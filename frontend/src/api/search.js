import { apiClient } from './apiClient.js';

export async function searchEntities(query, signal) {
  const trimmed = query?.trim();
  if (!trimmed) return { projects: [], boards: [], tasks: [] };

  return apiClient.get('/api/search', {
    params: { q: trimmed },
    signal,
    fallbackMessage: 'Search request failed',
  });
}
