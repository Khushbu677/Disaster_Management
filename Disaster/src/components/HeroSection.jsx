import React from 'react';
import { Link } from 'react-router-dom';

// HeroSection — matches the home section design in resqnet.html
// Props:
//   stats: { total, critical, resolvedToday, totalAffected }
//   loading: boolean

export default function HeroSection({ stats = {}, loading = false }) {
  const statItems = [
    { label: 'Active Incidents', value: stats.total ?? '—' },
    { label: 'Critical',         value: stats.critical ?? '—' },
    { label: 'Resolved Today',   value: stats.resolvedToday ?? '—' },
    { label: 'People Affected',  value: stats.totalAffected != null ? Number(stats.totalAffected).toLocaleString() : '—' },
  ];

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        paddingTop: 64,
        paddingBottom: 0,
      }}
    >
      {/* Rescue emoji grid watermark */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        opacity: 0.06,
        pointerEvents: 'none',
      }}>
        {['🚁','🏥','🚒','⛑️','🌊','🆘'].map((e, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 72, border: '1px solid rgba(255,255,255,0.04)',
          }}>{e}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

        {/* Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(79,207,142,0.12)',
          border: '1px solid rgba(79,207,142,0.32)',
          color: '#9ef1c0',
          padding: '6px 18px', borderRadius: 100,
          fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2,
          textTransform: 'uppercase', marginBottom: '1.5rem',
        }}>
          <span className="pulse-dot" />
          LIVE OPERATIONS ACTIVE
        </div>

        {/* Main title */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(64px, 14vw, 132px)',
          lineHeight: 0.9,
          letterSpacing: 2,
          marginBottom: '0.5rem',
        }}>
          RESQ<span style={{ color: 'var(--red)' }}>NET</span>
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 'clamp(12px, 2vw, 15px)',
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontWeight: 300,
          marginBottom: '2.5rem',
          fontFamily: 'var(--font-mono)',
        }}>
          Disaster Management System · Emergency Response
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Link to="/sos" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: 3,
            textDecoration: 'none',
            padding: '14px 36px',
            borderRadius: 6,
            background: 'var(--red)',
            color: 'white',
            transition: 'background 0.2s, transform 0.15s',
            display: 'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            🆘 REQUEST HELP
          </Link>
          <Link to="/reports" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            letterSpacing: 3,
            textDecoration: 'none',
            padding: '14px 36px',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'white',
            transition: 'background 0.2s',
            display: 'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            VIEW REPORTS
          </Link>
        </div>

        {/* Role quick cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          maxWidth: 680,
          margin: '0 auto 3rem',
        }}>
          {[
            { icon: '🆘', code: 'SOS', title: 'VICTIM',    desc: 'Emergency help request and live tracking.', to: '/sos' },
            { icon: '⛑️', code: 'AID', title: 'VOLUNTEER', desc: 'See assignments and response priorities.',   to: '/volunteer' },
            { icon: '🏛️', code: 'NGO', title: 'NGO',       desc: 'Offer aid with active relief demand map.',  to: '/ngo' },
            { icon: '🛡️', code: 'ADM', title: 'ADMIN',     desc: 'Coordinate the full live operations map.',  to: '/admin' },
          ].map(({ code, title, desc, to }) => (
            <Link
              key={code}
              to={to}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '14px 16px',
                textAlign: 'left',
                textDecoration: 'none',
                color: 'white',
                display: 'block',
                transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(79,207,142,0.07)';
                e.currentTarget.style.borderColor = 'rgba(79,207,142,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: 2,
                color: 'var(--red)',
                marginBottom: 8,
              }}>{code}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1.5 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.6 }}>{desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats bar — fetched from backend */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexWrap: 'wrap',
      }}>
        {statItems.map(({ label, value }, i) => (
          <div key={label} style={{
            flex: '1 1 25%',
            minWidth: 140,
            padding: '16px 24px',
            textAlign: 'center',
            borderRight: i < statItems.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              color: 'var(--red)',
              lineHeight: 1,
            }}>
              {loading ? '…' : value}
            </div>
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              marginTop: 6,
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
