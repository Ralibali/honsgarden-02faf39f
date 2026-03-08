import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

function getSessionId(): string {
  let sid = sessionStorage.getItem('_track_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('_track_sid', sid);
  }
  return sid;
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function usePageTracking() {
  const location = useLocation();
  const lastPath = useRef('');

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    const sessionId = getSessionId();

    supabase.from('page_views').insert({
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: sessionId,
      device_type: getDeviceType(),
    } as any).then(() => {});
  }, [location.pathname]);
}

export function trackClick(eventName: string, opts?: {
  elementId?: string;
  elementText?: string;
  metadata?: Record<string, any>;
}) {
  const sessionId = getSessionId();
  supabase.from('click_events').insert({
    event_name: eventName,
    element_id: opts?.elementId,
    element_text: opts?.elementText,
    path: window.location.pathname,
    session_id: sessionId,
    metadata: opts?.metadata || {},
  } as any).then(() => {});
}
