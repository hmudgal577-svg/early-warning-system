import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [lang, setLang]         = useState<'en' | 'hi' | 'as'>('en');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const data = await login(username, password);
      localStorage.setItem('ews_token', data.token);
      localStorage.setItem('ews_role', data.role);
      localStorage.setItem('ews_lang', data.languagePref || 'en');
      if (['ADMIN', 'DISTRICT_OFFICIAL', 'FIELD_OFFICER'].includes(data.role)) {
        navigate('/dashboard');
      } else {
        navigate('/citizen');
      }
    } catch {
      setError('Invalid credentials. Try: admin / demo1234');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (user: string) => { setUsername(user); setPassword('demo1234'); };

  const t = {
    en: {
      heroTitle: 'Northeast & Western Ghats Disaster Intelligence',
      heroSubtitle: 'Real-time safety alerts, NASA 30m terrain analytics, AI-powered risk prediction, and safe evacuation for India.',
      liveBadge: '🟢 LIVE MONITORING & TELEMETRY SYNC',
      citizenTitle: 'Continue as Citizen',
      citizenDesc: 'Access safety alerts, live AI risk predictions, highway road status and survival guide for your location.',
      citizenBtn: 'Continue as Citizen →',
      noAccount: 'Citizens do not need an account.',
      officerTitle: 'Field Officer & Admin Login',
      officerDesc: 'Authorized disaster management & field officers only.',
      submit: 'Log In as Officer →'
    },
    hi: {
      heroTitle: 'पूर्वोत्तर एवं पश्चिमी घाट आपदा पूर्व सूचना प्रणाली',
      heroSubtitle: 'रीयल-टाइम सुरक्षा चेतावनी, नासा 30m भू-भाग विश्लेषण, एआई-संचालित जोखिम भविष्यवाणी एवं सुरक्षित निकासी।',
      liveBadge: '🟢 लाइव निगरानी एवं उपग्रह टेलीमेट्री',
      citizenTitle: 'नागरिक के रूप में जारी रखें',
      citizenDesc: 'सुरक्षा चेतावनियां, लाइव एआई जोखिम स्कोर, सड़क स्थिति और जीवन रक्षा गाइड देखें।',
      citizenBtn: 'नागरिक के रूप में जारी रखें →',
      noAccount: 'नागरिकों को किसी खाते की आवश्यकता नहीं है।',
      officerTitle: 'फील्ड अधिकारी एवं एडमिन लॉगिन',
      officerDesc: 'केवल अधिकृत आपदा प्रबंधन अधिकारियों के लिए।',
      submit: 'अधिकारी के रूप में लॉगिन करें →'
    },
    as: {
      heroTitle: 'উত্তৰ-পূব দুৰ্যোগ চোৰাংচোৱা প্লেটফৰ্ম',
      heroSubtitle: 'প্ৰকৃত সময়ৰ সুৰক্ষা সতৰ্কবাৰ্তা, নাছা ৩০মি উচ্চতা বিশ্লেষণ আৰু এআই ভূমিস্খলন পূৰ্বানুমান।',
      liveBadge: '🟢 লাইভ নিৰীক্ষণ সক্ৰিয়',
      citizenTitle: 'নাগৰিক হিচাপে অব্যাহত ৰাখক',
      citizenDesc: 'সুৰক্ষা সতৰ্কবাৰ্তা, ৰাজপথৰ স্থিতি আৰু জৰুৰীকালীন নিৰ্দেশনা লাভ কৰক।',
      citizenBtn: 'নাগৰিক হিচাপে অব্যাহত ৰাখক →',
      noAccount: 'নাগৰিকসকলৰ বাবে একাউণ্টৰ প্ৰয়োজন নাই।',
      officerTitle: 'ক্ষেত্ৰ বিষয়া আৰু এডমিন প্ৰৱেশ',
      officerDesc: 'কেৱল কৰ্তৃত্বপ্ৰাপ্ত বিষয়াসকলৰ বাবে।',
      submit: 'বিষয়া হিচাপে প্ৰৱেশ কৰক →'
    }
  }[lang];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b1329 0%, #0f172a 50%, #1e1b4b 100%)',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>
            🛰️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              EWS · Disaster Intelligence
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              SIH 2026 AI Early Warning Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2px' }}>
            {(['en', 'hi', 'as'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '4px 10px', borderRadius: '16px', border: 'none',
                  background: lang === l ? '#2563eb' : 'transparent',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/sih-dashboard')}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🗺️ 3D GIS Map
          </button>
        </div>
      </header>

      {/* ── Main Entrance ── */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '32px 16px'
      }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', maxWidth: '580px', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e',
            color: '#4ade80', padding: '4px 12px', borderRadius: '20px',
            fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            {t.liveBadge}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 10px 0' }}>
            {t.heroTitle}
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
            {t.heroSubtitle}
          </p>
        </div>

        {/* Dual Cards Container */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', maxWidth: '820px', width: '100%' }}>
          
          {/* Card 1: Citizen Entry */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '20px',
            padding: '28px',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👤</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px 0', color: '#f8fafc' }}>
                {t.citizenTitle}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                {t.citizenDesc}
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate('/citizen')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'transform 0.15s'
                }}
              >
                {t.citizenBtn}
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '10px' }}>
                {t.noAccount}
              </div>
            </div>
          </div>

          {/* Card 2: Officer Login */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '28px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px 0', color: '#f8fafc' }}>
              {t.officerTitle}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              {t.officerDesc}
            </p>

            <form onSubmit={handleLogin}>
              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#fca5a5', marginBottom: '12px' }}>
                  ⚠ {error}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                    fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="demo1234"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    background: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                    fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                }}
              >
                {loading ? 'Authenticating...' : t.submit}
              </button>
            </form>

            {/* Demo Credential Quick-Fill */}
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Quick Fill:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['admin', 'district_kam', 'field_aiz'].map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => fillDemo(u)}
                    style={{
                      background: '#1e293b', color: '#38bdf8', border: '1px solid #334155',
                      borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer'
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center', padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: '0.75rem', color: '#64748b'
      }}>
        Northeast &amp; Western Ghats Disaster Intelligence · Data Sources: NDMA SACHET, Open-Meteo, NASA SRTM 30m DEM, OpenWeather
      </footer>
    </div>
  );
};

export default LoginPage;
