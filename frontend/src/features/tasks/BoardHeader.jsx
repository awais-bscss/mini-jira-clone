import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '../../components/Spinner/Spinner.jsx';
import { ProjectIcon } from '../../components/Icon/ProjectIcon.jsx';

export const BoardHeader = memo(function BoardHeader({ board, isLoading, children }) {
  return (
    <div className="px-6 py-3.5 border-b border-slate-200/90 bg-white shrink-0 space-y-3 shadow-2xs">
      {/* Top: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:underline hover:text-[#0052CC]">Projects</Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{board?.name || 'Board'}</span>
        <span>/</span>
        <span>Kanban board</span>
      </div>

      {/* Middle: Project title with badge + Actions/Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
            <ProjectIcon type={board?.iconType} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">{board?.name || 'Board'}</h1>
              {isLoading && <Spinner size="sm" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-mono font-medium text-slate-600">{board?.key || 'FP'}</span>
              <span>·</span>
              <span>{board?.category || 'Software project'}</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar slot */}
        {children}
      </div>
    </div>
  );
});
