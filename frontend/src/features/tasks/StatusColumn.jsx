import { memo, useCallback, useMemo, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from './Card.jsx';
import { useColumnTasks, PAGE_SIZE } from '../../hooks/useTasks.js';
import { Spinner } from '../../components/Spinner/Spinner.jsx';

const COLUMN_COLORS = {
  'todo':        '#6b7280',
  'in-progress': '#4F6EF7',
  'in-review':   '#f59e0b',
  'done':        '#10b981',
};

const EMPTY_LIST = Object.freeze([]);

// Self-fetching kanban column — fetches PAGE_SIZE tasks at a time per status
export const StatusColumn = memo(function StatusColumn({
  column,
  boardId,
  filters = {},
  onCreateTask,
  isDragging = false,
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useColumnTasks(boardId, column.id, filters);

  const tasks = useMemo(() => {
    if (!data?.pages) return EMPTY_LIST;
    const flat = data.pages.flatMap(p => p.tasks ?? []);
    return flat.length > 1 ? [...flat].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : flat;
  }, [data]);

  const total     = data?.pages?.[0]?.total ?? 0;
  const loaded    = tasks.length;
  const nextBatch = Math.min(PAGE_SIZE, total - loaded);
  const dotColor  = column.dotColor ?? COLUMN_COLORS[column.id] ?? '#6b7280';

  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // Disable virtualization during drag — DnD needs real DOM measurements
  const shouldVirtualize = tasks.length > 15 && !isDragging;

  const handleCreateClick = useCallback(() => onCreateTask?.(column.id), [onCreateTask, column.id]);

  return (
    <div className="flex flex-col w-72 shrink-0 rounded-xl bg-[#F4F5F7] border border-slate-200/80 max-h-full min-h-0 shadow-2xs">

      {/* Header */}
      <div className="px-3.5 py-3 flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden="true" />
        <h3 className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider">{column.name}</h3>
        <span className="bg-[#EBECF0] text-[#42526E] text-xs font-semibold px-2 py-0.5 rounded-full">
          {isLoading ? '…' : hasNextPage ? `${loaded} / ${total}` : loaded}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => {
          const isVirtual = shouldVirtualize && !snapshot.isDraggingOver;
          return (
            <div
              ref={(node) => { provided.innerRef(node); parentRef.current = node; }}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto px-2.5 py-1 min-h-[60px] transition-colors duration-150
                ${isVirtual ? '' : 'space-y-2.5'}
                ${snapshot.isDraggingOver ? 'bg-blue-50/60 ring-2 ring-[#0052CC]/30 rounded-lg' : ''}`}
            >
              {isLoading && <div className="flex justify-center py-8"><Spinner size="sm" /></div>}

              {isError && !isLoading && (
                <p className="text-xs text-red-400 text-center py-6">Failed to load tasks</p>
              )}

              {!isLoading && isVirtual && (
                <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
                  {virtualizer.getVirtualItems().map(vi => (
                    <div
                      key={tasks[vi.index].id}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: vi.size, transform: `translateY(${vi.start}px)` }}
                    >
                      <Card task={tasks[vi.index]} index={vi.index} />
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}

              {!isLoading && !isVirtual && (
                <>
                  {tasks.map((task, index) => <Card key={task.id} task={task} index={index} />)}
                  {provided.placeholder}
                </>
              )}

              {!isLoading && hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-2
                             text-xs font-medium text-[#0052CC] rounded-lg
                             hover:bg-blue-50/70 hover:text-[#0747A6]
                             disabled:opacity-60 transition-colors duration-150"
                >
                  {isFetchingNextPage ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                      Load {nextBatch} more
                    </>
                  )}
                </button>
              )}
            </div>
          );
        }}
      </Droppable>

      {/* Create task */}
      <div className="p-2 shrink-0 border-t border-slate-200/60">
        <button
          id={`create-task-${column.id}`}
          onClick={handleCreateClick}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     text-slate-600 rounded-lg hover:bg-slate-200/70 hover:text-slate-900
                     transition-colors duration-150 focus:outline-none"
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
