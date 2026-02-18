import { Outlet } from 'react-router';
import { TopNav } from './components/TopNav';
import { LeftNavRail } from './components/LeftNavRail';
import { RoleFloater } from './components/RoleFloater';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <RoleFloater />
      <div className="flex flex-1">
        <LeftNavRail />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
