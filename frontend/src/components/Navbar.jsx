import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'text-brand-700 bg-brand-50'
          : 'text-ink-500 hover:text-ink-900 hover:bg-surface-100'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand-500 rounded-full" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-soft border-b border-surface-200'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-ink-900 tracking-tight">Pierian</span>
              <span className="text-lg font-bold text-brand-600 tracking-tight ml-1">Sign</span>
            </div>
          </Link>

          <div className="flex items-center gap-1 bg-surface-50 rounded-xl p-1">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/new">New Request</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}