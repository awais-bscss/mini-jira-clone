import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchTasks, fetchTask, createTask, updateTask, deleteTask,
  reorderTasks, addComment,
} from '../api/tasks.js';

export const PAGE_SIZE = 30;

export const taskKeys = {
  all:    ['tasks'],
  board:  (boardId)                  => ['tasks', boardId],
  column: (boardId, status, filters) => ['tasks', boardId, 'column', status, filters],
  detail: (taskId)                   => ['task', taskId],
};

// Per-column infinite query — used by StatusColumn when groupBy === 'status'
export function useColumnTasks(boardId, status, filters = {}) {
  const isValidId = typeof boardId === 'string' && /^[0-9a-fA-F]{24}$/.test(boardId);
  const { assigneeId, labelId, search } = filters;

  return useInfiniteQuery({
    queryKey: taskKeys.column(boardId, status, { assigneeId, labelId, search }),
    queryFn: ({ pageParam = 1 }) =>
      fetchTasks(boardId, { status, assigneeId, labelId, search, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.tasks.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled: Boolean(isValidId && status),
    staleTime: 60_000,
  });
}

// Board-level query — used when groupBy is assignee or label
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
        if (data?.pages) {
          for (const page of data.pages) {
            const hit = page.tasks?.find(t => t.id === taskId);
            if (hit) return hit;
          }
        }
      }
    },
    initialDataUpdatedAt: 0,
  });
}

// Applies an updater fn to tasks in both regular { tasks } and infinite { pages } formats
function updateQueriesTasks(qc, queryKey, updater) {
  qc.setQueriesData({ queryKey }, (old) => {
    if (!old) return old;
    if (old.pages) {
      return { ...old, pages: old.pages.map(p => ({ ...p, tasks: updater(p.tasks ?? []) })) };
    }
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
    onMutate: async ({ taskId, newStatus, newOrder, oldStatus }) => {
      await qc.cancelQueries({ queryKey: taskKeys.board(boardId) });
      const snapshot = qc.getQueriesData({ queryKey: taskKeys.board(boardId) });
      // Only optimistically update same-column reorders; cross-column relies on refetch
      if (oldStatus === newStatus) {
        updateQueriesTasks(qc, taskKeys.board(boardId), (tasks) =>
          tasks.map(t => t.id === taskId ? { ...t, order: newOrder } : t)
        );
      }
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
