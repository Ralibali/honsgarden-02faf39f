import { Home, Egg, Bird, Coins, BarChart3, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const mainNav = [
  { title: 'Hem', url: '/app', icon: Home },
  { title: 'Ägg', url: '/app/eggs', icon: Egg },
  { title: 'Hönor', url: '/app/hens', icon: Bird },
  { title: 'Ekonomi', url: '/app/finance', icon: Coins },
  { title: 'Statistik', url: '/app/statistics', icon: BarChart3 },
  { title: 'Inställningar', url: '/app/settings', icon: Settings },
  { title: 'Admin', url: '/app/admin', icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="hidden md:flex border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        {/* Logo */}
        <div className="px-4 pb-6 flex items-center gap-3">
          <span className="text-2xl">🥚</span>
          {!collapsed && (
            <h1 className="font-serif text-xl text-foreground">Hönsgården</h1>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
                      activeClassName="bg-primary/15 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        {!collapsed && (
          <>
            <p className="text-[10px] text-muted-foreground">Build: 2026-03-04</p>
            <div>
              <p className="text-sm font-medium text-foreground">Christoffer</p>
              <p className="text-xs text-muted-foreground">info@auroramedia.se</p>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" />
              Logga ut
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
