import { useMemo, memo } from 'react';
import { USERS } from '../../../constants/data.js';
import { STATUS_OPTIONS } from '../../../constants/statuses.js';
import { format } from 'date-fns';

export const TaskActivityTab = memo(function TaskActivityTab({ task }) {
  const activities = useMemo(() => {
    if (!task) return [];
    const list = [];

    if (task.createdAt) {
      list.push({
        id: 'created',
        iconType: 'created',
        msg: `Task created (${task.taskKey || 'TASK'})`,
        time: task.createdAt,
      });
    }

    if (task.updatedAt && task.updatedAt !== task.createdAt) {
      const statusLabel = STATUS_OPTIONS.find(s => s.value === task.status)?.label || task.status;
      list.push({
        id: 'updated',
        iconType: 'updated',
        msg: `Task updated (Status: ${statusLabel})`,
        time: task.updatedAt,
      });
    }

    (task.comments || []).forEach(c => {
      const author = USERS.find(u => u.id === c.authorId)?.name || 'Team member';
      list.push({
        id: `comment-${c.id}`,
        iconType: 'comment',
        msg: `Comment added by ${author}`,
        time: c.createdAt,
      });
    });

    return list;
  }, [task]);

  if (activities.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 text-sm">
          {entry.iconType === 'created' && (
            <span className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
          {entry.iconType === 'updated' && (
            <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
          )}
          {entry.iconType === 'comment' && (
            <span className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          )}
          <div className="pt-1">
            <p className="text-slate-700">{entry.msg}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {format(new Date(entry.time), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});
