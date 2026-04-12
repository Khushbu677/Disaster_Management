import React from 'react';
import styles from './Sidebar.module.css';
import {
  getPriorityLevel,
  getPriorityColor,
  getPriorityBg,
  formatNumber,
  timeAgo,
  DISASTER_ICONS,
} from '../utils/priority';

export default function Sidebar({ reports, selectedId, onSelect, onResolve }) {
  const critical = reports.filter(r => getPriorityLevel(r.score) === 'CRITICAL').length;
  const high = reports.filter(r => getPriorityLevel(r.score) === 'HIGH').length;
  const totalAffected = reports.reduce((s, r) => s + r.peopleAffected, 0);

  return (
    <aside className={styles.sidebar}>
      {/* Stats */}
      <div className={styles.statsSection}>
        <div className={styles.sectionLabel}>SYSTEM STATUS</div>
        <div className={styles.statsGrid}>
          <StatCard value={critical} label="CRITICAL" color="var(--red)" bg="var(--red-dim)" />
          <StatCard value={high} label="HIGH" color="var(--amber)" bg="var(--amber-dim)" />
          <StatCard value={reports.length} label="ACTIVE" color="var(--blue)" bg="var(--blue-dim)" />
          <StatCard value={formatNumber(totalAffected)} label="AFFECTED" color="var(--purple)" bg="var(--purple-dim)" />
        </div>
      </div>

      {/* Priority list */}
      <div className={styles.listSection}>
        <div className={styles.sectionLabel}>
          INCIDENT QUEUE
          <span className={styles.sortHint}>↓ BY PRIORITY</span>
        </div>
        <div className={styles.list}>
          {reports.map((r, i) => {
            const level = getPriorityLevel(r.score);
            const color = getPriorityColor(level);
            const bg = getPriorityBg(level);
            const isSelected = r.id === selectedId;

            return (
              <div
                key={r.id}
                className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                style={{ '--item-color': color, '--item-bg': bg, animationDelay: `${i * 30}ms` }}
                onClick={() => onSelect(r.id)}
              >
                <div className={styles.itemRank}>#{i + 1}</div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <span className={styles.itemIcon}>{DISASTER_ICONS[r.type] || '⚠'}</span>
                    <span className={styles.itemType}>{r.type.toUpperCase()}</span>
                    <span className={styles.itemBadge} style={{ color, background: bg }}>
                      {level}
                    </span>
                  </div>
                  <div className={styles.itemLoc}>{r.location}</div>
                  <div className={styles.itemMeta}>
                    <span>{formatNumber(r.peopleAffected)} affected</span>
                    <span className={styles.dot}>·</span>
                    <span>{timeAgo(r.createdAt)}</span>
                    <span className={styles.dot}>·</span>
                    <span style={{ color }}>Score: {r.score}</span>
                  </div>
                  <div className={styles.scorebar}>
                    <div
                      className={styles.scorebarFill}
                      style={{
                        width: `${Math.min(100, (r.score / 200) * 100)}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
                {isSelected && (
                  <button
                    className={styles.resolveBtn}
                    onClick={(e) => { e.stopPropagation(); onResolve(r.id); }}
                    title="Mark resolved"
                  >
                    ✓
                  </button>
                )}
              </div>
            );
          })}
          {reports.length === 0 && (
            <div className={styles.empty}>No active incidents</div>
          )}
        </div>
      </div>
    </aside>
  );
}

function StatCard({ value, label, color, bg }) {
  return (
    <div className={styles.statCard} style={{ '--c': color, '--bg': bg }}>
      <div className={styles.statVal}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}