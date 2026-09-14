import { memo, useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSidebarOpen } from '../../store/selectors.js';
import { useBoards } from '../../hooks/useBoards.js';
import { Accordion } from '../Accordion/Accordion.jsx';
import { Spinner } from '../Spinner/Spinner.jsx';
import { USERS, LABELS } from '../../constants/data.js';

function getProjectIcon(iconType) {
  switch (iconType) {
    case 'code':
      return (
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'server':
      return (
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      );
    case 'mobile':
      return (
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
  }
}

export const Sidebar = memo(function Sidebar() {
  const isOpen = useSelector(selectSidebarOpen);
  const { boardId } = useParams();
  const { data: boards = [], isLoading } = useBoards();
  const [searchParams, setSearchParams] = useSearchParams();

  const setFilter = useCallback((key, value) => {
    setSearchParams(p => {
      const next = new URLSearchParams(p);
      if (value) { next.set(key, value); } else { next.delete(key); }
      return next;
    });
  }, [setSearchParams]);

  const activeAssignee = searchParams.get('assigneeId') || '';
  const activeLabel = searchParams.get('labelId') || '';

  const filterItems = useMemo(() => [
    {
      id: 'assignee',
      label: 'Assignee',
      icon: (
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      content: (
        <div className="space-y-0.5">
          <button
            onClick={() => setFilter('assigneeId', '')}
            className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${!activeAssignee ? 'bg-[#E9F2FF] text-[#0052CC] font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            All members
          </button>
          {/* Unassigned filter */}
          <button
            onClick={() => setFilter('assigneeId', 'unassigned')}
            className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 transition-colors ${activeAssignee === 'unassigned' ? 'bg-[#E9F2FF] text-[#0052CC] font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <svg className="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <span>Unassigned</span>
          </button>
          {USERS.map(u => (
            <button
              key={u.id}
              onClick={() => setFilter('assigneeId', u.id)}
              className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 transition-colors ${activeAssignee === u.id ? 'bg-[#E9F2FF] text-[#0052CC] font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span
                className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center text-white font-bold shrink-0 shadow-2xs"
                style={{ backgroundColor: u.color }}
              >
                {u.avatar}
              </span>
              <span className="truncate">{u.name}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'label',
      label: 'Label',
      icon: (
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      content: (
        <div className="space-y-0.5">
          <button
            onClick={() => setFilter('labelId', '')}
            className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${!activeLabel ? 'bg-[#E9F2FF] text-[#0052CC] font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            All labels
          </button>
          {LABELS.map(l => (
            <button
              key={l.id}
              onClick={() => setFilter('labelId', l.id)}
              className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 transition-colors ${activeLabel === l.id ? 'bg-[#E9F2FF] text-[#0052CC] font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
              <span className="truncate">{l.name}</span>
            </button>
          ))}
        </div>
      ),
    },
  ], [activeAssignee, activeLabel, setFilter]);

  return (
    <aside
      className={`fixed top-14 left-0 bottom-0 z-30 bg-[#FAFBFC] border-r border-[#EBECF0] flex flex-col
                  transition-all duration-300 ease-in-out ${isOpen ? 'w-60' : 'w-0 overflow-hidden'}`}
    >
      <div className="flex flex-col h-full min-w-[240px]">
        <div className="flex-1 overflow-y-auto">
          {/* Projects section */}
          <div className="p-2">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</p>
              <Link to="/" className="text-xs text-[#0052CC] hover:underline font-medium">
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-4"><Spinner size="sm" /></div>
            ) : (
              <nav className="space-y-0.5">
                {boards.map(board => {
                  const isActive = boardId === board.id;
                  return (
                    <Link
                      key={board.id}
                      to={`/board/${board.id}`}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                          ? 'bg-[#E9F2FF] text-[#0052CC] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {getProjectIcon(board.iconType)}
                      <span className="truncate">{board.name}</span>
                    </Link>
                  );
                })}

                {/* Prompt to visit all projects if none exist */}
                {!isLoading && boards.length === 0 && (
                  <Link
                    to="/"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    Browse all projects
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Filters - Accordion */}
          {boardId && (
            <div className="p-2 pt-1 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">Filters</p>
              <Accordion items={filterItems} allowMultiple />
            </div>
          )}
        </div>

        {/* Bottom AI Assistant link */}
        <div className="p-2 border-t border-slate-200">
          <Link
            to="/ai-demo"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>
    </aside>
  );
});
