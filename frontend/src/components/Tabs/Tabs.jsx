import { createContext, useContext, useState, useRef, useCallback } from 'react';

const TabsContext = createContext(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs sub-components must be used inside <Tabs>');
  return ctx;
}

function Tabs({ children, defaultTab, onChange }) {
  const [active, setActive] = useState(defaultTab);
  const handleChange = useCallback((id) => {
    setActive(id);
    onChange?.(id);
  }, [onChange]);

  return (
    <TabsContext.Provider value={{ active, setActive: handleChange }}>
      {children}
    </TabsContext.Provider>
  );
}

function List({ children, className = '' }) {
  const listRef = useRef(null);

  function handleKeyDown(e) {
    const tabs = Array.from(listRef.current?.querySelectorAll('[role="tab"]') || []);
    const idx = tabs.findIndex(t => t === document.activeElement);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      tabs[(idx + 1) % tabs.length]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      tabs[(idx - 1 + tabs.length) % tabs.length]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      tabs[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      tabs[tabs.length - 1]?.focus();
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={`flex border-b border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
}

function Tab({ id, children, className = '' }) {
  const { active, setActive } = useTabs();
  const isActive = active === id;
  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActive(id)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none
        ${isActive
          ? 'border-brand-500 text-brand-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        } ${className}`}
    >
      {children}
    </button>
  );
}

function Panel({ id, children, className = '' }) {
  const { active } = useTabs();
  if (active !== id) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
}

Tabs.List  = List;
Tabs.Tab   = Tab;
Tabs.Panel = Panel;

export { Tabs };
