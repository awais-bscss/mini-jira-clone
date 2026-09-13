# State Decisions

This document details the architectural rationale for state distribution across Mini Jira.

---

## State Categories Overview

The application organizes state into four explicit layers:

```
[ State Classification ]
        |
        +---> 1. Client UI State (Redux Toolkit)
        |        Transient visual flags and view layout preferences.
        |
        +---> 2. Server Cache State (TanStack Query)
        |        Remote entities fetched from the Express/MongoDB REST API.
        |
        +---> 3. URL State (React Router v7)
        |        Shareable navigation context and active filter parameters.
        |
        +---> 4. Ephemeral Component State (Local Hooks / Form Hooks)
                 Form inputs, dirty flags, and inline edit toggles.
```

---

## 1. Redux Toolkit (`src/store/uiSlice.js`)

Redux manages pure client-side UI state that affects visual layout across distant components without server persistence.

| State Slice Field | Type | Rationale |
|---|---|---|
| `sidebarOpen` | Boolean | Controls collapsible sidebar and main content margin across independent layout components. |
| `openModalType` | String / null | Controls active modal dialog (`createTask`). Opened from multiple locations (Navbar "Create" button, Column "+ Create task" button). |
| `createTaskStatus` | String | Captures the column context where "+ Create task" was clicked so the modal opens with that status pre-selected. |
| `groupBy` | String | View presentation preference (`status`, `assignee`, `label`). Determines column grouping without modifying underlying task records. |

### Why Not Context?
Redux Toolkit with Redux DevTools provides deterministic state tracking, time-travel inspection, and action log visibility for modal transitions and view switches.

---

## 2. Server Cache State (`src/hooks/useBoards.js`, `src/hooks/useTasks.js`)

All server entities (projects, tasks, search results) live in TanStack Query (React Query) and are fetched from the Node.js / Express backend backed by MongoDB.

| Decision | Implementation Detail | Rationale |
|---|---|---|
| `staleTime: 60_000` | 1 minute | Prevents redundant network queries when toggling between views or closing modals while keeping data fresh. |
| `gcTime: 300_000` | 5 minutes | Preserves unmounted queries in memory so returning to a board from the projects page renders instantly. |
| `retry: 1` | 1 network retry | Recovers automatically from brief network hiccups without inducing prolonged loading stalls on failure. |
| `onMutate` Optimistic Updates | Applied in `useReorderTask` and `useUpdateTask` | Cancels in-flight queries, updates the cache immediately for smooth drag-and-drop, and stores a snapshot for error rollback. |
| `onSettled` Query Invalidation | `qc.invalidateQueries({ queryKey: ... })` | Always re-syncs with MongoDB once mutations complete to ensure final consistency. |

### Why Not Redux For Server State?
TanStack Query manages request deduplication, cache garbage collection, background refetching, and optimistic mutation rollbacks natively without boilerplate action creators and loading reducers.

---

## 3. URL State (`useSearchParams`, `useParams`)

Routing context and filter parameters live directly in the browser URL so that views are shareable and preserve history.

| Parameter | Location | Rationale |
|---|---|---|
| `:boardId` | Route path (`/board/:boardId`) | Establishes project context. Switching boards updates the route. |
| `:taskId` | Route path (`/board/:boardId/task/:taskId`) | Allows deep linking directly to a specific task detail modal. |
| `?status=` | Search param | Filters board columns. Direct link shares a filtered view (e.g. only "Done" cards). |
| `?assigneeId=` | Search param | Filters tasks by user. Allows bookmarking an individual developer's task backlog. |
| `?labelId=` | Search param | Filters tasks by tag (e.g. "backend", "frontend"). |
| `?search=` | Search param | Text search query synced after a 300ms debounce. |

### Why Not Store Filters in Redux?
If filters were stored in Redux, navigating between pages or refreshing the browser would clear them. Storing filters in the URL allows users to bookmark views, share links with teammates, and navigate backwards/forwards using browser history.

---

## 4. Ephemeral Component State & Custom Form Hooks

Component-local state is restricted to components that own the interaction:

| State | Hook / Location | Rationale |
|---|---|---|
| Board creation inputs | `useCreateBoardForm.js` | Manages `name`, `key`, `category`, auto-key generation, and field validation until form submission. |
| Board rename inputs | `useRenameBoardForm.js` | Manages rename field state, dirty tracking, and inline errors in `BoardSettingsModal`. |
| Task creation inputs | `useCreateTaskForm.js` | Manages task fields (`title`, `description`, `type`, `dueDate`) in `CreateTaskModal`. |
| Search input string | `GlobalSearch.jsx` | Uncommitted typing buffer before query execution. |
| Comment draft text | `TaskDetailModal.jsx` | Text input for new comment drafts. |
| Dropdown open/focus | `Dropdown.jsx` | Keyboard highlighted index and menu visibility. |

---

## 5. Derived State (Computed on Demand)

Derived state is calculated dynamically from existing server cache data using memoized Reselect selectors (`src/store/selectors.js`), never duplicated in Redux or local state:

- **`makeSelectTasksByStatus`**: Filters board tasks by current search params and groups them into an object keyed by column status (`todo`, `in-progress`, `in-review`, `done`).
- **`makeSelectTasksByAssignee`**: Groups tasks by assigned team member ID or `'unassigned'`.
- **`makeSelectTasksByLabel`**: Groups tasks by label ID or `'unlabelled'`.
- **Column Card Counts**: Calculated directly via `tasks.length` on the grouped array.
