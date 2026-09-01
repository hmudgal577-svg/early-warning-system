/**
 * API Service — SIH 26001 EWS-NER
 * Auto-falls back to DEMO MODE (mock data) when backend is unreachable.
 * A yellow banner in the UI indicates demo mode is active.
 */
import axios from 'axios';
import { RegionRisk, RiskDetail, AlertItem, CitizenReport, CreateReportPayload, RoadStatus } from '../types';
import {
  MOCK_HEATMAP,
  MOCK_ALERTS,
  MOCK_USERS,
  getMockRiskDetail,
} from './mockData';

// ── Is demo mode forced or auto? ─────────────────────────────────────────────
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
    // In demo mode, simulate successful submission
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
    .catch(() => URL.createObjectURL(file)); // fallback: local preview URL
};

export const login = async (username: string, password: string): Promise<{
  token: string; role: string; district: string | null; languagePref: string; username: string;
}> => {
  try {
    const res = await api.post('/api/auth/login', { username, password });
    setDemoMode(false);
    return res.data;
  } catch (err: any) {
    // If backend is down, allow demo logins
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
    // In demo mode, silently succeed (UI already updated optimistically)
  }
};

// ── SIH 2026 AI Landslide Early Warning API ─────────────────────────────────

import { RiskAssessmentResponse, LiveWeatherMetrics } from '../types';

export const fetchRiskAssessment = async (
  lat: number = 11.6854,
  lon: number = 76.1320,
  slope: number = 36.5,
  regionName: string = 'Meppadi, Wayanad'
): Promise<RiskAssessmentResponse> => {
  try {
    const res = await api.get<RiskAssessmentResponse>('/api/v1/risk-assessment', {
      params: { lat, lon, slope, regionName }
    });
    setDemoMode(false);
    return res.data;
  } catch {
    setDemoMode(true);
    // Fallback based on SIH 2026 specification
    return {
      location: { lat, lon, slope_deg: slope, region_name: regionName },
      weather: {
        rain_24h_mm: 142.0,
        rain_72h_mm: 285.0,
        soil_moisture: 0.52,
        critical_rain_trigger: true,
        source: 'OPEN_METEO_SIMULATED'
      },
      assessment: {
        score: 0.84,
        level: 'RED',
        action_protocol: 'Immediate Evacuation & Highway Closure',
        feature_breakdown: {
          norm_slope: 0.73,
          norm_r24: 0.71,
          norm_r72: 0.81,
          norm_moisture: 0.87
        }
      },
      evacuation_plan: {
        region: regionName,
        risk_score: 0.84,
        status: 'REROUTED',
        primary_corridor: 'NH-766 (BLOCKED - Landslide Hazard Zone)',
        safe_evacuation_route: 'Active via SH-59 (Bypass Corridor)',
        action: 'Immediate Evacuation & Highway Closure',
        rerouted: true,
        blocked_segments: [
          [11.55, 76.12],
          [11.57, 76.14]
        ],
        safe_route_geometry: [
          [11.55, 76.12],
          [11.52, 76.13],
          [11.54, 76.17]
        ],
        estimated_evacuation_time_min: 42
      }
    };
  }
};

export const fetchLiveWeather = async (
  lat: number = 11.6854,
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

