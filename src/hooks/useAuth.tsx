import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  is_premium?: boolean;
  subscription_status?: string;
  subscription_end?: string | null;
  [key: string]: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SYNC_INTERVAL_MS = 60_000; // Re-check subscription every 60 seconds

function toBasicProfile(supaUser: SupabaseUser): UserProfile {
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: supaUser.user_metadata?.name ?? '',
    is_premium: false,
    subscription_status: 'free',
  };
}

async function syncSubscriptionStatus(): Promise<{ subscriptionEnd: string | null; synced: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('check-subscription');
    if (error) {
      console.warn('[Auth] check-subscription error:', error.message);
      return { subscriptionEnd: null, synced: false };
    }
    return { subscriptionEnd: data?.subscription_end ?? null, synced: true };
  } catch (err) {
    console.warn('[Auth] check-subscription failed:', err);
    return { subscriptionEnd: null, synced: false };
  }
}

async function buildProfile(supaUser: SupabaseUser): Promise<UserProfile> {
  // Sync Stripe status → profiles table
  const { subscriptionEnd, synced } = await syncSubscriptionStatus();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, subscription_status, premium_expires_at')
    .eq('user_id', supaUser.id)
    .maybeSingle();

  const now = new Date();
  const expiryDate = profile?.premium_expires_at ? new Date(profile.premium_expires_at) : null;
  const hasValidExpiry = !!expiryDate && expiryDate > now;

  let subStatus = profile?.subscription_status ?? 'free';

  // Heal status drift locally
  if (hasValidExpiry && subStatus !== 'premium') {
    subStatus = 'premium';
  }

  // Auto-downgrade ONLY if sync succeeded and expiry is past
  // If sync failed, keep current status to avoid false downgrades
  if (synced && subStatus === 'premium' && expiryDate && expiryDate < now) {
    subStatus = 'free';
  }

  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: profile?.display_name ?? supaUser.user_metadata?.name ?? '',
    is_premium: subStatus === 'premium',
    subscription_status: subStatus,
    subscription_end: subscriptionEnd ?? profile?.premium_expires_at ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUserRef = useRef<SupabaseUser | null>(null);

  // Periodic subscription sync
  const startPeriodicSync = useCallback((supaUser: SupabaseUser) => {
    // Clear any existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    currentUserRef.current = supaUser;

    syncIntervalRef.current = setInterval(async () => {
      if (!currentUserRef.current) return;
      try {
        const profile = await buildProfile(currentUserRef.current);
        setUser(profile);
      } catch {
        // Non-blocking periodic sync
      }
    }, SYNC_INTERVAL_MS);
  }, []);

  const stopPeriodicSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    currentUserRef.current = null;
  }, []);

  // Exposed method to force-refresh subscription (used after checkout)
  const refreshSubscription = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await buildProfile(session.user);
      setUser(profile);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const applySession = (session: Session | null, hydrateProfile: boolean) => {
      const supaUser = session?.user ?? null;

      if (!supaUser) {
        if (isMounted) setUser(null);
        stopPeriodicSync();
        return;
      }

      if (isMounted) {
        setUser(toBasicProfile(supaUser));
      }

      if (hydrateProfile) {
        void buildProfile(supaUser)
          .then((profile) => {
            if (isMounted) {
              setUser(profile);
              startPeriodicSync(supaUser);
            }
          })
          .catch(() => {
            // Keep basic profile if profile query fails
            if (isMounted) startPeriodicSync(supaUser);
          });
      }
    };

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        applySession(session, true);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        stopPeriodicSync();
        setLoading(false);
        return;
      }

      const shouldHydrateProfile = event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED';
      applySession(session, shouldHydrateProfile);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      stopPeriodicSync();
      subscription.unsubscribe();
    };
  }, [startPeriodicSync, stopPeriodicSync]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    if (data.user) {
      setUser(toBasicProfile(data.user));
      void buildProfile(data.user).then((p) => {
        setUser(p);
        startPeriodicSync(data.user);
      }).catch(() => undefined);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    return data;
  };

  const logout = async () => {
    stopPeriodicSync();
    await supabase.auth.signOut();
    setUser(null);
    try {
      const keysToRemove = Object.keys(localStorage).filter(k =>
        k.startsWith('sb-') || k.startsWith('supabase') || k.startsWith('honsgarden-') || k === 'theme' || k === '_track_sid'
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch { /* private browsing */ }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
