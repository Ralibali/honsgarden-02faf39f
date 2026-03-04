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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === '/app'}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
