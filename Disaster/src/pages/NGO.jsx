import React, { useState, useEffect, useCallback } from 'react';
import { loginNGO, registerNGO, submitOffer } from '../api/ngoService';

// ── NGO Page ────────────────────────────────────────────────────────────────
// Route: /ngo
// POST /api/ngos/register  — register
// POST /api/ngos/login     — login
// POST /api/ngos/offer     — submit aid offer (auth required)

const CAPABILITIES = ['Food & Water', 'Medical Aid', 'Shelter', 'Search & Rescue', 'Logistics', 'Counselling', 'Legal Aid', 'Evacuation Support'];

const saveToken = (token, name) => {
  localStorage.setItem('rq_token', token);
  localStorage.setItem('rq_role', 'ngo');
  localStorage.setItem('rq_name', name);
};

export default function NGO() {
  const [mode, setMode]         = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('rq_token') && localStorage.getItem('rq_role') === 'ngo');
  const [orgName, setOrgName]   = useState(localStorage.getItem('rq_name') || '');
  const [submitting, setSubmitting]   = useState(false);
  const [formError,  setFormError]    = useState(null);
  const [regSuccess, setRegSuccess]   = useState(false);
  const [offerSent,  setOfferSent]    = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm,   setRegForm]   = useState({
    organizationName: '', registrationNumber: '', establishedYear: '',
    headName: '', phone: '', email: '', password: '', registeredAddress: '',
    totalWorkers: '', trainedRescueWorkers: '', pastExperience: '',
  });
  const [offerForm, setOfferForm] = useState({
    capabilities: [],
    capacityDetails: '',
    deploymentTimeline: '24 hours',
  });

  const toggleCapability = (cap) => {
    setOfferForm(p => ({
      ...p,
      capabilities: p.capabilities.includes(cap)
        ? p.capabilities.filter(c => c !== cap)
        : [...p.capabilities, cap],
    }));
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError(null);
    try {
      const res = await loginNGO(loginForm);
      saveToken(res.data.token, res.data.organizationName);
      setOrgName(res.data.organizationName);
      setIsLoggedIn(true);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError(null);
    try {
      const payload = {
        ...regForm,
        establishedYear:    Number(regForm.establishedYear) || undefined,
        totalWorkers:       Number(regForm.totalWorkers) || undefined,
        trainedRescueWorkers: Number(regForm.trainedRescueWorkers) || undefined,
      };
      const res = await registerNGO(payload);
      saveToken(res.data.token, regForm.organizationName);
      setOrgName(regForm.organizationName);
      setRegSuccess(true);
      setTimeout(() => { setIsLoggedIn(true); setRegSuccess(false); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit Aid Offer ─────────────────────────────────────────────────────
  const handleOffer = async (e) => {
    e.preventDefault();
    if (offerForm.capabilities.length === 0) {
      setFormError('Select at least one capability');
      return;
    }
    setSubmitting(true); setFormError(null);
    try {
      await submitOffer(offerForm);
      setOfferSent(true);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit offer');
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rq_token');
    localStorage.removeItem('rq_role');
    localStorage.removeItem('rq_name');
    setIsLoggedIn(false);
    setOfferSent(false);
  };

  const S = {
    page:  { minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 80px' },
    label: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 6 },
    card:  { background: 'rgba(13,36,25,0.85)', border: '1px solid rgba(79,207,142,0.12)', borderRadius: 14, padding: '28px 32px', backdropFilter: 'blur(8px)', width: '100%' },
  };

  /* ═══════════════════════════════════════════════════════ LOGGED-IN VIEW */
  if (isLoggedIn) return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 62px)', padding: '48px 24px 80px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 6 }}>🏛️ NGO Portal</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2, lineHeight: 1 }}>{orgName?.toUpperCase()}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Submit your relief capabilities to active disasters</div>
        </div>
        <button onClick={logout} style={{ padding: '10px 20px', background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 6, color: '#f09595', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, cursor: 'pointer' }}>Sign Out</button>
      </div>

      {offerSent ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🤝</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: 2, color: 'var(--teal)', marginBottom: 8 }}>OFFER SUBMITTED</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 24 }}>
            Your aid capabilities have been communicated to the coordination team.<br />They will reach out to deploy your resources.
          </div>
          <button onClick={() => setOfferSent(false)} style={{ padding: '12px 28px', background: 'rgba(79,207,142,0.08)', border: '1px solid rgba(79,207,142,0.2)', borderRadius: 6, color: '#9ef1c0', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 2, cursor: 'pointer' }}>
            SUBMIT ANOTHER
          </button>
        </div>
      ) : (
        <form onSubmit={handleOffer} style={S.card}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, marginBottom: 20 }}>SUBMIT AID OFFER</div>

          {formError && <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 8, color: '#f09595', fontSize: 14 }}>⚠ {formError}</div>}

          {/* Capabilities */}
          <label style={S.label}>Aid Capabilities * (select all that apply)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CAPABILITIES.map(cap => {
              const sel = offerForm.capabilities.includes(cap);
              return (
                <button key={cap} type="button" id={`cap-${cap.replace(/\s/g,'-').toLowerCase()}`}
                  onClick={() => toggleCapability(cap)}
                  style={{ padding: '8px 16px', borderRadius: 100, border: sel ? '1px solid rgba(79,207,142,0.4)' : '1px solid rgba(255,255,255,0.1)', background: sel ? 'rgba(79,207,142,0.12)' : 'rgba(255,255,255,0.03)', color: sel ? '#9ef1c0' : 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {sel ? '✓ ' : ''}{cap}
                </button>
              );
            })}
          </div>

          {/* Capacity details */}
          <label style={S.label}>Capacity Details *</label>
          <textarea id="ngo-capacity" value={offerForm.capacityDetails} onChange={e => setOfferForm(p => ({ ...p, capacityDetails: e.target.value }))} placeholder="e.g. Can provide 500 food packets, 3 medical teams, 20 tents…" rows={4} required className="rq-input" style={{ resize: 'vertical', minHeight: 100, marginBottom: 18 }} />

          {/* Timeline */}
          <label style={S.label}>Deployment Timeline *</label>
          <select id="ngo-timeline" value={offerForm.deploymentTimeline} onChange={e => setOfferForm(p => ({ ...p, deploymentTimeline: e.target.value }))} className="rq-select" style={{ marginBottom: 24 }}>
            {['Within 6 hours', '12 hours', '24 hours', '48 hours', '72 hours', '1 week'].map(t => <option key={t}>{t}</option>)}
          </select>

          <button id="ngo-offer-btn" type="submit" disabled={submitting} className="rq-btn">{submitting ? 'SUBMITTING…' : '🏛️ SUBMIT AID OFFER'}</button>
        </form>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════ AUTH FORMS */
  return (
    <div className="page-enter" style={S.page}>
      <div style={{ maxWidth: 680, width: '100%' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 6 }}>🏛️ NGO Portal</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: 2, lineHeight: 1, marginBottom: 6 }}>NGO</div>
          <div style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 1 }}>Register your organisation or log in to offer relief aid</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, border: '1px solid rgba(255,255,255,0.07)' }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setFormError(null); }} style={{ flex: 1, padding: '10px 0', borderRadius: 6, border: 'none', background: mode === m ? 'rgba(79,207,142,0.12)' : 'transparent', color: mode === m ? '#9ef1c0' : 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
              {m === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {formError  && <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 8, color: '#f09595', fontSize: 14 }}>⚠ {formError}</div>}
        {regSuccess && <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: 8, color: '#5DCAA5', fontSize: 14 }}>✅ NGO registered! Logging you in…</div>}

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={S.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Email *</label>
                <input id="ngo-login-email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required type="email" placeholder="ngo@organisation.org" className="rq-input" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Password *</label>
                <input id="ngo-login-pass" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required type="password" placeholder="Your password" className="rq-input" />
              </div>
            </div>
            <button id="ngo-login-btn" type="submit" disabled={submitting} className="rq-btn" style={{ marginTop: 20 }}>{submitting ? 'LOGGING IN…' : 'LOG IN'}</button>
          </form>
        )}

        {/* ── REGISTER ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={S.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { id:'nr-org',   key:'organizationName',    label:'Organisation Name *', placeholder:'e.g. Helping Hands Foundation', span:2, required:true },
                { id:'nr-reg',   key:'registrationNumber',  label:'Registration No. *',  placeholder:'NGO Regd. No.', required:true },
                { id:'nr-year',  key:'establishedYear',     label:'Established Year',    placeholder:'2005', type:'number' },
                { id:'nr-head',  key:'headName',            label:'Head / Director Name *', placeholder:'Name', required:true },
                { id:'nr-phone', key:'phone',               label:'Phone *',             placeholder:'+91 98xxx xxxxx', required:true },
                { id:'nr-email', key:'email',               label:'Email *',             placeholder:'ngo@org.com', required:true, type:'email' },
                { id:'nr-pass',  key:'password',            label:'Password *',          placeholder:'Set a password', required:true, type:'password' },
                { id:'nr-addr',  key:'registeredAddress',   label:'Registered Address',  placeholder:'City, State', span:2 },
                { id:'nr-total', key:'totalWorkers',        label:'Total Workers',       placeholder:'150', type:'number' },
                { id:'nr-train', key:'trainedRescueWorkers',label:'Trained Rescue Workers', placeholder:'30', type:'number' },
                { id:'nr-exp',   key:'pastExperience',      label:'Past Experience',     placeholder:'Describe previous disaster relief work…', span:2, textarea:true },
              ].map(({ id, key, label, placeholder, required, type='text', span, textarea }) => (
                <div key={key} style={{ gridColumn: span ? 'span 2' : 'span 1' }}>
                  <label style={S.label}>{label}</label>
                  {textarea
                    ? <textarea id={id} value={regForm[key]} onChange={e => setRegForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} rows={3} className="rq-input" style={{ resize:'vertical', minHeight:80 }} />
                    : <input id={id} type={type} value={regForm[key]} onChange={e => setRegForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required={required} className="rq-input" />
                  }
                </div>
              ))}
            </div>
            <button id="ngo-register-btn" type="submit" disabled={submitting} className="rq-btn" style={{ marginTop: 20 }}>{submitting ? 'REGISTERING…' : '🏛️ REGISTER NGO'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
