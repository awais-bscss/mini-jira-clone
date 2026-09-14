import { Modal } from '../../components/Modal/Modal.jsx';
import { Spinner } from '../../components/Spinner/Spinner.jsx';
import { ProjectIcon } from '../../components/Icon/ProjectIcon.jsx';
import {
  useCreateBoardForm,
  NAME_MAX,
  CATEGORY_MAX,
  PROJECT_ICONS,
  CATEGORY_SUGGESTIONS,
} from '../../hooks/useCreateBoardForm.js';

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

function CreateBoardForm({ onClose }) {
  const {
    form,
    err,
    submitted,
    setField,
    setKey,
    touch,
    selectIcon,
    selectCategory,
    autoKeyHint,
    handleSubmit,
    isPending,
    isError,
    errorMessage,
    hasErrors,
  } = useCreateBoardForm({ onClose });

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
      {/* Project name */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0" htmlFor="board-name">Project name <span className="text-red-400">*</span></label>
          <span className={`text-[11px] ${form.name.length > NAME_MAX ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {form.name.length}/{NAME_MAX}
          </span>
        </div>
        <input
          id="board-name"
          type="text"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
          onBlur={() => touch('name')}
          placeholder="e.g. Frontend Platform"
          className={`input ${err('name') ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
          autoFocus
        />
        <ErrorMsg msg={err('name')} />
      </div>

      {/* Project key */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0" htmlFor="board-key">Key <span className="text-slate-400 font-normal text-xs">(2-6 uppercase letters)</span></label>
          {autoKeyHint && !form.key && (
            <span className="text-[11px] text-slate-400">Preview: <strong className="text-slate-600">{autoKeyHint}</strong></span>
          )}
        </div>
        <input
          id="board-key"
          type="text"
          value={form.key}
          onChange={e => setKey(e.target.value)}
          onBlur={() => touch('key')}
          placeholder={autoKeyHint ? `Auto: ${autoKeyHint}` : 'e.g. FP, PROJ'}
          maxLength={6}
          className={`input uppercase ${err('key') ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
        />
        <ErrorMsg msg={err('key')} />
      </div>

      {/* Template & Icon */}
      <div>
        <label className="label">Project Template & Icon</label>
        <div className="grid grid-cols-2 gap-2">
          {PROJECT_ICONS.map(icon => (
            <button
              key={icon.id}
              type="button"
              onClick={() => selectIcon(icon)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                form.iconType === icon.id
                  ? 'border-[#0052CC] bg-[#E9F2FF] text-[#0052CC] font-semibold ring-1 ring-[#0052CC]'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <div className="w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                <ProjectIcon type={icon.id} className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs truncate">{icon.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0" htmlFor="board-category">Project Category</label>
          <span className={`text-[11px] ${form.category.length > CATEGORY_MAX ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {form.category.length}/{CATEGORY_MAX}
          </span>
        </div>
        <input
          id="board-category"
          type="text"
          value={form.category}
          onChange={e => setField('category', e.target.value)}
          onBlur={() => touch('category')}
          placeholder="e.g. Software project, Marketing, Design"
          maxLength={CATEGORY_MAX}
          className={`input ${err('category') ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
        />
        <ErrorMsg msg={err('category')} />
        <div className="flex flex-wrap gap-1.5 pt-2">
          {CATEGORY_SUGGESTIONS.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => selectCategory(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                form.category === cat
                  ? 'border-[#0052CC] bg-[#E9F2FF] text-[#0052CC] font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isPending || (submitted && hasErrors)}
        >
          {isPending ? <Spinner size="sm" /> : 'Create project'}
        </button>
      </div>

      {isError && (
        <p className="text-xs text-red-500 text-center">{errorMessage || 'Failed to create project'}</p>
      )}
    </form>
  );
}

export function CreateBoardModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" size="md" id="create-board">
      {isOpen && <CreateBoardForm onClose={onClose} />}
    </Modal>
  );
}
