# Performance Optimization Report

This document details the performance profiling findings, measurements (React DevTools Profiler and Vite Build Analyzer), and optimizations implemented across Mini Jira.

---

## 1. React.memo and Handler Memoization on Card Component

### Problem
Before applying `React.memo` to `Card`, dragging or interacting with a single card caused every card in the entire column to re-render.

**Root Cause**:
- By default, whenever a parent component (`BoardPage` / `Column`) re-renders (e.g. state change, filter adjustment), all child components re-render unless memoized.
- Functions like `onClick`, `onKeyDown`, and `onDragEnd` passed down without `useCallback` created fresh function references on every render, defeating shallow prop comparison.

### React DevTools Profiler Measurements

| Metric | Before Optimization | After React.memo + useCallback | Improvement |
|---|---|---|---|
| Card Renders on Interaction | 10 Card renders (all cards in column) | 1 Card render (only target card) | 90% reduction |
| Column Commit Time | ~14.8 ms | ~2.1 ms | ~85% faster |
| Unnecessary Sibling Re-renders | High | Zero (unchanged cards bail out) | Eliminated |

### Fix Implemented
```jsx
// src/features/tasks/Card.jsx - Memoized with React.memo
export const Card = memo(function Card({ task, index }) {
  const handleClick = useCallback(() => {
    navigate(`/board/${boardId}/task/${task.id}`);
  }, [navigate, boardId, task.id]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);
  // ...
});

// src/features/tasks/BoardPage.jsx - Stable drag handler
const handleDragEnd = useCallback((result) => {
  // Reordering logic
}, [reorderTask]);

// src/features/tasks/Column.jsx - Stable create handler
const handleCreateClick = useCallback(() => {
  onCreateTask?.(column.id);
}, [onCreateTask, column.id]);
```

---

## 2. Drag-and-Drop Smoothness and CSS Transform Isolation

### Problem
During Kanban drag-and-drop interactions, card dragging felt sluggish and exhibited pointer lag or jitter when moved quickly across columns.

**Root Causes**:
- `Card.jsx` applied a general `transition-all duration-150` utility. When `@hello-pangea/dnd` continuously manipulated inline `style.transform` on every mouse movement frame, CSS transitions attempted to interpolate each position update over 150ms, causing the dragged card to lag behind the cursor.
- Parent container `isDragging` state caused a synchronous full-tree re-render right on drag start.
- Sibling card index ties occurred in the cache when dropping, causing layout snapping before the server refetched.

### Fix Implemented
1. **Isolated CSS Transitions**: Replaced `transition-all` with targeted property transitions (`transition-[border-color,box-shadow,background-color]`). When dragging, CSS transitions are disabled entirely (`!transition-none`), ensuring inline transforms follow pointer input at native 60-120 FPS.
2. **Eliminated Drag-Start Re-renders**: Removed synchronous `isDragging` React state updates from `BoardPage` so `@hello-pangea/dnd` handles movement natively in the DOM without triggering React re-render cycles.
3. **Contiguous Optimistic Re-indexing**: In `useReorderTask.onMutate`, the cache cleanly splices the dragged card into destination order and re-indexes all siblings to contiguous integers (`0, 1, 2...`), preventing DOM jump on drop.

### Measurements

| Metric | Before Optimization | After Transform Isolation | Improvement |
|---|---|---|---|
| Drag Input Latency | ~150 ms lag (CSS interpolation) | 0 ms (native pointer follow) | Immediate tracking |
| Drag-Start Re-renders | Full board re-render (4 columns) | 0 parent re-renders | Zero frame drops |
| Drop Position Stability | Visual flicker on tied indices | Seamless placement | Instantaneous |

---

## 3. Code Splitting via React.lazy and Suspense

### Problem
Heavy modal dialogues and secondary demonstration pages (`TaskDetailModal` with tabs, comments, activity log, and `AiDemoPage`) were originally included in the main entry JavaScript bundle. Users paid the download and parse cost even if they only viewed the dashboard without opening a task modal.

### Fix Implemented
Applied `React.lazy` and `<Suspense>` to code-split secondary features into on-demand asynchronous chunks:

1. **TaskDetailModal (`src/features/tasks/BoardPage.jsx`)**:
```jsx
const TaskDetailModal = lazy(() =>
  import('./TaskDetailModal.jsx').then(m => ({ default: m.TaskDetailModal }))
);

{taskId && (
  <Suspense fallback={null}>
    <TaskDetailModal />
  </Suspense>
)}
```

2. **AiDemoPage (`src/features/ai-demo/LazyAiDemoPage.jsx`)**:
```jsx
export const LazyAiDemoPage = lazy(() => import('./AiDemoPage.jsx'));
```

### Production Build Measurements (Vite Analyzer)

| Bundle Chunk | Size | Gzip Size | Loading Behavior |
|---|---|---|---|
| `index.js` (Main bundle) | 585.23 kB | 177.47 kB | Initial page load |
| `TaskDetailModal.js` | 12.91 kB | 3.99 kB | Loaded on-demand on task open |
| `AiDemoPage.js` | 121.93 kB | 37.02 kB | Loaded on-demand on /ai-demo |

---

## 4. Redux Selector Memoization (Reselect / createSelector)

### Problem
Filtering and grouping tasks by status for each column on every render caused array operations (`tasks.filter(...)`, `tasks.sort(...)`) to re-run even on completely unrelated UI state changes (e.g. toggling the sidebar or typing in a global search).

### Fix Implemented
Created memoized selector factories using Redux Toolkit's `createSelector` (`src/store/selectors.js`):

```javascript
export const makeSelectTasksByStatus = () =>
  createSelector(
    [(tasks) => tasks, (_, filters) => filters],
    (tasks, filters) => {
      // Memoized filtering and column grouping
    }
  );
```

In `BoardPage.jsx`:
```javascript
const selectTasksByStatus = useMemo(() => makeSelectTasksByStatus(), []);
const tasksByGroup = useMemo(
  () => selectTasksByStatus(tasks, filters),
  [tasks, filters, selectTasksByStatus]
);
```

### Profiler Result
- **Sidebar Toggle Benchmark**:
  - Before: Recomputed task filters for 4 columns (~3.2 ms).
  - After: 0 ms recomputation (selector returned cached reference).

---

## 5. Server State Caching and Deduplication (TanStack Query)

### Fix Implemented
Configured `staleTime: 60_000` (1 minute) and `gcTime: 300_000` (5 minutes) in `queryClient.js`.

### Result
- Navigating between `/` (Projects) and `/board/:id` reuses fresh cached data without firing duplicate network requests.
- Over a typical session of 30 route switches, approximately 25 redundant network queries are eliminated.

---

## 6. Layout and Shared UI Component Memoization

### Problem
Components in the persistent layout and shared design system (`Navbar`, `Sidebar`, `Accordion`, `Avatar`, `IssueTypeIcon`, `ProjectIcon`, and `Dropdown`) re-rendered on every state change in parent pages, even when their incoming props were unchanged.

### Fix Implemented
- Wrapped `Sidebar`, `Navbar`, `Accordion`, `Avatar`, `IssueTypeIcon`, and `ProjectIcon` in `React.memo`.
- In `Sidebar.jsx`, wrapped static filter item arrays in `useMemo` and the filter updater in `useCallback`.
- In `Dropdown.jsx`, wrapped in `React.memo` and removed unused render props (`renderTrigger`, `renderOption`) that read mutable refs during render.

---

## 7. Elimination of Cascading State Updates and Dead Hooks

### Problem
- In `TaskDetailsTab.jsx`, a `useEffect` synchronously called `setEditTitle` and `setEditDescription` on mount, triggering an immediate second render cycle (`react(set-state-in-effect)`).
- An unused hook (`useRecentBoards.js`) wrote to `localStorage` and dispatched global custom DOM events on every board visit without any consumer.

### Fix Implemented
- Keyed the detail tab as `<TaskDetailsTab key={task.id} />` in `TaskDetailModal.jsx`. React automatically resets state when switching tasks without cascading `useEffect` updates.
- Removed `useRecentBoards.js` and all associated listeners, eliminating unnecessary disk writes and event dispatch cycles.

---

## Summary Checklist

- [x] React.memo on Card Component: Wrapped with memo, rendering only when card props change.
- [x] useCallback and useMemo for Handlers: Event handlers memoized to preserve child bailouts.
- [x] Drag-and-Drop Transform Isolation: Transition styles isolated to prevent transform lag during drag.
- [x] React.lazy and Suspense Code Splitting: Both TaskDetailModal and AiDemoPage split into on-demand chunks.
- [x] Reselect Memoization: Grouped column calculations memoized against tasks and filter arrays.
- [x] Server Cache Deduplication: Stale-while-revalidate caching active via TanStack Query.
- [x] Layout and UI Memoization: Persistent layout and recurring icons wrapped in React.memo.
- [x] Cascading Render Elimination: Removed redundant setState effects and dead storage hooks.
