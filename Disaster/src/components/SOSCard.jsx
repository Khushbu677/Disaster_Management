import React from 'react';

// Victim/SOS card shown on Dashboard
// Maps to data returned by GET /api/victims/all (admin)
// or the registered victim's data stored in state

const statusColors = {
  pending:    { color: '#FAC775', bg: 'rgba(239,159,39,0.12)', border: 'rgba(239,159,39,0.3)' },
  reviewing:  { color: '#9ef1c0', bg: 'rgba(79,207,142,0.12)', border: 'rgba(79,207,142,0.3)' },
  assigned:   { color: '#5DCAA5', bg: 'rgba(29,158,117,0.12)', border: 'rgba(29,158,117,0.3)' },
  resolved:   { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
};

const priorityColors = {
  CRITICAL: '#f09595',
  HIGH:     '#FAC775',
  MEDIUM:   '#5DCAA5',
  LOW:      'rgba(255,255,255,0.45)',
};

export default function SOSCard({ victim }) {
  const st  = statusColors[victim.status] || statusColors.pending;
  const pc  = priorityColors[victim.priorityLevel] || priorityColors.LOW;
  const pct = Math.min(100, ((victim.priorityScore || 0) / 200) * 100);

  return (
    <div
      className="page-enter"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${pc}`,
        borderRadius: 10,
        padding: '18px 20px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: 3 }}>
            #{victim.ticketId}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{victim.name}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {/* Priority badge */}
          <span style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1,
            padding: '2px 8px', borderRadius: 100,
            color: pc, background: `${pc}22`, border: `1px solid ${pc}55`,
          }}>
            {victim.priorityLevel}
          </span>
          {/* Status badge */}
          <span style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1,
            padding: '2px 8px', borderRadius: 100,
            color: st.color, background: st.bg, border: `1px solid ${st.border}`,
          }}>
            {victim.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Location */}
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
        📍 {victim.location}
      </div>

      {/* Meta row */}
      <div style={{
        fontSize: 12, fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.38)',
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10,
      }}>
        <span>Disaster: {victim.disasterType}</span>
        <span>Injury: {victim.injuryLevel?.split('—')[0]?.trim()}</span>
        <span>People: {victim.numberOfPeople}</span>
        {victim.bloodGroup && <span>Blood: {victim.bloodGroup}</span>}
      </div>

      {/* Assigned volunteer */}
      {victim.assignedVolunteer && (
        <div style={{
          fontSize: 12, color: '#5DCAA5', fontFamily: 'var(--font-mono)',
          marginBottom: 8, padding: '6px 10px',
          background: 'rgba(29,158,117,0.07)', borderRadius: 6,
          border: '1px solid rgba(29,158,117,0.15)',
        }}>
          ⛑️ Assigned: {victim.assignedVolunteer?.name || victim.assignedVolunteer}
        </div>
      )}

      {/* Priority score bar */}
      <div style={{ marginTop: 4 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, fontFamily: 'var(--font-mono)',
          color: 'rgba(255,255,255,0.32)', marginBottom: 4,
        }}>
          <span>Priority Score</span>
          <span style={{ color: pc }}>{victim.priorityScore}</span>
        </div>
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${pct}%`, background: pc }} />
        </div>
      </div>
    </div>
  );
}
