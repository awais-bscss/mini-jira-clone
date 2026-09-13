import { createSelector } from '@reduxjs/toolkit';

export const selectOpenModalType = (state) => state.ui.openModalType;
export const selectSidebarOpen   = (state) => state.ui.sidebarOpen;
export const selectGroupBy       = (state) => state.ui.groupBy;

// Shared filter logic — avoids 15+ duplicated lines across three selectors
function applyFilters(tasks, { status, assigneeId, labelId, search } = {}) {
  let filtered = tasks;
  if (status)     filtered = filtered.filter(t => t.status === status);
  if (assigneeId) filtered = filtered.filter(t => t.assigneeId === assigneeId);
  if (labelId)    filtered = filtered.filter(t => t.labelId === labelId);
  if (search)     filtered = filtered.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  return filtered;
}

export const makeSelectTasksByStatus = () =>
  createSelector(
    (tasks) => tasks,
    (_tasks, filters) => filters,
    (tasks, filters) => {
      const filtered = applyFilters(tasks, filters);
      return filtered.reduce((acc, task) => {
        if (!acc[task.status]) acc[task.status] = [];
        acc[task.status].push(task);
        return acc;
      }, {});
    }
  );

export const makeSelectTasksByAssignee = () =>
  createSelector(
    (tasks) => tasks,
    (_tasks, filters) => filters,
    (tasks, filters) => {
      const filtered = applyFilters(tasks, filters);
      return filtered.reduce((acc, task) => {
        const key = task.assigneeId || 'unassigned';
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {});
    }
  );

export const makeSelectTasksByLabel = () =>
  createSelector(
    (tasks) => tasks,
    (_tasks, filters) => filters,
    (tasks, filters) => {
      const filtered = applyFilters(tasks, filters);
      return filtered.reduce((acc, task) => {
        const key = task.labelId || 'unlabelled';
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
      }, {});
    }
  );
