import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useGeolocation } from '../hooks/useGeolocation';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { CategoryGrid } from '../components/report/CategoryGrid';
import { AiVisionScanner, VisionDetectionResult } from '../components/report/AiVisionScanner';
import { ReportCategory } from '../types';
import { queueReport } from '../services/offlineStore';
import { submitReport } from '../services/api';

const ReportFormPage = () => {
  const navigate = useNavigate();
  const { isOnline } = useOfflineSync();
  const { coords } = useGeolocation();
  const lang = (localStorage.getItem('ews_lang') as 'en' | 'hi' | 'as') || 'en';
  const { startListening, stopListening, isListening, transcript } = useVoiceAssistant(lang);
  
  const [category, setCategory] = useState<ReportCategory | null>('CRACK');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visionData, setVisionData] = useState<VisionDetectionResult | null>(null);

  // When speech transcript comes, append to description
  React.useEffect(() => {
    if (transcript) {
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  }, [transcript]);

  const handleAiScanComplete = (result: VisionDetectionResult) => {
    setVisionData(result);
    // Auto-fill category based on AI Vision detection
    if (result.hazardType === 'TENSION_CRACK') {
      setCategory('CRACK');
    } else if (result.hazardType === 'MUDFLOW' || result.hazardType === 'SLOPE_EROSION') {
      setCategory('SLOPE_MOVEMENT');
    } else if (result.hazardType === 'ROAD_FRACTURE') {
      setCategory('BLOCKED_ROAD');
    } else {
      setCategory('OTHER');
    }

    setDescription(prev =>
      `[AI Verified: ${result.label} (${result.confidence}% confidence)]. ${result.recommendedAction} ${prev}`
    );
  };

  const handleSubmit = async () => {
    if (!category) return;
    setSubmitting(true);
    try {
      const payload = {
        geoLat: coords?.lat || 11.5534,
        geoLng: coords?.lng || 76.1320,
        category,
        description,
        reporterType: 'CITIZEN' as const,
        photoUrl: null
      };

      if (isOnline) {
        await submitReport(payload);
      } else {
        await queueReport(payload);
      }
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('Error submitting report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b1329', color: '#f1f5f9', padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/citizen')}
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            ← Back to Citizen Portal
          </button>
          <div style={{ fontSize: '0.8rem', color: isOnline ? '#4ade80' : '#f59e0b', fontWeight: 700 }}>
            {isOnline ? '🟢 Connected (Instant Sync)' : '🟡 Offline Mode (Queued)'}
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '18px', padding: '28px' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc' }}>
            📋 Report Landslide / Road Hazard
          </h2>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Crowdsourced disaster verification powered by Computer Vision &amp; NDMA CAP protocols.
          </p>

          {/* 1. AI Vision Scanner */}
          <AiVisionScanner onScanComplete={handleAiScanComplete} />

          {/* 2. Hazard Category Grid */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              Hazard Category:
            </label>
            <CategoryGrid selected={category} onSelect={setCategory} lang={lang} />
          </div>

          {/* 3. Description with Voice Dictation */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                Incident Details:
              </label>
              <button
                onClick={() => isListening ? stopListening() : startListening()}
                style={{
                  background: isListening ? '#ef4444' : 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid #3b82f650', color: isListening ? '#fff' : '#60a5fa',
                  borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {isListening ? '🛑 Listening… Click to Stop' : '🎤 Speak / Voice Dictate'}
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe road blockage, mudflow severity, or stranded vehicles..."
              style={{
                width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155',
                borderRadius: '8px', color: '#f8fafc', fontSize: '0.9rem', resize: 'vertical'
              }}
            />
          </div>

          {/* 4. GPS Location Status */}
          <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.8rem', color: '#94a3b8' }}>
            📍 GPS Coordinates: <strong style={{ color: '#f8fafc' }}>{coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Auto-detecting GPS (11.5534, 76.1320)...'}</strong>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || success}
            style={{
              width: '100%', padding: '14px',
              background: success ? '#22c55e' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 800,
              cursor: submitting || success ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.4)'
            }}
          >
            {success ? '✅ Incident Report Logged & Dispatched!' : submitting ? 'Submitting…' : '🚀 Submit Verified Incident Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFormPage;
