import React, { useState, useEffect } from 'react';
import styles from './Topbar.module.css';

export default function Topbar({ activeTab, onTabChange, connected, reportCount }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tabs = ['DASHBOARD', 'MAP', 'REPORTS', 'ANALYTICS'];

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--red)"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className={styles.logoName}>DISASTERRELIEF<span className={styles.logoAI}>.AI</span></div>
            <div className={styles.logoSub}>Emergency Command System v2.0</div>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
            {tab === 'REPORTS' && reportCount > 0 && (
              <span className={styles.badge}>{reportCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        <div className={`${styles.statusDot} ${connected ? styles.online : styles.offline}`} />
        <span className={styles.statusText}>{connected ? 'LIVE' : 'LOCAL'}</span>
        <div className={styles.divider} />
        <div className={styles.clock}>
          <div className={styles.clockTime}>{time.toLocaleTimeString('en-US', { hour12: false })}</div>
          <div className={styles.clockDate}>{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}