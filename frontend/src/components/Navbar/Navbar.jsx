import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toggleSidebar, openCreateTaskModal } from '../../store/uiSlice.js';
import { GlobalSearch } from './GlobalSearch.jsx';

export function Navbar({ boardId }) {
  const dispatch = useDispatch();

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const handleOpenCreateModal = useCallback(() => {
    dispatch(openCreateTaskModal());
  }, [dispatch]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4">

      {/* ── Left: Sidebar toggle + Logo + Nav links ── */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Sidebar toggle */}
        <button
          onClick={handleToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Jira Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-[#0052CC] flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2.8v4.32h4.33c4.78 0 8.67-3.86 8.67-8.67V2h-4.27zm.94 6.26c0 2.4-1.97 4.35-4.4 4.35H3.74v4.32h4.33c4.78 0 8.67-3.86 8.67-8.67v-.03h-4.27v.03zm.94 6.26c0 2.4-1.97 4.35-4.4 4.35H4.68v4.32H9c4.78 0 8.67-3.86 8.67-8.67v-.03h-4.26v.03z"/>
            </svg>
          </div>
          <span className="text-slate-800 font-bold text-base tracking-tight hidden sm:inline">Jira</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link to="/" className="px-3 py-1.5 rounded hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1">
            Projects
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Link>
        </nav>
      </div>

      {/* ── Center: Isolated Global Search ── */}
      <div className="flex-1 flex justify-center">
        <GlobalSearch />
      </div>

      {/* ── Right: Create button + AI Assistant (right corner) ── */}
      <div className="flex items-center gap-3 shrink-0">
        {boardId && (
          <button
            id="create-task-btn"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white text-sm font-semibold
                       rounded-md hover:bg-[#0065FF] active:bg-[#0747A6] transition-colors duration-150 shadow-xs focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create
          </button>
        )}

        <Link
          to="/ai-demo"
          className="px-3 py-1.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-brand-600 text-sm font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Assistant
        </Link>
      </div>

    </header>
  );
}
