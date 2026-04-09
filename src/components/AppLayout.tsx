import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MobileNav } from './MobileNav';
import { QuickEggFAB } from './QuickEggFAB';
import CommandPalette from './CommandPalette';
import { Menu, Feather, Search } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export default function AppLayout() {
  // Ensure app routes are not indexed by search engines
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    return () => { meta.content = 'index, follow'; };
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full noise-bg">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Desktop header */}
          <header className="h-12 hidden md:flex items-center justify-between border-b border-border/60 px-5 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <NotificationBell />
          </header>

          {/* Mobile header */}
          <header className="h-14 flex md:hidden items-center justify-between border-b border-border/60 px-4 bg-background/70 backdrop-blur-xl sticky top-0 z-30">
            <div className="w-8" />
            <div className="flex items-center gap-2">
              <Feather className="h-4 w-4 text-primary" />
              <span className="font-serif text-lg text-foreground">Hönsgården</span>
            </div>
            <NotificationBell />
          </header>

          <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 relative z-10">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-2xl">🥚</span>
                  <span className="text-sm text-muted-foreground">Laddar...</span>
                </div>
              </div>
            }>
              <Outlet />
            </Suspense>
          </main>
        </div>

        <MobileNav />
        <QuickEggFAB />
      </div>
    </SidebarProvider>
  );
}
