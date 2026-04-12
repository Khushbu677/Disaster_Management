// adminService.js
// Mirrors all routes in backend/routes/admin.js
// Mount: app.use('/api/admin', adminRoutes)

import API from './api';

// POST /api/admin/login  — admin login (returns JWT token)
// Credentials: email, password, adminCode
export const adminLogin = (data) => API.post('/admin/login', data);

// GET /api/admin/dashboard  — full stats for admin dashboard (auth: admin)
// Returns: stats, topVictims, topIncidents, availableVolunteers
export const getAdminDashboard = () => API.get('/admin/dashboard');
