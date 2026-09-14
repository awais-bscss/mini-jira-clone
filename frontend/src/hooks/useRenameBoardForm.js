import { useState, useMemo, useCallback } from 'react';
import { useUpdateBoard } from './useBoards.js';

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const CATEGORY_MAX = 50;

export function validateRenameForm(name, category) {
  const errs = {};
  const trimmedName = name.trim();

  if (!trimmedName) {
    errs.name = 'Project name is required.';
  } else if (trimmedName.length < NAME_MIN) {
    errs.name = `Project name must be at least ${NAME_MIN} characters.`;
  } else if (trimmedName.length > NAME_MAX) {
    errs.name = `Project name must be ${NAME_MAX} characters or fewer.`;
  }

  if (category.trim().length > CATEGORY_MAX) {
    errs.category = `Category must be ${CATEGORY_MAX} characters or fewer.`;
  }

  return errs;
}

export function useRenameBoardForm({ board, onClose }) {
  const updateBoard = useUpdateBoard();
  const [name, setName] = useState(board.name);
  const [category, setCategory] = useState(board.category || 'Software project');
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateRenameForm(name, category), [name, category]);

  const err = useCallback(
    (field) => (touched[field] || submitted) ? errors[field] : undefined,
    [touched, submitted, errors]
  );

  const touch = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    updateBoard.mutate(
      {
        id: board.id,
        name: name.trim(),
        category: category.trim() || 'Software project',
      },
      {
        onSuccess: () => onClose(),
      }
    );
  }, [name, category, errors, board.id, updateBoard, onClose]);

  return {
    name,
    setName,
    category,
    setCategory,
    err,
    touch,
    handleSubmit,
    isPending: updateBoard.isPending,
    isError: updateBoard.isError,
    errorMessage: updateBoard.error?.message,
    hasErrors: Object.keys(errors).length > 0,
    submitted,
  };
}
