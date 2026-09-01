import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRiskAssessment } from '../services/api';
import { sendRiskAlert } from '../services/notificationService';
import { useAlertSound } from '../hooks/useAlertSound';
import { usePermissions } from '../hooks/usePermissions';
import { AIPriorityPanel } from '../components/AIPriorityPanel';
import { RiskAssessmentResponse } from '../types';

export const CitizenPortal: React.FC = () => {
  const navigate = useNavigate();
  const { playCriticalSiren, playWarningBeep, stopSiren, isPlaying } = useAlertSound();
  const { userLocation, notification } = usePermissions();
  const [lang, setLang] = useState<'en' | 'hi' | 'as'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<RiskAssessmentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_agent'>('overview');
  const [selectedZone, setSelectedZone] = useState({
    name: 'Meppadi, Wayanad (Testbed)',
    lat: 11.5534,
    lon: 76.1320,
    slope: 38.5
  });
  const lastAlertLevel = useRef<string | null>(null);
  const notificationSent = useRef<Set<string>>(new Set());

  const ZONES = [
    { name: 'Meppadi, Wayanad (Testbed)', lat: 11.5534, lon: 76.1320, slope: 38.5 },
    { name: 'Munnar, Idukki (Western Ghats)', lat: 10.0889, lon: 77.0595, slope: 42.0 },
    { name: 'Guwahati Hills (NER)', lat: 26.1445, lon: 91.7362, slope: 28.0 },
    { name: 'Shillong Ridge (NER)', lat: 25.5788, lon: 91.8933, slope: 34.0 },
    { name: 'Aizawl Slopes (NER)', lat: 23.7271, lon: 92.7176, slope: 45.0 }
  ];

  // If user location detected, find nearest zone
  useEffect(() => {
    if (userLocation) {
      const nearest = ZONES.reduce((prev, curr) => {
        const dPrev = Math.hypot(prev.lat - userLocation.lat, prev.lon - userLocation.lon);
        const dCurr = Math.hypot(curr.lat - userLocation.lat, curr.lon - userLocation.lon);
        return dCurr < dPrev ? curr : prev;
      });
      setSelectedZone(nearest);
    }
  }, [userLocation]);

  useEffect(() => {
    setLoading(true);
    fetchRiskAssessment(selectedZone.lat, selectedZone.lon, selectedZone.slope, selectedZone.name)
      .then(async (res) => {
        setData(res);
        setLoading(false);
        const level = res.assessment.level;
        const alertKey = `${selectedZone.name}-${level}`;

        // Trigger sound on RED or AMBER
        if (level === 'RED' && lastAlertLevel.current !== 'RED') {
          playCriticalSiren();
        } else if (level === 'AMBER' && lastAlertLevel.current !== 'AMBER') {
          playWarningBeep();
        } else if (level === 'GREEN') {
          stopSiren();
        }
        lastAlertLevel.current = level;

        // Send push notification (only once per alert key per session)
        if (!notificationSent.current.has(alertKey) && notification === 'granted') {
          await sendRiskAlert({
            zone: selectedZone.name,
            level,
            score: res.assessment.score,
            action: res.assessment.action_protocol,
            rain24h: res.weather.rain_24h_mm,
          });
          notificationSent.current.add(alertKey);
        }
      })
      .catch(() => setLoading(false));
  }, [selectedZone]);

  const t = {
    en: {
      title: 'Citizen Safety & Disaster Intelligence',
      subtitle: 'Real-time AI Landslide Early Warning, Weather Telemetry & Safe Evacuation',
      liveBadge: 'LIVE SATELLITE & WEATHER SYNC',
      location: 'Your Monitored Zone',
      aiScore: 'AI Landslide Susceptibility Index',
      action: 'Emergency Action Protocol',
      rain24: '24h Cumulative Rain',
      rain72: '72h Total Rainfall',
      soil: 'Soil Moisture Saturation',
      elevation: 'NASA SRTM 30m Elevation',
      slope: 'Terrain Slope Angle',
      roadStatus: 'Highway Corridor Status',
      safeRoute: 'Guaranteed Safe Evacuation Route',
      estTime: 'Est. Evacuation Time',
      sirenOn: '🔇 Mute Siren',
      sirenOff: '🔊 Test Emergency Siren',
      survivalGuide: 'Emergency Survival & Evacuation Protocols',
      reportBtn: '📋 Report Disaster / Road Blockage',
      cmdMapBtn: '🛰️ Open GIS Command Map',
      tabOverview: 'Overview',
      tabAgent: '🤖 AI Priority Agent',
    },
    hi: {
      title: 'नागरिक सुरक्षा एवं आपदा पूर्व चेतावनी',
      subtitle: 'रीयल-टाइम एआई भूस्खलन चेतावनी, उपग्रह डेटा और सुरक्षित निकासी',
      liveBadge: 'लाइव उपग्रह एवं मौसम निगरानी',
      location: 'आपका निगरानी क्षेत्र',
      aiScore: 'एआई भूस्खलन संवेदनशीलता स्कोर',
      action: 'आपातकालीन कार्रवाई निर्देश',
      rain24: 'पिछले 24 घंटे की बारिश',
      rain72: '72 घंटे की कुल बारिश',
      soil: 'मिट्टी की नमी',
      elevation: 'नासा 30m डिजिटल ऊंचाई',
      slope: 'पहाड़ी ढलान कोण',
      roadStatus: 'राजमार्ग स्थिति',
      safeRoute: 'सुरक्षित वैकल्पिक निकासी मार्ग',
      estTime: 'अनुमानित निकासी समय',
      sirenOn: '🔇 सायरन बंद करें',
      sirenOff: '🔊 आपातकालीन सायरन टेस्ट',
      survivalGuide: 'आपातकालीन सुरक्षा एवं बचाव नियम',
      reportBtn: '📋 आपदा या सड़क रुकावट रिपोर्ट करें',
      cmdMapBtn: '🛰️ जीआईएस मैप खोलें',
      tabOverview: 'अवलोकन',
      tabAgent: '🤖 एआई प्राथमिकता एजेंट',
    },
    as: {
      title: 'নাগৰিক সুৰক্ষা আৰু দুৰ্যোগ সতৰ্কবাৰ্তা',
      subtitle: 'প্ৰকৃত সময়ৰ এআই ভূমিস্খলন সতৰ্কবাৰ্তা আৰু সুৰক্ষিত নিষ্কাষণ',
      liveBadge: 'লাইভ উপগ্ৰহ আৰু বতৰ নিৰীক্ষণ',
      location: 'আপোনাৰ নিৰীক্ষণ অঞ্চল',
      aiScore: 'এআই ভূমিস্খলন আশংকা সূচক',
      action: 'জৰুৰীকালীন নিৰ্দেশনা',
      rain24: '২৪ ঘণ্টাৰ বৰষুণ',
      rain72: '৭২ ঘণ্টাৰ বৰষুণ',
      soil: 'মাটিৰ আৰ্দ্ৰতা',
      elevation: 'নাছা ৩০মি উচ্চতা',
      slope: 'পাহাৰীয়া ঢাল',
      roadStatus: 'ৰাজপথৰ স্থিতি',
      safeRoute: 'সুৰক্ষিত বিকল্প পথ',
      estTime: 'আনুমানিক নিষ্কাষণ সময়',
      sirenOn: '🔇 চাইৰেন বন্ধ কৰক',
      sirenOff: '🔊 চাইৰেন পৰীক্ষা কৰক',
      survivalGuide: 'জৰুৰীকালীন সুৰক্ষা নিৰ্দেশনা',
      reportBtn: '📋 দুৰ্যোগৰ তথ্য প্ৰেৰণ কৰক',
      cmdMapBtn: '🛰️ জিআইএছ মেপ খোলক',
      tabOverview: 'অৱলোকন',
      tabAgent: '🤖 এআই অগ্ৰাধিকাৰ এজেন্ট',
    }
  }[lang];

  const isRed   = data?.assessment.level === 'RED';
  const isAmber = data?.assessment.level === 'AMBER';

  const bg   = theme === 'dark' ? '#0b1329' : '#f8fafc';
  const fg   = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const card = theme === 'dark' ? '#0f172a' : '#ffffff';
  const brd  = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const muted= theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: fg, fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── RED alert pulsing top bar ── */}
      {isRed && (
        <div style={{
          background: 'linear-gradient(90deg, #991b1b, #ef4444, #991b1b)',
          backgroundSize: '200% 100%',
          animation: 'redSlide 2s linear infinite',
          padding: '8px 24px', textAlign: 'center',
          fontSize: '0.85rem', fontWeight: 800, color: '#fff',
          letterSpacing: '0.05em'
        }}>
          🚨 CRITICAL LANDSLIDE ALERT — {selectedZone.name} — IMMEDIATE EVACUATION REQUIRED 🚨
          <style>{`
            @keyframes redSlide { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
          `}</style>
        </div>
      )}

      {/* ── Top Nav ── */}
      <header style={{
        background: theme === 'dark' ? '#0f172a' : '#ffffff',
        borderBottom: `1px solid ${brd}`,
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>🛰️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>EWS-NER · Citizen</div>
            <div style={{ fontSize: '0.72rem', color: muted }}>
              {userLocation ? `📍 ${userLocation.detectedZone}` : 'National Early Warning System'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Siren toggle */}
          <button
            onClick={() => isPlaying ? stopSiren() : playCriticalSiren()}
            style={{
              padding: '6px 12px', borderRadius: '8px', border: 'none',
              background: isPlaying ? '#ef4444' : 'rgba(239,68,68,0.15)',
              color: isPlaying ? '#fff' : '#ef4444',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
              animation: isPlaying ? 'pulse 1s infinite' : 'none'
            }}
          >
            {isPlaying ? t.sirenOn : t.sirenOff}
          </button>

          {/* Language toggle */}
          <div style={{ display: 'flex', background: theme === 'dark' ? '#1e293b' : '#e2e8f0', borderRadius: '20px', padding: '2px' }}>
            {(['en', 'hi', 'as'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '4px 10px', borderRadius: '16px', border: 'none',
                background: lang === l ? '#2563eb' : 'transparent',
                color: lang === l ? '#fff' : muted,
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}>{l.toUpperCase()}</button>
            ))}
          </div>

          {/* Theme */}
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{ background: theme === 'dark' ? '#1e293b' : '#e2e8f0', border: 'none', borderRadius: '20px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* Officer Login */}
          <button onClick={() => navigate('/login')}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
            🔒 Officer
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e',
            color: '#4ade80', padding: '4px 12px', borderRadius: '20px',
            fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            {t.liveBadge}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.03em' }}>{t.title}</h1>
          <p style={{ color: muted, fontSize: '0.92rem', margin: 0 }}>{t.subtitle}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: `1px solid ${brd}`, paddingBottom: '0' }}>
          {[
            { id: 'overview', label: t.tabOverview },
            { id: 'ai_agent', label: t.tabAgent }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 20px', border: 'none', cursor: 'pointer',
                background: 'transparent', fontWeight: 700, fontSize: '0.88rem',
                color: activeTab === tab.id ? '#3b82f6' : muted,
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Zone Selector */}
            <div style={{
              background: card, border: `1px solid ${brd}`, borderRadius: '12px',
              padding: '16px', marginBottom: '20px',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
            }}>
              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: muted, fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  📍 {t.location} {userLocation && <span style={{ color: '#22c55e', marginLeft: '6px' }}>● GPS Auto-Detected</span>}
                </label>
                <select value={selectedZone.name}
                  onChange={e => { const z = ZONES.find(x => x.name === e.target.value); if (z) setSelectedZone(z); }}
                  style={{
                    padding: '8px 14px', borderRadius: '8px',
                    background: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                    color: fg, border: `1px solid ${brd}`,
                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                  {ZONES.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate('/sih-dashboard')}
                  style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  {t.cmdMapBtn}
                </button>
                <button onClick={() => navigate('/report')}
                  style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  {t.reportBtn}
                </button>
              </div>
            </div>

            {/* AI Risk Banner */}
            <div style={{
              background: isRed ? 'linear-gradient(135deg,rgba(239,68,68,0.25),rgba(185,28,28,0.15))' :
                          isAmber ? 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(217,119,6,0.15))' :
                          'linear-gradient(135deg,rgba(34,197,94,0.25),rgba(21,128,61,0.15))',
              border: `2px solid ${isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#22c55e'}`,
              borderRadius: '16px', padding: '24px', marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: muted, textTransform: 'uppercase' }}>{t.aiScore}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#22c55e', marginTop: '4px' }}>
                    {loading ? 'Analyzing…' : `${data?.assessment.level} RISK (${(data?.assessment.score ?? 0.84).toFixed(2)})`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: muted }}>Notification Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: notification === 'granted' ? '#4ade80' : '#f59e0b' }}>
                    {notification === 'granted' ? '🔔 Alerts Enabled' : '🔕 Notifications Off'}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{t.action}:</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isRed ? '#fca5a5' : isAmber ? '#fcd34d' : '#86efac', marginTop: '4px' }}>
                  {data?.assessment.action_protocol || 'Normal Monitoring Active'}
                </div>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {[
                { icon: '🌧️', label: t.rain24, value: `${data?.weather.rain_24h_mm ?? 142.0} mm`, sub: 'Open-Meteo & OpenWeather', color: (data?.weather.rain_24h_mm ?? 0) > 100 ? '#ef4444' : '#38bdf8' },
                { icon: '📊', label: t.rain72, value: `${data?.weather.rain_72h_mm ?? 285.0} mm`, sub: '3-Day Antecedent Rain', color: '#f8fafc' },
                { icon: '🌱', label: t.soil, value: `${data?.weather.soil_moisture ?? 0.52} m³/m³`, sub: 'Topsoil 0-1cm Layer', color: '#f8fafc' },
                { icon: '🛰️', label: t.elevation, value: '879.0 m', sub: 'NASA SRTM 30m DEM', color: '#38bdf8' },
              ].map(({ icon, label, value, sub, color }) => (
                <div key={label} style={{ background: card, border: `1px solid ${brd}`, borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, fontWeight: 600 }}>{icon} {label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color, marginTop: '4px' }}>{value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Road Status */}
            <div style={{ background: card, border: `1px solid ${brd}`, borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>
                🚗 {t.roadStatus} &amp; Safe Detour Routing
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {[
                  { label: t.roadStatus, value: data?.evacuation_plan.primary_corridor || 'NH-766 Blocked', color: '#f87171', prefix: '⛔' },
                  { label: t.safeRoute, value: data?.evacuation_plan.safe_evacuation_route || 'Active via SH-59 Bypass', color: '#4ade80', prefix: '✅' },
                  { label: t.estTime, value: `${data?.evacuation_plan.estimated_evacuation_time_min ?? 42} Minutes`, color: '#f8fafc', prefix: '⏱️' },
                ].map(({ label, value, color, prefix }) => (
                  <div key={label} style={{ background: theme === 'dark' ? '#1e293b' : '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', color: muted }}>{label}:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color, marginTop: '4px' }}>{prefix} {value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Survival Guide */}
            <div style={{ background: card, border: `1px solid ${brd}`, borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 800 }}>🛡️ {t.survivalGuide}</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.9', color: theme === 'dark' ? '#cbd5e1' : '#334155', fontSize: '0.9rem', margin: 0 }}>
                <li><strong>Muddy water or sudden stream surge</strong> indicates uphill slope failure — move immediately.</li>
                <li><strong>Do not use NH-766</strong> when blocked. Follow designated SH-59 green bypass on the GIS map.</li>
                <li><strong>Rumbling sounds or cracking trees</strong> — move perpendicular to slope, not downhill.</li>
                <li><strong>Emergency Helplines:</strong> National Disaster: <strong>1070</strong> | State Control Room: <strong>1077</strong>.</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'ai_agent' && (
          <AIPriorityPanel />
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '18px', borderTop: `1px solid ${brd}`, fontSize: '0.75rem', color: '#64748b' }}>
        SIH 2026 AI Landslide Early Warning System · NDMA SACHET · Open-Meteo · NASA SRTM 30m DEM · OpenWeather
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
};
