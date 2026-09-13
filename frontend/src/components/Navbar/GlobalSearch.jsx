import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../../hooks/useGlobalSearch.js';
import { useOutsideClick } from '../../hooks/useOutsideClick.js';

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const { results, isSearching } = useGlobalSearch(query, 200);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useOutsideClick(containerRef, handleClose, isOpen);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleSelectBoard = useCallback((boardId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/board/${boardId}`);
  }, [navigate]);

  const handleSelectTask = useCallback((boardId, taskId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/board/${boardId}/task/${taskId}`);
  }, [navigate]);

  const hasResults = results.boards.length > 0 || results.tasks.length > 0;
  const isQueryActive = Boolean(query.trim());

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        id="global-search"
        autoComplete="off"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          if (e.target.value.trim()) setIsOpen(true);
        }}
        onFocus={() => {
          if (query.trim()) setIsOpen(true);
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            setQuery('');
            setIsOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder="Search tasks, boards..."
        className="w-full pl-9 pr-8 h-10 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800
                   placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0052CC]
                   transition-colors duration-150"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          aria-label="Clear search"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Quick Search Results Dropdown */}
      {isOpen && isQueryActive && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in duration-100 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-xs text-slate-400">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching tasks or boards found
            </div>
          ) : (
            <div className="py-1">
              {/* Matching Boards */}
              {results.boards.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Boards
                  </p>
                  {results.boards.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBoard(b.id)}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <span className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                        {b.key || 'BD'}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{b.name}</span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0">Board</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Matching Tasks */}
              {results.tasks.length > 0 && (
                <div className={results.boards.length > 0 ? 'border-t border-slate-100 mt-1 pt-1' : ''}>
                  <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Tasks
                  </p>
                  {results.tasks.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTask(t.boardId, t.id)}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-mono text-[11px] font-semibold text-[#0052CC] bg-[#E9F2FF] px-1.5 py-0.5 rounded shrink-0">
                        {t.taskKey || 'TASK'}
                      </span>
                      <span className="text-slate-700 truncate">{t.title}</span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                        {t.boardName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
