import { Home, Egg, Bird, ClipboardCheck, BarChart3, MoreHorizontal, Package, Syringe, Baby, Coins } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useState } from 'react';

const primaryItems = [
  { title: 'Hem', url: '/app', icon: Home },
  { title: 'Ägg', url: '/app/eggs', icon: Egg },
  { title: 'Hönor', url: '/app/hens', icon: Bird },
  { title: 'Uppgifter', url: '/app/tasks', icon: ClipboardCheck },
  { title: 'Mer', url: '#more', icon: MoreHorizontal },
];

const moreItems = [
  { title: 'Foder', url: '/app/feed', icon: Package },
  { title: 'Kläckning', url: '/app/hatching', icon: Baby },
  { title: 'Påminnelser', url: '/app/reminders', icon: Syringe },
  { title: 'Ekonomi', url: '/app/finance', icon: Coins },
  { title: 'Statistik', url: '/app/statistics', icon: BarChart3 },
];

export function MobileNav() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div className="absolute bottom-16 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-4 pb-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-5 gap-1">
              {moreItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  activeClassName="text-primary"
                  onClick={() => setShowMore(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[9px] font-medium truncate">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-1">
          {primaryItems.map((item) => (
            item.url === '#more' ? (
              <button
                key="more"
                onClick={() => setShowMore(!showMore)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-colors min-w-0 ${showMore ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate">{item.title}</span>
              </button>
            ) : (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === '/app'}
                className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors min-w-0"
                activeClassName="text-primary"
                onClick={() => setShowMore(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate">{item.title}</span>
              </NavLink>
            )
          ))}
        </div>
      </nav>
    </>
  );
}
