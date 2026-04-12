// incidentService.js
// Mirrors all routes in backend/routes/incidents.js
// Mount: app.use('/api/incidents', incidentRoutes)
// Note: All these routes require auth (protect + blockVictims middleware)

import API from './api';

// POST /api/incidents  — volunteer/admin/NGO submits a new incident
export const createIncident = (data) => API.post('/incidents', data);

// GET /api/incidents  — all active incidents sorted by priority (for dashboard map)
export const getIncidents = () => API.get('/incidents');

// PATCH /api/incidents/:id/resolve  — resolve an incident
export const resolveIncident = (id) => API.patch(`/incidents/${id}/resolve`);

// GET /api/incidents/stats  — incident statistics breakdown
export const getIncidentStats = () => API.get('/incidents/stats');
