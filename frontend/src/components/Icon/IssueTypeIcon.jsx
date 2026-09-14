import { memo } from 'react';

const SIZE_BOX = {
  xs: 'w-3.5 h-3.5 rounded',
  sm: 'w-4 h-4 rounded',
  md: 'w-5 h-5 rounded-md',
};

const ICON_SIZE = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

export const IssueTypeIcon = memo(function IssueTypeIcon({ type = 'task', size = 'sm', className = '' }) {
  const normType = String(type).toLowerCase();

  const sizeBox = SIZE_BOX[size] || 'w-4 h-4 rounded';
  const iconSize = ICON_SIZE[size] || 'w-3 h-3';

  if (normType === 'bug') {
    return (
      <span
        className={`inline-flex items-center justify-center bg-red-500 rounded-full text-white shrink-0 shadow-2xs ${sizeBox} ${className}`}
        title="Bug"
      >
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
        </svg>
      </span>
    );
  }

  if (normType === 'story') {
    return (
      <span
        className={`inline-flex items-center justify-center bg-emerald-500 rounded text-white shrink-0 shadow-2xs ${sizeBox} ${className}`}
        title="Story"
      >
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 2H5a2 2 0 00-2 2v18l9-4 9 4V4a2 2 0 00-2-2z" />
        </svg>
      </span>
    );
  }

  if (normType === 'epic') {
    return (
      <span
        className={`inline-flex items-center justify-center bg-purple-600 rounded text-white shrink-0 shadow-2xs ${sizeBox} ${className}`}
        title="Epic"
      >
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center bg-blue-500 rounded text-white shrink-0 shadow-2xs ${sizeBox} ${className}`}
      title="Task"
    >
      <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
});

