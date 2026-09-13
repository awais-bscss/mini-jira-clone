/**
 * ProjectBadge — Renders Jira-style rounded project tiles with vector icons and keys.
 */
export function ProjectBadge({ name = '', iconType = 'board', color = '#0052CC', size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-5 h-5 rounded text-[10px]',
    sm: 'w-7 h-7 rounded-md text-xs',
    md: 'w-9 h-9 rounded-lg text-sm',
    lg: 'w-11 h-11 rounded-xl text-base',
  }[size] || 'w-9 h-9 rounded-lg text-sm';

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size] || 'w-5 h-5';

  return (
    <div
      className={`inline-flex items-center justify-center font-bold text-white shrink-0 shadow-sm transition-transform ${sizeClasses} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
      aria-hidden="true"
    >
      {iconType === 'code' ? (
        <svg className={iconSizes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ) : iconType === 'server' ? (
        <svg className={iconSizes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ) : iconType === 'mobile' ? (
        <svg className={iconSizes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className={iconSizes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )}
    </div>
  );
}
