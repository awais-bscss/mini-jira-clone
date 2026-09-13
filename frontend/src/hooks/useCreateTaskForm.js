import { useState, useMemo, useCallback } from 'react';
import { useCreateTask } from './useTasks.js';

export const TITLE_MIN = 3;
export const TITLE_MAX = 120;
export const DESC_MAX  = 5000;
export const DESC_WARN = 4500;

export function validateTaskForm(form) {
  const errs = {};
  const title = form.title.trim();

  if (!title) {
    errs.title = 'Title is required.';
  } else if (title.length < TITLE_MIN) {
    errs.title = `Title must be at least ${TITLE_MIN} characters.`;
  } else if (title.length > TITLE_MAX) {
    errs.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  if (form.description.length > DESC_MAX) {
    errs.description = `Max ${DESC_MAX.toLocaleString()} characters.`;
  }

  if (!form.labelId) {
    errs.labelId = 'Please select a label.';
  }

  return errs;
}

export function useCreateTaskForm({ boardId, defaultStatus = 'todo', onClose }) {
  const createTask = useCreateTask(boardId);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    assigneeId: '',
    labelId: '',
    dueDate: '',
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateTaskForm(form), [form]);

  const err = useCallback(
    (field) => (touched[field] || submitted) ? errors[field] : undefined,
    [touched, submitted, errors]
  );

  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const touch = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    createTask.mutate(
      {
        boardId,
        title:       form.title.trim(),
        description: form.description.trim(),
        status:      form.status,
        assigneeId:  form.assigneeId || null,
        labelId:     form.labelId,
        dueDate:     form.dueDate ? new Date(form.dueDate).toISOString() : null,
      },
      { onSuccess: onClose }
    );
  }, [form, errors, boardId, createTask, onClose]);

  return {
    form,
    errors,
    err,
    touched,
    submitted,
    setField,
    touch,
    handleSubmit,
    titleLen: form.title.length,
    descLen: form.description.length,
    isPending: createTask.isPending,
    isError: createTask.isError,
    errorMessage: createTask.error?.message,
    hasErrors: Object.keys(errors).length > 0,
  };
}
