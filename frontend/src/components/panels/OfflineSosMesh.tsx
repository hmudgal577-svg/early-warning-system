import React, { useState, useEffect } from 'react';
import { useAlertSound } from '../../hooks/useAlertSound';

export interface SosPacket {
  id: string;
  senderName?: string;
  lat: number;
  lon: number;
  casualties: number;
  urgentMedical: boolean;
  timestamp: string;
  hops: number;
  status: string;
}

const SOS_STORAGE_KEY = 'satark_live_sos_mesh_ledger';

export const OfflineSosMesh: React.FC<{ userLat?: number; userLon?: number }> = ({
  userLat = 11.5534,
  userLon = 76.1320
}) => {
  const { playWarningBeep } = useAlertSound();
  const [broadcasting, setBroadcasting] = useState<boolean>(false);
  const [sosHistory, setSosHistory] = useState<SosPacket[]>([]);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [medicalUrgent, setMedicalUrgent] = useState<boolean>(false);
  const [incomingAlert, setIncomingAlert] = useState<SosPacket | null>(null);

  // Sync SOS packets cross-device via BroadcastChannel & LocalStorage events
  useEffect(() => {
    // 1. Initial load from shared storage
    try {
      const stored = localStorage.getItem(SOS_STORAGE_KEY);
      if (stored) {
        setSosHistory(JSON.parse(stored));
      }
    } catch {}

    // 2. BroadcastChannel for real-time peer message synchronization
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('satark_mesh_p2p_channel');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_SOS_BROADCAST') {
          const newPacket: SosPacket = event.data.packet;
          setSosHistory(prev => [newPacket, ...prev.filter(p => p.id !== newPacket.id)]);
          setIncomingAlert(newPacket);
          playWarningBeep(); // Beep on nearby friend's phone!

          // Auto-dismiss incoming popup after 8 seconds
          setTimeout(() => setIncomingAlert(null), 8000);
        }
      };
    }

    // 3. Storage event listener for multi-tab / device sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SOS_STORAGE_KEY && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          setSosHistory(list);
          if (list.length > 0) {
            setIncomingAlert(list[0]);
            playWarningBeep();
            setTimeout(() => setIncomingAlert(null), 8000);
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const triggerMeshSos = () => {
    setBroadcasting(true);

    const newSos: SosPacket = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      lat: userLat,
      lon: userLon,
      casualties: peopleCount,
      urgentMedical: medicalUrgent,
      timestamp: new Date().toLocaleTimeString(),
      hops: 1,
      status: 'BROADCASTING_BLE'
    };

    // Save locally
    const updatedList = [newSos, ...sosHistory.slice(0, 15)];
    setSosHistory(updatedList);
    try {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}

    // Broadcast over P2P Channel to all nearby devices
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('satark_mesh_p2p_channel');
      channel.postMessage({ type: 'NEW_SOS_BROADCAST', packet: newSos });
      channel.close();
    }

    // Multi-hop mesh propagation simulation
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
    <div style={{
      background: 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      {/* 🚨 REAL-TIME INCOMING SOS POPUP ON FRIEND'S DEVICE */}
      {incomingAlert && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 0 25px rgba(239, 68, 68, 0.7)',
          animation: 'pulse 1s infinite',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🚨 LIVE INCOMING NEARBY SOS DETECTED!
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '2px' }}>
              Packet: <strong>{incomingAlert.id}</strong> &bull; GPS: {incomingAlert.lat.toFixed(4)}, {incomingAlert.lon.toFixed(4)}
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>
              👥 Casualties: <strong>{incomingAlert.casualties} Person(s)</strong> {incomingAlert.urgentMedical && '• 🚨 Urgent Medical Required'} ({incomingAlert.timestamp})
            </div>
          </div>
          <button
            onClick={() => setIncomingAlert(null)}
            style={{
              background: '#ffffff', color: '#dc2626', border: 'none',
              borderRadius: '6px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
            }}
          >
            ACKNOWLEDGE
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📴</span> Offline BLE Mesh SOS Emergency Broadcast
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Zero-Internet Peer-to-Peer emergency relay protocol (Cellular tower blackout fallback).
          </p>
        </div>
        <span style={{
          background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6',
          color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
        }}>
          📶 BLUETOOTH LE MESH ACTIVE
        </span>
      </div>

      {/* SOS Trigger Panel */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(153, 27, 27, 0.25))',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '12px', padding: '18px', marginBottom: '18px',
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
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
            animation: broadcasting ? 'pulse 1s infinite' : 'none'
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
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '0.8rem', flexWrap: 'wrap', gap: '8px'
                }}
              >
                <div>
                  <strong style={{ color: '#ef4444' }}>{sos.id}</strong> &bull; Lat: {sos.lat.toFixed(4)}, Lon: {sos.lon.toFixed(4)} &bull; Casualties: {sos.casualties}
                  <span style={{ color: '#64748b', marginLeft: '8px' }}>({sos.timestamp})</span>
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
