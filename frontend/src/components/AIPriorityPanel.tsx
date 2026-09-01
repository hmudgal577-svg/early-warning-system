/**
 * AIPriorityPanel — Live AI Agent Priority Dashboard
 * Shows ranked alerts sorted by criticality score
 * SIH 2026 EWS-NER
 */
import React, { useState, useEffect, useCallback } from 'react';
import { runAIPriorityAgent, getDemoAlerts, PrioritizedAlert, CriticalityLabel } from '../services/aiPriorityAgent';

const CRITICALITY_CONFIG: Record<CriticalityLabel, { color: string; bg: string; icon: string; border: string }> = {
  'LIFE-THREATENING': { color: '#fca5a5', bg: 'rgba(239,68,68,0.15)',  icon: '🚨', border: '#ef4444' },
  'URGENT':           { color: '#fcd34d', bg: 'rgba(245,158,11,0.15)', icon: '⚠️', border: '#f59e0b' },
  'MONITOR':          { color: '#93c5fd', bg: 'rgba(59,130,246,0.15)', icon: '👁️', border: '#3b82f6' },
  'ROUTINE':          { color: '#86efac', bg: 'rgba(34,197,94,0.10)',  icon: '✅', border: '#22c55e' },
};

export const AIPriorityPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<PrioritizedAlert[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    // Run AI Priority Agent on demo alerts (in production, fetched from backend)
    setTimeout(() => {
      const raw = getDemoAlerts();
      const prioritized = runAIPriorityAgent(raw);
      setAlerts(prioritized);
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  }, []);

  // Initial load + auto-refresh every 5 minutes
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [refresh]);

  const levelColor = (level: string) =>
    level === 'RED' ? '#ef4444' : level === 'AMBER' ? '#f59e0b' : '#22c55e';

  return (
    <div style={{
      background: '#0a0f1e',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '20px',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(15,23,42,0.9))',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}>
              🤖
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>
              AI Priority Agent
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Weighted multi-factor scoring · Auto-ranks by LIFE-THREATENING → ROUTINE
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'right' }}>
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={refresh}
            disabled={isRefreshing}
            style={{
              background: 'rgba(37,99,235,0.2)', border: '1px solid #2563eb',
              color: '#60a5fa', borderRadius: '8px', padding: '6px 12px',
              fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
              opacity: isRefreshing ? 0.5 : 1
            }}
          >
            {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      {/* Alert Count Summary Bar */}
      {alerts.length > 0 && (
        <div style={{
          padding: '12px 24px',
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.3)'
        }}>
          {(['LIFE-THREATENING', 'URGENT', 'MONITOR', 'ROUTINE'] as CriticalityLabel[]).map(label => {
            const count = alerts.filter(a => a.criticality_label === label).length;
            const cfg = CRITICALITY_CONFIG[label];
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px'
                }}>
                  {count}
                </span>
                <span style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 700 }}>{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert List */}
      <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
        {isRefreshing && alerts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            🤖 AI Agent scoring alerts…
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = CRITICALITY_CONFIG[alert.criticality_label];
            const isExpanded = expandedId === alert.id;

            return (
              <div
                key={alert.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                {/* Main Row */}
                <div
                  style={{ padding: '16px 24px', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
                  onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: cfg.bg, border: `2px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.9rem', color: cfg.color
                  }}>
                    #{alert.priority_rank}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                          {cfg.icon} {alert.zone}
                        </span>
                        <span style={{
                          marginLeft: '10px', padding: '2px 8px',
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          color: cfg.color, borderRadius: '20px',
                          fontSize: '0.68rem', fontWeight: 800
                        }}>
                          {alert.criticality_label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
                          background: `${levelColor(alert.risk_level)}20`,
                          color: levelColor(alert.risk_level),
                          border: `1px solid ${levelColor(alert.risk_level)}40`
                        }}>
                          {alert.risk_level} · {(alert.risk_score * 100).toFixed(0)}%
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <MetricChip icon="🌧️" value={`${alert.rain_24h_mm}mm/24h`} />
                      <MetricChip icon="⛰️" value={`${alert.slope_deg}°`} />
                      <MetricChip icon="👥" value={alert.affected_population_estimate} />
                      <MetricChip icon="📊" value={`Priority: ${(alert.priority_score * 100).toFixed(0)}%`} />
                    </div>
                  </div>
                </div>

                {/* Expanded AI Reasoning */}
                {isExpanded && (
                  <div style={{ padding: '0 24px 20px 76px' }}>
                    {/* Recommended Action */}
                    <div style={{
                      padding: '12px 16px', borderRadius: '10px',
                      background: cfg.bg, border: `1px solid ${cfg.border}30`,
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                        🎯 RECOMMENDED ACTION
                      </div>
                      <div style={{ fontSize: '0.85rem', color: cfg.color, fontWeight: 600, lineHeight: '1.5' }}>
                        {alert.recommended_action}
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>
                        🤖 WHY THIS PRIORITY? (AI Reasoning)
                      </div>
                      {alert.agent_reasoning.map((reason, i) => (
                        <div key={i} style={{
                          fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.5',
                          padding: '4px 0', borderLeft: `2px solid ${cfg.border}50`,
                          paddingLeft: '10px', marginBottom: '4px'
                        }}>
                          {reason}
                        </div>
                      ))}
                    </div>

                    {/* Confidence */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Agent Confidence:</div>
                      <div style={{ flex: 1, height: '4px', background: '#1e293b', borderRadius: '2px', maxWidth: '200px' }}>
                        <div style={{
                          height: '100%', borderRadius: '2px',
                          width: `${alert.confidence_pct}%`,
                          background: `linear-gradient(90deg, ${cfg.border}, ${cfg.color})`
                        }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 700 }}>{alert.confidence_pct}%</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 24px', fontSize: '0.7rem', color: '#334155',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        Model: Weighted 5-factor scoring (risk 35% · rainfall 25% · population 20% · citizen reports 15% · recency 5%)
      </div>
    </div>
  );
};

const MetricChip: React.FC<{ icon: string; value: string }> = ({ icon, value }) => (
  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
    <span>{icon}</span>
    <span>{value}</span>
  </div>
);
