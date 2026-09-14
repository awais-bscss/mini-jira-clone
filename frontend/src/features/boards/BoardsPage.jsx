import { useState, useCallback, useMemo } from 'react';
import { useBoards } from '../../hooks/useBoards.js';
import { BoardCard } from './BoardCard.jsx';
import { CreateBoardModal } from './CreateBoardModal.jsx';
import { RenameBoardModal } from './RenameBoardModal.jsx';
import { DeleteBoardModal } from './DeleteBoardModal.jsx';

export function BoardsPage() {
  const { data: boards = [], isLoading, isError } = useBoards();

  const INITIAL_COUNT = 6;
  const PAGE_SIZE      = 6;

  const [showCreate, setShowCreate] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const handleOpenCreate = useCallback(() => setShowCreate(true), []);
  const handleCloseCreate = useCallback(() => setShowCreate(false), []);

  const handleOpenRename = useCallback((board) => setRenameTarget(board), []);
  const handleCloseRename = useCallback(() => setRenameTarget(null), []);

  const handleOpenDelete = useCallback((boardId) => {
    const target = boards.find(b => b.id === boardId);
    if (target) setDeleteTarget(target);
  }, [boards]);
  const handleCloseDelete = useCallback(() => setDeleteTarget(null), []);

  const boardCount   = boards.length;
  const visibleBoards = useMemo(() => boards.slice(0, visibleCount), [boards, visibleCount]);
  const hasMore      = visibleCount < boardCount;

  const handleLoadMore = useCallback(() => {
    setVisibleCount(c => c + PAGE_SIZE);
  }, []);

  return (
    <div className="flex-1 h-full overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto p-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage software projects, workflows, and boards {boardCount > 0 ? `(${boardCount})` : ''}
          </p>
        </div>
        <button id="new-board-btn" onClick={handleOpenCreate} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between gap-5 shadow-xs animate-pulse min-h-[215px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 bg-slate-200 rounded w-10" />
                      <div className="h-3 bg-slate-100 rounded w-28" />
                    </div>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-md bg-slate-100 shrink-0" />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-slate-200 rounded w-16" />
                  <div className="h-3 bg-slate-200 rounded w-24" />
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-slate-200 h-full rounded-full w-1/3" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                <div className="h-3.5 bg-slate-200 rounded w-24" />
                <div className="h-3.5 bg-slate-200 rounded w-20" />
              </div>
            </div>
          ))}

          {/* CTA Skeleton Card */}
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 min-h-[215px] animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-slate-200" />
            <div className="h-4 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-100 rounded w-36" />
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load boards. Please make sure the backend server is running.</p>
        </div>
      )}

      {/* Boards grid */}
      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleBoards.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={handleOpenDelete}
                onRename={handleOpenRename}
              />
            ))}

            {!hasMore && (
              <button
                onClick={handleOpenCreate}
                className="bg-white rounded-xl border-2 border-dashed border-slate-200/90 p-6
                           hover:border-[#0052CC] hover:bg-[#F8FAFC] transition-all duration-200
                           flex flex-col items-center justify-center gap-3 min-h-[215px] cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:text-[#0052CC] group-hover:border-[#0052CC] transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-[#0052CC] transition-colors block">Create new project</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">Kanban software workflow</span>
                </div>
              </button>
            )}
          </div>

          {/* Load more row */}
          {hasMore && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <button
                onClick={handleLoadMore}
                className="px-5 py-2 text-sm font-medium text-[#0052CC]
                           bg-white border border-slate-200 rounded-lg shadow-xs
                           hover:border-[#0052CC]/60 hover:bg-blue-50/50 transition-all duration-150"
              >
                Load more
              </button>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}
        </>
      )}

      {/* Create board modal with isolated form state */}
      <CreateBoardModal isOpen={showCreate} onClose={handleCloseCreate} />

      {/* Rename board modal with isolated form state */}
      <RenameBoardModal board={renameTarget} onClose={handleCloseRename} />

      {/* Delete board confirmation modal */}
      <DeleteBoardModal board={deleteTarget} onClose={handleCloseDelete} />
      </div>
    </div>
  );
}
