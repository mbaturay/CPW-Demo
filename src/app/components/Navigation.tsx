import { Link, useLocation } from 'react-router';
import { Home, Upload, CheckSquare, Search, BarChart3, Waves, Database } from 'lucide-react';
import { useRole } from '../context/RoleContext';

export function Navigation() {
  const location = useLocation();
  const { role } = useRole();
  
  // Define all possible nav items
  const allNavItems = [
    { path: '/', icon: Home, label: 'Dashboard', roles: ['data-entry', 'area-biologist', 'senior-biologist'], dataEntryLabel: 'My Waters' },
    { path: '/water', icon: Waves, label: 'Water Profile', roles: ['data-entry', 'area-biologist', 'senior-biologist'] },
    { path: '/upload', icon: Upload, label: 'Upload Survey', roles: ['data-entry', 'area-biologist', 'senior-biologist'] },
    { path: '/validation', icon: CheckSquare, label: 'Validation', roles: ['data-entry', 'area-biologist', 'senior-biologist'], dataEntryLabel: 'Validation Queue' },
    { path: '/query', icon: Search, label: 'Query Builder', roles: ['area-biologist', 'senior-biologist'] },
    { path: '/insights', icon: BarChart3, label: 'Insights', roles: ['area-biologist', 'senior-biologist'] },
  ];
  
  // Filter nav items based on role
  const navItems = allNavItems.filter(item => item.roles.includes(role));
  
  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-border flex flex-col">
      <div className="px-6 pt-5 pb-4 border-b border-border/60">
        <h1 className="text-[18px] font-semibold tracking-tight text-primary">
          ADAMAS
        </h1>
        <p className="text-[11px] text-muted-foreground mt-1 whitespace-nowrap">
          Aquatic Data & Monitoring
        </p>
      </div>

      <div className="flex-1 mt-3 px-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const label = role === 'data-entry' && item.dataEntryLabel ? item.dataEntryLabel : item.label;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded text-[13px]
                    ${isActive 
                      ? 'bg-primary text-primary-foreground font-medium' 
                      : 'text-foreground hover:bg-muted/50'
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
      
      <div className="mt-auto p-4 border-t border-border">
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground">Version 1.0.2</p>
          <p className="mt-1.5">Colorado Parks & Wildlife</p>
          <p className="mt-0.5 text-[10px]">Fisheries Program</p>
        </div>
      </div>
    </nav>
  );
}