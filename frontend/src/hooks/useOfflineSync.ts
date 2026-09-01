import { useState, useEffect, useCallback } from 'react';
import { getPendingReports, removePendingReport } from '../services/offlineStore';
import { submitReport } from '../services/api';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkPending = useCallback(async () => {
    const pending = await getPendingReports();
    setPendingCount(pending.length);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const pending = await getPendingReports();
      for (const item of pending) {
        try {
          await submitReport(item.payload);
          await removePendingReport(item.id);
        } catch (e) {
          console.error('Failed to sync report', item.id, e);
        }
      }
      await checkPending();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, checkPending]);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncNow(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    checkPending();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow, checkPending]);

  return { isOnline, pendingCount, syncNow, isSyncing };
}
