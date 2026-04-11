import React, { useEffect, useRef } from 'react';
import styles from './MapView.module.css';
import { getPriorityLevel, getPriorityColor, DISASTER_ICONS } from '../utils/priority';

// Dynamically import Leaflet to avoid SSR issues
let L = null;
try { L = require('leaflet'); } catch (e) {}

export default function MapView({ reports, selectedId, onSelect }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!L || !mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current, {
      center: [28.65, 77.20],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(leafletMap.current);
  }, []);

  useEffect(() => {
    if (!L || !leafletMap.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    reports.forEach(report => {
      const level = getPriorityLevel(report.score);
      const color = getPriorityColor(level);
      const isSelected = report.id === selectedId;

      const size = level === 'CRITICAL' ? 20 : level === 'HIGH' ? 16 : 13;
      const pulse = level === 'CRITICAL';

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:${size}px;height:${size}px;
            background:${color};
            border-radius:50%;
            border:2px solid rgba(255,255,255,0.6);
            display:flex;align-items:center;justify-content:center;
            font-size:${size * 0.5}px;
            cursor:pointer;
            position:relative;
            box-shadow:0 0 ${isSelected ? 16 : 8}px ${color};
            transition:all 0.2s;
          ">
            ${isSelected ? `<div style="
              position:absolute;inset:-6px;border-radius:50%;
              border:2px solid ${color};opacity:0.5;
            "></div>` : ''}
            ${pulse ? `<div style="
              position:absolute;inset:-8px;border-radius:50%;
              background:${color};opacity:0.15;
              animation:pulse-ring 1.8s infinite;
            "></div>` : ''}
            <span style="font-size:${Math.round(size * 0.55)}px;line-height:1">${DISASTER_ICONS[report.type] || '⚠'}</span>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([report.lat, report.lng], { icon })
        .addTo(leafletMap.current)
        .on('click', () => onSelect(report.id));

      marker.bindPopup(`
        <div style="font-family:monospace;font-size:12px;min-width:180px">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:${color}">
            ${DISASTER_ICONS[report.type]} ${report.type.toUpperCase()}
          </div>
          <div style="color:#aaa;margin-bottom:4px">${report.location}</div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            <span style="color:#aaa">SEVERITY</span>
            <span style="color:${color};font-weight:700">${report.severity}/10</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#aaa">AFFECTED</span>
            <span>${report.peopleAffected.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#aaa">SCORE</span>
            <span style="color:${color};font-weight:700">${report.score}</span>
          </div>
          <div style="margin-top:8px;font-size:11px;color:#888;border-top:1px solid #333;padding-top:6px">
            ${report.description || 'No description provided.'}
          </div>
        </div>
      `, { maxWidth: 240 });

      markersRef.current[report.id] = marker;

      if (report.id === selectedId) {
        marker.openPopup();
        leafletMap.current.panTo([report.lat, report.lng], { animate: true });
      }
    });
  }, [reports, selectedId, onSelect]);

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />
      <div className={styles.legend}>
        <div className={styles.legendTitle}>PRIORITY LEGEND</div>
        {[['CRITICAL', 'var(--red)'], ['HIGH', 'var(--amber)'], ['MEDIUM', 'var(--green)']].map(([label, color]) => (
          <div key={label} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className={styles.mapInfo}>
        <span className={styles.mapCount}>{reports.length} INCIDENTS MAPPED</span>
      </div>
    </div>
  );
}