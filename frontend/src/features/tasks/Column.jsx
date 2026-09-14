import { memo, useCallback, useMemo, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from './Card.jsx';

const COLUMN_COLORS = {
  'todo':        { dot: '#6b7280', header: '#f8fafc', text: '#374151' },
  'in-progress': { dot: '#4F6EF7', header: '#eef2ff', text: '#3730a3' },
  'in-review':   { dot: '#f59e0b', header: '#fffbeb', text: '#92400e' },
  'done':        { dot: '#10b981', header: '#ecfdf5', text: '#065f46' },
};

const EMPTY_LIST = Object.freeze([]);

export const Column = memo(function Column({ column, tasks = EMPTY_LIST, onCreateTask, isDragging = false }) {
  const cfg = COLUMN_COLORS[column.id] || COLUMN_COLORS['todo'];
  const count = tasks.length;

  const sortedTasks = useMemo(() => {
    if (!tasks || tasks.length <= 1) return tasks || EMPTY_LIST;
    return [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tasks]);

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: sortedTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // estimated card height in px
    overscan: 5,             // render 5 extra items above/below viewport
  });

  const handleCreateClick = useCallback(() => {
    onCreateTask?.(column.id);
  }, [onCreateTask, column.id]);

  // Use virtualization only when there are more than 15 cards
  const shouldVirtualize = sortedTasks.length > 15;

  return (
    <div className="flex flex-col w-72 shrink-0 rounded-xl bg-[#F4F5F7] border border-slate-200/80 max-h-full min-h-0 shadow-2xs">
      <div className="px-3.5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: column.dotColor ?? cfg.dot }} aria-hidden="true" />
          <h3 className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider">
            {column.name}
          </h3>
          <span className="bg-[#EBECF0] text-[#42526E] text-xs font-semibold px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => {
          // Keep all cards mounted while dragging
          const isVirtual = shouldVirtualize && !snapshot.isDraggingOver && !isDragging;

          return (
            <div
              ref={(node) => {
                provided.innerRef(node);
                parentRef.current = node;
              }}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto px-2.5 py-1 space-y-2.5 min-h-[60px] transition-colors duration-150 ${
                snapshot.isDraggingOver ? 'bg-blue-50/60 ring-2 ring-[#0052CC]/30 rounded-lg' : ''
              }`}
            >
              {isVirtual ? (
                <div
                  style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}
                >
                  {virtualizer.getVirtualItems().map(vi => (
                    <div
                      key={sortedTasks[vi.index].id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: vi.size,
                        transform: `translateY(${vi.start}px)`,
                      }}
                    >
                      <Card task={sortedTasks[vi.index]} index={vi.index} />
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              ) : (
                <>
                  {sortedTasks.map((task, index) => (
                    <Card key={task.id} task={task} index={index} />
                  ))}
                  {provided.placeholder}
                </>
              )}
            </div>
          );
        }}
      </Droppable>

      <div className="p-2 shrink-0 border-t border-slate-200/60">
        <button
          id={`create-task-${column.id}`}
          onClick={handleCreateClick}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg
                     hover:bg-slate-200/70 hover:text-slate-900 transition-colors duration-150 focus:outline-none"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create task
        </button>
      </div>
    </div>
  );
});
