/**
 * AI Priority Agent — Ranks and prioritizes disaster alerts
 * Uses a weighted multi-factor scoring model
 * SIH 2026 EWS-NER
 *
 * Priority Score Formula:
 *   P = 0.35 × risk_score
 *     + 0.25 × rainfall_score
 *     + 0.20 × population_score
 *     + 0.15 × report_density_score
 *     + 0.05 × recency_score
 */

export type CriticalityLabel =
  | 'LIFE-THREATENING'
  | 'URGENT'
  | 'MONITOR'
  | 'ROUTINE';

export interface AlertInput {
  id: string;
  zone: string;
  lat: number;
  lon: number;
  risk_level: 'RED' | 'AMBER' | 'GREEN';
  risk_score: number;          // 0–1
  rain_24h_mm: number;
  rain_72h_mm: number;
  soil_moisture: number;       // 0–1
  slope_deg: number;
  citizen_reports_count: number;
  population_estimate?: number;
  timestamp: string;           // ISO
}

export interface PrioritizedAlert extends AlertInput {
  priority_rank: number;
  priority_score: number;       // 0–1
  criticality_label: CriticalityLabel;
  recommended_action: string;
  affected_population_estimate: string;
  agent_reasoning: string[];    // Explanation bullets
  confidence_pct: number;
}

/** Normalize a value to 0–1 range */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/** Get time recency score — more recent = higher score */
function recencyScore(timestamp: string): number {
  const ageMinutes = (Date.now() - new Date(timestamp).getTime()) / 60000;
  if (ageMinutes < 15) return 1.0;
  if (ageMinutes < 60) return 0.8;
  if (ageMinutes < 360) return 0.5;
  if (ageMinutes < 1440) return 0.3;
  return 0.1;
}

/** Get population density score based on known high-density zones */
function populationScore(lat: number, lon: number, override?: number): number {
  if (override !== undefined) {
    return normalize(override, 0, 500000);
  }
  // Approximate density scoring by coordinate proximity to urban centers
  const urbanCenters = [
    { lat: 26.1445, lon: 91.7362, density: 0.9 },  // Guwahati
    { lat: 25.5788, lon: 91.8933, density: 0.7 },  // Shillong
    { lat: 11.5534, lon: 76.1320, density: 0.6 },  // Meppadi
    { lat: 10.0889, lon: 77.0595, density: 0.5 },  // Munnar
    { lat: 23.7271, lon: 92.7176, density: 0.5 },  // Aizawl
  ];
  let maxDensity = 0.2;
  for (const center of urbanCenters) {
    const dist = Math.sqrt(Math.pow(lat - center.lat, 2) + Math.pow(lon - center.lon, 2));
    if (dist < 0.5) maxDensity = Math.max(maxDensity, center.density);
    else if (dist < 1.5) maxDensity = Math.max(maxDensity, center.density * 0.5);
  }
  return maxDensity;
}

/** Map priority score to criticality label */
function getCriticalityLabel(score: number, level: string): CriticalityLabel {
  if (level === 'RED' && score >= 0.75) return 'LIFE-THREATENING';
  if (score >= 0.65 || level === 'RED') return 'URGENT';
  if (score >= 0.40 || level === 'AMBER') return 'MONITOR';
  return 'ROUTINE';
}

/** Get recommended action based on criticality */
function getRecommendedAction(label: CriticalityLabel, zone: string): string {
  switch (label) {
    case 'LIFE-THREATENING':
      return `IMMEDIATE EVACUATION of ${zone}. Close all highways. Deploy NDRF teams. Issue CAP RED alert.`;
    case 'URGENT':
      return `Alert field officers in ${zone}. Issue public warning. Pre-position rescue teams. Close vulnerable roads.`;
    case 'MONITOR':
      return `Monitor ${zone} hourly. Notify district administration. Keep evacuation routes clear.`;
    case 'ROUTINE':
      return `Standard monitoring for ${zone}. Update risk model with incoming rainfall data.`;
  }
}

/** Generate human-readable reasoning for agent decision */
function buildReasoning(input: AlertInput, score: number, components: Record<string, number>): string[] {
  const reasons: string[] = [];

  if (input.risk_level === 'RED') {
    reasons.push(`🔴 AI model returned RED alert (score: ${(input.risk_score * 100).toFixed(0)}%) — highest severity classification`);
  } else if (input.risk_level === 'AMBER') {
    reasons.push(`🟡 AI model flagged AMBER risk (score: ${(input.risk_score * 100).toFixed(0)}%) — elevated hazard threshold crossed`);
  }

  if (input.rain_24h_mm > 100) {
    reasons.push(`🌧️ Extreme 24h rainfall: ${input.rain_24h_mm}mm (threshold: 100mm) — critical saturation risk`);
  } else if (input.rain_24h_mm > 60) {
    reasons.push(`🌦️ Heavy 24h rainfall: ${input.rain_24h_mm}mm — soil moisture accumulation`);
  }

  if (input.slope_deg > 35) {
    reasons.push(`⛰️ Steep terrain: ${input.slope_deg}° slope — high gravitational failure risk`);
  }

  if (input.soil_moisture > 0.5) {
    reasons.push(`💧 Saturated soil moisture: ${(input.soil_moisture * 100).toFixed(0)}% — near field capacity`);
  }

  if (input.citizen_reports_count > 5) {
    reasons.push(`📋 ${input.citizen_reports_count} citizen ground reports corroborate model prediction`);
  } else if (input.citizen_reports_count > 0) {
    reasons.push(`📋 ${input.citizen_reports_count} citizen report(s) received from this zone`);
  }

  reasons.push(`⏱️ Overall priority weight: ${(score * 100).toFixed(1)}% (ranked by weighted AI formula)`);

  return reasons;
}

/** Format population estimate for display */
function formatPopulation(lat: number, lon: number, override?: number): string {
  const score = populationScore(lat, lon, override);
  if (score >= 0.85) return '> 500,000 at risk';
  if (score >= 0.65) return '100,000 – 500,000 at risk';
  if (score >= 0.45) return '25,000 – 100,000 at risk';
  if (score >= 0.25) return '5,000 – 25,000 at risk';
  return '< 5,000 at risk (remote region)';
}

/**
 * Core AI Priority Agent function
 * Takes a list of alerts, scores each, and returns sorted priority list
 */
export function runAIPriorityAgent(alerts: AlertInput[]): PrioritizedAlert[] {
  const scored = alerts.map((input) => {
    // Factor scores
    const riskLevelScore = input.risk_level === 'RED' ? 1.0 : input.risk_level === 'AMBER' ? 0.6 : 0.1;
    const rainfallScore  = normalize(input.rain_24h_mm, 0, 200);
    const popScore       = populationScore(input.lat, input.lon, input.population_estimate);
    const reportScore    = normalize(input.citizen_reports_count, 0, 20);
    const recency        = recencyScore(input.timestamp);

    // Weighted composite priority score
    const priority_score =
      0.35 * riskLevelScore +
      0.25 * rainfallScore  +
      0.20 * popScore       +
      0.15 * reportScore    +
      0.05 * recency;

    const components = { riskLevelScore, rainfallScore, popScore, reportScore, recency };
    const criticality_label = getCriticalityLabel(priority_score, input.risk_level);

    return {
      ...input,
      priority_rank: 0,   // assigned after sort
      priority_score,
      criticality_label,
      recommended_action: getRecommendedAction(criticality_label, input.zone),
      affected_population_estimate: formatPopulation(input.lat, input.lon, input.population_estimate),
      agent_reasoning: buildReasoning(input, priority_score, components),
      confidence_pct: Math.round(70 + priority_score * 25), // 70–95% confidence range
    };
  });

  // Sort by priority score descending
  scored.sort((a, b) => b.priority_score - a.priority_score);

  // Assign rank
  return scored.map((item, idx) => ({ ...item, priority_rank: idx + 1 }));
}

/** Generate sample demo alerts for live dashboard */
export function getDemoAlerts(): AlertInput[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'alert-001',
      zone: 'Meppadi, Wayanad',
      lat: 11.5534, lon: 76.1320,
      risk_level: 'RED',
      risk_score: 0.84,
      rain_24h_mm: 142,
      rain_72h_mm: 285,
      soil_moisture: 0.52,
      slope_deg: 38.5,
      citizen_reports_count: 7,
      population_estimate: 35000,
      timestamp: now,
    },
    {
      id: 'alert-002',
      zone: 'Munnar, Idukki',
      lat: 10.0889, lon: 77.0595,
      risk_level: 'AMBER',
      risk_score: 0.62,
      rain_24h_mm: 88,
      rain_72h_mm: 176,
      soil_moisture: 0.43,
      slope_deg: 42.0,
      citizen_reports_count: 3,
      population_estimate: 22000,
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: 'alert-003',
      zone: 'Guwahati Hills, Assam',
      lat: 26.1445, lon: 91.7362,
      risk_level: 'AMBER',
      risk_score: 0.58,
      rain_24h_mm: 72,
      rain_72h_mm: 145,
      soil_moisture: 0.38,
      slope_deg: 28.0,
      citizen_reports_count: 2,
      population_estimate: 120000,
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: 'alert-004',
      zone: 'Aizawl Slopes, Mizoram',
      lat: 23.7271, lon: 92.7176,
      risk_level: 'RED',
      risk_score: 0.79,
      rain_24h_mm: 118,
      rain_72h_mm: 230,
      soil_moisture: 0.61,
      slope_deg: 45.0,
      citizen_reports_count: 5,
      population_estimate: 18000,
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: 'alert-005',
      zone: 'Shillong Ridge, Meghalaya',
      lat: 25.5788, lon: 91.8933,
      risk_level: 'GREEN',
      risk_score: 0.28,
      rain_24h_mm: 32,
      rain_72h_mm: 68,
      soil_moisture: 0.22,
      slope_deg: 34.0,
      citizen_reports_count: 0,
      population_estimate: 85000,
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ];
}
