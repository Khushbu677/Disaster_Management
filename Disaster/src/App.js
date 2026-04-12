import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import Navbar from './components/Navbar';

// Pages
import Dashboard    from './pages/Dashboard';
import SOS          from './pages/SOS';
import Reports      from './pages/Reports';
import VictimStatus from './pages/VictimStatus';

// Global styles (Tailwind + ResQNet tokens)
import './index.css';

// ── Background decorations (fixed behind all pages) ──────────────────────────
function BackgroundDecor() {
  return (
    <>
      <div className="bg-grid"  aria-hidden="true" />
      <div className="bg-orb orb1" aria-hidden="true" />
      <div className="bg-orb orb2" aria-hidden="true" />
      <div className="bg-orb orb3" aria-hidden="true" />
    </>
  );
}

// ── App Shell ────────────────────────────────────────────────────────────────
// Architecture: React Component → Service File → Axios → Express → MongoDB
//
// Routes:
//   /         → Dashboard  (GET /api/dashboard/incidents)
//   /sos      → SOS Form   (POST /api/victims/register)
//   /reports  → Reports    (GET /api/dashboard/incidents)
//   /status   → Victim Status Tracker (GET /api/victims/status/:ticketId)
export default function App() {
  return (
    <BrowserRouter>
      <BackgroundDecor />

      {/* Sticky navbar — present on all pages */}
      <Navbar />

      {/* Main content area always fills at least the viewport */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 62px)' }}>
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/sos"     element={<SOS />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/status"  element={<VictimStatus />} />

          {/* Catch-all */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
