// volunteerService.js
// Mirrors all routes in backend/routes/volunteers.js
// Mount: app.use('/api/volunteers', volunteerRoutes)

import API from './api';

// POST /api/volunteers/register  — volunteer self-registration
export const registerVolunteer = (data) => API.post('/volunteers/register', data);

// POST /api/volunteers/login  — volunteer login
export const loginVolunteer = (data) => API.post('/volunteers/login', data);

// GET /api/volunteers/tasks  — priority-sorted victims for logged-in volunteer (auth)
export const getVolunteerTasks = () => API.get('/volunteers/tasks');

// PATCH /api/volunteers/complete/:victimId  — volunteer marks a task complete (auth)
export const completeTask = (victimId) => API.patch(`/volunteers/complete/${victimId}`);

// GET /api/volunteers/all  — admin only: all volunteers
export const getAllVolunteers = () => API.get('/volunteers/all');
