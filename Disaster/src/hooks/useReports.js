import { useState, useEffect, useCallback } from 'react';
import { calculatePriority, SEED_REPORTS } from '../utils/priority';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Load seed data + try fetching from backend
  useEffect(() => {
    const seeded = SEED_REPORTS.map(r => ({
      ...r,
      score: calculatePriority(r),
    }));
    setReports(seeded);

    // Try to fetch from backend (fails gracefully if not running)
    fetch(`${BACKEND_URL}/reports`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReports(data.map(r => ({ ...r, score: calculatePriority(r) })));
          setConnected(true);
        }
      })
      .catch(() => {
        // Backend not running yet — use seed data
        setConnected(false);
      });
  }, []);

  // Try Socket.io real-time updates
  useEffect(() => {
    let socket = null;
    try {
      const io = require('socket.io-client');
      socket = io(BACKEND_URL, { timeout: 3000 });
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
      socket.on('new-report', (report) => {
        setReports(prev => {
          const updated = [
            { ...report, score: calculatePriority(report) },
            ...prev,
          ];
          return sortByScore(updated);
        });
      });
    } catch (e) {
      // socket.io not available
    }
    return () => socket && socket.disconnect();
  }, []);

  // Recalculate scores every 30s (time decay)
  useEffect(() => {
    const interval = setInterval(() => {
      setReports(prev =>
        sortByScore(prev.map(r => ({ ...r, score: calculatePriority(r) })))
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const submitReport = useCallback(async (formData) => {
    setLoading(true);
    const report = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BACKEND_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      const data = await res.json();
      const finalReport = {
        ...report,
        score: data.priorityScore || calculatePriority(report),
      };
      setReports(prev => sortByScore([finalReport, ...prev]));
      setConnected(true);
      return { success: true, score: finalReport.score };
    } catch {
      // Backend offline — calculate locally
      const finalReport = { ...report, score: calculatePriority(report) };
      setReports(prev => sortByScore([finalReport, ...prev]));
      return { success: true, score: finalReport.score, offline: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveReport = useCallback((id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  return { reports, loading, connected, submitReport, resolveReport };
}

function sortByScore(reports) {
  return [...reports].sort((a, b) => b.score - a.score);
}