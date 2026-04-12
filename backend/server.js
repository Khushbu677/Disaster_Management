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
// ── Allowed origins (add production URL here when deploying) ────
const ALLOWED_ORIGINS = [
  // Production
  'https://disaster-management-eosin.vercel.app',
  // Also support custom FRONTEND_URL set in Render env vars
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  // Local dev
  'http://localhost:3000',
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const io     = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  }
});

// Connect MongoDB
connectDB();

// ── Middleware ───────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200, // IE11 fix
};

// Handle pre-flight for all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
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
