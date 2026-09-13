import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'mini_jira_recent_boards';
const MAX_RECENT  = 5;
const SYNC_EVENT  = 'mini_jira_recent_boards_updated';

function readFromStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentBoards() {
  const [recentIds, setRecentIds] = useState(readFromStorage);

  // Stay in sync with other hook instances (e.g. AppShell vs Sidebar)
  useEffect(() => {
    const sync = () => setRecentIds(readFromStorage());
    window.addEventListener(SYNC_EVENT, sync);
    return () => window.removeEventListener(SYNC_EVENT, sync);
  }, []);

  const addRecentBoard = useCallback((id) => {
    if (!id) return;
    const next = [id, ...readFromStorage().filter(b => b !== id)].slice(0, MAX_RECENT);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setRecentIds(next);
    // Defer so dispatch never fires inside a React state update
    setTimeout(() => window.dispatchEvent(new Event(SYNC_EVENT)), 0);
  }, []);

  return { recentIds, addRecentBoard };
}
