import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useRole } from '../context/RoleContext';
import { navItems } from './navConfig';

export function LeftNavRail() {
  const [expanded, setExpanded] = useState(false);
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
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setExpanded(false);
        }
      }}
      className={`
        fixed left-0 top-14 bottom-0 z-40
        bg-[#2d333b] border-r border-[#444c56]
        flex flex-col pt-4 gap-1 overflow-hidden
        transition-[width,box-shadow] duration-200 ease-in-out
        ${expanded ? 'w-[200px] shadow-[4px_0_12px_rgba(0,0,0,0.15)]' : 'w-16'}
      `}
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
              group relative flex items-center h-11 mx-2.5 rounded-lg
              transition-colors duration-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#2d333b]
              ${isActive
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <div className="w-11 shrink-0 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>

            {/* Label — revealed on expand */}
            <span
              className={`
                text-sm font-medium whitespace-nowrap
                transition-all duration-200 ease-in-out
                ${expanded
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-1'
                }
              `}
            >
              {label}
            </span>

            {/* Tooltip — visible only when collapsed */}
            <span
              className={`
                pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-md
                bg-slate-900 text-white text-xs font-medium whitespace-nowrap
                shadow-lg transition-opacity duration-150
                ${expanded
                  ? 'opacity-0 invisible'
                  : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                }
              `}
            >
              {label}
            </span>

            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-sm bg-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
