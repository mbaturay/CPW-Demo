import { Link } from 'react-router';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { useRole, getRoleLabel, UserRole } from '../context/RoleContext';

export function TopNav() {
  const { role, setRole } = useRole();

  return (
    <header
      className="sticky top-0 z-50 bg-primary h-14"
      style={{ boxShadow: 'var(--shadow-1)' }}
    >
      <div className="flex items-center justify-between h-14 px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-[14px] font-semibold text-white tracking-tight">AD</span>
          <span className="text-[16px] font-semibold text-white tracking-tight">ADAMAS</span>
          <span className="text-[11px] text-white/50 hidden sm:inline">Aquatic Data &amp; Monitoring</span>
        </Link>

        {/* Role switcher (demo only) */}
        <div data-testid="role-floater" className="flex items-center gap-2">
          <span className="text-[11px] text-white/50 select-none hidden sm:inline">Role</span>
          <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
            <SelectTrigger
              id="ddRole"
              aria-label="Select demo role"
              className="w-[160px] h-8 text-[12px] bg-white/10 border-white/20 text-white hover:bg-white/15"
            >
              <span>{getRoleLabel(role)}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data-entry" className="text-[12px]">
                Data Entry Assistant
              </SelectItem>
              <SelectItem value="area-biologist" className="text-[12px]">
                Area Biologist
              </SelectItem>
              <SelectItem value="senior-biologist" className="text-[12px]">
                Senior Biologist
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[10px] text-white/40 select-none hidden sm:inline">(demo)</span>
        </div>
      </div>
    </header>
  );
}
