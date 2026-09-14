import { LABELS } from '../../constants/data.js';

export function Badge({ labelId, className = '' }) {
  const label = LABELS.find(l => l.id === labelId);
  if (!label) return null;
  return (
    <span
      className={`badge ${className}`}
      style={{ backgroundColor: label.bg, color: label.color }}
    >
      {label.name}
    </span>
  );
}

const STATUS_CONFIG = {
  'todo':        { label: 'To Do',       bg: '#f1f5f9', color: '#64748b' },
  'in-progress': { label: 'In Progress', bg: '#eef2ff', color: '#4F6EF7' },
  'in-review':   { label: 'In Review',   bg: '#fffbeb', color: '#d97706' },
  'done':        { label: 'Done',        bg: '#ecfdf5', color: '#059669' },
};

export function StatusBadge({ status, className = '' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['todo'];
  return (
    <span
      className={`badge ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
