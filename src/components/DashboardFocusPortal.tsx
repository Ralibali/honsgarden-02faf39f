import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import DashboardFocusPanel from './DashboardFocusPanel';

const PORTAL_ID = 'dashboard-focus-panel-anchor';

function findDashboardRoot() {
  return document.querySelector('main .max-w-2xl.mx-auto.space-y-5.pb-8');
}

function findInsertAfter(root: Element) {
  const weatherTip = root.querySelector('p.-mt-2.flex.items-center');
  if (weatherTip) return weatherTip;
  return root.querySelector('.flex.items-end.justify-between.gap-4.pt-1');
}

export default function DashboardFocusPortal() {
  const location = useLocation();
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/';
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isDashboard) {
      const existing = document.getElementById(PORTAL_ID);
      existing?.remove();
      setTarget(null);
      return;
    }

    let cancelled = false;

    const mount = () => {
      if (cancelled) return;
      const root = findDashboardRoot();
      if (!root) return;

      let anchor = document.getElementById(PORTAL_ID) as HTMLElement | null;
      if (!anchor) {
        anchor = document.createElement('section');
        anchor.id = PORTAL_ID;
        anchor.className = 'contents';
      }

      const after = findInsertAfter(root);
      if (after && after.parentElement && anchor.parentElement !== after.parentElement) {
        after.insertAdjacentElement('afterend', anchor);
      } else if (after && after.nextSibling !== anchor) {
        after.insertAdjacentElement('afterend', anchor);
      } else if (!after && !anchor.parentElement) {
        root.prepend(anchor);
      }

      setTarget(anchor);
    };

    const timer = window.setTimeout(mount, 80);
    const observer = new MutationObserver(mount);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [isDashboard]);

  if (!isDashboard || !target) return null;
  return createPortal(<DashboardFocusPanel />, target);
}
