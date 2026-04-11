import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const roles = ['Victim', 'Volunteer', 'NGO', 'Admin'];

export default function RegisterPage() {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C0F', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ background: '#181C22', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px' }}>
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            color: '#8B94A3', padding: '6px 12px', borderRadius: '8px',
            cursor: 'pointer', marginBottom: '1.5rem', fontFamily: 'Syne, sans-serif' }}>
          ← Back
        </button>
        <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '1.5rem' }}>Register</h2>
        
        {/* Role selector */}
        <label style={{ color: '#8B94A3', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
          SELECT ROLE
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRole(r)}
              style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600,
                background: role === r ? '#E8321A' : '#1E242D',
                color: role === r ? '#fff' : '#8B94A3',
                border: role === r ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
              {r}
            </button>
          ))}
        </div>

        {role && (
          <>
            <input placeholder="Full name" style={inputStyle} />
            <input placeholder="Phone number" style={inputStyle} />
            <input placeholder="Email address" type="email" style={inputStyle} />
            <input placeholder="Password" type="password" style={inputStyle} />
            {role === 'Victim' && (
              <>
                <input placeholder="Current location" style={inputStyle} />
                <select style={inputStyle}>
                  <option value="">Disaster type</option>
                  <option>Flood</option><option>Earthquake</option>
                  <option>Fire</option><option>Cyclone</option><option>Other</option>
                </select>
              </>
            )}
            <button onClick={() => navigate('/map')}
              style={{ width: '100%', padding: '13px', background: '#E8321A', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                fontFamily: 'Syne, sans-serif', cursor: 'pointer', marginTop: '8px' }}>
              Submit & Continue →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 13px', marginBottom: '10px',
  background: '#1E242D', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#fff', fontSize: '14px',
  fontFamily: 'Syne, sans-serif', boxSizing: 'border-box', display: 'block'
};