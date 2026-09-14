import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from '../../components/Dropdown/Dropdown.jsx';
import { setGroupBy } from '../../store/uiSlice.js';
import { selectGroupBy } from '../../store/selectors.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { STATUS_FILTER_OPTIONS } from '../../constants/statuses.js';

const GROUP_BY_OPTIONS = [
  { value: 'status',   label: 'Group: Status' },
  { value: 'assignee', label: 'Group: Assignee' },
  { value: 'label',    label: 'Group: Label' },
];

export const BoardFilters = memo(function BoardFilters() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get('status') || '';
  const assigneeFilter = searchParams.get('assigneeId') || '';
  const labelFilter = searchParams.get('labelId') || '';
  const urlSearch = searchParams.get('search') || '';

  const groupBy = useSelector(selectGroupBy);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const lastSyncedSearch = useRef(urlSearch);

  useEffect(() => {
    if (debouncedSearch === lastSyncedSearch.current) return;
    lastSyncedSearch.current = debouncedSearch;
    setSearchParams(p => {
      const next = new URLSearchParams(p);
      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      return next;
    }, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  useEffect(() => {
    if (urlSearch !== lastSyncedSearch.current) {
      lastSyncedSearch.current = urlSearch;
      setSearchInput(urlSearch);
    }
  }, [urlSearch]);

  const handleStatusChange = useCallback((val) => {
    setSearchParams(p => {
      const next = new URLSearchParams(p);
      if (val) {
        next.set('status', val);
      } else {
        next.delete('status');
      }
      return next;
    });
  }, [setSearchParams]);

  const handleGroupByChange = useCallback((val) => {
    dispatch(setGroupBy(val));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const hasActiveFilters = Boolean(statusFilter || assigneeFilter || labelFilter || urlSearch || searchInput);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search Input */}
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          id="board-search"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setSearchInput('');
              setSearchParams(p => {
                const next = new URLSearchParams(p);
                next.delete('search');
                return next;
              }, { replace: true });
            }
          }}
          placeholder="Filter tasks..."
          className="pl-8 pr-3 py-1.5 w-44 text-xs bg-white border border-slate-200 rounded-md
                     hover:border-slate-300 focus:outline-none focus:border-[#0052CC]
                     transition-colors duration-150"
        />
      </div>

      <Dropdown
        id="status-filter"
        value={statusFilter}
        onChange={handleStatusChange}
        options={STATUS_FILTER_OPTIONS}
        size="sm"
        className="w-36"
      />

      <Dropdown
        id="group-by"
        value={groupBy}
        onChange={handleGroupByChange}
        options={GROUP_BY_OPTIONS}
        size="sm"
        className="w-36"
      />

      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="text-xs text-[#0052CC] hover:text-[#0747A6] font-medium hover:underline px-1 py-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
});
