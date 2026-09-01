import React, { useState, useEffect } from 'react';

/**
 * Shows a dismissable banner when the app is running in DEMO MODE
 * (backend offline — using mock data from mockData.ts)
 */
export const DemoBanner: React.FC = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setIsDemoMode((e as CustomEvent).detail as boolean);
    };
    window.addEventListener('ews-demo-mode', handler);
    return () => window.removeEventListener('ews-demo-mode', handler);
  }, []);

  if (!isDemoMode || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: 'linear-gradient(90deg, #3d2a00, #5c3d00, #3d2a00)',
      borderBottom: '1px solid #C4873A',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
      padding: '7px 20px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
    }}>
      <span style={{ color: '#C4873A', fontWeight: 600, letterSpacing: '0.08em' }}>
        📡 DEMO MODE
      </span>
      <span style={{ color: '#C5D1E0' }}>
        Backend offline — showing synthetic NER data. Start Docker Desktop and run{' '}
        <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '3px', color: '#E8EDF2' }}>
          docker-compose up
        </code>{' '}
        to connect live data.
      </span>
      <button onClick={() => setDismissed(true)} style={{
        marginLeft: 'auto', background: 'transparent', border: 'none',
        color: '#8A9BB5', cursor: 'pointer', fontSize: '1rem', padding: '0 4px',
        lineHeight: 1,
      }} title="Dismiss">×</button>
    </div>
  );
};
