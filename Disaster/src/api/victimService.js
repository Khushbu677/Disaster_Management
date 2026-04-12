// victimService.js
// Mirrors all routes in backend/routes/victims.js
// Mount: app.use('/api/victims', victimRoutes)

import API from './api';

// POST /api/victims/register  — victim submits emergency registration form
export const registerVictim = (data) => API.post('/victims/register', data);

// POST /api/victims/login  — victim logs in to check their status
export const loginVictim = (data) => API.post('/victims/login', data);

// GET /api/victims/status/:ticketId  — victim tracks their rescue status
export const getVictimStatus = (ticketId) => API.get(`/victims/status/${ticketId}`);

// GET /api/victims/all  — admin only: all victims sorted by priority
export const getAllVictims = () => API.get('/victims/all');

// PATCH /api/victims/:id/assign  — admin assigns a volunteer to a victim
export const assignVolunteer = (id, data) => API.patch(`/victims/${id}/assign`, data);

// PATCH /api/victims/:id/status  — admin/volunteer updates victim status
export const updateVictimStatus = (id, data) => API.patch(`/victims/${id}/status`, data);
