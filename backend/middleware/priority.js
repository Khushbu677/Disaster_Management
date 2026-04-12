// ================================================
// Priority Algorithm — shared between victim scores
// and incident scores
// Score = (severity*10) + (people/500) + (urgency*15) * timeDecay
// ================================================

function calculatePriorityScore(data) {
  const { severity, peopleAffected, urgency, createdAt } = data;

  // Time decay: score drops 1% per minute, minimum 50%
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

function getPriorityLevel(score) {
  if (score >= 130) return 'CRITICAL';
  if (score >= 80)  return 'HIGH';
  if (score >= 40)  return 'MEDIUM';
  return 'LOW';
}

// Map injury level text → numeric severity
function injuryToSeverity(injuryLevel) {
  const map = {
    'Critical — Immediate help needed': 9,
    'Moderate — Injured but stable': 6,
    'Minor — Mostly safe': 3,
    'None — Stranded only': 1,
  };
  return map[injuryLevel] || 5;
}

// Map injury level text → urgency number
function injuryToUrgency(injuryLevel) {
  if (injuryLevel.startsWith('Critical')) return 3;
  if (injuryLevel.startsWith('Moderate')) return 2;
  return 1;
}

module.exports = {
  calculatePriorityScore,
  getPriorityLevel,
  injuryToSeverity,
  injuryToUrgency,
};