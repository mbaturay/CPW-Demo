import { Outlet } from 'react-router';
import { TopNav } from './components/TopNav';
import { RoleFloater } from './components/RoleFloater';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <RoleFloater />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
