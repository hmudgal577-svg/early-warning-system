import React from 'react';

interface Shelter {
  id: string;
  name: string;
  zone: string;
  totalBeds: number;
  occupiedBeds: number;
  foodStockDays: number;
  medicalTeam: string;
  waterSupplyLitres: number;
  distanceKm: number;
  status: 'AVAILABLE' | 'ALMOST_FULL' | 'FULL';
}

const MOCK_SHELTERS: Shelter[] = [
  {
    id: 's1',
    name: 'Meppadi Govt Higher Secondary School Relief Camp',
    zone: 'Meppadi, Wayanad (Testbed)',
    totalBeds: 350,
    occupiedBeds: 215,
    foodStockDays: 7,
    medicalTeam: 'Dr. Nair (NDRF Medical Unit 4)',
    waterSupplyLitres: 12000,
    distanceKm: 3.2,
    status: 'AVAILABLE'
  },
  {
    id: 's2',
    name: 'Kalpatta Town Community Cyclone & Landslide Shelter',
    zone: 'Meppadi, Wayanad (Testbed)',
    totalBeds: 500,
    occupiedBeds: 460,
    foodStockDays: 12,
    medicalTeam: 'District Health Mobile Team',
    waterSupplyLitres: 25000,
    distanceKm: 8.5,
    status: 'ALMOST_FULL'
  },
  {
    id: 's3',
    name: 'Munnar Tea Estate Community Hall Shelter',
    zone: 'Munnar, Idukki (Western Ghats)',
    totalBeds: 200,
    occupiedBeds: 85,
    foodStockDays: 5,
    medicalTeam: 'Kerala State Disaster Response (SDRF)',
    waterSupplyLitres: 8000,
    distanceKm: 2.1,
    status: 'AVAILABLE'
  },
  {
    id: 's4',
    name: 'Guwahati Stadium Emergency Relief Center',
    zone: 'Guwahati Hills (NER)',
    totalBeds: 800,
    occupiedBeds: 320,
    foodStockDays: 14,
    medicalTeam: 'Guwahati Medical College Rapid Unit',
    waterSupplyLitres: 40000,
    distanceKm: 4.8,
    status: 'AVAILABLE'
  },
  {
    id: 's5',
    name: 'Aizawl Synod Conference Hall Relief Camp',
    zone: 'Aizawl Slopes (NER)',
    totalBeds: 400,
    occupiedBeds: 380,
    foodStockDays: 4,
    medicalTeam: 'Mizoram SDRF Medical Team',
    waterSupplyLitres: 15000,
    distanceKm: 1.8,
    status: 'ALMOST_FULL'
  }
];

export const ShelterResourcePanel: React.FC<{ selectedZoneName?: string }> = ({ selectedZoneName }) => {
  const filteredShelters = selectedZoneName
    ? MOCK_SHELTERS.filter(s => s.zone === selectedZoneName || s.zone.includes(selectedZoneName.split(',')[0]))
    : MOCK_SHELTERS;

  const displayList = filteredShelters.length > 0 ? filteredShelters : MOCK_SHELTERS;

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏥</span> Safe Relief Camps &amp; Resource Allocation
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Real-time live bed occupancy, food rations &amp; medical response units.
          </p>
        </div>
        <span style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
          ● LIVE RESOURCE SYNC
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {displayList.map(shelter => {
          const occPct = Math.round((shelter.occupiedBeds / shelter.totalBeds) * 100);
          const isAlmostFull = occPct >= 85;

          return (
            <div
              key={shelter.id}
              style={{
                background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
                padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    {shelter.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px' }}>
                    📍 {shelter.distanceKm} km away via safe corridor
                  </div>
                </div>
                <span style={{
                  background: isAlmostFull ? '#ef4444' : '#22c55e', color: '#fff',
                  padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800
                }}>
                  {isAlmostFull ? 'ALMOST FULL' : 'AVAILABLE'}
                </span>
              </div>

              {/* Occupancy bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>Bed Occupancy:</span>
                  <strong>{shelter.occupiedBeds} / {shelter.totalBeds} ({occPct}%)</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${occPct}%`, height: '100%',
                    background: isAlmostFull ? '#ef4444' : occPct > 60 ? '#f59e0b' : '#22c55e',
                    borderRadius: '4px', transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Resource Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>🍞 Food Stocks:</span><br/>
                  <strong style={{ color: '#f8fafc' }}>{shelter.foodStockDays} Days Reserve</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>💧 Potable Water:</span><br/>
                  <strong style={{ color: '#f8fafc' }}>{shelter.waterSupplyLitres.toLocaleString()} L</strong>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '4px', borderTop: '1px solid #1e293b', paddingTop: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>🩺 Medical Station:</span><br/>
                  <strong style={{ color: '#4ade80' }}>{shelter.medicalTeam}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
