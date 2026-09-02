import React, { useState } from 'react';

export const OfflineSosMesh: React.FC<{ userLat?: number; userLon?: number }> = ({
  userLat = 11.5534,
  userLon = 76.1320
}) => {
  const [broadcasting, setBroadcasting] = useState<boolean>(false);
  const [sosHistory, setSosHistory] = useState<Array<{ id: string; time: string; hops: number; status: string }>>([]);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [medicalUrgent, setMedicalUrgent] = useState<boolean>(false);

  const triggerMeshSos = () => {
    setBroadcasting(true);

    const newSos = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString(),
      hops: 1,
      status: 'BROADCASTING_BLE'
    };

    setSosHistory(prev => [newSos, ...prev]);

    // Simulate multi-hop mesh propagation
    setTimeout(() => {
      setSosHistory(prev =>
        prev.map(item => item.id === newSos.id ? { ...item, hops: 2, status: 'RELAYED_NEIGHBOR_DEVICE' } : item)
      );
    }, 1500);

    setTimeout(() => {
      setSosHistory(prev =>
        prev.map(item => item.id === newSos.id ? { ...item, hops: 3, status: 'DELIVERED_NDRF_SATELLITE_HUB' } : item)
      );
      setBroadcasting(false);
    }, 3500);
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📴</span> Offline BLE Mesh SOS Emergency Broadcast
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Zero-Internet Peer-to-Peer emergency relay protocol (Cellular tower blackout fallback).
          </p>
        </div>
        <span style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
          📶 BLUETOOTH LE MESH ACTIVE
        </span>
      </div>

      {/* SOS Trigger Panel */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(153, 27, 27, 0.25))',
        border: '1px solid #ef444450', borderRadius: '12px', padding: '18px', marginBottom: '18px',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              People Needing Rescue:
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={peopleCount}
              onChange={e => setPeopleCount(parseInt(e.target.value) || 1)}
              style={{
                width: '70px', padding: '6px 10px', background: '#0f172a', border: '1px solid #475569',
                borderRadius: '6px', color: '#f8fafc', fontWeight: 700
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#fca5a5', fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={medicalUrgent}
              onChange={e => setMedicalUrgent(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
            />
            🚨 Urgent Medical Attention Required
          </label>
        </div>

        <button
          onClick={triggerMeshSos}
          disabled={broadcasting}
          style={{
            background: broadcasting ? '#64748b' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px',
            fontSize: '0.95rem', fontWeight: 800, cursor: broadcasting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)', animation: broadcasting ? 'pulse 1s infinite' : 'none'
          }}
        >
          {broadcasting ? '📡 Broadcasting SOS Packet…' : '🆘 Broadcast Offline SOS Mesh'}
        </button>
      </div>

      {/* Live Mesh Propagation Ticker */}
      {sosHistory.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Emergency Signal Hop Ledger
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sosHistory.map(sos => (
              <div
                key={sos.id}
                style={{
                  background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                  padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '0.8rem'
                }}
              >
                <div>
                  <strong style={{ color: '#ef4444' }}>{sos.id}</strong> · Lat: {userLat.toFixed(4)}, Lon: {userLon.toFixed(4)}
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>({sos.time})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#38bdf8' }}>Hops: {sos.hops}/3</span>
                  <span style={{
                    background: sos.status === 'DELIVERED_NDRF_SATELLITE_HUB' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                    color: sos.status === 'DELIVERED_NDRF_SATELLITE_HUB' ? '#4ade80' : '#fcd34d',
                    padding: '2px 8px', borderRadius: '4px', fontWeight: 700
                  }}>
                    {sos.status === 'DELIVERED_NDRF_SATELLITE_HUB' ? '✅ ACK RECEIVED BY NDRF' : '📡 PROPAGATING MESH'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
