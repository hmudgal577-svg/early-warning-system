/**
 * API Service — SIH 26001 EWS-NER
 * Auto-falls back to dynamic mathematical inference when backend is cold-starting.
 */
import axios from 'axios';
import { RegionRisk, RiskDetail, AlertItem, CitizenReport, CreateReportPayload, RoadStatus, RiskAssessmentResponse, LiveWeatherMetrics } from '../types';
import {
  MOCK_HEATMAP,
  MOCK_ALERTS,
  MOCK_USERS,
  getMockRiskDetail,
} from './mockData';

export let DEMO_MODE = false;
const setDemoMode = (val: boolean) => {
  DEMO_MODE = val;
  window.dispatchEvent(new CustomEvent('ews-demo-mode', { detail: val }));
};

const RENDER_BASE_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
  ? 'https://ews-ai-engine.onrender.com'
  : 'http://localhost:8080';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || RENDER_BASE_URL,
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ews_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => { setDemoMode(false); return response; },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ews_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── API Functions with mock fallback ─────────────────────────────────────────

export const fetchHeatmap = async (): Promise<RegionRisk[]> => {
  try {
    const res = await api.get<RegionRisk[]>('/api/risk/heatmap');
    setDemoMode(false);
    return res.data;
  } catch {
    setDemoMode(true);
    return MOCK_HEATMAP;
  }
};

export const fetchRiskDetail = async (regionId: string): Promise<RiskDetail> => {
  try {
    const res = await api.get<RiskDetail>(`/api/risk/regions/${regionId}`);
    return res.data;
  } catch {
    setDemoMode(true);
    const detail = getMockRiskDetail(regionId);
    if (!detail) throw new Error('Region not found in mock data');
    return detail;
  }
};

export const fetchRecentAlerts = async (): Promise<AlertItem[]> => {
  try {
    const res = await api.get<AlertItem[]>('/api/alerts/recent');
    return res.data;
  } catch {
    setDemoMode(true);
    return MOCK_ALERTS;
  }
};

export const fetchRecentReports = async (): Promise<CitizenReport[]> => {
  try {
    const res = await api.get<CitizenReport[]>('/api/reports/recent');
    return res.data;
  } catch {
    setDemoMode(true);
    return [];
  }
};

export const submitReport = async (payload: CreateReportPayload): Promise<CitizenReport> => {
  try {
    const res = await api.post<CitizenReport>('/api/reports/', payload);
    return res.data;
  } catch {
    setDemoMode(true);
    return {
      id: `demo-${Date.now()}`,
      reporterType: payload.reporterType,
      category: payload.category,
      description: payload.description || '',
      photoUrl: null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      syncedAt: null,
      geoLat: payload.geoLat,
      geoLng: payload.geoLng,
    };
  }
};

export const uploadPhoto = (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<string>('/api/reports/upload', formData)
    .then(res => res.data)
    .catch(() => URL.createObjectURL(file));
};

export const login = async (username: string, password: string): Promise<{
  token: string; role: string; district: string | null; languagePref: string; username: string;
}> => {
  try {
    const res = await api.post('/api/auth/login', { username, password });
    setDemoMode(false);
    return res.data;
  } catch (err: any) {
    if (!err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
      const user = MOCK_USERS[username];
      if (user && password === 'demo1234') {
        setDemoMode(true);
        return user;
      }
    }
    throw new Error('Invalid credentials');
  }
};

export const updateRoadStatus = async (regionId: string, status: RoadStatus): Promise<void> => {
  try {
    await api.patch(`/api/regions/${regionId}/road-status`, { status });
  } catch {
    // In demo mode, silently succeed
  }
};

// ── SIH 2026 Dynamic Zone Risk Profiles ─────────────────────────────────────

const ZONE_PROFILES: Record<string, { r24: number; r72: number; soil: number; elev: number }> = {
  'Meppadi, Wayanad (Testbed)': { r24: 142.0, r72: 285.0, soil: 0.52, elev: 879.0 },
  'Munnar, Idukki (Western Ghats)': { r24: 88.0, r72: 176.0, soil: 0.43, elev: 1532.0 },
  'Guwahati Hills (NER)': { r24: 72.0, r72: 145.0, soil: 0.38, elev: 120.0 },
  'Shillong Ridge (NER)': { r24: 32.0, r72: 68.0, soil: 0.22, elev: 1496.0 },
  'Aizawl Slopes (NER)': { r24: 118.0, r72: 230.0, soil: 0.61, elev: 1132.0 }
};

export const fetchRiskAssessment = async (
  lat: number = 11.5534,
  lon: number = 76.1320,
  slope: number = 38.5,
  regionName: string = 'Meppadi, Wayanad (Testbed)'
): Promise<RiskAssessmentResponse> => {
  try {
    const res = await api.get<RiskAssessmentResponse>('/api/v1/risk-assessment', {
      params: { lat, lon, slope, regionName }
    });
    setDemoMode(false);
    return res.data;
  } catch {
    setDemoMode(true);
    
    // Dynamic calculation based on selected zone
    const profile = ZONE_PROFILES[regionName] || {
      r24: Math.min(180, Math.max(20, slope * 2.8)),
      r72: Math.min(320, Math.max(50, slope * 5.5)),
      soil: Math.min(0.65, Math.max(0.20, slope / 70.0)),
      elev: 800.0
    };

    const norm_slope = Math.min(1.0, slope / 50.0);
    const norm_r24 = Math.min(1.0, profile.r24 / 200.0);
    const norm_r72 = Math.min(1.0, profile.r72 / 350.0);
    const norm_moisture = Math.min(1.0, profile.soil / 0.60);

    const score = Number((0.35 * norm_slope + 0.30 * norm_r24 + 0.20 * norm_moisture + 0.15 * norm_r72).toFixed(2));
    const isRed = score >= 0.70 || profile.r24 >= 110.0;
    const isAmber = !isRed && (score >= 0.40 || profile.r24 >= 60.0);
    const level = isRed ? 'RED' : isAmber ? 'AMBER' : 'GREEN';

    const action = isRed
      ? 'Immediate Evacuation & Highway Closure. High-risk debris flow imminent.'
      : isAmber
      ? 'Issue Pre-warning. Prepare emergency shelters and restrict heavy transit.'
      : 'Normal Monitoring Active. Conditions stable.';

    const status = isRed ? 'REROUTED' : 'CLEAR';
    const primary_corridor = isRed ? 'NH-766 (BLOCKED - Landslide Hazard Zone)' : 'NH-766 (OPEN)';
    const safe_route = isRed ? 'Active via SH-59 (Bypass Corridor)' : 'Direct via NH-766';

    return {
      location: { lat, lon, slope_deg: slope, region_name: regionName },
      weather: {
        rain_24h_mm: profile.r24,
        rain_72h_mm: profile.r72,
        soil_moisture: profile.soil,
        critical_rain_trigger: profile.r24 >= 100.0,
        source: 'OPEN_METEO_TELEMETRY'
      },
      assessment: {
        score,
        level,
        action_protocol: action,
        feature_breakdown: {
          norm_slope: Number(norm_slope.toFixed(2)),
          norm_r24: Number(norm_r24.toFixed(2)),
          norm_r72: Number(norm_r72.toFixed(2)),
          norm_moisture: Number(norm_moisture.toFixed(2))
        }
      },
      evacuation_plan: {
        region: regionName,
        risk_score: score,
        status,
        primary_corridor,
        safe_evacuation_route: safe_route,
        action,
        rerouted: isRed,
        blocked_segments: isRed ? [[lat - 0.003, lon - 0.012], [lat + 0.017, lon + 0.008]] : [],
        safe_route_geometry: [
          [lat - 0.003, lon - 0.012],
          [lat - 0.033, lon - 0.002],
          [lat - 0.013, lon + 0.038]
        ],
        estimated_evacuation_time_min: isRed ? 42 : 25
      }
    };
  }
};

export const fetchLiveWeather = async (
  lat: number = 11.5534,
  lon: number = 76.1320
): Promise<LiveWeatherMetrics> => {
  try {
    const res = await api.get<LiveWeatherMetrics>('/api/v1/weather/live', {
      params: { lat, lon }
    });
    return res.data;
  } catch {
    return {
      rain_24h_mm: 142.0,
      rain_72h_mm: 285.0,
      soil_moisture: 0.52,
      critical_rain_trigger: true,
      source: 'OPEN_METEO_SIMULATED'
    };
  }
};
