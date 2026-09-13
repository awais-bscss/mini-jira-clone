import { USERS } from '../../constants/data.js';

/**
 * Avatar — renders a user's initials in their assigned color.
 * Presentational component: no logic, only display.
 */
export function Avatar({ userId, size = 'sm', showName = false, className = '' }) {
  const user = USERS.find(u => u.id === userId);
  if (!user) return null;

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
        style={{ backgroundColor: user.color }}
        title={user.name}
        aria-label={user.name}
      >
        {user.avatar}
      </span>
      {showName && <span className="text-sm text-slate-700">{user.name}</span>}
    </span>
  );
}
