import { memo } from 'react';
import { Modal } from '../../components/Modal/Modal.jsx';
import { Spinner } from '../../components/Spinner/Spinner.jsx';
import {
  useRenameBoardForm,
  NAME_MAX,
  CATEGORY_MAX,
} from '../../hooks/useRenameBoardForm.js';

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

function RenameBoardForm({ board, onClose }) {
  const {
    name,
    setName,
    category,
    setCategory,
    err,
    touch,
    handleSubmit,
    isPending,
    isError,
    errorMessage,
    hasErrors,
    submitted,
  } = useRenameBoardForm({ board, onClose });

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0" htmlFor="rename-board-input">Project name <span className="text-red-400">*</span></label>
          <span className={`text-[11px] ${name.length > NAME_MAX ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {name.length}/{NAME_MAX}
          </span>
        </div>
        <input
          id="rename-board-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => touch('name')}
          className={`input ${err('name') ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
          autoFocus
        />
        <ErrorMsg msg={err('name')} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0" htmlFor="rename-category-input">Category</label>
          <span className={`text-[11px] ${category.length > CATEGORY_MAX ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {category.length}/{CATEGORY_MAX}
          </span>
        </div>
        <input
          id="rename-category-input"
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          onBlur={() => touch('category')}
          placeholder="e.g. Software project, Marketing"
          maxLength={CATEGORY_MAX}
          className={`input ${err('category') ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
        />
        <ErrorMsg msg={err('category')} />
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isPending || (submitted && hasErrors)}
        >
          {isPending ? <Spinner size="sm" /> : 'Save changes'}
        </button>
      </div>

      {isError && (
        <p className="text-xs text-red-500 text-center">{errorMessage || 'Failed to update project'}</p>
      )}
    </form>
  );
}

export const RenameBoardModal = memo(function RenameBoardModal({ board, onClose }) {
  return (
    <Modal isOpen={!!board} onClose={onClose} title="Edit Project" size="sm" id="rename-board">
      {board && <RenameBoardForm key={board.id} board={board} onClose={onClose} />}
    </Modal>
  );
});
