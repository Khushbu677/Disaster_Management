import React, { useState, useCallback } from 'react';
import ReportCard from '../components/ReportCard';
import SOSCard from '../components/SOSCard';
import { adminLogin } from '../api/adminService';
import { getAdminDashboard, adminLogin as _adminLogin } from '../api/adminService';
import { getAllVictims, assignVolunteer } from '../api/victimService';
import { resolveDashboardIncident } from '../api/dashboardService';

// ── Admin Page ──────────────────────────────────────────────────────────────
// Route: /admin
// POST /api/admin/login      — hardcoded credentials
// GET  /api/admin/dashboard  — full stats (JWT required)
//
// Default test credentials (from server.js env):
//   email:     admin@resqnet.gov
//   password:  Admin@123
//   adminCode: 123456

const saveToken = (token) => {
  localStorage.setItem('rq_token', token);
  localStorage.setItem('rq_role', 'admin');
  localStorage.setItem('rq_name', 'Admin');
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('rq_token') && localStorage.getItem('rq_role') === 'admin'
  );
  const [loginForm, setLoginForm] = useState({ email: 'admin@resqnet.gov', password: 'Admin@123', adminCode: '123456' });
  const [loginError, setLoginError] = useState(null);
  const [logging, setLogging]       = useState(false);

  // Dashboard data
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [loadErr, setLoadErr]   = useState(null);
  const [tab, setTab]           = useState('overview');  // 'overview' | 'victims' | 'incidents' | 'volunteers'
  const [assigning, setAssigning] = useState(null);

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLogging(true); setLoginError(null);
    try {
      const res = await adminLogin(loginForm);
      saveToken(res.data.token);
      setIsLoggedIn(true);
      fetchDashboard();
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLogging(false);
    }
  };

  // ── Fetch dashboard ──────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true); setLoadErr(null);
    try {
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setLoadErr(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isLoggedIn) fetchDashboard();
  }, [isLoggedIn, fetchDashboard]);

  // ── Assign volunteer ─────────────────────────────────────────────────────
  const handleAssign = async (victimId, volunteerId) => {
    setAssigning(victimId);
    try {
      await assignVolunteer(victimId, volunteerId);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Assignment failed');
    } finally {
      setAssigning(null);
    }
  };

  // ── Resolve incident ─────────────────────────────────────────────────────
  const handleResolveIncident = async (id) => {
    try {
      await resolveDashboardIncident(id);
      setData(prev => ({
        ...prev,
        topIncidents: prev.topIncidents.filter(i => i._id !== id),
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Could not resolve');
    }
  };

  const logout = () => {
    localStorage.removeItem('rq_token');
    localStorage.removeItem('rq_role');
    localStorage.removeItem('rq_name');
    setIsLoggedIn(false);
    setData(null);
  };

  const S = {
    card:  { background: 'rgba(13,36,25,0.85)', border: '1px solid rgba(79,207,142,0.12)', borderRadius: 14, padding: '24px 28px', backdropFilter: 'blur(8px)' },
    label: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 6 },
  };

  /* ═══════════════════════════════════════════════════════ LOGIN FORM */
  if (!isLoggedIn) return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🛡️</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 8 }}>Restricted Access</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: 2, lineHeight: 1, marginBottom: 6 }}>ADMIN</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Default: admin@resqnet.gov / Admin@123 / 123456</div>
        </div>

        {loginError && <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 8, color: '#f09595', fontSize: 14 }}>⚠ {loginError}</div>}

        <form onSubmit={handleLogin} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={S.label}>Admin Email *</label>
            <input id="admin-email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required type="email" className="rq-input" />
          </div>
          <div>
            <label style={S.label}>Password *</label>
            <input id="admin-pass" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required type="password" className="rq-input" />
          </div>
          <div>
            <label style={S.label}>Admin Code *</label>
            <input id="admin-code" value={loginForm.adminCode} onChange={e => setLoginForm(p => ({ ...p, adminCode: e.target.value }))} required type="text" placeholder="6-digit code" className="rq-input" />
          </div>
          <button id="admin-login-btn" type="submit" disabled={logging} className="rq-btn" style={{ marginTop: 6 }}>
            {logging ? 'VERIFYING…' : '🛡️ ACCESS ADMIN PANEL'}
          </button>
        </form>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════ DASHBOARD */
  const st = data?.stats || {};
  const STAT_TILES = [
    { label: 'Total Victims',    value: st.totalVictims,   color: '#9ef1c0' },
    { label: 'Pending',          value: st.pendingVictims, color: '#FAC775' },
    { label: 'Resolved',         value: st.resolvedVictims,color: '#5DCAA5' },
    { label: 'Volunteers',       value: st.totalVolunteers,color: '#9ef1c0' },
    { label: 'Active Volunteers',value: st.activeVolunteers,color:'var(--teal)' },
    { label: 'NGO Partners',     value: st.totalNGOs,      color: '#9ef1c0' },
    { label: 'Open Incidents',   value: st.totalIncidents, color: '#FAC775' },
    { label: 'Critical',         value: st.criticalIncidents,color:'#f09595' },
  ];

  const TABS = [
    { key: 'overview',   label: 'Overview' },
    { key: 'victims',    label: `Victims (${data?.topVictims?.length || 0})` },
    { key: 'incidents',  label: `Incidents (${data?.topIncidents?.length || 0})` },
    { key: 'volunteers', label: `Volunteers (${data?.availableVolunteers?.length || 0})` },
  ];

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 62px)', padding: '40px 24px 80px', maxWidth: 1240, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 6 }}>🛡️ Admin Control Panel</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2, lineHeight: 1 }}>OPERATIONS HQ</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchDashboard} style={{ padding: '10px 20px', background: 'rgba(79,207,142,0.08)', border: '1px solid rgba(79,207,142,0.2)', borderRadius: 6, color: '#9ef1c0', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, cursor: 'pointer' }}>↻ Refresh</button>
          <button onClick={logout}         style={{ padding: '10px 20px', background: 'rgba(226,75,74,0.1)',  border: '1px solid rgba(226,75,74,0.25)',  borderRadius: 6, color: '#f09595', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {loadErr && !loading && (
        <div style={{ padding: '14px 18px', marginBottom: 20, background: 'rgba(226,75,74,0.07)', border: '1px solid rgba(226,75,74,0.22)', borderRadius: 10, color: '#f09595', fontSize: 14 }}>
          ⚠ {loadErr}
          <button onClick={fetchDashboard} style={{ marginLeft: 12, background: 'none', border: '1px solid #f09595', color: '#f09595', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)' }}>Retry</button>
        </div>
      )}

      {/* ── Stats grid ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {STAT_TILES.map(({ label, value, color }) => (
          <div key={label} style={{ ...S.card, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color, lineHeight: 1, marginBottom: 6 }}>
              {loading ? '…' : (value ?? '—')}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} id={`admin-tab-${key}`} onClick={() => setTab(key)} style={{ padding: '8px 18px', borderRadius: 6, border: tab === key ? '1px solid rgba(79,207,142,0.35)' : '1px solid rgba(255,255,255,0.08)', background: tab === key ? 'rgba(79,207,142,0.1)' : 'rgba(255,255,255,0.03)', color: tab === key ? '#9ef1c0' : 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 12, height: 160, animation: `fadeIn 0.4s ease ${i*0.07}s both` }} />)}
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {!loading && tab === 'overview' && data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={S.card}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1.5, marginBottom: 14 }}>TOP PRIORITY VICTIMS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data.topVictims || []).slice(0, 4).map(v => (
                <div key={v._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>{v.location} · {v.disasterType}</div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 100, background: 'rgba(226,75,74,0.12)', color: '#f09595', border: '1px solid rgba(226,75,74,0.25)', whiteSpace: 'nowrap' }}>
                    Score {v.priorityScore}
                  </div>
                </div>
              ))}
              {(!data.topVictims || data.topVictims.length === 0) && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>No pending victims</div>}
            </div>
          </div>
          <div style={S.card}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: 1.5, marginBottom: 14 }}>TOP INCIDENTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data.topIncidents || []).slice(0, 4).map(inc => (
                <div key={inc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{inc.type}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>{inc.location}</div>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 100, background: 'rgba(239,159,39,0.12)', color: '#FAC775', border: '1px solid rgba(239,159,39,0.3)' }}>{inc.priorityLevel}</span>
                </div>
              ))}
              {(!data.topIncidents || data.topIncidents.length === 0) && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>No incidents</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── VICTIMS TAB ── */}
      {!loading && tab === 'victims' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {(data?.topVictims || []).map(v => (
            <div key={v._id}>
              <SOSCard victim={v} />
              {!v.assignedVolunteer && (data?.availableVolunteers || []).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <select
                    id={`assign-sel-${v._id}`}
                    defaultValue=""
                    onChange={e => { if (e.target.value) handleAssign(v._id, e.target.value); }}
                    className="rq-select"
                    disabled={assigning === v._id}
                    style={{ fontSize: 12 }}
                  >
                    <option value="" disabled>⛑️ Assign volunteer…</option>
                    {(data.availableVolunteers || []).map(vol => (
                      <option key={vol._id} value={vol._id}>{vol.name} — {vol.phone}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
          {(!data?.topVictims || data.topVictims.length === 0) && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: 40, fontFamily: 'var(--font-mono)', fontSize: 13 }}>No pending victims</div>
          )}
        </div>
      )}

      {/* ── INCIDENTS TAB ── */}
      {!loading && tab === 'incidents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {(data?.topIncidents || []).map(inc => (
            <ReportCard key={inc._id} incident={inc} onResolve={handleResolveIncident} />
          ))}
          {(!data?.topIncidents || data.topIncidents.length === 0) && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: 40, fontFamily: 'var(--font-mono)', fontSize: 13 }}>No open incidents</div>
          )}
        </div>
      )}

      {/* ── VOLUNTEERS TAB ── */}
      {!loading && tab === 'volunteers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {(data?.availableVolunteers || []).map(v => (
            <div key={v._id} style={{ ...S.card, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', animation: 'pulseDot 1.5s infinite', flexShrink: 0 }} />
                <div style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</div>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>📞 {v.phone}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)' }}>Tasks completed: <span style={{ color: '#9ef1c0' }}>{v.tasksCompleted || 0}</span></div>
            </div>
          ))}
          {(!data?.availableVolunteers || data.availableVolunteers.length === 0) && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: 40, fontFamily: 'var(--font-mono)', fontSize: 13 }}>No available volunteers</div>
          )}
        </div>
      )}
    </div>
  );
}
