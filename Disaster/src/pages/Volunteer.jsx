import React, { useState, useEffect, useCallback } from 'react';
import { loginVolunteer, registerVolunteer, getVolunteerTasks, completeTask } from '../api/volunteerService';

// ── Volunteer Page ──────────────────────────────────────────────────────────
// Route: /volunteer
// POST /api/volunteers/register  — registration
// POST /api/volunteers/login     — login → JWT stored in localStorage
// GET  /api/volunteers/tasks     — priority-sorted victim list (requires JWT)
// PATCH /api/volunteers/complete/:victimId — mark task done

const EXP_LEVELS     = ['Beginner', 'Intermediate', 'Expert'];
const SPECIALIZATIONS = ['First Aid', 'Search & Rescue', 'Medical', 'Logistics', 'Communication', 'Firefighting', 'Water Rescue', 'Other'];

const PRIORITY_COLORS = {
  CRITICAL: { color: '#f09595', bg: 'rgba(226,75,74,0.15)', border: 'rgba(226,75,74,0.3)' },
  HIGH:     { color: '#FAC775', bg: 'rgba(239,159,39,0.15)', border: 'rgba(239,159,39,0.3)' },
  MEDIUM:   { color: '#5DCAA5', bg: 'rgba(29,158,117,0.15)', border: 'rgba(29,158,117,0.3)' },
  LOW:      { color: '#9ef1c0', bg: 'rgba(79,207,142,0.1)',  border: 'rgba(79,207,142,0.2)' },
};

const saveToken = (token, name) => {
  localStorage.setItem('rq_token', token);
  localStorage.setItem('rq_role', 'volunteer');
  localStorage.setItem('rq_name', name);
};

export default function Volunteer() {
  const [mode, setMode]         = useState('login');       // 'login' | 'register'
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('rq_token') && localStorage.getItem('rq_role') === 'volunteer');
  const [volName, setVolName]   = useState(localStorage.getItem('rq_name') || '');
  const [tasks, setTasks]       = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [completing, setCompleting]     = useState(null);
  const [taskError, setTaskError]       = useState(null);

  // Form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm,  setRegForm]   = useState({
    name: '', phone: '', email: '', password: '', address: '', age: '',
    bloodGroup: '', aadhaarNumber: '', licenceNumber: '',
    experienceLevel: 'Beginner', specialization: 'First Aid',
    skillsDescription: '', availability: 'Full-time', vehicleAvailable: 'No',
  });
  const [formError,   setFormError]   = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [regSuccess,  setRegSuccess]  = useState(false);

  // Fetch tasks when logged in
  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    setTaskError(null);
    try {
      const res = await getVolunteerTasks();
      setTasks(res.data || []);
    } catch (e) {
      setTaskError(e.response?.data?.error || 'Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn, fetchTasks]);

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError(null);
    try {
      const res = await loginVolunteer(loginForm);
      saveToken(res.data.token, res.data.name);
      setVolName(res.data.name);
      setIsLoggedIn(true);
    } catch (e) {
      setFormError(e.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError(null);
    try {
      const res = await registerVolunteer({ ...regForm, age: regForm.age ? Number(regForm.age) : undefined });
      saveToken(res.data.token, regForm.name);
      setVolName(regForm.name);
      setRegSuccess(true);
      setTimeout(() => { setIsLoggedIn(true); setRegSuccess(false); }, 1500);
    } catch (e) {
      setFormError(e.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Complete task ────────────────────────────────────────────────────────
  const handleComplete = async (victimId) => {
    setCompleting(victimId);
    try {
      await completeTask(victimId);
      setTasks(prev => prev.filter(v => v._id !== victimId));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to complete task');
    } finally {
      setCompleting(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('rq_token');
    localStorage.removeItem('rq_role');
    localStorage.removeItem('rq_name');
    setIsLoggedIn(false);
    setTasks([]);
  };

  const S = {
    page: {
      minHeight: 'calc(100vh - 62px)',
      padding: '48px 24px 80px',
      maxWidth: 1100,
      margin: '0 auto',
    },
    label: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 6 },
    card:  { background: 'rgba(13,36,25,0.85)', border: '1px solid rgba(79,207,142,0.12)', borderRadius: 14, padding: '28px 32px', backdropFilter: 'blur(8px)' },
  };

  /* ═══════════════════════════════════════════════════════ LOGGED-IN VIEW */
  if (isLoggedIn) return (
    <div className="page-enter" style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 6 }}>Volunteer Portal</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, letterSpacing: 2, lineHeight: 1 }}>
            WELCOME, {volName?.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            {tasksLoading ? 'Fetching tasks…' : `${tasks.length} active rescue task${tasks.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={fetchTasks} style={{ padding: '10px 20px', background: 'rgba(79,207,142,0.08)', border: '1px solid rgba(79,207,142,0.2)', borderRadius: 6, color: '#9ef1c0', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, cursor: 'pointer' }}>↻ Refresh</button>
          <button onClick={logout}     style={{ padding: '10px 20px', background: 'rgba(226,75,74,0.1)',   border: '1px solid rgba(226,75,74,0.25)',  borderRadius: 6, color: '#f09595',  fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      {/* Task error */}
      {taskError && (
        <div style={{ padding: '14px 18px', marginBottom: 20, background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 10, color: '#f09595', fontSize: 14 }}>
          ⚠ {taskError}
        </div>
      )}

      {/* Tasks grid */}
      {tasksLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 12, height: 180, animation: `fadeIn 0.4s ease ${i * 0.07}s both` }} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>All Clear</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>No active rescue tasks assigned right now.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {tasks.map((v) => {
            const pc = PRIORITY_COLORS[v.priorityLevel] || PRIORITY_COLORS.LOW;
            const done = completing === v._id;
            return (
              <div key={v._id} style={{ background: 'rgba(13,36,25,0.85)', border: `1px solid rgba(79,207,142,0.12)`, borderLeft: `3px solid ${pc.color}`, borderRadius: 12, padding: '18px 20px', opacity: done ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{v.name}</div>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 100, background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>{v.priorityLevel}</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>📍 {v.location}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span>{v.disasterType}</span>
                  <span>·</span>
                  <span>{v.numberOfPeople} people</span>
                  <span>·</span>
                  <span style={{ color: pc.color }}>Score: {v.priorityScore}</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${Math.min(100, (v.priorityScore / 200) * 100)}%`, background: pc.color }} />
                  </div>
                </div>
                <button
                  id={`complete-${v._id}`}
                  onClick={() => handleComplete(v._id)}
                  disabled={done}
                  style={{ width: '100%', padding: '9px 0', background: 'rgba(79,207,142,0.08)', border: '1px solid rgba(79,207,142,0.22)', borderRadius: 6, color: '#9ef1c0', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1.5, cursor: done ? 'not-allowed' : 'pointer' }}
                >
                  {done ? 'Completing…' : '✓ Mark Rescued'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════ AUTH FORMS */
  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 680, width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 6 }}>⛑️ Volunteer Portal</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: 2, lineHeight: 1, marginBottom: 6 }}>VOLUNTEER</div>
          <div style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 1 }}>Register or log in to see priority rescue tasks</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, border: '1px solid rgba(255,255,255,0.07)' }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setFormError(null); }} style={{ flex: 1, padding: '10px 0', borderRadius: 6, border: 'none', background: mode === m ? 'rgba(79,207,142,0.12)' : 'transparent', color: mode === m ? '#9ef1c0' : 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
              {m === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Error */}
        {formError && <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 8, color: '#f09595', fontSize: 14 }}>⚠ {formError}</div>}
        {regSuccess  && <div style={{ padding: '12px 16px', marginBottom: 16, background: 'rgba(29,158,117,0.1)',   border: '1px solid rgba(29,158,117,0.3)',  borderRadius: 8, color: '#5DCAA5', fontSize: 14 }}>✅ Registered! Logging you in…</div>}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={S.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Email *</label>
                <input id="vol-login-email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required type="email" placeholder="volunteer@email.com" className="rq-input" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Password *</label>
                <input id="vol-login-pass" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required type="password" placeholder="Your password" className="rq-input" />
              </div>
            </div>
            <button id="vol-login-btn" type="submit" disabled={submitting} className="rq-btn" style={{ marginTop: 20 }}>
              {submitting ? 'LOGGING IN…' : 'LOG IN'}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={S.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { id: 'vr-name',   key: 'name',   label: 'Full Name *',    placeholder: 'e.g. Rahul Singh', required: true },
                { id: 'vr-phone',  key: 'phone',  label: 'Phone *',        placeholder: '+91 98xxx xxxxx',  required: true },
                { id: 'vr-email',  key: 'email',  label: 'Email *',        placeholder: 'you@email.com',    required: true, type: 'email' },
                { id: 'vr-pass',   key: 'password', label: 'Password *',   placeholder: 'Set a password',   required: true, type: 'password' },
                { id: 'vr-age',    key: 'age',    label: 'Age',            placeholder: '25',               type: 'number' },
                { id: 'vr-blood',  key: 'bloodGroup', label: 'Blood Group', placeholder: 'e.g. O+' },
                { id: 'vr-addr',   key: 'address', label: 'Address',       placeholder: 'City, State', span: 2 },
                { id: 'vr-adh',    key: 'aadhaarNumber', label: 'Aadhaar (optional)', placeholder: '12-digit' },
                { id: 'vr-lic',    key: 'licenceNumber', label: 'Driving Licence (optional)', placeholder: 'Licence No.' },
              ].map(({ id, key, label, placeholder, required, type = 'text', span }) => (
                <div key={key} style={{ gridColumn: span ? 'span 2' : 'span 1' }}>
                  <label style={S.label}>{label}</label>
                  <input id={id} type={type} value={regForm[key]} onChange={e => setRegForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required={required} className="rq-input" />
                </div>
              ))}

              <div>
                <label style={S.label}>Experience Level</label>
                <select id="vr-exp" value={regForm.experienceLevel} onChange={e => setRegForm(p => ({ ...p, experienceLevel: e.target.value }))} className="rq-select">
                  {EXP_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Specialization</label>
                <select id="vr-spec" value={regForm.specialization} onChange={e => setRegForm(p => ({ ...p, specialization: e.target.value }))} className="rq-select">
                  {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Availability</label>
                <select id="vr-avail" value={regForm.availability} onChange={e => setRegForm(p => ({ ...p, availability: e.target.value }))} className="rq-select">
                  {['Full-time','Part-time','Weekends','On-call'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Vehicle Available?</label>
                <select id="vr-vehicle" value={regForm.vehicleAvailable} onChange={e => setRegForm(p => ({ ...p, vehicleAvailable: e.target.value }))} className="rq-select">
                  <option>No</option><option>Yes</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Skills Description</label>
                <textarea id="vr-skills" value={regForm.skillsDescription} onChange={e => setRegForm(p => ({ ...p, skillsDescription: e.target.value }))} placeholder="Describe your rescue skills and experience…" rows={3} className="rq-input" style={{ resize: 'vertical', minHeight: 80 }} />
              </div>
            </div>
            <button id="vol-register-btn" type="submit" disabled={submitting} className="rq-btn" style={{ marginTop: 20 }}>
              {submitting ? 'REGISTERING…' : '⛑️ REGISTER AS VOLUNTEER'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
