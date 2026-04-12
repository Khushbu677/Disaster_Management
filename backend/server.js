require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// ── Routes ──────────────────────────────────────────────────────
const victimRoutes    = require('./routes/victims');
const volunteerRoutes = require('./routes/volunteers');
const ngoRoutes       = require('./routes/ngos');
const incidentRoutes  = require('./routes/incidents');
const dashboardIncidentRoutes = require('./routes/dashboardIncidents');
const adminRoutes     = require('./routes/admin');

// ── App Setup ───────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

// Connect MongoDB
connectDB();

// ── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Inject io into every request so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/victims',    victimRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/ngos',       ngoRoutes);
app.use('/api/incidents',  incidentRoutes);
app.use('/api/dashboard/incidents', dashboardIncidentRoutes);
app.use('/api/admin',      adminRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚨 ResQNet API is running',
    version: '1.0.0',
    endpoints: {
      victims:    '/api/victims',
      volunteers: '/api/volunteers',
      ngos:       '/api/ngos',
      incidents:  '/api/incidents',
      admin:      '/api/admin',
    }
  });
});

// ── Socket.io ────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Client identifies their role
  socket.on('join-role', (role) => {
    socket.join(role); // joins 'volunteer', 'ngo', or 'admin' room
    console.log(`   → Joined room: ${role}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`\n🚀 ResQNet Backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for real-time updates\n`);
});
