import { Outlet } from 'react-router';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <CollapsibleSidebar position="left" />
      <main className="ml-16">
        <Outlet />
      </main>
    </div>
  );
}
