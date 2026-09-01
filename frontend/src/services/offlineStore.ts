import { openDB } from 'idb';
import { CreateReportPayload, RegionRisk } from '../types';

const DB_NAME = 'ews-offline-db';

export interface PendingReport {
  id: string;
  payload: CreateReportPayload;
  timestamp: number;
}

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pending-reports')) {
        db.createObjectStore('pending-reports', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cached-heatmap')) {
        db.createObjectStore('cached-heatmap', { keyPath: 'key' });
      }
    },
  });
};

export const queueReport = async (payload: CreateReportPayload): Promise<string> => {
  const db = await initDB();
  const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.put('pending-reports', { id, payload, timestamp: Date.now() });
  return id;
};

export const getPendingReports = async (): Promise<PendingReport[]> => {
  const db = await initDB();
  return db.getAll('pending-reports');
};

export const removePendingReport = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete('pending-reports', id);
};

export const cacheHeatmap = async (data: RegionRisk[]): Promise<void> => {
  const db = await initDB();
  await db.put('cached-heatmap', { key: 'main', data, timestamp: Date.now() });
};

export const getCachedHeatmap = async (): Promise<RegionRisk[] | null> => {
  const db = await initDB();
  const result = await db.get('cached-heatmap', 'main');
  return result ? result.data : null;
};
