import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTasks, fetchTask, createTask, updateTask, deleteTask,
  reorderTasks, addComment,
} from '../api/tasks.js';

export const taskKeys = {
  all:    ['tasks'],
  board:  (boardId) => ['tasks', boardId],
  detail: (taskId)  => ['task', taskId],
};

// Unified board-level task query — fetches all tasks in a single clean request
export function useTasks(boardId, filters = {}, options = {}) {
  const isValid = typeof boardId === 'string' && /^[0-9a-fA-F]{24}$/.test(boardId);
  return useQuery({
    queryKey: [...taskKeys.board(boardId), filters],
    queryFn: () => fetchTasks(boardId, { ...filters, limit: 200 }),
    enabled: isValid && options.enabled !== false,
    select: (data) => data.tasks,
  });
}

export function useTask(taskId) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => fetchTask(taskId),
    enabled: !!taskId,
    initialData: () => {
      for (const [, data] of qc.getQueriesData({ queryKey: taskKeys.all })) {
        const hit = data?.tasks?.find(t => t.id === taskId);
        if (hit) return hit;
      }
    },
    initialDataUpdatedAt: 0,
  });
}

function updateQueriesTasks(qc, queryKey, updater) {
  qc.setQueriesData({ queryKey }, (old) => {
    if (!old) return old;
    if (!old.tasks) return old;
    return { ...old, tasks: updater(old.tasks) };
  });
}

export function useCreateTask(boardId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.board(boardId) }),
  });
}

export function useUpdateTask(boardId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: taskKeys.board(boardId) });
      const snapshot = qc.getQueriesData({ queryKey: taskKeys.board(boardId) });
      updateQueriesTasks(qc, taskKeys.board(boardId), (tasks) =>
        tasks.map(t => t.id === variables.id ? { ...t, ...variables } : t)
      );
      qc.setQueryData(taskKeys.detail(variables.id), (old) =>
        old ? { ...old, ...variables } : old
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => ctx?.snapshot?.forEach(([k, v]) => qc.setQueryData(k, v)),
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.board(boardId) }),
  });
}

export function useDeleteTask(boardId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.board(boardId) }),
  });
}

export function useReorderTask(boardId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => reorderTasks(boardId, payload),
    onMutate: async ({ taskId, newStatus, newOrder }) => {
      await qc.cancelQueries({ queryKey: taskKeys.board(boardId) });
      const snapshot = qc.getQueriesData({ queryKey: taskKeys.board(boardId) });
      updateQueriesTasks(qc, taskKeys.board(boardId), (tasks) =>
        tasks.map(t => t.id === taskId ? { ...t, status: newStatus, order: newOrder } : t)
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => ctx?.snapshot?.forEach(([k, v]) => qc.setQueryData(k, v)),
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.board(boardId) }),
  });
}

export function useAddComment(taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => addComment(taskId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) }),
  });
}
