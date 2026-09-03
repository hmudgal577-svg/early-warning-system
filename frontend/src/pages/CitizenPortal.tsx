import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRiskAssessment } from '../services/api';
import { sendRiskAlert } from '../services/notificationService';
import { useAlertSound } from '../hooks/useAlertSound';
import { usePermissions } from '../hooks/usePermissions';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { AIPriorityPanel } from '../components/AIPriorityPanel';
import { Terrain3DVisualizer } from '../components/map/Terrain3DVisualizer';
import { ShelterResourcePanel } from '../components/panels/ShelterResourcePanel';
import { OfflineSosMesh } from '../components/panels/OfflineSosMesh';
import { RiskAssessmentResponse } from '../types';

export const CitizenPortal: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'hi' | 'as'>('en');
  const { playCriticalSiren, playWarningBeep, stopSiren, isPlaying } = useAlertSound();
  const { userLocation, notification } = usePermissions();
  const { speakAlert, isSpeaking, stopSpeaking } = useVoiceAssistant(lang);

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<RiskAssessmentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | '3d_terrain' | 'shelters' | 'ai_agent' | 'offline_sos'>('overview');
  
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
          speakAlert(selectedZone.name, 'RED', res.assessment.action_protocol);
        } else if (level === 'AMBER' && lastAlertLevel.current !== 'AMBER') {
          playWarningBeep();
        } else if (level === 'GREEN') {
          stopSiren();
        }
        lastAlertLevel.current = level;

        // Send push notification
        if (!notificationSent.current.has(alertKey) && (notification === 'granted' || Notification.permission === 'granted')) {
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
      brandName: 'SATARK',
      tagline: 'Citizen Safety',
      subtag: 'National Early Warning Network',
      title: 'Citizen Safety & Disaster Intelligence',
      subtitle: 'Real-time AI Landslide Early Warning, Weather Telemetry & Safe Evacuation',
      liveBadge: 'LIVE SATELLITE & WEATHER SYNC',
      location: 'YOUR MONITORED ZONE',
      aiScore: 'AI LANDSLIDE SUSCEPTIBILITY INDEX',
      action: 'Emergency Action Protocol:',
      rain24: '24h Cumulative Rain',
      rain72: '72h Total Rainfall',
      soil: 'Soil Moisture Saturation',
      elevation: 'NASA SRTM 30m Elevation',
      roadStatus: 'Highway Corridor Status & Safe Detour Routing',
      safeRoute: 'Guaranteed Safe Evacuation Route',
      estTime: 'Est. Evacuation Time',
      sirenOn: 'Mute Siren',
      sirenOff: 'Emergency Siren',
      voiceBtn: 'Speak Voice Alert',
      stopVoiceBtn: 'Stop Voice',
      survivalGuide: 'Emergency Survival & Evacuation Protocols',
      reportBtn: 'AI Scan & Report Hazard',
      cmdMapBtn: 'GIS Command Map',
      tabOverview: 'Overview',
      tab3d: '3D Terrain & Runoff',
      tabShelters: 'Relief Camps',
      tabAgent: 'AI Priority Agent',
      tabSos: 'Offline SOS Mesh',
      footerStay: 'Stay Informed. Stay Alert. Stay Safe.'
    },
    hi: {
      brandName: 'सतर्क (SATARK)',
      tagline: 'नागरिक सुरक्षा',
      subtag: 'राष्ट्रीय पूर्व चेतावनी नेटवर्क',
      title: 'नागरिक सुरक्षा एवं आपदा पूर्व चेतावनी',
      subtitle: 'रीयल-टाइम एआई भूस्खलन चेतावनी, उपग्रह डेटा और सुरक्षित निकासी',
      liveBadge: 'लाइव उपग्रह एवं मौसम निगरानी',
      location: 'आपका निगरानी क्षेत्र',
      aiScore: 'एआई भूस्खलन संवेदनशीलता स्कोर',
      action: 'आपातकालीन कार्रवाई निर्देश:',
      rain24: 'पिछले 24 घंटे की बारिश',
      rain72: '72 घंटे की कुल बारिश',
      soil: 'मिट्टी की नमी',
      elevation: 'नासा 30m डिजिटल ऊंचाई',
      roadStatus: 'राजमार्ग स्थिति एवं सुरक्षित वैकल्पिक मार्ग',
      safeRoute: 'सुरक्षित वैकल्पिक निकासी मार्ग',
      estTime: 'अनुमानित निकासी समय',
      sirenOn: 'सायरन बंद करें',
      sirenOff: 'आपातकालीन सायरन',
      voiceBtn: 'आवाज में सुनें',
      stopVoiceBtn: 'आवाज रोकें',
      survivalGuide: 'आपातकालीन सुरक्षा एवं बचाव नियम',
      reportBtn: 'एआई स्कैन व रिपोर्ट करें',
      cmdMapBtn: 'जीआईएस कमांड मैप',
      tabOverview: 'अवलोकन',
      tab3d: '3D पहाड़ी सिमुलेशन',
      tabShelters: 'राहत शिविर',
      tabAgent: 'एआई प्राथमिकता एजेंट',
      tabSos: 'ऑफलाइन एसओएस मेश',
      footerStay: 'सतर्क रहें। सुरक्षित रहें।'
    },
    as: {
      brandName: 'SATARK',
      tagline: 'নাগৰিক সুৰক্ষা',
      subtag: 'ৰাষ্ট্ৰীয় সতৰ্কবাৰ্তা নেটৱৰ্ক',
      title: 'নাগৰিক সুৰক্ষা আৰু দুৰ্যোগ সতৰ্কবাৰ্তা',
      subtitle: 'প্ৰকৃত সময়ৰ এআই ভূমিস্খলন সতৰ্কবাৰ্তা আৰু সুৰক্ষিত নিষ্কাষণ',
      liveBadge: 'লাইভ উপগ্ৰহ আৰু বতৰ নিৰীক্ষণ',
      location: 'আপোনাৰ নিৰীক্ষণ অঞ্চল',
      aiScore: 'এআই ভূমিস্খলন আশংকা সূচক',
      action: 'জৰুৰীকালীন নিৰ্দেশনা:',
      rain24: '২৪ ঘণ্টাৰ বৰষুণ',
      rain72: '৭২ ঘণ্টাৰ বৰষুণ',
      soil: 'মাটিৰ আৰ্দ্ৰতা',
      elevation: 'নাছা ৩০মি উচ্চতা',
      roadStatus: 'ৰাজপথৰ স্থিতি আৰু সুৰক্ষিত বিকল্প পথ',
      safeRoute: 'সুৰক্ষিত বিকল্প পথ',
      estTime: 'আনুমানিক নিষ্কাষণ সময়',
      sirenOn: 'চাইৰেন বন্ধ কৰক',
      sirenOff: 'চাইৰেন পৰীক্ষা',
      voiceBtn: 'ভইচ সতৰ্কবাৰ্তা',
      stopVoiceBtn: 'ভইচ বন্ধ কৰক',
      survivalGuide: 'জৰুৰীকালীন সুৰক্ষা নিৰ্দেশনা',
      reportBtn: 'এআই ফটো ৰিপোৰ্ট',
      cmdMapBtn: 'জিআইএছ মেপ',
      tabOverview: 'অৱলোকন',
      tab3d: '৩ডি পাহাৰ',
      tabShelters: 'আশ্ৰয় শিবিৰ',
      tabAgent: 'এআই অগ্ৰাধিকাৰ',
      tabSos: 'অফলাইন এছঅ’এছ',
      footerStay: 'সতৰ্ক থাকক। সুৰক্ষিত থাকক।'
    }
  }[lang];

  const isRed   = data?.assessment.level === 'RED';
  const isAmber = data?.assessment.level === 'AMBER';

  return (
    <div style={{
      minHeight: '100vh',
      background: "linear-gradient(180deg, rgba(6, 10, 18, 0.55) 0%, rgba(8, 12, 22, 0.70) 100%), url('/landslide_bg.jpg') center/cover fixed no-repeat",
      color: '#f8fafc',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* ── Top Warning Banner (Exact Match to Mockup) ── */}
      {isRed ? (
        <div style={{
          background: '#dc2626', color: '#ffffff',
          padding: '9px 16px', textAlign: 'center',
          fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 2px 12px rgba(220, 38, 38, 0.5)'
        }}>
          <span>⚠️ ⚠️</span>
          <span>CRITICAL LANDSLIDE ALERT - {selectedZone.name.toUpperCase()} - IMMEDIATE EVACUATION REQUIRED</span>
          <span>⚠️ ⚠️</span>
        </div>
      ) : isAmber ? (
        <div style={{
          background: '#d97706', color: '#ffffff',
          padding: '9px 16px', textAlign: 'center',
          fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <span>⚠️</span>
          <span>ELEVATED LANDSLIDE ADVISORY - {selectedZone.name.toUpperCase()} - PREPARE FOR EVACUATION</span>
          <span>⚠️</span>
        </div>
      ) : null}

      {/* ── SATARK Navbar (Dark Glassmorphic) ── */}
      <header style={{
        background: 'rgba(11, 17, 32, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
        position: 'sticky', top: 0, zIndex: 40
      }}>
        {/* SATARK Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/satark_logo.png"
            alt="SATARK Logo"
            style={{
              width: '46px', height: '46px',
              borderRadius: '10px', objectFit: 'contain',
              background: '#ffffff', padding: '2px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
          />
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              {t.brandName}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>
              {t.tagline}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {t.subtag}
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Voice Alert Button */}
          <button
            onClick={() => isSpeaking ? stopSpeaking() : speakAlert(selectedZone.name, data?.assessment.level || 'GREEN', data?.assessment.action_protocol || '')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: isSpeaking ? '#2563eb' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <span>🗣️</span>
            <span>{isSpeaking ? t.stopVoiceBtn : t.voiceBtn}</span>
          </button>

          {/* Emergency Siren Button */}
          <button
            onClick={() => isPlaying ? stopSiren() : playCriticalSiren()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: '#dc2626', color: '#ffffff',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(220, 38, 38, 0.4)',
              animation: isPlaying ? 'pulse 1s infinite' : 'none'
            }}
          >
            <span>🔔</span>
            <span>{isPlaying ? t.sirenOn : t.sirenOff}</span>
          </button>

          {/* Language Switcher Pill */}
          <div style={{
            display: 'flex', background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '8px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {(['en', 'hi', 'as'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none',
                  background: lang === l ? '#2563eb' : 'transparent',
                  color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Officer Portal Button */}
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#2563eb', color: '#ffffff', border: 'none',
              borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
            }}
          >
            <span>👤</span>
            <span>Officer ▾</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399', padding: '5px 14px', borderRadius: '9999px',
            fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>{t.liveBadge}</span>
          </div>

          <h1 style={{
            fontSize: '2.4rem', fontWeight: 900, color: '#ffffff',
            margin: '0 0 8px 0', letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.6)'
          }}>
            {t.title}
          </h1>
          <p style={{ fontSize: '0.96rem', color: '#cbd5e1', margin: 0, fontWeight: 500 }}>
            {t.subtitle}
          </p>
        </div>

        {/* ── Segmented Pill Tab Bar (Translucent Glass) ── */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '9999px',
          padding: '6px 10px',
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', icon: '📊', label: t.tabOverview },
            { id: '3d_terrain', icon: '⛰️', label: t.tab3d },
            { id: 'shelters', icon: '🏥', label: t.tabShelters },
            { id: 'ai_agent', icon: '🤖', label: t.tabAgent },
            { id: 'offline_sos', icon: '📴', label: t.tabSos }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 18px', borderRadius: '9999px', border: 'none',
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 700 : 600, fontSize: '0.84rem',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Zone Selector Box */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                {t.location}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  value={selectedZone.name}
                  onChange={e => { const z = ZONES.find(x => x.name === e.target.value); if (z) setSelectedZone(z); }}
                  style={{
                    width: '100%', padding: '12px 18px', borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.85)', color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                    appearance: 'none', outline: 'none'
                  }}
                >
                  {ZONES.map(z => <option key={z.name} value={z.name} style={{ background: '#0f172a', color: '#fff' }}>📍 {z.name}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                  ▼
                </div>
              </div>
            </div>

            {/* Action Buttons (Side by Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => navigate('/sih-dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '10px', border: 'none',
                  background: '#1d4ed8', color: '#ffffff',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(29, 78, 216, 0.4)'
                }}
              >
                <span>🛰️</span>
                <span>{t.cmdMapBtn}</span>
              </button>

              <button
                onClick={() => navigate('/report')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px 20px', borderRadius: '10px', border: 'none',
                  background: '#059669', color: '#ffffff',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
                }}
              >
                <span>📸</span>
                <span>{t.reportBtn}</span>
              </button>
            </div>

            {/* ── AI Risk Assessment Card (Matching Mockup with Logo Icon) ── */}
            <div style={{
              background: 'rgba(24, 12, 18, 0.85)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Circular Hazard Icon Badge */}
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'radial-gradient(circle, #7f1d1d 0%, #450a0a 100%)',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)', fontSize: '28px'
                  }}>
                    🚨
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {t.aiScore}
                    </div>
                    <div style={{
                      fontSize: '2.4rem', fontWeight: 900,
                      color: isRed ? '#ef4444' : isAmber ? '#f59e0b' : '#22c55e',
                      letterSpacing: '-0.03em', marginTop: '2px'
                    }}>
                      {loading ? 'ANALYZING...' : `${data?.assessment.level} RISK (${(data?.assessment.score ?? 0.78).toFixed(2)})`}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Notification Status</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171', padding: '4px 12px', borderRadius: '9999px',
                    fontSize: '0.78rem', fontWeight: 700, marginTop: '4px'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                    <span>Notifications Off</span>
                  </div>
                </div>
              </div>

              {/* Inner Protocol Box */}
              <div style={{
                background: 'rgba(10, 15, 26, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px 18px',
                marginTop: '10px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f87171' }}>
                  {t.action}
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#f8fafc', marginTop: '3px' }}>
                  {data?.assessment.action_protocol || 'Immediate Evacuation & Highway Closure. High-risk debris flow imminent.'}
                </div>
              </div>
            </div>

            {/* ── 4 Telemetry Metrics Grid (Exact Match to Mockup) ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '24px'
            }}>
              {[
                {
                  label: t.rain24,
                  value: `${data?.weather.rain_24h_mm ?? 142} mm`,
                  sub: 'Source: Open-Meteo & OpenWeather',
                  icon: '🌧️'
                },
                {
                  label: t.rain72,
                  value: `${data?.weather.rain_72h_mm ?? 285} mm`,
                  sub: 'Source: 3-Day Antecedent Rain',
                  icon: '💧'
                },
                {
                  label: t.soil,
                  value: `${data?.weather.soil_moisture ?? 0.52} m³/m³`,
                  sub: 'Source: Topsoil 0-10cm Layer',
                  icon: '%'
                },
                {
                  label: t.elevation,
                  value: '876.5 m',
                  sub: 'Source: NASA SRTM 30m DEM',
                  icon: '⛰️'
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.78)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                      {card.label}
                    </div>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa',
                      border: '1px solid rgba(37, 99, 235, 0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800
                    }}>
                      {card.icon}
                    </div>
                  </div>

                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.03em' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Highway Corridor Status & Safe Detour Routing ── */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.78)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '22px',
              marginBottom: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span>🚗</span>
                <span>{t.roadStatus}</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* Corridor 1 */}
                <div style={{
                  background: 'rgba(10, 15, 26, 0.65)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px', padding: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Highway Corridor Status</div>
                  <div style={{ color: '#ef4444', fontSize: '0.92rem', fontWeight: 800 }}>
                    ⛔ NH-766 (BLOCKED)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '3px' }}>
                    Landslide Hazard Zone
                  </div>
                </div>

                {/* Corridor 2 */}
                <div style={{
                  background: 'rgba(10, 15, 26, 0.65)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px', padding: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>{t.safeRoute}</div>
                  <div style={{ color: '#10b981', fontSize: '0.92rem', fontWeight: 800 }}>
                    ✅ Active via SH-59 (Bypass Corridor)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '3px' }}>
                    Recommended Safe Route
                  </div>
                </div>

                {/* Corridor 3 */}
                <div style={{
                  background: 'rgba(10, 15, 26, 0.65)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px', padding: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>{t.estTime}</div>
                  <div style={{ color: '#60a5fa', fontSize: '0.92rem', fontWeight: 800 }}>
                    ⏱️ 42 Minutes
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '3px' }}>
                    Under Current Conditions
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 3D Mountain Simulation */}
        {activeTab === '3d_terrain' && (
          <Terrain3DVisualizer
            zoneName={selectedZone.name}
            slope={selectedZone.slope}
            elevation={876.5}
          />
        )}

        {/* Tab 3: Relief Camps */}
        {activeTab === 'shelters' && (
          <ShelterResourcePanel selectedZoneName={selectedZone.name} />
        )}

        {/* Tab 4: AI Priority Agent */}
        {activeTab === 'ai_agent' && (
          <AIPriorityPanel />
        )}

        {/* Tab 5: Offline SOS Mesh */}
        {activeTab === 'offline_sos' && (
          <OfflineSosMesh userLat={selectedZone.lat} userLon={selectedZone.lon} />
        )}
      </main>

      {/* ── SATARK Footer (Exact Match to Mockup) ── */}
      <footer style={{
        background: 'rgba(8, 12, 22, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '10px', fontSize: '0.78rem', color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🛡️</span>
          <strong style={{ color: '#f8fafc' }}>SATARK</strong>
          <span>| Early Warning. Safe Tomorrow.</span>
        </div>

        <div style={{ color: '#34d399', fontWeight: 700 }}>
          {t.footerStay}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Live Satellite Sync</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            color: '#4ade80', fontWeight: 700
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            System Online
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
};

export default CitizenPortal;
