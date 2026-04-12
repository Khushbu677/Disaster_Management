import React from 'react';

// Priority colour helpers
export function getPriorityLevel(score) {
  if (score >= 130) return 'CRITICAL';
  if (score >= 80)  return 'HIGH';
  if (score >= 40)  return 'MEDIUM';
  return 'LOW';
}

export function getPriorityColor(level) {
  switch (level) {
    case 'CRITICAL': return { color: '#f09595', bg: 'rgba(226,75,74,0.15)', border: 'rgba(226,75,74,0.3)' };
    case 'HIGH':     return { color: '#FAC775', bg: 'rgba(239,159,39,0.15)', border: 'rgba(239,159,39,0.3)' };
    case 'MEDIUM':   return { color: '#5DCAA5', bg: 'rgba(29,158,117,0.15)', border: 'rgba(29,158,117,0.3)' };
    default:         return { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  }
}

export default function ReportCard({ incident, onResolve }) {
  const level  = incident.priorityLevel || getPriorityLevel(incident.priorityScore || 0);
  const clr    = getPriorityColor(level);
  const pct    = Math.min(100, ((incident.priorityScore || 0) / 200) * 100);
  const urgencyLabel = ['', 'MODERATE', 'HIGH', 'IMMEDIATE'][incident.urgency] || incident.urgency;

  return (
    <div
      className="page-enter"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${clr.color}`,
        borderRadius: 10,
        padding: '18px 20px',
        transition: 'background 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    >
      {/* Top row — type + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          letterSpacing: 1.5,
          color: 'white',
        }}>
          {incident.type?.toUpperCase()}
        </span>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          padding: '3px 10px',
          borderRadius: 100,
          background: clr.bg,
          color: clr.color,
          border: `1px solid ${clr.border}`,
          letterSpacing: 1,
        }}>
          {level}
        </span>
      </div>

      {/* Location */}
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)', marginBottom: 10 }}>
        📍 {incident.location}
      </div>

      {/* Meta */}
      <div style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.38)',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 10,
      }}>
        <span>Severity: {incident.severity}<span style={{ color: 'rgba(255,255,255,0.2)' }}>/10</span></span>
        <span>Affected: {Number(incident.peopleAffected || 0).toLocaleString()}</span>
        <span>Urgency: {urgencyLabel}</span>
        <span style={{ color: clr.color }}>Score: {incident.priorityScore}</span>
      </div>

      {/* Description */}
      {incident.description && (
        <div style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.62)',
          lineHeight: 1.7,
          marginBottom: 12,
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.025)',
          borderRadius: 6,
          borderLeft: '2px solid rgba(79,207,142,0.2)',
        }}>
          {incident.description}
        </div>
      )}

      {/* Score bar */}
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${pct}%`, background: clr.color }} />
      </div>

      {/* Submitted by */}
      {incident.submittedBy && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>
          Reported by: {incident.submittedBy} · {incident.submittedByRole}
        </div>
      )}

      {/* Resolve button */}
      {onResolve && (
        <button
          onClick={() => onResolve(incident._id)}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '9px 0',
            background: 'rgba(79,207,142,0.08)',
            border: '1px solid rgba(79,207,142,0.22)',
            color: '#9ef1c0',
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,207,142,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,207,142,0.08)'; }}
          id={`resolve-btn-${incident._id}`}
        >
          ✓ Mark Resolved
        </button>
      )}
    </div>
  );
}
