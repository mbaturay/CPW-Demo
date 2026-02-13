import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'data-entry' | 'area-biologist' | 'senior-biologist';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('area-biologist');

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'data-entry':
      return 'Data Entry Assistant';
    case 'area-biologist':
      return 'Area Biologist';
    case 'senior-biologist':
      return 'Senior Biologist';
  }
}
