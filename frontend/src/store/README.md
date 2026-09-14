# Frontend Redux Store

This directory contains the client UI state management implemented with Redux Toolkit and Reselect.

---

## State Philosophy

Mini Jira strictly delineates between **Server Cache State** and **Client UI State**:
- **Server Cache State**: Handled exclusively by TanStack Query (`src/hooks/`). Stores remote project and task records, optimistic updates, and background refetching.
- **Client UI State**: Handled exclusively by this Redux store. Stores transient view settings, modal dialog states, sidebar visibility, and column grouping options.

---

## Store Architecture

### 1. Store Setup (`index.js`)
Configures the Redux store with the `ui` slice reducer:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice.js';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});
```

---

### 2. UI Slice (`uiSlice.js`)

Manages layout and modal state across the application.

#### State Schema
```javascript
{
  sidebarOpen: true,            // Boolean indicating sidebar collapse status
  openModalType: null,          // 'createTask' | 'createBoard' | 'boardSettings' | null
  createTaskStatus: 'todo',     // Pre-selected column status when launching CreateTaskModal
  groupBy: 'status',            // Current Kanban grouping: 'status' | 'assignee' | 'label'
}
```

#### Dispatched Actions
- `toggleSidebar()`: Inverts `sidebarOpen` boolean.
- `setSidebarOpen(boolean)`: Explicitly sets sidebar visibility.
- `openCreateTaskModal(status)`: Opens task creation dialog with default status (e.g. `'in-progress'`).
- `openCreateBoardModal()`: Opens board creation dialog.
- `openBoardSettingsModal()`: Opens board settings and rename dialog.
- `closeModal()`: Closes any active modal and resets `createTaskStatus`.
- `setGroupBy(mode)`: Switches board columns between `'status'`, `'assignee'`, and `'label'`.

---

### 3. Memoized Selectors (`selectors.js`)

Implements Reselect (`createSelector`) factories to eliminate unnecessary recomputations when non-relevant state updates occur.

#### Primitive Selectors
- `selectSidebarOpen`: `(state) => state.ui.sidebarOpen`
- `selectOpenModalType`: `(state) => state.ui.openModalType`
- `selectCreateTaskStatus`: `(state) => state.ui.createTaskStatus`
- `selectGroupBy`: `(state) => state.ui.groupBy`

#### Selector Factories
Per-instance memoized selector factories for board column grouping:

- **`makeSelectTasksByStatus()`**:
  - Filters tasks by URL search parameters (`status`, `assigneeId`, `labelId`, `search`).
  - Groups matching tasks into an object keyed by column status (`todo`, `in-progress`, `in-review`, `done`).
  - Returns cached reference if input tasks and filters have not changed.

- **`makeSelectTasksByAssignee()`**:
  - Groups tasks by assigned user ID, grouping unassigned tasks under `'unassigned'`.

- **`makeSelectTasksByLabel()`**:
  - Groups tasks by label ID, grouping unlabeled tasks under `'unlabelled'`.
