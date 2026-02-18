import { Outlet } from 'react-router';
import { TopNav } from './components/TopNav';
import { RightNavRail } from './components/RightNavRail';
import { RoleFloater } from './components/RoleFloater';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <RightNavRail />
      <RoleFloater />
      <main className="pr-20">
        <Outlet />
      </main>
    </div>
  );
}
