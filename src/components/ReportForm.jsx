import React, { useState } from 'react';
import styles from './ReportForm.module.css';
import { DISASTER_TYPES, URGENCY_LABELS } from '../utils/priority';

const DEFAULT_FORM = {
  type: 'Flood',
  location: '',
  severity: 5,
  peopleAffected: 500,
  urgency: 3,
  description: '',
  lat: '',
  lng: '',
};

export default function ReportForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [expanded, setExpanded] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.location.trim()) return;
    const result = await onSubmit({
      ...form,
      severity: Number(form.severity),
      peopleAffected: Number(form.peopleAffected),
      urgency: Number(form.urgency),
      lat: form.lat ? Number(form.lat) : 28.5 + Math.random() * 0.4,
      lng: form.lng ? Number(form.lng) : 77.0 + Math.random() * 0.5,
    });
    if (result?.success) {
      setForm(DEFAULT_FORM);
      setExpanded(false);
    }
  };

  return (
    <div className={styles.formPanel}>
      <div className={styles.formHeader} onClick={() => setExpanded(!expanded)}>
        <div className={styles.formTitle}>
          <div className={styles.plusIcon}>{expanded ? '−' : '+'}</div>
          SUBMIT NEW INCIDENT REPORT
        </div>
        <div className={styles.formHint}>
          {expanded ? 'Click to collapse' : 'Click to expand form'}
        </div>
      </div>

      {expanded && (
        <div className={styles.formBody}>
          <div className={styles.row3}>
            <Field label="DISASTER TYPE">
              <select value={form.type} onChange={e => set('type', e.target.value)} className={styles.input}>
                {DISASTER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="SEVERITY (1–10)">
              <div className={styles.sliderWrapper}>
                <input
                  type="range" min="1" max="10" value={form.severity}
                  onChange={e => set('severity', e.target.value)}
                  className={styles.slider}
                />
                <span className={styles.sliderVal}>{form.severity}</span>
              </div>
            </Field>
            <Field label="URGENCY LEVEL">
              <select value={form.urgency} onChange={e => set('urgency', e.target.value)} className={styles.input}>
                <option value={3}>IMMEDIATE</option>
                <option value={2}>HIGH</option>
                <option value={1}>MODERATE</option>
              </select>
            </Field>
          </div>

          <div className={styles.row2}>
            <Field label="LOCATION NAME" wide>
              <input
                type="text"
                placeholder="e.g. Zone A — North Riverside District"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className={styles.input}
                required
              />
            </Field>
            <Field label="PEOPLE AFFECTED">
              <input
                type="number"
                placeholder="500"
                value={form.peopleAffected}
                onChange={e => set('peopleAffected', e.target.value)}
                className={styles.input}
              />
            </Field>
          </div>

          <div className={styles.row2}>
            <Field label="DESCRIPTION (optional)" wide>
              <input
                type="text"
                placeholder="Brief situation description..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                className={styles.input}
              />
            </Field>
            <div className={styles.coordFields}>
              <Field label="LAT">
                <input type="number" step="0.01" placeholder="28.65" value={form.lat} onChange={e => set('lat', e.target.value)} className={styles.input} />
              </Field>
              <Field label="LNG">
                <input type="number" step="0.01" placeholder="77.20" value={form.lng} onChange={e => set('lng', e.target.value)} className={styles.input} />
              </Field>
            </div>
          </div>

          <div className={styles.formFooter}>
            <div className={styles.formulaHint}>
              Score = (severity×10) + (affected÷500) + (urgency×15) × time_decay
            </div>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={loading || !form.location.trim()}
            >
              {loading ? 'SUBMITTING...' : '⬆ SUBMIT REPORT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, wide }) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}