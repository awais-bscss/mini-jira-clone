import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTasks, fetchTask, createTask, updateTask, deleteTask,
  reorderTasks, addComment, fetchTaskComments,
} from '../api/tasks.js';

export const taskKeys = {
  all:      ['tasks'],
  board:    (boardId) => ['tasks', boardId],
  detail:   (taskId)  => ['task', taskId],
  comments: (taskId)  => ['task', taskId, 'comments'],
};

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
    initialDataUpdatedAt: () => Date.now(),
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
      await qc.cancelQueries({ queryKey: taskKeys.detail(variables.id) });
      const snapshot = qc.getQueriesData({ queryKey: taskKeys.board(boardId) });
      const detailSnapshot = qc.getQueryData(taskKeys.detail(variables.id));
      updateQueriesTasks(qc, taskKeys.board(boardId), (tasks) =>
        tasks.map(t => t.id === variables.id ? { ...t, ...variables } : t)
      );
      qc.setQueryData(taskKeys.detail(variables.id), (old) =>
        old ? { ...old, ...variables } : old
      );
      return { snapshot, detailSnapshot };
    },
    onError: (_err, vars, ctx) => {
      ctx?.snapshot?.forEach(([k, v]) => qc.setQueryData(k, v));
      if (ctx?.detailSnapshot !== undefined) {
        qc.setQueryData(taskKeys.detail(vars.id), ctx.detailSnapshot);
      }
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: taskKeys.board(boardId) });
      if (vars?.id) qc.invalidateQueries({ queryKey: taskKeys.detail(vars.id) });
    },
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
      await qc.cancelQueries({ queryKey: taskKeys.detail(taskId) });

      const snapshot = qc.getQueriesData({ queryKey: taskKeys.board(boardId) });
      const detailSnapshot = qc.getQueryData(taskKeys.detail(taskId));

      updateQueriesTasks(qc, taskKeys.board(boardId), (tasks) =>
        tasks.map(t => t.id === taskId ? { ...t, status: newStatus, order: newOrder } : t)
      );

      qc.setQueryData(taskKeys.detail(taskId), (old) => {
        if (old) return { ...old, status: newStatus, order: newOrder };
        for (const [, data] of qc.getQueriesData({ queryKey: taskKeys.all })) {
          const hit = data?.tasks?.find(t => t.id === taskId);
          if (hit) return { ...hit, status: newStatus, order: newOrder };
        }
        return old;
      });

      return { snapshot, detailSnapshot };
    },
    onError: (_err, vars, ctx) => {
      ctx?.snapshot?.forEach(([k, v]) => qc.setQueryData(k, v));
      if (ctx?.detailSnapshot !== undefined) {
        qc.setQueryData(taskKeys.detail(vars.taskId), ctx.detailSnapshot);
      }
    },
    onSuccess: (updatedTask, vars) => {
      if (updatedTask) {
        qc.setQueryData(taskKeys.detail(vars.taskId), updatedTask);
      }
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: taskKeys.board(boardId) });
      if (vars?.taskId) {
        qc.invalidateQueries({ queryKey: taskKeys.detail(vars.taskId) });
      }
    },
  });
}

export function useTaskComments(taskId, { limit = 20, search = '' } = {}) {
  return useInfiniteQuery({
    queryKey: [...taskKeys.comments(taskId), { limit, search }],
    queryFn: ({ pageParam = 1 }) => fetchTaskComments(taskId, { page: pageParam, limit, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.page + 1 : undefined),
    enabled: !!taskId,
  });
}

export function useAddComment(taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => addComment(taskId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
    },
  });
}
