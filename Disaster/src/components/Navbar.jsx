import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen]     = useState(false);

  const mainLinks = [
    { to: '/',        label: 'Dashboard' },
    { to: '/reports', label: 'Reports' },
    { to: '/status',  label: 'Track Status' },
  ];

  const roleLinks = [
    { to: '/sos',       icon: '🆘', label: 'Victim / SOS',   sub: 'Request emergency help' },
    { to: '/volunteer', icon: '⛑️', label: 'Volunteer',      sub: 'View & complete tasks' },
    { to: '/ngo',       icon: '🏛️', label: 'NGO',            sub: 'Submit aid capabilities' },
    { to: '/admin',     icon: '🛡️', label: 'Admin Panel',    sub: 'Full operations control' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const isRoleActive = roleLinks.some(r => isActive(r.to));

  return (
    <nav style={{
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(79,207,142,0.1)',
      position: 'sticky', top: 0, zIndex: 1000,
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto', padding: '0 24px',
        height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(79,207,142,0.1)', border: '1px solid rgba(79,207,142,0.25)',
            color: '#9ef1c0', padding: '3px 10px', borderRadius: 100,
            fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 2, textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ef1c0', animation: 'pulseDot 1.5s infinite', flexShrink: 0, display: 'inline-block' }} />
            LIVE
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, color: 'white', lineHeight: 1 }}>
            RESQ<span style={{ color: 'var(--red)' }}>NET</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
          {mainLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5,
              textTransform: 'uppercase', textDecoration: 'none',
              padding: '7px 14px', borderRadius: 6, transition: 'all 0.2s',
              color: isActive(to) ? '#9ef1c0' : 'rgba(255,255,255,0.55)',
              background: isActive(to) ? 'rgba(79,207,142,0.1)' : 'transparent',
              border: isActive(to) ? '1px solid rgba(79,207,142,0.25)' : '1px solid transparent',
            }}>{label}</Link>
          ))}

          {/* Roles dropdown */}
          <div style={{ position: 'relative' }} onMouseEnter={() => setRoleOpen(true)} onMouseLeave={() => setRoleOpen(false)}>
            <button style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5,
              textTransform: 'uppercase', padding: '7px 14px', borderRadius: 6,
              border: isRoleActive ? '1px solid rgba(79,207,142,0.25)' : '1px solid rgba(255,255,255,0.08)',
              background: isRoleActive ? 'rgba(79,207,142,0.1)' : 'rgba(255,255,255,0.04)',
              color: isRoleActive ? '#9ef1c0' : 'rgba(255,255,255,0.55)',
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              PORTALS <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
            </button>
            {roleOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                background: 'rgba(6,20,14,0.97)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(79,207,142,0.15)', borderRadius: 12,
                padding: 8, minWidth: 240, zIndex: 200,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}>
                {roleLinks.map(({ to, icon, label, sub }) => (
                  <Link key={to} to={to} onClick={() => setRoleOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8, textDecoration: 'none',
                    transition: 'background 0.15s',
                    background: isActive(to) ? 'rgba(79,207,142,0.08)' : 'transparent',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,207,142,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isActive(to) ? 'rgba(79,207,142,0.08)' : 'transparent'; }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 1, color: 'white' }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-mono)' }}>{sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Emergency button */}
          <Link to="/sos" style={{
            marginLeft: 8, fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 2,
            textDecoration: 'none', padding: '8px 18px', borderRadius: 6,
            background: 'var(--red)', color: 'white', transition: 'background 0.2s, transform 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            🆘 EMERGENCY
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(o => !o)} className="mobile-menu-btn" aria-label="Toggle navigation" style={{
          display: 'none', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
          padding: '8px 12px', color: 'white', fontSize: 18, cursor: 'pointer',
        }}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(6,20,14,0.97)', borderTop: '1px solid rgba(79,207,142,0.08)',
          padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {[...mainLinks, ...roleLinks].map(({ to, label, icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 1.5,
              textTransform: 'uppercase', textDecoration: 'none', padding: '12px 14px',
              borderRadius: 6, color: isActive(to) ? '#9ef1c0' : 'rgba(255,255,255,0.65)',
              background: isActive(to) ? 'rgba(79,207,142,0.08)' : 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .nav-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
