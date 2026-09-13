import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBoard } from './useBoards.js';

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const KEY_REGEX = /^[A-Z]{2,6}$/;
export const CATEGORY_MAX = 50;

export const PROJECT_ICONS = [
  { id: 'code', label: 'Frontend / Code', color: '#0052CC' },
  { id: 'server', label: 'Backend Services', color: '#6554C0' },
  { id: 'mobile', label: 'Mobile Application', color: '#00875A' },
  { id: 'board', label: 'Kanban Workflow', color: '#FF5630' },
];

export const CATEGORY_SUGGESTIONS = ['Software project', 'Marketing', 'Business', 'Design', 'Mobile App'];

export function deriveKey(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const initials = words.map(w => w[0]).join('').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    if (initials.length >= 2) return initials;
  }
  return name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
}

export function validateBoardForm(form) {
  const errs = {};
  const name = form.name.trim();

  if (!name) {
    errs.name = 'Project name is required.';
  } else if (name.length < NAME_MIN) {
    errs.name = `Project name must be at least ${NAME_MIN} characters.`;
  } else if (name.length > NAME_MAX) {
    errs.name = `Project name must be ${NAME_MAX} characters or fewer.`;
  }

  const keyInput = form.key.trim();
  if (keyInput) {
    if (!KEY_REGEX.test(keyInput)) {
      errs.key = 'Key must be 2 to 6 uppercase letters (e.g. PROJ).';
    }
  } else if (name) {
    const auto = deriveKey(name);
    if (!KEY_REGEX.test(auto)) {
      errs.key = 'Please enter a 2 to 6 letter key.';
    }
  }

  if (form.category.trim().length > CATEGORY_MAX) {
    errs.category = `Category must be ${CATEGORY_MAX} characters or fewer.`;
  }

  return errs;
}

export function useCreateBoardForm({ onClose }) {
  const navigate = useNavigate();
  const createBoard = useCreateBoard();

  const [form, setForm] = useState({
    name: '',
    key: '',
    iconType: 'code',
    color: '#0052CC',
    category: 'Software project',
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateBoardForm(form), [form]);
  const err = useCallback((field) => (touched[field] || submitted) ? errors[field] : undefined, [touched, submitted, errors]);

  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const setKey = useCallback((val) => {
    const sanitized = val.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
    setForm(prev => ({ ...prev, key: sanitized }));
  }, []);

  const touch = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const selectIcon = useCallback((icon) => {
    setForm(prev => ({ ...prev, iconType: icon.id, color: icon.color }));
  }, []);

  const selectCategory = useCallback((cat) => {
    setForm(prev => ({ ...prev, category: cat }));
  }, []);

  const autoKeyHint = useMemo(() => {
    if (!form.name.trim()) return '';
    const derived = deriveKey(form.name);
    return KEY_REGEX.test(derived) ? derived : '';
  }, [form.name]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const nameTrimmed = form.name.trim();
    const finalKey = form.key.trim() || deriveKey(nameTrimmed);

    createBoard.mutate(
      {
        name: nameTrimmed,
        key: finalKey,
        iconType: form.iconType,
        color: form.color,
        category: form.category.trim() || 'Software project',
      },
      {
        onSuccess: (board) => {
          onClose();
          navigate(`/board/${board.id}`);
        },
      }
    );
  }, [form, errors, createBoard, onClose, navigate]);

  return {
    form,
    errors,
    err,
    touched,
    submitted,
    setField,
    setKey,
    touch,
    selectIcon,
    selectCategory,
    autoKeyHint,
    handleSubmit,
    isPending: createBoard.isPending,
    isError: createBoard.isError,
    errorMessage: createBoard.error?.message,
    hasErrors: Object.keys(errors).length > 0,
  };
}
