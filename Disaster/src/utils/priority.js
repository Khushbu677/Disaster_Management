// =============================================
// Priority Algorithm — matches backend formula
// Score = (severity*10) + (people/500) + (urgency*15) * timeDecay
// =============================================

export const URGENCY_LABELS = {
  3: 'IMMEDIATE',
  2: 'HIGH',
  1: 'MODERATE',
};

export const DISASTER_TYPES = ['Flood', 'Earthquake', 'Fire', 'Landslide', 'Storm', 'Cyclone', 'Tsunami'];

export const DISASTER_ICONS = {
  Flood: '🌊',
  Earthquake: '⚡',
  Fire: '🔥',
  Landslide: '⛰',
  Storm: '🌪',
  Cyclone: '🌀',
  Tsunami: '🌊',
};

export function calculatePriority(report) {
  const { severity, peopleAffected, urgency, createdAt } = report;

  // Time decay: priority decreases 1% per minute, min 50%
  let decay = 1;
  if (createdAt) {
    const ageMinutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
    decay = Math.max(0.5, 1 - ageMinutes * 0.01);
  }

  const score = Math.round(
    (severity * 10 + peopleAffected / 500 + urgency * 15) * decay
  );

  return score;
}

export function getPriorityLevel(score) {
  if (score >= 130) return 'CRITICAL';
  if (score >= 80) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export function getPriorityColor(level) {
  switch (level) {
    case 'CRITICAL': return 'var(--red)';
    case 'HIGH': return 'var(--amber)';
    case 'MEDIUM': return 'var(--green)';
    default: return 'var(--text-muted)';
  }
}

export function getPriorityBg(level) {
  switch (level) {
    case 'CRITICAL': return 'var(--red-dim)';
    case 'HIGH': return 'var(--amber-dim)';
    case 'MEDIUM': return 'var(--green-dim)';
    default: return 'rgba(255,255,255,0.04)';
  }
}

export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Initial seed data
export const SEED_REPORTS = [
  {
    id: 1,
    type: 'Flood',
    location: 'Zone A — Riverbank District',
    severity: 9,
    peopleAffected: 12000,
    urgency: 3,
    lat: 28.65,
    lng: 77.23,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    description: 'Major flooding across 3 residential blocks. Water level rising.',
  },
  {
    id: 2,
    type: 'Earthquake',
    location: 'Zone B — City Center',
    severity: 8,
    peopleAffected: 25000,
    urgency: 3,
    lat: 28.70,
    lng: 77.10,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    description: 'Magnitude 6.1 earthquake. Multiple buildings damaged.',
  },
  {
    id: 3,
    type: 'Fire',
    location: 'Zone C — Industrial Area',
    severity: 7,
    peopleAffected: 3000,
    urgency: 2,
    lat: 28.58,
    lng: 77.35,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    description: 'Factory fire spreading to nearby warehouses.',
  },
  {
    id: 4,
    type: 'Landslide',
    location: 'Zone D — Hill Road',
    severity: 5,
    peopleAffected: 800,
    urgency: 2,
    lat: 28.75,
    lng: 77.18,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    description: 'Road blocked by debris. 3 vehicles trapped.',
  },
  {
    id: 5,
    type: 'Storm',
    location: 'Zone E — Coastal Belt',
    severity: 6,
    peopleAffected: 5000,
    urgency: 1,
    lat: 28.62,
    lng: 77.08,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    description: 'Cyclonic storm with 80 km/h winds expected.',
  },
];