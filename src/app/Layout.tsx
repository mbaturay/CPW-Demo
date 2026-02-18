import { Outlet } from 'react-router';
import { TopNav } from './components/TopNav';
import { LeftNavRail } from './components/LeftNavRail';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <LeftNavRail />
      <main className="pl-16">
        <Outlet />
      </main>
    </div>
  );
}
