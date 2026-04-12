import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar       from './components/Navbar';
import Dashboard    from './pages/Dashboard';
import SOS          from './pages/SOS';
import Reports      from './pages/Reports';
import VictimStatus from './pages/VictimStatus';
import Volunteer    from './pages/Volunteer';
import NGO          from './pages/NGO';
import Admin        from './pages/Admin';

import './index.css';

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

// Routes:
//   /           → Dashboard  (public — GET /api/dashboard/incidents)
//   /sos        → SOS Form   (public — POST /api/victims/register)
//   /reports    → Reports    (public — GET /api/dashboard/incidents)
//   /status     → Track Status (public — GET /api/victims/status/:id)
//   /volunteer  → Volunteer Portal (login/register + tasks)
//   /ngo        → NGO Portal (login/register + offer aid)
//   /admin      → Admin Dashboard (admin login + full ops panel)
export default function App() {
  return (
    <BrowserRouter>
      <BackgroundDecor />
      <Navbar />
      <div style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 62px)' }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/sos"       element={<SOS />} />
          <Route path="/reports"   element={<Reports />} />
          <Route path="/status"    element={<VictimStatus />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/ngo"       element={<NGO />} />
          <Route path="/admin"     element={<Admin />} />
          <Route path="*"          element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
