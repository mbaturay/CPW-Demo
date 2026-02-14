import { Link, useLocation } from 'react-router';
import { useRole } from '../context/RoleContext';
import { navItems } from './CollapsibleSidebar';

export function TopNav() {
  const location = useLocation();
  const { role } = useRole();

  const filtered = navItems.filter((item) => item.roles.includes(role));

  const isActiveRoute = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-50 bg-primary"
      style={{ boxShadow: 'var(--shadow-1)' }}
    >
      <div className="flex items-center h-14 px-6">
        {/* Branding */}
        <Link to="/" className="flex items-center gap-2 mr-8 shrink-0">
          <span className="text-[14px] font-semibold text-white tracking-tight">AD</span>
          <span className="text-[16px] font-semibold text-white tracking-tight">ADAMAS</span>
          <span className="text-[11px] text-white/50 hidden sm:inline">Aquatic Data &amp; Monitoring</span>
        </Link>

        {/* Nav links */}
        <ul className="flex items-center gap-1">
          {filtered.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.to);
            const label =
              role === 'data-entry' && item.dataEntryLabel
                ? item.dataEntryLabel
                : item.label;
            return (
              <li key={item.key}>
                <Link
                  to={item.to}
                  aria-label={label}
                  className={`
                    flex items-center gap-1.5 px-3 h-9 rounded text-[13px]
                    ${isActive
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-white/60'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
