// DEMO-ONLY: role floater — not for production.
// In production Power Apps, roles come from Dataverse security roles / cpw_UserRole table.

import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { useRole, getRoleLabel, UserRole } from '../context/RoleContext';

export function RoleFloater() {
  const { role, setRole } = useRole();

  return (
    <div
      data-testid="role-floater"
      className="fixed top-16 right-4 z-40 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-border text-[12px]"
      style={{ boxShadow: 'none' }}
    >
      <span className="text-muted-foreground select-none">Role</span>
      <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
        <SelectTrigger
          id="ddRole"
          aria-label="Select demo role"
          className="w-[180px] h-7 text-[12px] border-border/50"
        >
          <span className="text-foreground">{getRoleLabel(role)}</span>
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
      <span className="text-[10px] text-muted-foreground select-none">(demo)</span>
    </div>
  );
}
