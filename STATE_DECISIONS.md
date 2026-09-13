# State Decisions

This document explains why each piece of state lives where it does.

## Redux Toolkit (`src/store/uiSlice.js`)

Redux manages **pure UI state** — state that affects the visual shell but has no server representation.

| State | Rationale |
|---|---|
| `activeBoardId` | Needs to be accessible by Navbar and Sidebar simultaneously without prop-drilling through the router |
| `openModalType` | Controls which modal is shown; multiple components (Navbar Create button, Column "+ Create") need to open it |
| `openTaskId` | Paired with `openModalType`; lives next to it for symmetry |
| `sidebarOpen` | Toggle affects Sidebar and the `main` margin; two separate layout components need it |
| `groupBy` | View configuration — not a server concept, purely a display preference |

**Why not Context?** Redux DevTools gives us time-travel debugging for UI state, which is useful when debugging modal transitions. Context would work but offers no tooling benefit.

## TanStack Query (`src/hooks/useBoards.js`, `src/hooks/useTasks.js`)

All **server state** lives in TanStack Query. This means data fetched from MSW — boards and tasks.

| Decision | Rationale |
|---|---|
| `staleTime: 60_000` | Avoids refetching boards/tasks on every route transition; 1 min is a reasonable freshness window for project data |
| `gcTime: 300_000` | Keeps cached data in memory for 5 min after the last subscriber unmounts; avoids re-fetching on quick back-navigations |
| `retry: 1` | One retry covers transient network errors; more retries would make the ~5% simulated failures annoying |
| `onMutate/onError/onSettled` pattern | Full optimistic update cycle: snapshot → apply → rollback on error → re-sync. Used for drag-and-drop and task field updates |
| `invalidateQueries` after mutations | Always re-syncs from server after mutations complete, even after a successful optimistic update, to catch server-side side effects |

**Why not Redux for server state?** RTK Query would work, but TanStack Query has better ergonomics for optimistic updates and built-in `staleTime` / `gcTime` / `invalidate` patterns. Mixing both would be redundant.

## URL State (`useSearchParams`)

Filter and search state lives in the URL so that filtered views are **bookmarkable and shareable**.

| Param | Rationale |
|---|---|
| `?search=` | A user copying the URL after searching should get the same results |
| `?status=` | Filtered board views (e.g. "show only Done") should be linkable |
| `?assigneeId=` | "Show only Sam's tasks" is a useful shareable view |

**Why not Redux for filters?** If filters were in Redux, navigating away and back would reset them. URL state persists across navigation for free. It also means browser back/forward works as expected.

**Why not TanStack Query for filters?** Filters are not fetched data — they're request parameters. They belong in the URL, which drives what TanStack Query fetches.

## Local `useState`

Used for ephemeral, component-local state that nothing outside the component cares about.

| State | Location | Rationale |
|---|---|---|
| Modal `isOpen` for CreateBoard/Rename | `BoardsPage` | Only BoardsPage shows/hides these modals |
| `commentText` | `TaskDetailModal` | Typing state; nothing outside the modal needs it |
| `isEditing` | `TaskDetailModal` | Edit mode toggle; purely local to the detail view |
| `createTaskStatus` | `BoardPage` | Which column the "+ Create" button was clicked from |
| Form fields | `CreateTaskModal` | Controlled form state — local until submitted |

## Derived State (never stored)

These values are **computed from server data**, never stored:
- **Column card counts**: `tasks.filter(t => t.status === col.id).length` — computed in `Column` from the task list
- **Per-column task groups**: computed by `makeSelectTasksByStatus` (a memoized `createSelector`) — not stored in Redux
