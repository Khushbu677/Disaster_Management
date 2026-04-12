import React, { useState } from 'react';
import { getVictimStatus } from '../api/victimService';

// ── Victim Status Page ──────────────────────────────────────────────────────
// Route: /status
// Data: GET /api/victims/status/:ticketId  (no auth required)
// Architecture: VictimStatus → victimService.getVictimStatus(id) → Axios → Express → MongoDB

const STATUS_STEPS = [
  { key: 'pending',    label: 'Request Submitted',  sub: 'Your SOS has been logged in the system.' },
  { key: 'reviewing', label: 'Under Review',         sub: 'Coordinators are evaluating your situation.' },
  { key: 'assigned',  label: 'Volunteer Assigned',   sub: 'A rescue volunteer is on the way.' },
  { key: 'resolved',  label: 'Rescue Complete',      sub: 'You have been marked as rescued.' },
];

const STATUS_ORDER = ['pending', 'reviewing', 'assigned', 'resolved'];

const PRIORITY_COLORS = {
  CRITICAL: { color: '#f09595', bg: 'rgba(226,75,74,0.15)', border: 'rgba(226,75,74,0.3)' },
  HIGH:     { color: '#FAC775', bg: 'rgba(239,159,39,0.15)', border: 'rgba(239,159,39,0.3)' },
  MEDIUM:   { color: '#5DCAA5', bg: 'rgba(29,158,117,0.15)', border: 'rgba(29,158,117,0.3)' },
  LOW:      { color: '#9ef1c0', bg: 'rgba(79,207,142,0.1)',  border: 'rgba(79,207,142,0.2)' },
};

export default function VictimStatus() {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await getVictimStatus(ticketId.trim().toUpperCase());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ticket not found. Check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = result ? STATUS_ORDER.indexOf(result.status) : -1;
  const pc = result ? (PRIORITY_COLORS[result.priorityLevel] || PRIORITY_COLORS.LOW) : null;

  return (
    <div
      className="page-enter"
      style={{
        minHeight: 'calc(100vh - 62px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '56px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 560, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2,
            color: 'var(--red)', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Rescue Tracker
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: 2, lineHeight: 1, marginBottom: 10 }}>
            TRACK STATUS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
            Enter your ticket ID to check your rescue status
          </div>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleCheck} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <input
            id="ticket-input"
            value={ticketId}
            onChange={e => { setTicketId(e.target.value); setError(null); }}
            placeholder="Enter Ticket ID  e.g. VIC-001"
            className="rq-input"
            style={{ flex: 1, fontFamily: 'var(--font-mono)', letterSpacing: 2, textTransform: 'uppercase' }}
            autoFocus
          />
          <button
            id="track-submit-btn"
            type="submit"
            disabled={loading || !ticketId.trim()}
            style={{
              padding: '12px 24px',
              background: 'var(--red)',
              border: 'none',
              borderRadius: 6,
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              letterSpacing: 2,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !ticketId.trim() ? 0.6 : 1,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '…' : 'TRACK'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px 18px', marginBottom: 20,
            background: 'rgba(226,75,74,0.08)',
            border: '1px solid rgba(226,75,74,0.25)',
            borderRadius: 10, color: '#f09595', fontSize: 14,
            fontFamily: 'var(--font-mono)',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result card */}
        {result && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Ticket header */}
            <div style={{
              background: 'rgba(13,36,25,0.9)',
              border: '1px solid rgba(79,207,142,0.18)',
              borderRadius: 14,
              padding: '24px 28px',
              marginBottom: 16,
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'rgba(255,255,255,0.32)', letterSpacing: 2, marginBottom: 4,
                  }}>TICKET ID</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 36,
                    color: 'var(--red)', letterSpacing: 3, lineHeight: 1,
                  }}>{result.ticketId}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  {/* Priority badge */}
                  {result.priorityLevel && (
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 10px',
                      borderRadius: 100, letterSpacing: 1,
                      color: pc.color, background: pc.bg, border: `1px solid ${pc.border}`,
                    }}>
                      {result.priorityLevel}
                    </span>
                  )}
                  {/* Status badge */}
                  <span style={{
                    fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 10px',
                    borderRadius: 100, letterSpacing: 1,
                    color: '#FAC775',
                    background: 'rgba(239,159,39,0.12)',
                    border: '1px solid rgba(239,159,39,0.3)',
                  }}>
                    {result.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Score bar */}
              {result.priorityScore != null && (
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    color: 'rgba(255,255,255,0.3)', marginBottom: 5,
                  }}>
                    <span>Priority Score</span>
                    <span style={{ color: pc.color }}>{result.priorityScore}</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" style={{
                      width: `${Math.min(100, (result.priorityScore / 200) * 100)}%`,
                      background: pc.color,
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Rescue progress tracker */}
            <div style={{
              background: 'rgba(13,36,25,0.9)',
              border: '1px solid rgba(79,207,142,0.18)',
              borderRadius: 14,
              padding: '24px 28px',
              marginBottom: 16,
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-mono)', marginBottom: 18,
              }}>Rescue Progress</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {STATUS_STEPS.map((step, i) => {
                  const done   = i < currentStepIndex;
                  const active = i === currentStepIndex;
                  const dotBg  = done   ? 'rgba(29,158,117,0.2)'
                               : active ? 'rgba(239,159,39,0.2)'
                               :          'rgba(255,255,255,0.05)';
                  const dotClr = done   ? '#5DCAA5'
                               : active ? '#FAC775'
                               :          'rgba(255,255,255,0.2)';
                  const dotBrd = done   ? 'rgba(29,158,117,0.4)'
                               : active ? 'rgba(239,159,39,0.4)'
                               :          'rgba(255,255,255,0.08)';
                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, background: dotBg,
                        color: dotClr, border: `1px solid ${dotBrd}`,
                        animation: active ? 'pulseDot 2s infinite' : 'none',
                      }}>
                        {done ? '✓' : active ? '●' : '○'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 14, fontWeight: active ? 600 : 400,
                          color: active ? 'white' : done ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.32)',
                        }}>{step.label}</div>
                        <div style={{
                          fontSize: 12, color: 'rgba(255,255,255,0.35)',
                          fontFamily: 'var(--font-mono)', marginTop: 2,
                        }}>{step.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned volunteer */}
            {result.assignedVolunteer && (
              <div style={{
                background: 'rgba(29,158,117,0.06)',
                border: '1px solid rgba(29,158,117,0.2)',
                borderRadius: 12, padding: '18px 22px',
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.32)', fontFamily: 'var(--font-mono)', marginBottom: 10,
                }}>Assigned Volunteer</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 28 }}>⛑️</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#5DCAA5' }}>
                      {result.assignedVolunteer?.name || 'Volunteer'}
                    </div>
                    {result.assignedVolunteer?.phone && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        📞 {result.assignedVolunteer.phone}
                      </div>
                    )}
                  </div>
                  <div style={{
                    marginLeft: 'auto', width: 8, height: 8,
                    background: 'var(--teal)', borderRadius: '50%',
                    animation: 'pulseDot 1.5s infinite',
                  }} />
                </div>
              </div>
            )}

            {/* Search again */}
            <button
              onClick={() => { setResult(null); setTicketId(''); }}
              style={{
                width: '100%', padding: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: 'rgba(255,255,255,0.55)',
                fontFamily: 'var(--font-mono)', fontSize: 12,
                letterSpacing: 2, cursor: 'pointer', transition: 'all 0.2s',
              }}
              id="search-again-btn"
            >
              ← SEARCH ANOTHER TICKET
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
