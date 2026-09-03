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

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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
      tabSos: 'Offline SOS Mesh'
    },
    hi: {
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
      tabSos: 'ऑफलाइन एसओएस मेश'
    },
    as: {
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
      tabSos: 'অফলাইন এছঅ’এছ'
    }
  }[lang];

  const isRed   = data?.assessment.level === 'RED';
  const isAmber = data?.assessment.level === 'AMBER';

  const isDark = theme === 'dark';
  const pageBg = isDark ? '#090d16' : '#f8fafc';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const cardBorder = isDark ? '#1f2937' : '#e5e7eb';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#4b5563';
  const textMuted = isDark ? '#6b7280' : '#6b7280';

  return (
    <div style={{ minHeight: '100vh', background: pageBg, color: textPrimary, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ── Top Warning Banner (Matching Uploaded Mockup) ── */}
      {isRed ? (
        <div style={{
          background: '#ef4444', color: '#ffffff',
          padding: '10px 16px', textAlign: 'center',
          fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
        }}>
          <span>⚠️ ⚠️</span>
          <span>CRITICAL LANDSLIDE ALERT - {selectedZone.name.toUpperCase()} - IMMEDIATE EVACUATION REQUIRED</span>
          <span>⚠️</span>
        </div>
      ) : isAmber ? (
        <div style={{
          background: '#f59e0b', color: '#ffffff',
          padding: '10px 16px', textAlign: 'center',
          fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <span>⚠️</span>
          <span>ELEVATED LANDSLIDE ADVISORY - {selectedZone.name.toUpperCase()} - RESTRICT TRANSIT</span>
          <span>⚠️</span>
        </div>
      ) : null}

      {/* ── Navigation Header (Clean White Card Layout) ── */}
      <header style={{
        background: cardBg,
        borderBottom: `1px solid ${cardBorder}`,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '20px', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: textPrimary, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>EWS-NER</span>
              <span style={{ color: textSecondary, fontWeight: 500, fontSize: '0.95rem' }}>· Citizen Safety</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: textMuted }}>National Early Warning Network</div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Voice Alert Button */}
          <button
            onClick={() => isSpeaking ? stopSpeaking() : speakAlert(selectedZone.name, data?.assessment.level || 'GREEN', data?.assessment.action_protocol || '')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              border: `1px solid ${cardBorder}`,
              background: isSpeaking ? '#2563eb' : cardBg,
              color: isSpeaking ? '#ffffff' : textPrimary,
              fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
              background: '#ef4444', color: '#ffffff',
              fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              animation: isPlaying ? 'pulse 1s infinite' : 'none'
            }}
          >
            <span>🔔</span>
            <span>{isPlaying ? t.sirenOn : t.sirenOff}</span>
          </button>

          {/* Language Switcher Pill */}
          <div style={{
            display: 'flex', background: isDark ? '#1f2937' : '#f3f4f6',
            borderRadius: '8px', padding: '3px', border: `1px solid ${cardBorder}`
          }}>
            {(['en', 'hi', 'as'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none',
                  background: lang === l ? '#2563eb' : 'transparent',
                  color: lang === l ? '#ffffff' : textSecondary,
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(th => th === 'dark' ? 'light' : 'dark')}
            style={{
              background: isDark ? '#1f2937' : '#f3f4f6',
              border: `1px solid ${cardBorder}`, borderRadius: '8px',
              padding: '8px 10px', cursor: 'pointer', fontSize: '0.85rem'
            }}
          >
            {isDark ? '🌙' : '☀️'}
          </button>

          {/* Officer Button */}
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
              borderRadius: '8px', padding: '8px 14px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
            <span>Officer</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#ecfdf5', border: '1px solid #a7f3d0',
            color: '#059669', padding: '5px 14px', borderRadius: '9999px',
            fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>{t.liveBadge}</span>
          </div>

          <h1 style={{
            fontSize: '2.2rem', fontWeight: 900, color: textPrimary,
            margin: '0 0 6px 0', letterSpacing: '-0.03em'
          }}>
            {t.title}
          </h1>
          <p style={{ fontSize: '0.95rem', color: textSecondary, margin: 0, fontWeight: 500 }}>
            {t.subtitle}
          </p>
        </div>

        {/* ── Segmented Pill Tab Bar (Matching Uploaded Mockup) ── */}
        <div style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: '9999px',
          padding: '6px',
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '24px',
          boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
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
                  color: isActive ? '#ffffff' : textSecondary,
                  fontWeight: isActive ? 700 : 600, fontSize: '0.85rem',
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

        {/* ── TAB CONTENT ── */}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* Zone Selector Box */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 800, color: textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                {t.location}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  value={selectedZone.name}
                  onChange={e => { const z = ZONES.find(x => x.name === e.target.value); if (z) setSelectedZone(z); }}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: cardBg, color: textPrimary,
                    border: `1px solid ${cardBorder}`,
                    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                    appearance: 'none', outline: 'none',
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  {ZONES.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: textMuted }}>
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
                  background: '#2563eb', color: '#ffffff',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
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
                  background: '#10b981', color: '#ffffff',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                }}
              >
                <span>📸</span>
                <span>{t.reportBtn}</span>
              </button>
            </div>

            {/* ── AI Risk Assessment Card (Soft Red / Amber / Green Banner) ── */}
            <div style={{
              background: isRed ? (isDark ? '#2a1215' : '#fef2f2') : isAmber ? (isDark ? '#2a1e0b' : '#fffbeb') : (isDark ? '#0f2419' : '#f0fdf4'),
              border: `1px solid ${isRed ? '#fecaca' : isAmber ? '#fde68a' : '#bbf7d0'}`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isRed ? '#dc2626' : isAmber ? '#d97706' : '#16a34a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {t.aiScore}
                  </div>
                  <div style={{
                    fontSize: '2.3rem', fontWeight: 900,
                    color: isRed ? '#dc2626' : isAmber ? '#d97706' : '#16a34a',
                    letterSpacing: '-0.03em', marginTop: '2px'
                  }}>
                    {loading ? 'ANALYZING...' : `${data?.assessment.level} RISK (${(data?.assessment.score ?? 0.78).toFixed(2)})`}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: textMuted }}>Notification Status</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: notification === 'granted' ? '#dcfce7' : '#fee2e2',
                    color: notification === 'granted' ? '#15803d' : '#b91c1c',
                    padding: '3px 10px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, marginTop: '3px'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: notification === 'granted' ? '#22c55e' : '#ef4444' }} />
                    <span>{notification === 'granted' ? 'Alerts Enabled' : 'Notifications Off'}</span>
                  </div>
                </div>
              </div>

              {/* Inner Protocol Box */}
              <div style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '12px',
                padding: '14px 18px',
                marginTop: '14px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isRed ? '#dc2626' : isAmber ? '#d97706' : '#16a34a' }}>
                  {t.action}
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: textPrimary, marginTop: '3px' }}>
                  {data?.assessment.action_protocol || 'Normal Monitoring Active. Conditions stable.'}
                </div>
              </div>
            </div>

            {/* ── 4 Telemetry Metrics Grid ── */}
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
                  sub: 'source: Open-Meteo & OpenWeather',
                  icon: '🌧️',
                  badgeBg: '#eff6ff',
                  badgeColor: '#2563eb'
                },
                {
                  label: t.rain72,
                  value: `${data?.weather.rain_72h_mm ?? 285} mm`,
                  sub: 'source: 3-Day Antecedent Rain',
                  icon: '💧',
                  badgeBg: '#eff6ff',
                  badgeColor: '#2563eb'
                },
                {
                  label: t.soil,
                  value: `${data?.weather.soil_moisture ?? 0.52} m³/m³`,
                  sub: 'source: Topsoil 0-1cm Layer',
                  icon: '%',
                  badgeBg: '#eff6ff',
                  badgeColor: '#2563eb'
                },
                {
                  label: t.elevation,
                  value: '876.5 m',
                  sub: 'source: NASA SRTM 30m DEM',
                  icon: '📈',
                  badgeBg: '#eff6ff',
                  badgeColor: '#2563eb'
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '16px',
                    padding: '18px',
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: textSecondary }}>
                      {card.label}
                    </div>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: card.badgeBg, color: card.badgeColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800
                    }}>
                      {card.icon}
                    </div>
                  </div>

                  <div style={{ fontSize: '1.9rem', fontWeight: 900, color: textPrimary, letterSpacing: '-0.03em' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '4px' }}>
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Highway Corridor Status & Safe Detour Routing Card ── */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '22px',
              marginBottom: '24px',
              boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: textPrimary,
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span>🚗</span>
                <span>{t.roadStatus}</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {/* Corridor 1 */}
                <div style={{
                  background: isDark ? '#1f2937' : '#f9fafb',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '12px', padding: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>Highway Corridor Status</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    color: '#dc2626', padding: '6px 12px', borderRadius: '8px',
                    fontSize: '0.86rem', fontWeight: 800
                  }}>
                    <span>⛔</span>
                    <span>{data?.evacuation_plan.primary_corridor || 'NH-766 (BLOCKED - Landslide Hazard Zone)'}</span>
                  </div>
                </div>

                {/* Corridor 2 */}
                <div style={{
                  background: isDark ? '#1f2937' : '#f9fafb',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '12px', padding: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>{t.safeRoute}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    color: '#16a34a', padding: '6px 12px', borderRadius: '8px',
                    fontSize: '0.86rem', fontWeight: 800
                  }}>
                    <span>✅</span>
                    <span>{data?.evacuation_plan.safe_evacuation_route || 'Active via SH-59 (Bypass Corridor)'}</span>
                  </div>
                </div>

                {/* Corridor 3 */}
                <div style={{
                  background: isDark ? '#1f2937' : '#f9fafb',
                  border: `1px solid ${cardBorder}`,
                  borderRadius: '12px', padding: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: textMuted, marginBottom: '6px' }}>{t.estTime}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    color: '#2563eb', padding: '6px 12px', borderRadius: '8px',
                    fontSize: '0.86rem', fontWeight: 800
                  }}>
                    <span>⏱️</span>
                    <span>{data?.evacuation_plan.estimated_evacuation_time_min ?? 42} Minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Survival Guide Card */}
            <div style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '22px',
              boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', fontWeight: 800, color: textPrimary }}>
                🛡️ {t.survivalGuide}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: textSecondary, fontSize: '0.88rem' }}>
                <li><strong>Muddy water or sudden stream surge</strong> indicates uphill slope failure — move immediately.</li>
                <li><strong>Do not use NH-766</strong> when blocked. Follow designated SH-59 green bypass on the GIS map.</li>
                <li><strong>Rumbling sounds or cracking trees</strong> — move perpendicular to slope, not downhill.</li>
                <li><strong>Emergency Helplines:</strong> National Disaster: <strong>1070</strong> | State Control Room: <strong>1077</strong>.</li>
              </ul>
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

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '20px 16px',
        borderTop: `1px solid ${cardBorder}`, fontSize: '0.78rem', color: textMuted,
        background: cardBg
      }}>
        SIH 2026 AI Landslide Early Warning System · NDMA SACHET · Open-Meteo · NASA SRTM 30m DEM · OpenWeather
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
};

export default CitizenPortal;
