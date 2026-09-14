import { useState, memo, useCallback } from 'react';

export const Accordion = memo(function Accordion({ items, allowMultiple = false, className = '' }) {
  const [openItems, setOpenItems] = useState(new Set());

  const toggle = useCallback((id) => {
    setOpenItems(prev => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, [allowMultiple]);

  return (
    <div className={`divide-y divide-slate-100 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        const panelId = `accordion-panel-${item.id}`;
        const triggerId = `accordion-trigger-${item.id}`;

        return (
          <div key={item.id}>
            <button
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(item.id);
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700
                         hover:bg-slate-50 rounded-md transition-colors duration-150 focus:outline-none text-left"
            >
              <span className="flex items-center gap-2.5">
                {item.icon && <span className="text-slate-500 shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className={`overflow-hidden transition-all duration-200 ${isOpen ? 'animate-fadeIn' : ''}`}
            >
              <div className="px-3 pb-2 pt-1">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

