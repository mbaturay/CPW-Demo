import { Outlet } from 'react-router';
import { TopNav } from './components/TopNav';
import { LeftNavRail } from './components/LeftNavRail';
import { RoleFloater } from './components/RoleFloater';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <LeftNavRail />
      <RoleFloater />
      <main className="pl-20">
        <Outlet />
      </main>
    </div>
  );
}
