import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#FAFBFC]">
      <div className="max-w-md w-full text-center">
        {/* Visual Badge / Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <svg className="w-8 h-8 text-[#0052CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* 404 Header */}
        <span className="inline-block text-xs font-bold tracking-widest text-[#0052CC] uppercase mb-2">
          Error 404
        </span>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The project, board, or page you are looking for doesn’t exist, has been removed, or is temporarily unavailable.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs focus:outline-none"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0052CC] hover:bg-[#0065FF] active:bg-[#0747A6] rounded-md transition-colors shadow-2xs focus:outline-none"
          >
            View Projects
          </button>
        </div>
      </div>
    </div>
  );
}
