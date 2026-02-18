import { Link } from 'react-router';

export function TopNav() {
  return (
    <header
      className="sticky top-0 z-50 bg-primary h-14"
      style={{ boxShadow: 'var(--shadow-1)' }}
    >
      <div className="flex items-center h-14 px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-[14px] font-semibold text-white tracking-tight">AD</span>
          <span className="text-[16px] font-semibold text-white tracking-tight">ADAMAS</span>
          <span className="text-[11px] text-white/50 hidden sm:inline">Aquatic Data &amp; Monitoring</span>
        </Link>
      </div>
    </header>
  );
}
