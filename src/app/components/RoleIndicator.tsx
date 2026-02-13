import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRole, getRoleLabel, UserRole } from '../context/RoleContext';

export function RoleIndicator() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
        <SelectTrigger className="w-[220px] h-8 text-[12px] border-border/50">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Role:</span>
            <span className="text-foreground">{getRoleLabel(role)}</span>
          </div>
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
      <span className="text-[10px] text-muted-foreground">(Demo mode)</span>
    </div>
  );
}