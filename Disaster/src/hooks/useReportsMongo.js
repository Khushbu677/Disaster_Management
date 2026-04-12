import { useState, useEffect, useCallback } from 'react';
import { calculatePriority, SEED_REPORTS } from '../utils/priority';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
const INCIDENTS_URL = `${BACKEND_URL}/api/dashboard/incidents`;

function normalizeReport(report) {
  return {
    ...report,
    id: report._id || report.id,
    lat: report.coordinates?.lat ?? report.lat ?? 28.61,
    lng: report.coordinates?.lng ?? report.lng ?? 77.21,
    score: report.priorityScore ?? report.score ?? calculatePriority(report),
    createdAt: report.createdAt || new Date().toISOString(),
  };
}

function sortByScore(reports) {
  return [...reports].sort((a, b) => b.score - a.score);
}

export function useReportsMongo() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const seeded = SEED_REPORTS.map(report => ({
      ...report,
      score: calculatePriority(report),
    }));
    setReports(seeded);

    console.log('📝 [useReportsMongo] Fetching incidents from:', INCIDENTS_URL);

    fetch(INCIDENTS_URL)
      .then(response => {
        console.log('ℹ️ [useReportsMongo] Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('✅ [useReportsMongo] Fetched incidents:', data);
        if (Array.isArray(data) && data.length > 0) {
          setReports(sortByScore(data.map(normalizeReport)));
          setConnected(true);
        }
      })
      .catch(error => {
        console.error('❌ [useReportsMongo] Error fetching incidents:', error.message);
        setConnected(false);
      });
  }, []);

  useEffect(() => {
    let socket = null;

    try {
      const io = require('socket.io-client');
      console.log('📝 [useReportsMongo] Connecting to Socket.io at:', BACKEND_URL);
      socket = io(BACKEND_URL, { timeout: 3000 });
      socket.on('connect', () => {
        console.log('✅ [useReportsMongo] Connected to Socket.io');
        setConnected(true);
      });
      socket.on('disconnect', () => {
        console.log('⚠️ [useReportsMongo] Disconnected from Socket.io');
        setConnected(false);
      });
      socket.on('new-incident', incident => {
        console.log('🆕 [useReportsMongo] New incident received:', incident);
        setReports(prev => sortByScore([normalizeReport(incident), ...prev]));
      });
      socket.on('incident-resolved', ({ incidentId }) => {
        console.log('✅ [useReportsMongo] Incident resolved:', incidentId);
        setReports(prev => prev.filter(report => report.id !== incidentId));
      });
    } catch (error) {
      console.error('❌ [useReportsMongo] Error connecting to Socket.io:', error.message);
      setConnected(false);
    }

    return () => {
      if (socket) {
        console.log('📝 [useReportsMongo] Disconnecting from Socket.io');
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🕒 [useReportsMongo] Recalculating scores for reports');
      setReports(prev =>
        sortByScore(prev.map(report => ({ ...report, score: calculatePriority(report) })))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const submitReport = useCallback(async formData => {
    setLoading(true);

    const report = {
      ...formData,
      createdAt: new Date().toISOString(),
      coordinates: {
        lat: formData.lat,
        lng: formData.lng,
      },
    };

    console.log('📝 [useReportsMongo] Submitting report to:', INCIDENTS_URL);
    console.log('📦 [useReportsMongo] Report payload:', report);

    try {
      const res = await fetch(INCIDENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: report.type,
          location: report.location,
          severity: report.severity,
          peopleAffected: report.peopleAffected,
          urgency: report.urgency,
          description: report.description,
          coordinates: report.coordinates,
        }),
      });
      const data = await res.json();

      console.log('ℹ️ [useReportsMongo] Response status:', res.status);
      console.log('✅ [useReportsMongo] Response data:', data);

      if (!res.ok) {
        console.error('❌ [useReportsMongo] Backend Error:', data);
        throw new Error(data.error || 'Unable to submit report');
      }

      console.log('✅ [useReportsMongo] Report saved to MongoDB:', data.incident);
      const finalReport = normalizeReport(data.incident || report);
      setReports(prev => sortByScore([finalReport, ...prev]));
      setConnected(true);
      return { success: true, score: finalReport.score };
    } catch (error) {
      console.error('❌ [useReportsMongo] Error submitting report:', error.message);
      console.error('Backend URL:', INCIDENTS_URL);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveReport = useCallback(async id => {
    console.log('📝 [useReportsMongo] Resolving report with ID:', id);

    try {
      const res = await fetch(`${INCIDENTS_URL}/${id}/resolve`, {
        method: 'PATCH',
      });

      console.log('ℹ️ [useReportsMongo] Response status:', res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('❌ [useReportsMongo] Backend Error:', data);
        throw new Error(data.error || 'Unable to resolve report');
      }

      console.log('✅ [useReportsMongo] Report resolved successfully');
      setReports(prev => prev.filter(report => report.id !== id));
      return { success: true };
    } catch (error) {
      console.error('❌ [useReportsMongo] Error resolving report:', error.message);
      return { success: false, error: error.message };
    }
  }, []);

  return { reports, loading, connected, submitReport, resolveReport };
}
