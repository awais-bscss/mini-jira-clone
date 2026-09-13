import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick.js';

/**
 * Dropdown — Accessible, keyboard-navigable custom select component.
 *
 * Supports:
 * - Keyboard navigation (ArrowUp, ArrowDown, Enter, Space, Escape, Home, End)
 * - WAI-ARIA combobox + listbox pattern (aria-expanded, aria-activedescendant, role="option")
 * - Outside click auto-close
 * - Colored dots (for Status), Avatars (for Assignees), Badges (for Labels)
 * - Custom trigger or option renderers
 */
export function Dropdown({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  size = 'md',
  className = '',
  buttonClassName = '',
  renderTrigger,
  renderOption,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  // Close when clicked outside
  useOutsideClick(containerRef, () => {
    if (isOpen) setIsOpen(false);
  }, isOpen);

  const selectedOption = options.find(o => o.value === value) || null;

  // Sync highlighted index with currently selected option when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(o => o.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value, options]);

  // Scroll highlighted item into view if necessary
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, highlightedIndex]);

  const selectOption = useCallback((option) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [onChange]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      }
      case 'Home': {
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;
      }
      case 'End': {
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(options.length - 1);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && options[highlightedIndex]) {
            selectOption(options[highlightedIndex]);
          }
        } else {
          setIsOpen(true);
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      }
      case 'Tab': {
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      }
      default:
        break;
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }[size] || 'px-3 py-2 text-sm';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      {renderTrigger ? (
        renderTrigger({
          selectedOption,
          isOpen,
          toggle: () => !disabled && setIsOpen(!isOpen),
          buttonRef,
          handleKeyDown,
          disabled,
        })
      ) : (
        <button
          ref={buttonRef}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={id ? `${id}-listbox` : undefined}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0 ? `${id}-opt-${highlightedIndex}` : undefined
          }
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center justify-between gap-2 bg-white border rounded-md text-left
                     transition-colors duration-150 focus:outline-none
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'}
                     ${sizeClasses} ${buttonClassName}`}
        >
          <span className="flex items-center gap-2 truncate text-slate-800">
            {selectedOption ? (
              <>
                {selectedOption.dotColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: selectedOption.dotColor }}
                    aria-hidden="true"
                  />
                )}
                {selectedOption.avatar && (
                  <span className="shrink-0">{selectedOption.avatar}</span>
                )}
                {selectedOption.badge && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[11px] font-medium shrink-0"
                    style={{
                      backgroundColor: selectedOption.badgeColor ? `${selectedOption.badgeColor}20` : '#f1f5f9',
                      color: selectedOption.badgeColor || '#475569',
                    }}
                  >
                    {selectedOption.badge}
                  </span>
                )}
                <span className="truncate font-normal">{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </span>

          {/* Chevron indicator with smooth rotation animation */}
          <svg
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-500' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Floating Options Menu */}
      {isOpen && (
        <ul
          ref={listRef}
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1 left-0 w-full bg-white border border-slate-200 rounded-lg
                     shadow-lg overflow-hidden max-h-60 overflow-y-auto focus:outline-none animate-in fade-in duration-100"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs text-slate-400 text-center">No options available</li>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;
              const itemSizeClass = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';

              return (
                <li
                  key={String(option.value)}
                  id={id ? `${id}-opt-${index}` : undefined}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`${itemSizeClass} flex items-center justify-between gap-2 cursor-pointer
                             transition-colors duration-100 select-none
                             ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                             ${isSelected
                               ? (isHighlighted ? 'bg-[#DEEBFF] text-[#0052CC] font-semibold' : 'bg-[#E9F2FF] text-[#0052CC] font-semibold')
                               : (isHighlighted ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50')
                             }`}
                >
                  {renderOption ? (
                    renderOption({ option, isSelected, isHighlighted })
                  ) : (
                    <div className="flex items-center gap-2 truncate">
                      {option.dotColor && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: option.dotColor }}
                          aria-hidden="true"
                        />
                      )}
                      {option.avatar && <span className="shrink-0">{option.avatar}</span>}
                      {option.badge && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[11px] font-medium shrink-0"
                          style={{
                            backgroundColor: option.badgeColor ? `${option.badgeColor}20` : '#f1f5f9',
                            color: option.badgeColor || '#475569',
                          }}
                        >
                          {option.badge}
                        </span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                  )}

                  {/* Selected checkmark */}
                  {isSelected && (
                    <svg
                      className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#0052CC] shrink-0 ml-1`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
