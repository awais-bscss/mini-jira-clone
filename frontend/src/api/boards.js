import { apiClient } from './apiClient.js';

export const fetchBoards = () =>
  apiClient.get('/api/boards', { fallbackMessage: 'Failed to fetch boards' });

export const createBoard = (data) =>
  apiClient.post('/api/boards', data, { fallbackMessage: 'Failed to create board' });

export const updateBoard = ({ id, ...data }) =>
  apiClient.patch(`/api/boards/${id}`, data, { fallbackMessage: 'Failed to update board' });

export const deleteBoard = (id) =>
  apiClient.delete(`/api/boards/${id}`, { fallbackMessage: 'Failed to delete board' });
