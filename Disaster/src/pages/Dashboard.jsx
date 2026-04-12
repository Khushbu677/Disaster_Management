import React, { useEffect, useState, useCallback } from 'react';
import HeroSection from '../components/HeroSection';
import ReportCard from '../components/ReportCard';
import { getDashboardIncidents, resolveDashboardIncident } from '../api/dashboardService';

// ── Dashboard Page ──────────────────────────────────────────────────────────
// Route: /
// Data: GET /api/dashboard/incidents   (no auth required)
// Architecture: Dashboard → dashboardService → Axios → Express → MongoDB

const GUIDE_CARDS = [
  {
    name: 'Flood', risk: 'WATER RISE',
    dos:   'Move to higher ground, keep emergency medicine dry, and use official rescue routes.',
    donts: 'Walk through fast water, touch electrical lines, or drive into flooded streets.',
  },
  {
    name: 'Earthquake', risk: 'GROUND SHOCK',
    dos:   'Drop, cover, hold on, and shift to open space after the shaking stops.',
    donts: 'Use elevators, stand near windows, or panic-run during tremors.',
  },
  {
    name: 'Fire', risk: 'SMOKE + HEAT',
    dos:   'Crawl below smoke, use safe exits, and alert everyone in the building immediately.',
    donts: "Re-enter for belongings, open hot doors, or hide in closed rooms.",
  },
  {
    name: 'Storm', risk: 'HIGH WIND',
    dos:   'Stay indoors, secure loose items, and follow evacuation instructions from authorities.',
    donts: 'Stand under trees, go out during false calm, or ignore alerts.',
  },
];

const GALLERY = [
  {
    src: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80',
    alt: 'Flood disaster rescue operation',
    title: 'Flood Rescue',
    text: 'Boat teams moving families and essential supplies through flooded neighborhoods.',
  },
  {
    src: 'https://images.unsplash.com/photo-1570612861542-284f4c12e75f?auto=format&fit=crop&w=900&q=80',
    alt: 'Fire disaster response team',
    title: 'Fire Response',
    text: 'Emergency personnel managing evacuation, smoke safety, and on-site support.',
  },
  {
    src: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=900&q=80',
    alt: 'Earthquake disaster relief operation',
    title: 'Earthquake Relief',
    text: 'Search, rescue, and relief work across damaged urban and community zones.',
  },
];

const ACHIEVEMENTS = [
  { value: '94%', label: 'Response Visibility',  note: 'Live tracking and coordinated updates help teams act with better awareness.' },
  { value: '843', label: 'Volunteer Reach',       note: 'A wide volunteer network improves speed for nearby emergency response.' },
  { value: '56',  label: 'NGO Partners',          note: 'Relief organizations can coordinate food, shelter, and medical support faster.' },
];

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState('ALL');
  const [resolving, setResolving] = useState(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardIncidents();
      setIncidents(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load incidents. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const id = setInterval(fetchIncidents, 30_000);
    return () => clearInterval(id);
  }, [fetchIncidents]);

  const handleResolve = async (id) => {
    try {
      setResolving(id);
      await resolveDashboardIncident(id);
      setIncidents(prev => prev.filter(inc => inc._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve incident');
    } finally {
      setResolving(null);
    }
  };

  const stats = {
    total:         incidents.length,
    critical:      incidents.filter(i => i.priorityLevel === 'CRITICAL').length,
    resolvedToday: 0,
    totalAffected: incidents.reduce((s, i) => s + (Number(i.peopleAffected) || 0), 0),
  };

  const filterOptions = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const filtered = filter === 'ALL' ? incidents : incidents.filter(i => i.priorityLevel === filter);

  /* ── shared style helpers ── */
  const glassBox = (extra = {}) => ({
    background: 'rgba(13,36,25,0.85)',
    border: '1px solid rgba(79,207,142,0.12)',
    borderRadius: 14,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    ...extra,
  });

  return (
    <div className="page-enter">
      {/* ── Hero with live stats ──────────────────────────────────────────── */}
      <HeroSection stats={stats} loading={loading} />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Active Incidents header + filter ─────────────────────────────── */}
        <div style={{
          padding: '36px 0 12px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2 }}>
              ACTIVE INCIDENTS
            </div>
            <div style={{
              fontSize: 12, color: 'rgba(255,255,255,0.38)',
              fontFamily: 'var(--font-mono)', marginTop: 4, letterSpacing: 1,
            }}>
              {loading ? 'Loading…' : `${filtered.length} incident${filtered.length !== 1 ? 's' : ''} — sorted by priority`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {filterOptions.map(f => {
              const active = filter === f;
              const cols = {
                ALL:      ['rgba(79,207,142,0.1)',  'rgba(79,207,142,0.3)',  '#9ef1c0'],
                CRITICAL: ['rgba(226,75,74,0.1)',   'rgba(226,75,74,0.3)',   '#f09595'],
                HIGH:     ['rgba(239,159,39,0.1)',  'rgba(239,159,39,0.3)',  '#FAC775'],
                MEDIUM:   ['rgba(29,158,117,0.1)',  'rgba(29,158,117,0.3)', '#5DCAA5'],
                LOW:      ['rgba(255,255,255,0.05)','rgba(255,255,255,0.15)','rgba(255,255,255,0.6)'],
              };
              const [bg, brd, clr] = cols[f];
              return (
                <button key={f} id={`filter-${f.toLowerCase()}`} onClick={() => setFilter(f)} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.5,
                  textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100,
                  border: `1px solid ${active ? brd : 'rgba(255,255,255,0.1)'}`,
                  background: active ? bg : 'transparent',
                  color: active ? clr : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {f}
                </button>
              );
            })}
            <button onClick={fetchIncidents} id="refresh-btn" style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.5,
              padding: '6px 14px', borderRadius: 100,
              border: '1px solid rgba(79,207,142,0.2)', background: 'rgba(79,207,142,0.05)',
              color: '#9ef1c0', cursor: 'pointer', transition: 'all 0.2s',
            }}>↻ Refresh</button>
          </div>
        </div>

        {/* ── Error state ─────────────────────────────────────────────── */}
        {error && !loading && (
          <div style={{
            padding: '24px 28px', marginBottom: 20,
            background: 'rgba(226,75,74,0.07)',
            border: '1px solid rgba(226,75,74,0.22)', borderRadius: 12,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#f09595', marginBottom: 6 }}>
              ⚠ Connection Error
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{error}</div>
            <button onClick={fetchIncidents} style={{
              marginTop: 12, padding: '7px 18px',
              background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.28)',
              color: '#f09595', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
            }}>Retry</button>
          </div>
        )}

        {/* ── Skeleton loading ─────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10, height: 180, animation: `fadeIn 0.5s ease ${i * 0.07}s both`,
              }} />
            ))}
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.35)' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: 2, marginBottom: 6 }}>All Clear</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1 }}>
              {filter === 'ALL' ? 'No active incidents.' : `No ${filter} priority incidents.`}
            </div>
          </div>
        )}

        {/* ── Incident cards grid ──────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(incident => (
              <div key={incident._id} style={{ opacity: resolving === incident._id ? 0.45 : 1, transition: 'opacity 0.3s' }}>
                <ReportCard incident={incident} onResolve={handleResolve} />
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            DISASTER GUIDE — Do's & Don'ts
            Mirrors the guide-panel section in resqnet.html
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ ...glassBox({ padding: '28px 32px', marginTop: 56 }) }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-mono)', marginBottom: 10,
          }}>Disaster Guide</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 20 }}>
            Quick safety guidance for users and guests before field support reaches them.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GUIDE_CARDS.map(({ name, risk, dos, donts }) => (
              <div key={name} style={{
                background: 'rgba(0,0,0,0.22)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: 1.5 }}>{name}</div>
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1,
                    color: 'rgba(255,255,255,0.6)', padding: '4px 10px',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
                  }}>{risk}</div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.74)', lineHeight: 1.75, marginBottom: 6 }}>
                  <span style={{ color: '#8de2c8', fontWeight: 600 }}>Do: </span>{dos}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.74)', lineHeight: 1.75 }}>
                  <span style={{ color: '#f4a3a1', fontWeight: 600 }}>Don't: </span>{donts}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ABOUT RESQNET — Mirrors home-copy + achievement-card section
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ ...glassBox({ padding: '28px 32px', marginTop: 24 }) }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-mono)', marginBottom: 12,
          }}>About ResQNet</div>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: 'rgba(255,255,255,0.8)', maxWidth: 760, marginBottom: 24 }}>
            ResQNet is a disaster response platform that helps victims request urgent help, gives volunteers a
            prioritized rescue workflow, lets NGOs coordinate relief contributions, and enables administrators to
            monitor response operations in one place. The platform is designed to speed up communication,
            improve resource allocation, and guide users through emergency situations with faster and more
            organized action.
          </p>

          {/* Achievement cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
          }}>
            {ACHIEVEMENTS.map(({ value, label, note }) => (
              <div key={label} style={{
                background: 'rgba(0,0,0,0.24)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: 18,
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 40,
                  letterSpacing: 1, color: 'var(--red)', lineHeight: 1,
                }}>{value}</div>
                <div style={{
                  fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-mono)', marginTop: 8,
                }}>{label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 1.7 }}>{note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RESCUE GALLERY — Mirrors rescue-gallery / gallery-grid section
        ══════════════════════════════════════════════════════════════ */}
        <div style={{ ...glassBox({ padding: '28px 32px', marginTop: 24, marginBottom: 60 }) }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-mono)', marginBottom: 10,
          }}>Rescue Operations</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.58)', lineHeight: 1.8, marginBottom: 20 }}>
            Examples of the kinds of rescue and relief activity the platform is built to support across different disasters.
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {GALLERY.map(({ src, alt, title, text }) => (
              <div key={title} style={{
                overflow: 'hidden', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(0,0,0,0.22)',
              }}>
                <img
                  src={src}
                  alt={alt}
                  style={{
                    width: '100%', height: 200, objectFit: 'cover', display: 'block',
                    filter: 'saturate(0.88) contrast(1.04)',
                  }}
                  loading="lazy"
                />
                <div style={{ padding: '14px 18px 18px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 1, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>{/* /maxWidth wrapper */}
    </div>
  );
}
