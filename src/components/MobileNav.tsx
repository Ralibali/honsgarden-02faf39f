import { Home, Egg, Bird, Coins, BarChart3 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const items = [
  { title: 'Hem', url: '/app', icon: Home },
  { title: 'Ägg', url: '/app/eggs', icon: Egg },
  { title: 'Hönor', url: '/app/hens', icon: Bird },
  { title: 'Ekonomi', url: '/app/finance', icon: Coins },
  { title: 'Statistik', url: '/app/statistics', icon: BarChart3 },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === '/app'}
            className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors min-w-0"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium truncate">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
