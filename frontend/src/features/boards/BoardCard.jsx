import { useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutsideClick } from '../../hooks/useOutsideClick.js';
import { ProjectIcon } from '../../components/Icon/ProjectIcon.jsx';

export const BoardCard = memo(function BoardCard({ board, onDelete, onRename }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleCloseMenu = useCallback(() => setMenuOpen(false), []);
  useOutsideClick(menuRef, handleCloseMenu, menuOpen);

  const taskCount = board.taskCount ?? 0;
  const doneCount = board.doneCount ?? 0;
  const progressPercent = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  const handleNavigate = useCallback(() => {
    navigate(`/board/${board.id}`);
  }, [navigate, board.id]);

  const handleRenameClick = useCallback((e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onRename?.(board);
  }, [onRename, board]);

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete?.(board.id);
  }, [onDelete, board.id]);

  return (
    <div
      className="group relative bg-white rounded-xl border border-slate-200/90 p-6 cursor-pointer
                 shadow-xs hover:border-[#0052CC]/60 hover:shadow-md
                 transition-all duration-200 flex flex-col justify-between gap-5 min-h-[215px]"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleNavigate()}
      aria-label={`Open ${board.name} board`}
      id={`board-card-${board.id}`}
    >
      {/* Top row: Icon + Titles + Context Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-600 group-hover:text-[#0052CC] group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all shrink-0">
            <ProjectIcon type={board.iconType} className="w-6 h-6" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-base font-bold text-slate-900 group-hover:text-[#0052CC] transition-colors truncate">
              {board.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {board.key || 'BOARD'}
              </span>
              <span className="text-xs text-slate-500 truncate">{board.category || 'Software project'}</span>
            </div>
          </div>
        </div>

        {/* Context menu */}
        <div ref={menuRef} className="relative shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Board options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-scaleIn">
              <button
                onClick={handleRenameClick}
                className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rename
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 border-t border-slate-100"
              >
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle row: Progress & Task Metrics */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</span>
          <span>{doneCount} completed ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#0052CC] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom row: Quick action */}
      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <span className="font-medium">Kanban board</span>
        </div>
        <span className="text-[#0052CC] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          View board
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
});
