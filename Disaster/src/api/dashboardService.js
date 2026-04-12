// dashboardService.js
// Mirrors all routes in backend/routes/dashboardIncidents.js
// Mount: app.use('/api/dashboard/incidents', dashboardIncidentRoutes)
// Note: These routes have NO auth requirement — public dashboard

import API from './api';

// GET /api/dashboard/incidents  — all active incidents sorted by priority (public)
export const getDashboardIncidents = () => API.get('/dashboard/incidents');

// POST /api/dashboard/incidents  — submit a new incident from public dashboard
export const submitDashboardIncident = (data) => API.post('/dashboard/incidents', data);

// PATCH /api/dashboard/incidents/:id/resolve  — resolve an incident (from public dashboard)
export const resolveDashboardIncident = (id) => API.patch(`/dashboard/incidents/${id}/resolve`);
