import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C0F', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '72px', fontWeight: 800, marginBottom: '1rem' }}>
          DISASTER<span style={{ color: '#E8321A' }}>AID</span>
        </h1>
        <p style={{ color: '#8B94A3', marginBottom: '2rem' }}>
          Emergency Response Command Center
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')}
            style={{ padding: '12px 28px', background: '#E8321A', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '15px',
              fontFamily: 'Syne, sans-serif', cursor: 'pointer' }}>
            Register
          </button>
          <button onClick={() => navigate('/map')}
            style={{ padding: '12px 28px', background: 'transparent', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
              fontSize: '15px', fontFamily: 'Syne, sans-serif', cursor: 'pointer' }}>
            Open Map
          </button>
        </div>
      </div>
    </div>
  );
}