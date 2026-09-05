import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { AlertItem, CitizenReport, RegionRisk } from '../types';
import { fetchHeatmap, fetchRecentAlerts, resolveApiBaseUrl } from '../services/api';

const resolveBrokerUrl = (): string | null => {
  const base = resolveApiBaseUrl();
  if (!base) return null;
  if (base.startsWith('https://')) return base.replace('https://', 'wss://') + '/ws';
  if (base.startsWith('http://')) return base.replace('http://', 'ws://') + '/ws';
  return null;
};

const resolveSseUrl = (): string | null => {
  const base = resolveApiBaseUrl();
  if (!base) return null;
  return base + '/api/risk/stream';
};

export function useLiveFeed(
  onAlert: (alert: AlertItem) => void,
  onReport: (report: CitizenReport) => void,
  onHeatmapUpdate?: (data: RegionRisk[]) => void
) {
  const [connected, setConnected] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const sseRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 1. SSE: primary real-time heatmap stream ─────────────────────────────
  useEffect(() => {
    const sseUrl = resolveSseUrl();
    if (!sseUrl || !onHeatmapUpdate) return;

    const connect = () => {
      try {
        const es = new EventSource(sseUrl);
        sseRef.current = es;

        es.addEventListener('heatmap', (e: MessageEvent) => {
          try {
            const data: RegionRisk[] = JSON.parse(e.data);
            onHeatmapUpdate(data);
            setSseConnected(true);
            // Clear polling fallback if SSE is working
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
          } catch {}
        });

        es.addEventListener('ping', () => {
          setSseConnected(true);
        });

        es.onerror = () => {
          setSseConnected(false);
          es.close();
          // Fallback to 15s polling if SSE fails
          if (!pollRef.current) {
            pollRef.current = setInterval(async () => {
              try {
                const data = await fetchHeatmap();
                onHeatmapUpdate(data);
              } catch {}
            }, 15000);
          }
          // Reconnect SSE after 10s
          setTimeout(connect, 10000);
        };

        es.onopen = () => setSseConnected(true);
      } catch {
        setSseConnected(false);
      }
    };

    connect();

    return () => {
      sseRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [onHeatmapUpdate]);

  // ── 2. WebSocket STOMP: alerts + reports ─────────────────────────────────
  useEffect(() => {
    const brokerURL = resolveBrokerUrl();
    if (!brokerURL) return;

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/alerts', (message) => {
          try { onAlert(JSON.parse(message.body)); } catch {}
        });
        client.subscribe('/topic/reports', (message) => {
          try { onReport(JSON.parse(message.body)); } catch {}
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketError: () => setConnected(false)
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [onAlert, onReport]);

  // ── 3. Alert polling fallback (every 15s) ─────────────────────────────────
  useEffect(() => {
    const pollAlerts = async () => {
      try {
        const alerts = await fetchRecentAlerts();
        alerts.forEach(a => onAlert(a));
      } catch {}
    };
    const iv = setInterval(pollAlerts, 15000);
    return () => clearInterval(iv);
  }, [onAlert]);

  return { connected, sseConnected };
}
