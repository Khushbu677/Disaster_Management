import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/',        label: 'Dashboard' },
    { to: '/sos',     label: 'SOS Request' },
    { to: '/reports', label: 'Reports' },
    { to: '/status',  label: 'Track Status' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(79,207,142,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 24px',
          height: 62,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(79,207,142,0.12)',
              border: '1px solid rgba(79,207,142,0.28)',
              color: '#9ef1c0',
              padding: '3px 10px',
              borderRadius: 100,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            LIVE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              letterSpacing: 2,
              color: 'white',
              lineHeight: 1,
            }}
          >
            RESQ<span style={{ color: 'var(--red)' }}>NET</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '7px 16px',
                borderRadius: 6,
                transition: 'all 0.2s',
                color: isActive(to) ? '#9ef1c0' : 'rgba(255,255,255,0.6)',
                background: isActive(to) ? 'rgba(79,207,142,0.1)' : 'transparent',
                border: isActive(to)
                  ? '1px solid rgba(79,207,142,0.3)'
                  : '1px solid transparent',
              }}
            >
              {label}
            </Link>
          ))}

          {/* Emergency badge */}
          <a
            href="/sos"
            style={{
              marginLeft: 8,
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              letterSpacing: 2,
              textDecoration: 'none',
              padding: '8px 20px',
              borderRadius: 6,
              background: 'var(--red)',
              color: 'white',
              transition: 'background 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            🆘 EMERGENCY
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            display: 'none',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6,
            padding: '8px 12px',
            color: 'white',
            fontSize: 18,
            cursor: 'pointer',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            background: 'rgba(6,20,14,0.95)',
            borderTop: '1px solid rgba(79,207,142,0.1)',
            padding: '12px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 6,
                color: isActive(to) ? '#9ef1c0' : 'rgba(255,255,255,0.7)',
                background: isActive(to) ? 'rgba(79,207,142,0.08)' : 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
