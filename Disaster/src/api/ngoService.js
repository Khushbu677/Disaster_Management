// ngoService.js
// Mirrors all routes in backend/routes/ngos.js
// Mount: app.use('/api/ngos', ngoRoutes)

import API from './api';

// POST /api/ngos/register  — NGO self-registration
export const registerNGO = (data) => API.post('/ngos/register', data);

// POST /api/ngos/login  — NGO login
export const loginNGO = (data) => API.post('/ngos/login', data);

// POST /api/ngos/offer  — NGO submits aid capabilities (auth: ngo role)
export const submitOffer = (data) => API.post('/ngos/offer', data);

// GET /api/ngos/all  — admin only: all NGOs
export const getAllNGOs = () => API.get('/ngos/all');
