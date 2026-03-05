import { Home, Egg, Bird, Coins, BarChart3, Settings, LogOut, Package, Syringe, Baby, ClipboardCheck, Crown, Shield } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  { title: 'Dagliga uppgifter', url: '/app/tasks', icon: ClipboardCheck },
  { title: 'Foder', url: '/app/feed', icon: Package },
  { title: 'Kläckning', url: '/app/hatching', icon: Baby },
  { title: 'Påminnelser', url: '/app/reminders', icon: Syringe },
];

const secondaryNav = [
  { title: 'Ekonomi', url: '/app/finance', icon: Coins },
  { title: 'Statistik', url: '/app/statistics', icon: BarChart3 },
  { title: 'Premium', url: '/app/premium', icon: Crown },
  { title: 'Inställningar', url: '/app/settings', icon: Settings },
  { title: 'Admin', url: '/app/admin', icon: Shield, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="hidden md:flex border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        <div className="px-4 pb-4 flex items-center gap-3">
          <span className="text-2xl">🥚</span>
          {!collapsed && <h1 className="font-serif text-xl text-foreground">Hönsgården</h1>}
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] text-muted-foreground uppercase tracking-widest px-4">Gården</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/app'} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200" activeClassName="bg-primary/15 text-primary font-medium">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] text-muted-foreground uppercase tracking-widest px-4 mt-2">Verktyg</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200" activeClassName="bg-primary/15 text-primary font-medium">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
            <div>
              <p className="text-sm font-medium text-foreground">{user?.name || 'Användare'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-muted-foreground" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              Logga ut
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
