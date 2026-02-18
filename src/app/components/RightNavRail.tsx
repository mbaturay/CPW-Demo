import { Link, useLocation } from 'react-router';
import { useRole } from '../context/RoleContext';
import { navItems } from './navConfig';

export function RightNavRail() {
  const location = useLocation();
  const { role } = useRole();

  const filtered = navItems.filter((item) => item.roles.includes(role));

  const isActiveRoute = (to: string) =>
    to === '/'
      ? location.pathname === '/'
      : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed right-0 top-14 bottom-0 w-16 z-40 bg-[#2d333b] border-l border-[#444c56] flex flex-col items-center pt-4 gap-1"
    >
      {filtered.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveRoute(item.to);
        const label =
          role === 'data-entry' && item.dataEntryLabel
            ? item.dataEntryLabel
            : item.label;

        return (
          <Link
            key={item.key}
            to={item.to}
            aria-label={label}
            className={`
              group relative flex items-center justify-center w-11 h-11 rounded-lg
              transition-colors duration-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#2d333b]
              ${isActive
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <Icon className="w-5 h-5" />

            {/* Tooltip — appears to the left of the rail */}
            <span
              className="
                pointer-events-none absolute right-full mr-3 px-2.5 py-1.5 rounded-md
                bg-slate-900 text-white text-xs font-medium whitespace-nowrap
                opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
                transition-opacity duration-150
                shadow-lg
              "
            >
              {label}
            </span>

            {/* Active indicator bar on left edge */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-sm bg-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
