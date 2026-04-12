import React, { useEffect, useState, useCallback } from 'react';
import ReportCard from '../components/ReportCard';
import { getDashboardIncidents, resolveDashboardIncident } from '../api/dashboardService';

// ── Reports Page ────────────────────────────────────────────────────────────
// Route: /reports
// Data: GET /api/dashboard/incidents  (no auth required)
// Architecture: Reports → dashboardService → Axios → Express → MongoDB

export default function Reports() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('priority');
  const [resolving, setResolving] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardIncidents();
      setIncidents(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load reports. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // ── Resolve ──────────────────────────────────────────────────────────────
  const handleResolve = async (id) => {
    try {
      setResolving(id);
      await resolveDashboardIncident(id);
      setIncidents(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not resolve incident');
    } finally {
      setResolving(null);
    }
  };

  // ── Filter + Sort ────────────────────────────────────────────────────────
  const sorted = [...incidents].sort((a, b) => {
    if (sortBy === 'priority') return (b.priorityScore || 0) - (a.priorityScore || 0);
    if (sortBy === 'type')     return (a.type || '').localeCompare(b.type || '');
    if (sortBy === 'affected') return (b.peopleAffected || 0) - (a.peopleAffected || 0);
    return 0;
  });

  const q = search.toLowerCase().trim();
  const filtered = q
    ? sorted.filter(i =>
        (i.type || '').toLowerCase().includes(q) ||
        (i.location || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q)
      )
    : sorted;

  // ── Stats summary ────────────────────────────────────────────────────────
  const totalAffected = incidents.reduce((s, i) => s + (Number(i.peopleAffected) || 0), 0);
  const byLevel = {
    CRITICAL: incidents.filter(i => i.priorityLevel === 'CRITICAL').length,
    HIGH:     incidents.filter(i => i.priorityLevel === 'HIGH').length,
    MEDIUM:   incidents.filter(i => i.priorityLevel === 'MEDIUM').length,
    LOW:      incidents.filter(i => !['CRITICAL','HIGH','MEDIUM'].includes(i.priorityLevel)).length,
  };

  const statPills = [
    { label: 'Total Active',    value: incidents.length,        color: '#9ef1c0' },
    { label: 'Critical',        value: byLevel.CRITICAL,        color: '#f09595' },
    { label: 'High',            value: byLevel.HIGH,            color: '#FAC775' },
    { label: 'Medium',          value: byLevel.MEDIUM,          color: '#5DCAA5' },
    { label: 'People Affected', value: totalAffected.toLocaleString(), color: 'rgba(255,255,255,0.6)' },
  ];

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 62px)' }}>
      {/* Page header */}
      <div style={{
        padding: '48px 24px 0',
        maxWidth: 1240,
        margin: '0 auto',
        background: 'radial-gradient(ellipse at top right, rgba(79,207,142,0.06) 0%, transparent 55%)',
      }}>
        {/* Breadcrumb label */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: 2, color: 'var(--red)',
          textTransform: 'uppercase', marginBottom: 8,
        }}>
          Live Reports
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 7vw, 72px)',
          letterSpacing: 2,
          lineHeight: 1,
          marginBottom: 8,
        }}>
          DISASTER REPORTS
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.42)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          letterSpacing: 1,
          marginBottom: 28,
        }}>
          All active incidents sorted by priority — fetched live from backend
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {statPills.map(({ label, value, color }) => (
            <div key={label} style={{
              padding: '8px 18px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color, lineHeight: 1 }}>
                {loading ? '—' : value}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Search + Sort controls */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          flexWrap: 'wrap', marginBottom: 24,
        }}>
          {/* Search input */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.3)', fontSize: 14,
            }}>🔍</span>
            <input
              id="reports-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by type, location, description…"
              className="rq-input"
              style={{ paddingLeft: 38 }}
            />
          </div>

          {/* Sort */}
          <select
            id="reports-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="rq-select"
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="priority">Sort: Priority Score</option>
            <option value="affected">Sort: Most Affected</option>
            <option value="type">Sort: Type A–Z</option>
          </select>

          <button
            onClick={fetchIncidents}
            id="reports-refresh-btn"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              letterSpacing: 1.5, padding: '12px 18px',
              borderRadius: 6,
              border: '1px solid rgba(79,207,142,0.2)',
              background: 'rgba(79,207,142,0.06)',
              color: '#9ef1c0', cursor: 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Content area */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Error */}
        {error && !loading && (
          <div style={{
            padding: '24px 28px',
            background: 'rgba(226,75,74,0.07)',
            border: '1px solid rgba(226,75,74,0.22)',
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#f09595', marginBottom: 6 }}>
              ⚠ Error Loading Reports
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{error}</div>
            <button
              onClick={fetchIncidents}
              style={{
                marginTop: 14, padding: '8px 20px',
                background: 'rgba(226,75,74,0.12)',
                border: '1px solid rgba(226,75,74,0.28)',
                color: '#f09595', borderRadius: 6,
                fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, height: 140,
                animation: `fadeIn 0.5s ease ${i * 0.06}s both`,
              }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>
              {search ? 'No Results Found' : 'No Active Reports'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1 }}>
              {search ? `No incidents matching "${search}"` : 'All incidents have been resolved or none exist yet.'}
            </div>
          </div>
        )}

        {/* Report list */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Results count */}
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5,
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              Showing {filtered.length} of {incidents.length} reports
              {search && ` · filtered by "${search}"`}
            </div>

            {filtered.map((incident, idx) => (
              <div
                key={incident._id}
                style={{
                  opacity: resolving === incident._id ? 0.45 : 1,
                  transition: 'opacity 0.3s',
                  animation: `fadeIn 0.35s ease ${Math.min(idx, 8) * 0.04}s both`,
                }}
              >
                <ReportCard
                  incident={incident}
                  onResolve={handleResolve}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
