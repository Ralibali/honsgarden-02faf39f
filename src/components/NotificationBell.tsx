import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data: notifs } = await supabase
        .from('notifications')
        .select('id, title, message, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: reads } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      setNotifications((notifs as Notification[]) ?? []);
      setReadIds(new Set((reads ?? []).map((r: any) => r.notification_id)));
    };

    fetchNotifications();

    const channel = supabase
      .channel('notifications-bell')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = async () => {
    if (!user?.id) return;
    const unread = notifications.filter(n => !readIds.has(n.id));
    if (unread.length === 0) return;

    const rows = unread.map(n => ({ notification_id: n.id, user_id: user.id }));
    await supabase.from('notification_reads').upsert(rows, { onConflict: 'notification_id,user_id' });
    setReadIds(prev => {
      const next = new Set(prev);
      unread.forEach(n => next.add(n.id));
      return next;
    });
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label={unreadCount > 0 ? `Visa notiser, ${unreadCount} olästa` : 'Visa notiser'}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-1rem)] sm:w-[30rem] lg:w-[34rem] p-0 rounded-2xl overflow-hidden" align="end" sideOffset={10}>
        <div className="px-4 py-3 border-b border-border/60 bg-card sticky top-0 z-10">
          <p className="font-serif text-base font-semibold text-foreground">Notiser</p>
          <p className="text-xs text-muted-foreground mt-0.5">Viktiga uppdateringar och meddelanden från Hönsgården</p>
        </div>
        <ScrollArea className="max-h-[70vh] sm:max-h-[28rem]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Inga notiser ännu
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map(n => (
                <article
                  key={n.id}
                  className={`px-4 py-4 transition-colors ${!readIds.has(n.id) ? 'bg-primary/5' : ''}`}
                >
                  <p className="text-sm sm:text-base font-medium text-foreground leading-snug break-words">{n.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap break-words leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-2">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: sv })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
