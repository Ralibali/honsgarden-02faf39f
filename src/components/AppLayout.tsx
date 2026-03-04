import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MobileNav } from './MobileNav';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full noise-bg">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop header */}
          <header className="h-14 hidden md:flex items-center border-b border-border px-4 glass sticky top-0 z-30">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <span className="ml-4 font-serif text-lg text-foreground">Hönsgården</span>
          </header>

          {/* Mobile header */}
          <header className="h-14 flex md:hidden items-center justify-center border-b border-border px-4 glass sticky top-0 z-30">
            <span className="font-serif text-lg text-foreground">🥚 Hönsgården</span>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 relative z-10">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
