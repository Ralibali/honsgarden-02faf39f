import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toBasicProfile(supaUser: SupabaseUser): UserProfile {
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: supaUser.user_metadata?.name ?? '',
    is_premium: false,
    subscription_status: 'free',
  };
}

async function buildProfile(supaUser: SupabaseUser): Promise<UserProfile> {
  // Fire check-subscription to sync Stripe status → profiles table
  try {
    await supabase.functions.invoke('check-subscription');
  } catch {
    // Non-blocking – profile query below will still work with cached status
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, subscription_status, premium_expires_at')
    .eq('user_id', supaUser.id)
    .maybeSingle();

  // Check if premium has expired
  let subStatus = profile?.subscription_status ?? 'free';
  if (subStatus === 'premium' && profile?.premium_expires_at) {
    const expiresAt = new Date(profile.premium_expires_at);
    if (expiresAt < new Date()) {
      subStatus = 'free';
      // Auto-downgrade in DB (fire-and-forget)
      void supabase.from('profiles').update({ subscription_status: 'free', premium_expires_at: null }).eq('user_id', supaUser.id);
    }
  }

  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: profile?.display_name ?? supaUser.user_metadata?.name ?? '',
    is_premium: subStatus === 'premium',
    subscription_status: subStatus,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const applySession = (session: Session | null, hydrateProfile: boolean) => {
      const supaUser = session?.user ?? null;

      if (!supaUser) {
        if (isMounted) setUser(null);
        return;
      }

      if (isMounted) {
        // Set basic user immediately for fast route access
        setUser(toBasicProfile(supaUser));
      }

      if (hydrateProfile) {
        // Fire-and-forget: do not block auth state callback
        void buildProfile(supaUser)
          .then((profile) => {
            if (isMounted) setUser(profile);
          })
          .catch(() => {
            // Keep basic profile if profile query fails
          });
      }
    };

    // 1) Restore session from storage first
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

    // 2) React to subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      const shouldHydrateProfile = event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED';
      applySession(session, shouldHydrateProfile);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    if (data.user) {
      setUser(toBasicProfile(data.user));
      void buildProfile(data.user).then(setUser).catch(() => undefined);
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
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
