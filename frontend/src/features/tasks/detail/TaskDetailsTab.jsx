import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Dropdown } from '../../../components/Dropdown/Dropdown.jsx';
import { Spinner } from '../../../components/Spinner/Spinner.jsx';
import { Avatar } from '../../../components/Avatar/Avatar.jsx';
import { useUpdateTask, useDeleteTask } from '../../../hooks/useTasks.js';
import { USERS, LABELS } from '../../../constants/data.js';
import { STATUS_OPTIONS } from '../../../constants/statuses.js';
import { format } from 'date-fns';

function Field({ label, children }) {
  return (
    <div>
      <p className="label">{label}</p>
      {children}
    </div>
  );
}

export const TaskDetailsTab = memo(function TaskDetailsTab({ task, boardId, onDeleteSuccess }) {
  const updateTask = useUpdateTask(boardId);
  const deleteTask = useDeleteTask(boardId);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  }, [task.id, task.title, task.description]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handleEditSave = useCallback(() => {
    updateTask.mutate(
      { id: task.id, title: editTitle, description: editDescription },
      { onSuccess: () => setIsEditing(false) }
    );
  }, [updateTask, task.id, editTitle, editDescription]);

  const handleDelete = useCallback(() => {
    deleteTask.mutate(task.id, {
      onSuccess: () => onDeleteSuccess?.(),
    });
    setShowDeleteConfirm(false);
  }, [deleteTask, task.id, onDeleteSuccess]);

  const handleFieldUpdate = useCallback((field, value) => {
    updateTask.mutate({ id: task.id, [field]: value });
  }, [updateTask, task.id]);

  const assigneeOptions = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...USERS.map(u => ({
      value: u.id,
      label: u.name,
      avatar: <Avatar userId={u.id} size="xs" />,
    })),
  ], []);

  const labelOptions = useMemo(() => [
    { value: '', label: 'None' },
    ...LABELS.map(l => ({
      value: l.id,
      label: l.name,
      badge: l.name,
      badgeColor: l.color,
    })),
  ], []);

  const createdDateStr = useMemo(() => {
    if (!task.createdAt) return '';
    try {
      return format(new Date(task.createdAt), 'MMM d, yyyy');
    } catch {
      return '';
    }
  }, [task.createdAt]);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main content */}
      <div className="col-span-2 space-y-4">
        {/* Title */}
        {isEditing ? (
          <input
            ref={titleInputRef}
            id="edit-task-title"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            className="input text-lg font-semibold"
            placeholder="Task title"
          />
        ) : (
          <h3 className="text-xl font-semibold text-slate-800 leading-snug">{task.title}</h3>
        )}

        {/* Description */}
        <div>
          <label className="label">Description</label>
          {isEditing ? (
            <textarea
              id="edit-task-description"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              className="input resize-none"
              rows={5}
              placeholder="Add a description…"
            />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed min-h-[60px] whitespace-pre-wrap">
              {task.description || <span className="text-slate-400 italic">No description yet.</span>}
            </p>
          )}
        </div>

        {/* Edit controls + Delete */}
        <div className="flex gap-2 items-center">
          {isEditing ? (
            <>
              <button onClick={handleEditSave} className="btn-primary text-xs" disabled={updateTask.isPending}>
                {updateTask.isPending ? <Spinner size="sm" /> : 'Save changes'}
              </button>
              <button onClick={() => { setIsEditing(false); setEditTitle(task.title); setEditDescription(task.description || ''); }} className="btn-secondary text-xs">
                Cancel
              </button>
              {updateTask.isError && (
                <p className="text-xs text-red-500 ml-1">Save failed - please try again.</p>
              )}
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            {showDeleteConfirm ? (
              <>
                <span className="text-xs text-slate-600">Delete this task?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                  className="btn-danger text-xs"
                >
                  {deleteTask.isPending ? <Spinner size="sm" /> : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar fields */}
      <div className="space-y-4 text-sm">
        <Field label="Status">
          <Dropdown
            id="edit-task-status"
            value={task.status}
            onChange={val => handleFieldUpdate('status', val)}
            options={STATUS_OPTIONS}
            size="sm"
          />
        </Field>

        <Field label="Assignee">
          <Dropdown
            id="edit-task-assignee"
            value={task.assigneeId || ''}
            onChange={val => handleFieldUpdate('assigneeId', val)}
            options={assigneeOptions}
            placeholder="Unassigned"
            size="sm"
          />
        </Field>

        <Field label="Label">
          <Dropdown
            id="edit-task-label"
            value={task.labelId || ''}
            onChange={val => handleFieldUpdate('labelId', val)}
            options={labelOptions}
            placeholder="None"
            size="sm"
          />
        </Field>

        <Field label="Due date">
          <input
            id="edit-task-due"
            type="date"
            value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
            onChange={e => handleFieldUpdate('dueDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="input text-sm"
          />
        </Field>

        <Field label="Created">
          <p className="text-slate-500 text-xs">{createdDateStr}</p>
        </Field>
      </div>
    </div>
  );
});
