// components/VictimDashboard.jsx
import React from 'react';
import styles from './Victim.module.css';

export default function VictimDashboard({ reports }) {
  // Filter reports to only show ones belonging to this user
  const myReports = reports; // In a real app, filter by userId

  return (
    <div className={styles.container}>
      <h2>Your Assistance Requests</h2>
      <div className={styles.statusList}>
        {myReports.map(report => (
          <div key={report.id} className={styles.statusCard}>
            <div className={styles.type}>{report.type}</div>
            <div className={styles.statusIndicator}>
               {/* Logic for Status */}
               {report.resolved ? "✅ Resolved" : "⏳ Pending / Volunteer Assigned"}
            </div>
            <div className={styles.progressBar}>
                <div className={report.resolved ? styles.full : styles.partial}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}