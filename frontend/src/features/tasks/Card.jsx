import { memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Draggable } from '@hello-pangea/dnd';
import { Avatar } from '../../components/Avatar/Avatar.jsx';
import { IssueTypeIcon } from '../../components/Icon/IssueTypeIcon.jsx';
import { LABELS } from '../../constants/data.js';
import { format, isPast, isToday } from 'date-fns';

const Card = memo(function Card({ task, index }) {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const handleClick = useCallback(() => {
    navigate(`/board/${boardId}/task/${task.id}`);
  }, [navigate, boardId, task.id]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const label = LABELS.find(l => l.id === task.labelId);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const dueDateStr = dueDate ? format(dueDate, 'MMM d') : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);

  const issueType = task.type || 'task';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Task: ${task.title}`}
          id={`card-${task.id}`}
          className={`group relative bg-white rounded-lg p-3 cursor-pointer select-none
                      border transition-all duration-150
                      ${
                        snapshot.isDragging
                          ? 'border-[#0052CC] shadow-[0_8px_16px_rgba(9,30,66,0.25)] ring-2 ring-[#0052CC]/20'
                          : 'border-slate-200/90 shadow-[0_1px_2px_rgba(9,30,66,0.08)] hover:border-[#4c9aff] hover:shadow-[0_3px_6px_rgba(9,30,66,0.12)]'
                      }
                      focus:outline-none`}
          style={provided.draggableProps.style}
        >
          {/* Card Title */}
          <p className="text-sm font-normal text-slate-800 leading-snug line-clamp-2 mb-2.5 group-hover:text-[#0052CC] transition-colors">
            {task.title}
          </p>

          {/* Label badge if present */}
          {label && (
            <div className="mb-2.5">
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium tracking-tight"
                style={{
                  backgroundColor: label.bg || `${label.color}15`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            </div>
          )}

          {/* Footer: Issue Type + Key + Due Date + Assignee Avatar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Jira Issue Type Icon */}
              <IssueTypeIcon type={issueType} size="xs" />

              {/* Issue Key (e.g. FP-1) */}
              <span className="text-[11px] text-slate-500 font-medium font-sans hover:underline">
                {task.taskKey || `TASK-${index + 1}`}
              </span>

              {/* Due date indicator */}
              {dueDateStr && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ml-1 ${
                    isOverdue
                      ? 'bg-red-50 text-red-600'
                      : isDueToday
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                  title={isOverdue ? 'Overdue' : isDueToday ? 'Due today' : `Due ${dueDateStr}`}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {dueDateStr}
                </span>
              )}
            </div>

            {/* Assignee Avatar */}
            {task.assigneeId && (
              <div className="shrink-0">
                <Avatar userId={task.assigneeId} size="xs" />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
});

export { Card };
