export const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       dotColor: '#6b7280' },
  { value: 'in-progress', label: 'In Progress', dotColor: '#4F6EF7' },
  { value: 'in-review',   label: 'In Review',   dotColor: '#f59e0b' },
  { value: 'done',        label: 'Done',        dotColor: '#10b981' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses', dotColor: '#0052CC' },
  ...STATUS_OPTIONS,
];
