import { useMemo } from 'react';
import { Modal } from '../../components/Modal/Modal.jsx';
import { Spinner } from '../../components/Spinner/Spinner.jsx';
import { Dropdown } from '../../components/Dropdown/Dropdown.jsx';
import { Avatar } from '../../components/Avatar/Avatar.jsx';
import { USERS, LABELS } from '../../constants/data.js';
import { STATUS_OPTIONS } from '../../constants/statuses.js';
import {
  useCreateTaskForm,
  TITLE_MAX,
  DESC_MAX,
  DESC_WARN,
} from '../../hooks/useCreateTaskForm.js';

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

function CreateTaskForm({ boardId, defaultStatus = 'todo', onClose }) {
  const {
    form,
    err,
    setField,
    touch,
    handleSubmit,
    titleLen,
    descLen,
    isPending,
    isError,
    errorMessage,
  } = useCreateTaskForm({ boardId, defaultStatus, onClose });

  const assigneeOptions = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...USERS.map(u => ({ value: u.id, label: u.name, avatar: <Avatar userId={u.id} size="xs" /> })),
  ], []);

  const labelOptions = useMemo(() =>
    LABELS.map(l => ({ value: l.id, label: l.name, badge: l.name, badgeColor: l.color })),
  []);

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="task-title" className="label mb-0">Title <span className="text-red-400">*</span></label>
          <span className={`text-[11px] tabular-nums ${
            titleLen > TITLE_MAX ? 'text-red-500 font-semibold'
            : titleLen > TITLE_MAX * 0.9 ? 'text-amber-500' : 'text-slate-400'
          }`}>{titleLen} / {TITLE_MAX}</span>
        </div>
        <input
          id="task-title"
          type="text"
          value={form.title}
          onChange={e => setField('title', e.target.value)}
          onBlur={() => touch('title')}
          placeholder="What needs to be done?"
          className={`input ${err('title') ? 'border-red-400 focus:border-red-400 bg-red-50/30' : ''}`}
          autoComplete="off"
          autoFocus
        />
        <ErrorMsg msg={err('title')} />
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="task-description" className="label mb-0">Description</label>
          {descLen > DESC_WARN && (
            <span className={`text-[11px] tabular-nums ${descLen > DESC_MAX ? 'text-red-500 font-semibold' : 'text-amber-500'}`}>
              {descLen.toLocaleString()} / {DESC_MAX.toLocaleString()}
            </span>
          )}
        </div>
        <textarea
          id="task-description"
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          onBlur={() => touch('description')}
          placeholder="Add more details…"
          rows={3}
          className={`input resize-none ${err('description') ? 'border-red-400 focus:border-red-400 bg-red-50/30' : ''}`}
        />
        <ErrorMsg msg={err('description')} />
      </div>

      {/* Status + Assignee */}
      <div className="grid grid-cols-2 gap-4">
        <Dropdown id="task-status" label="Status" value={form.status} onChange={v => setField('status', v)} options={STATUS_OPTIONS} />
        <Dropdown id="task-assignee" label="Assignee" value={form.assigneeId} onChange={v => setField('assigneeId', v)} options={assigneeOptions} placeholder="Unassigned" />
      </div>

      {/* Label + Due date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Dropdown
            id="task-label"
            label={<>Label <span className="text-red-400">*</span></>}
            value={form.labelId}
            onChange={v => { setField('labelId', v); touch('labelId'); }}
            options={labelOptions}
            placeholder="Select label…"
            error={!!err('labelId')}
          />
          <ErrorMsg msg={err('labelId')} />
        </div>
        <div>
          <label htmlFor="task-due" className="label">Due date</label>
          <input id="task-due" type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} className="input" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : 'Create task'}
        </button>
      </div>

      {isError && (
        <p className="text-xs text-red-500 text-center">
          {errorMessage || 'Failed to create task. Please try again.'}
        </p>
      )}
    </form>
  );
}

export function CreateTaskModal({ isOpen, onClose, boardId, defaultStatus = 'todo' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="md" id="create-task">
      {isOpen && (
        <CreateTaskForm key={defaultStatus} boardId={boardId} defaultStatus={defaultStatus} onClose={onClose} />
      )}
    </Modal>
  );
}
