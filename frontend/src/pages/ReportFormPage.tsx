import React, { useState } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useGeolocation } from '../hooks/useGeolocation';
import { CategoryGrid } from '../components/report/CategoryGrid';
import { PhotoCapture } from '../components/report/PhotoCapture';
import { ReportCategory } from '../types';
import { queueReport } from '../services/offlineStore';
import { submitReport, uploadPhoto } from '../services/api';

const ReportFormPage = () => {
  const { isOnline } = useOfflineSync();
  const { coords, error, loading } = useGeolocation();
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const lang = localStorage.getItem('ews_lang') || 'en';

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!category) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (photoFile && isOnline) {
        photoUrl = await uploadPhoto(photoFile);
      }
      
      const payload = {
        geoLat: coords?.lat || 23.7271,
        geoLng: coords?.lng || 92.7176,
        category,
        description,
        reporterType: 'CITIZEN' as const,
        photoUrl
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

  if (success) {
    return (
      <div style={{ background: 'var(--color-citizen-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-citizen-confirm)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>✓ Report submitted</h2>
          <p>Thank you for keeping the community safe.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '24px', padding: '12px 24px', background: 'var(--color-citizen-card)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Report Another</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-citizen-base)', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Report an Incident</h2>
        
        {!isOnline && (
          <div style={{ background: '#C4873A', color: '#161B22', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontWeight: 600 }}>
            You're offline — report will sync automatically when connected
          </div>
        )}
        
        <div style={{ background: 'var(--color-citizen-card)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          📍 Location: 
          {loading ? ' Detecting...' : error ? ` ${error}` : <span className="mono" style={{ marginLeft: '8px' }}>{coords?.lat.toFixed(4)}°N {coords?.lng.toFixed(4)}°E</span>}
        </div>
        
        <CategoryGrid selected={category} onSelect={setCategory} lang={lang} />
        
        <PhotoCapture onPhotoSelected={handlePhotoSelect} preview={preview} onRemovePhoto={() => { setPhotoFile(null); setPreview(null); }} />
        
        <textarea 
          placeholder="Add details (optional)" 
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={{ width: '100%', height: '100px', padding: '12px', background: 'var(--color-citizen-card)', color: '#fff', border: '1px solid var(--color-base-400)', borderRadius: '8px', marginBottom: '24px' }}
        />
        
        <button 
          onClick={handleSubmit} 
          disabled={!category || submitting}
          style={{ width: '100%', padding: '16px', background: 'var(--color-citizen-confirm)', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '18px', cursor: (category && !submitting) ? 'pointer' : 'not-allowed', opacity: (category && !submitting) ? 1 : 0.5 }}
        >
          {submitting ? 'Submitting...' : isOnline ? '✓ SUBMIT REPORT' : '📲 QUEUE FOR SYNC'}
        </button>
      </div>
    </div>
  );
};

export default ReportFormPage;
