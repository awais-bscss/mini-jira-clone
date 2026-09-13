import { useCallback, useMemo, useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useBoards } from '../../hooks/useBoards.js';
import { useTasks, useReorderTask } from '../../hooks/useTasks.js';
import {
  makeSelectTasksByAssignee,
  makeSelectTasksByLabel,
  selectGroupBy,
} from '../../store/selectors.js';
import { openCreateTaskModal, closeModal } from '../../store/uiSlice.js';
import { Column } from './Column.jsx';
import { StatusColumn } from './StatusColumn.jsx';
import { CreateTaskModal } from './CreateTaskModal.jsx';
import { BoardHeader } from './BoardHeader.jsx';
import { BoardFilters } from './BoardFilters.jsx';
import { USERS, LABELS, DEFAULT_COLUMNS } from '../../constants/data.js';

// Code-split TaskDetailModal with React.lazy
const TaskDetailModal = lazy(() =>
  import('./TaskDetailModal.jsx').then(m => ({ default: m.TaskDetailModal }))
);

// Module-level column definitions for each groupBy mode.
// Defined outside component so they maintain stable object references.
const ASSIGNEE_COLUMNS = Object.freeze([
  ...USERS.map(u => ({ id: u.id, name: u.name, dotColor: u.color })),
  { id: 'unassigned', name: 'Unassigned', dotColor: '#9ca3af' },
]);

const LABEL_COLUMNS = Object.freeze([
  ...LABELS.map(l => ({ id: l.id, name: l.name, dotColor: l.color })),
  { id: 'unlabelled', name: 'Unlabelled', dotColor: '#9ca3af' },
]);

// Module-level frozen empty array prevents breaking React.memo on empty columns
const EMPTY_TASKS = Object.freeze([]);

export function BoardPage() {
  const { boardId, taskId } = useParams();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redux-driven modal state
  const openModalType         = useSelector(state => state.ui.openModalType);
  const reduxCreateTaskStatus = useSelector(state => state.ui.createTaskStatus);
  const isCreateModalOpen     = openModalType === 'createTask';
  const effectiveStatus       = reduxCreateTaskStatus || 'todo';
  const groupBy               = useSelector(selectGroupBy);

  // URL-driven filters (bookmarkable)
  const statusFilter   = searchParams.get('status') || '';
  const assigneeFilter = searchParams.get('assigneeId') || '';
  const labelFilter    = searchParams.get('labelId') || '';
  const urlSearch      = searchParams.get('search') || '';

  const filters = useMemo(() => ({
    status:     statusFilter,
    assigneeId: assigneeFilter,
    labelId:    labelFilter,
    search:     urlSearch,
  }), [statusFilter, assigneeFilter, labelFilter, urlSearch]);

  // Filters passed to each StatusColumn (status is handled per-column, not here)
  const columnFilters = useMemo(() => ({
    assigneeId: assigneeFilter,
    labelId:    labelFilter,
    search:     urlSearch,
  }), [assigneeFilter, labelFilter, urlSearch]);

  const { data: boards = [], isLoading: isBoardsLoading } = useBoards();
  const board = useMemo(() => boards.find(b => b.id === boardId), [boards, boardId]);

  // If boards are loaded and boardId doesn't exist, automatically redirect to the first real board
  useEffect(() => {
    if (!isBoardsLoading && boards.length > 0 && !board) {
      navigate(`/board/${boards[0].id}`, { replace: true });
    }
  }, [isBoardsLoading, boards, board, navigate]);

  // ── groupBy !== 'status' : fetch all tasks (limit 200), group client-side ──
  // Disabled when groupBy === 'status' (StatusColumn fetches per-column instead)
  const {
    data: tasks = EMPTY_TASKS,
    isLoading: isTasksLoading,
    isError: isTasksError,
    refetch,
  } = useTasks(boardId, filters, { enabled: groupBy !== 'status' });

  // Only show a board-level error when we actually tried to fetch (non-status mode)
  const isLoading = groupBy !== 'status' && isTasksLoading;
  const isError   = groupBy !== 'status' && isTasksError;

  const reorderTask = useReorderTask(boardId);

  // One memoised selector instance per groupBy mode — stable per mount
  const selectTasksByAssignee = useMemo(() => makeSelectTasksByAssignee(), []);
  const selectTasksByLabel    = useMemo(() => makeSelectTasksByLabel(),    []);

  // Pick the right column set based on current groupBy
  const columns = groupBy === 'assignee' ? ASSIGNEE_COLUMNS
                : groupBy === 'label'    ? LABEL_COLUMNS
                : DEFAULT_COLUMNS;

  // In status mode, if a specific status filter is active, focus on that column
  const displayColumns = useMemo(() => {
    if (groupBy === 'status' && statusFilter) {
      const match = columns.filter(col => col.id === statusFilter);
      return match.length > 0 ? match : columns;
    }
    return columns;
  }, [columns, groupBy, statusFilter]);

  // Compute the grouped task map for non-status groupBy modes
  const tasksByGroup = useMemo(() => {
    if (groupBy === 'assignee') return selectTasksByAssignee(tasks, filters);
    if (groupBy === 'label')    return selectTasksByLabel(tasks, filters);
    return {}; // status mode: StatusColumn handles its own data
  }, [groupBy, tasks, filters, selectTasksByAssignee, selectTasksByLabel]);

  // ── Drag-and-drop handler ──────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((result) => {
    setIsDragging(false);
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    reorderTask.mutate({
      taskId: draggableId,
      newStatus: destination.droppableId,
      newOrder: destination.index,
      oldStatus: source.droppableId,
    });
  }, [reorderTask]);

  // ── Column-specific Create task ────────────────────────────────────────────
  const handleCreateTask = useCallback((columnId) => {
    dispatch(openCreateTaskModal(columnId));
  }, [dispatch]);

  const handleCloseCreateModal = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#F4F5F7]/40">
      {/* Board Header & Filters */}
      <BoardHeader board={board} isLoading={isLoading}>
        <BoardFilters />
      </BoardHeader>

      {/* Board-level error (non-status groupBy only) */}
      {isError && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="font-semibold text-red-700 mb-1">Failed to load tasks</p>
            <p className="text-sm text-red-500 mb-4">Could not connect to the backend API. Please make sure the Express server is running on port 5000.</p>
            <button onClick={() => refetch()} className="btn-primary">Retry</button>
          </div>
        </div>
      )}

      {/* Kanban Board Container */}
      {!isError && (
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
            <div className="flex gap-6 p-6 h-full min-h-0" style={{ minWidth: 'max-content' }}>

              {/* ── Status mode: each column self-fetches (30/page) ─── */}
              {groupBy === 'status' && displayColumns.map(col => (
                <StatusColumn
                  key={col.id}
                  column={col}
                  boardId={boardId}
                  filters={columnFilters}
                  onCreateTask={handleCreateTask}
                  isDragging={isDragging}
                />
              ))}

              {/* ── Assignee / Label mode: props-driven Column ────── */}
              {groupBy !== 'status' && columns.map(col => (
                <Column
                  key={col.id}
                  column={col}
                  tasks={tasksByGroup[col.id] || EMPTY_TASKS}
                  onCreateTask={handleCreateTask}
                  isDragging={isDragging}
                />
              ))}

            </div>
          </div>
        </DragDropContext>
      )}

      {/* Create task modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        boardId={boardId}
        defaultStatus={effectiveStatus}
      />

      {/* Task detail modal — code-split via React.lazy + Suspense */}
      {taskId && (
        <Suspense fallback={null}>
          <TaskDetailModal />
        </Suspense>
      )}
    </div>
  );
}
