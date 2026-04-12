import React, { useState } from 'react';
import { registerVictim } from '../api/victimService';

// ── SOS Page ────────────────────────────────────────────────────────────────
// Route: /sos
// Submits to: POST /api/victims/register
// Architecture: SOS → victimService.registerVictim(data) → Axios → Express → MongoDB

const DISASTER_TYPES  = ['Flood', 'Earthquake', 'Cyclone', 'Fire', 'Landslide', 'Tsunami', 'Drought', 'Industrial Accident', 'Other'];
const INJURY_LEVELS   = ['None — Stranded only', 'Minor — First Aid needed', 'Moderate — Medical attention needed', 'Critical — Life threatening'];
const BLOOD_GROUPS    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const initialForm = {
  name: '', phone: '', email: '', password: '',
  location: '', address: '',
  age: '', bloodGroup: '', aadhaarNumber: '',
  disasterType: 'Flood',
  injuryLevel: 'None — Stranded only',
  numberOfPeople: 1,
  hasChildrenOrElderly: 'No',
  additionalInfo: '',
};

export default function SOS() {
  const [form, setForm]           = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(null);   // { ticketId, priorityLevel, priorityScore, status }
  const [error, setError]         = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...form,
        numberOfPeople: Number(form.numberOfPeople) || 1,
        age:            form.age ? Number(form.age) : undefined,
      };

      // ✅ Calls victimService — never Axios directly
      const res = await registerVictim(payload);
      setSuccess(res.data);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Priority colour for success card ────────────────────────────────────
  const lvlColor = {
    CRITICAL: '#f09595',
    HIGH:     '#FAC775',
    MEDIUM:   '#5DCAA5',
    LOW:      '#9ef1c0',
  };

  return (
    <div
      className="page-enter"
      style={{
        minHeight: 'calc(100vh - 62px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '48px 20px 80px',
      }}
    >
      {/* Success state */}
      {success ? (
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'rgba(31,163,107,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, margin: '0 auto 24px',
            border: '2px solid rgba(31,163,107,0.3)',
          }}>
            ✅
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, letterSpacing: 2, color: 'var(--teal)', marginBottom: 8 }}>
            REGISTERED
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, marginBottom: 32, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
            Your emergency request has been submitted.<br />
            Keep your ticket ID safe — use it to track your rescue status.
          </div>

          {/* Ticket card */}
          <div style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(79,207,142,0.2)',
            borderRadius: 14,
            padding: '28px 32px',
            marginBottom: 24,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              Your Ticket ID
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 48,
              letterSpacing: 4,
              color: 'var(--red)',
              marginBottom: 20,
            }}>
              {success.ticketId}
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{
                padding: '10px 20px',
                background: `${lvlColor[success.priorityLevel]}22`,
                border: `1px solid ${lvlColor[success.priorityLevel]}44`,
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: 4 }}>PRIORITY</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: lvlColor[success.priorityLevel] }}>{success.priorityLevel}</div>
              </div>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: 4 }}>SCORE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--red)' }}>{success.priorityScore}</div>
              </div>
              <div style={{
                padding: '10px 20px',
                background: 'rgba(239,159,39,0.1)',
                border: '1px solid rgba(239,159,39,0.25)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: 4 }}>STATUS</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#FAC775' }}>{success.status?.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSuccess(null)}
            className="rq-btn"
            style={{ maxWidth: 320, margin: '0 auto 12px', display: 'block' }}
            id="register-another-btn"
          >
            REGISTER ANOTHER
          </button>
          <a
            href={`/status`}
            style={{
              display: 'block', textAlign: 'center', maxWidth: 320, margin: '0 auto',
              padding: '12px 0',
              background: 'rgba(79,207,142,0.08)',
              border: '1px solid rgba(79,207,142,0.22)',
              borderRadius: 6,
              color: '#9ef1c0',
              fontFamily: 'var(--font-mono)',
              fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            id="track-status-link"
          >
            → TRACK YOUR STATUS
          </a>
        </div>
      ) : (
        /* ── Registration Form ── */
        <div style={{ maxWidth: 700, width: '100%' }}>
          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: 'var(--red)', textTransform: 'uppercase', marginBottom: 8 }}>
              Emergency Registration
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: 2, lineHeight: 1, marginBottom: 6 }}>
              SOS REQUEST
            </div>
            <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
              Submit your emergency request and receive a priority ticket
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              padding: '14px 18px', marginBottom: 20,
              background: 'rgba(226,75,74,0.1)',
              border: '1px solid rgba(226,75,74,0.3)',
              borderRadius: 8,
              color: '#f09595', fontSize: 14,
            }}>
              ⚠ {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '36px 40px',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* ── Personal Info ── */}
            <SectionDivider label="Personal Information" />
            <FormGrid>
              <FormGroup label="Full Name *">
                <input id="sos-name" name="name" value={form.name} onChange={handleChange} required
                  placeholder="e.g. Priya Sharma" className="rq-input" />
              </FormGroup>
              <FormGroup label="Phone Number *">
                <input id="sos-phone" name="phone" value={form.phone} onChange={handleChange} required
                  placeholder="+91 98765 43210" className="rq-input" />
              </FormGroup>
              <FormGroup label="Email *">
                <input id="sos-email" name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="you@email.com" className="rq-input" />
              </FormGroup>
              <FormGroup label="Password *">
                <input id="sos-password" name="password" type="password" value={form.password} onChange={handleChange} required
                  placeholder="Set a password to track status" className="rq-input" />
              </FormGroup>
              <FormGroup label="Age">
                <input id="sos-age" name="age" type="number" value={form.age} onChange={handleChange}
                  placeholder="Your age" min="0" max="120" className="rq-input" />
              </FormGroup>
              <FormGroup label="Blood Group">
                <select id="sos-blood" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="rq-select">
                  <option value="">Unknown</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Aadhaar Number (optional)" span={2}>
                <input id="sos-aadhaar" name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange}
                  placeholder="12-digit Aadhaar" maxLength="12" className="rq-input" />
              </FormGroup>
            </FormGrid>

            {/* ── Location ── */}
            <SectionDivider label="Location" />
            <FormGrid>
              <FormGroup label="Current Location *">
                <input id="sos-location" name="location" value={form.location} onChange={handleChange} required
                  placeholder="Village, Area, City" className="rq-input" />
              </FormGroup>
              <FormGroup label="Full Address">
                <input id="sos-address" name="address" value={form.address} onChange={handleChange}
                  placeholder="Street, Landmark" className="rq-input" />
              </FormGroup>
            </FormGrid>

            {/* ── Disaster Info ── */}
            <SectionDivider label="Disaster Details" />
            <FormGrid>
              <FormGroup label="Disaster Type *">
                <select id="sos-disaster" name="disasterType" value={form.disasterType} onChange={handleChange} required className="rq-select">
                  {DISASTER_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Number of People *">
                <input id="sos-people" name="numberOfPeople" type="number" value={form.numberOfPeople} onChange={handleChange}
                  required min="1" max="10000" className="rq-input" />
              </FormGroup>
              <FormGroup label="Injury Level *" span={2}>
                <select id="sos-injury" name="injuryLevel" value={form.injuryLevel} onChange={handleChange} required className="rq-select">
                  {INJURY_LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Children or Elderly Present?">
                <select id="sos-children" name="hasChildrenOrElderly" value={form.hasChildrenOrElderly} onChange={handleChange} className="rq-select">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </FormGroup>
              <FormGroup label="Additional Info">
                <textarea id="sos-info" name="additionalInfo" value={form.additionalInfo} onChange={handleChange}
                  placeholder="Any other relevant details…" rows={3}
                  className="rq-input" style={{ resize: 'vertical', minHeight: 80 }} />
              </FormGroup>
            </FormGrid>

            {/* Submit */}
            <button
              id="sos-submit-btn"
              type="submit"
              disabled={submitting}
              className="rq-btn"
              style={{ marginTop: 28 }}
            >
              {submitting ? 'SUBMITTING…' : '🆘 SUBMIT EMERGENCY REQUEST'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────--- */
function SectionDivider({ label }) {
  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: 16,
      marginTop: 20,
      marginBottom: 16,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.28)',
      fontFamily: 'var(--font-mono)',
    }}>
      {label}
    </div>
  );
}

function FormGrid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 16,
    }}>
      {children}
    </div>
  );
}

function FormGroup({ label, span, children }) {
  return (
    <div style={{ gridColumn: span === 2 ? 'span 2' : 'span 1', display: 'flex', flexDirection: 'column' }}>
      <label className="rq-label">{label}</label>
      {children}
    </div>
  );
}
