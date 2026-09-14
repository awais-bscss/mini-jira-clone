import { apiClient } from './apiClient.js';

export const fetchTasks = (boardId, filters = {}) =>
  apiClient.get(`/api/boards/${boardId}/tasks`, {
    params: {
      limit: filters.limit || 1000,
      page: filters.page,
      status: filters.status,
      assigneeId: filters.assigneeId,
      labelId: filters.labelId,
      search: filters.search,
    },
    fallbackMessage: 'Failed to fetch tasks',
  });

export const fetchTask = (taskId) =>
  apiClient.get(`/api/tasks/${taskId}`, { fallbackMessage: 'Failed to fetch task' });

export const createTask = (data) =>
  apiClient.post('/api/tasks', data, { fallbackMessage: 'Failed to create task' });

export const updateTask = ({ id, ...data }) =>
  apiClient.patch(`/api/tasks/${id}`, data, { fallbackMessage: 'Failed to update task' });

export const deleteTask = (id) =>
  apiClient.delete(`/api/tasks/${id}`, { fallbackMessage: 'Failed to delete task' });

export const reorderTasks = (boardId, payload) =>
  apiClient.patch(`/api/boards/${boardId}/tasks/reorder`, payload, {
    fallbackMessage: 'Failed to reorder tasks',
  });

export const addComment = (taskId, data) =>
  apiClient.post(`/api/tasks/${taskId}/comments`, data, {
    fallbackMessage: 'Failed to add comment',
  });
