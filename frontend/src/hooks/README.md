# Frontend Custom Hooks

This directory contains custom React hooks implementing data fetching, caching, form state encapsulation, debouncing, and UI interactions.

---

## Hooks Summary

### 1. Data Fetching & Caching (TanStack Query)

#### `useTasks.js`
Provides queries and mutations for task management:
- **`taskKeys`**: Hierarchical query key factory (`['tasks']`, `['tasks', boardId]`, `['task', taskId]`).
- **`useTasks(boardId, filters, options)`**: Fetches all tasks for a project board with server-side filtering (`status`, `assigneeId`, `labelId`, `search`).
- **`useTask(taskId)`**: Fetches task detail document with embedded comments. Populates `initialData` from any active board query cache to eliminate blank loading states.
- **`useCreateTask(boardId)`**: Mutation creating a new task and invalidating board queries.
- **`useUpdateTask(boardId)`**: Mutation applying updates with optimistic cache updates and rollback support.
- **`useDeleteTask(boardId)`**: Mutation deleting a task and invalidating queries.
- **`useReorderTask(boardId)`**: Mutation handling Kanban drag-and-drop. Cancels in-flight queries, applies optimistic order/status updates, and reconciles cache on settled.
- **`useAddComment(taskId)`**: Mutation appending a comment and refreshing task detail data.

#### `useBoards.js`
Provides queries and mutations for project boards:
- **`boardKeys`**: Query key factory (`['boards']`, `['boards', boardId]`).
- **`useBoards()`**: Fetches all projects with aggregated task counts.
- **`useBoard(boardId)`**: Fetches a specific board by ID.
- **`useCreateBoard()`**: Mutation creating a board.
- **`useUpdateBoard()`**: Mutation updating board metadata with optimistic cache updates.
- **`useDeleteBoard()`**: Mutation deleting a board.

---

### 2. Form Logic & Validation Hooks

Form state and validation logic are decoupled from presentation components into dedicated custom hooks:

#### `useCreateBoardForm.js`
Encapsulates state and validation for the `CreateBoardModal` component:
- **State**: `name`, `key`, `category`, `color`, `iconType`.
- **Auto Key Generation**: Generates uppercase acronyms from the project name in real time (e.g. "Platform Engineering" -> "PE") until manual edits occur.
- **Validation**:
  - Name: Required, 2 to 80 characters.
  - Key: Required, 2 to 6 uppercase letters (`/^[A-Z]{2,6}$/`).
  - Category: Maximum 50 characters.
- **Exposes**: `form`, `errors`, `isSubmitting`, `isValid`, `handleChange`, `handleBlur`, `handleSubmit`, `resetForm`.

#### `useRenameBoardForm.js`
Encapsulates project rename operations inside `BoardSettingsModal`:
- **State**: Tracks updated project name, touched states, and inline validation.
- **Exposes**: `name`, `error`, `isSubmitting`, `isDirty`, `handleChange`, `handleSubmit`, `resetForm`.

#### `useCreateTaskForm.js`
Encapsulates state and validation for the `CreateTaskModal` component:
- **State**: `title`, `description`, `type`, `status`, `assigneeId`, `labelId`, `dueDate`.
- **Validation**: Title is required (1 to 255 characters).
- **Exposes**: `form`, `errors`, `isSubmitting`, `isValid`, `handleChange`, `handleBlur`, `handleSubmit`, `resetForm`.

---

### 3. Search and Streaming Hooks

#### `useGlobalSearch.js`
Drives the top navigation global search:
- Accepts `query` string and `debounceMs` (default: 200ms).
- Uses `useDebouncedValue` to prevent querying on every keypress.
- Instantiates `AbortController` to cancel in-flight HTTP requests when the search term changes.
- Exposes `{ results, isSearching, error, debouncedQuery }` containing matching `projects`, `boards`, and `tasks`.

#### `useAiChat.js`
Manages token-by-token streaming from the AI endpoint:
- Connects to `/api/ai/chat` using native fetch and `body.getReader()`.
- Supports aborting requests via `AbortController`.
- Manages streaming lifecycle state: `streamingText`, `isStreaming`, `isPaused`, and `error`.

---

### 4. Utility Hooks

#### `useDebouncedValue.js`
Generic debouncing hook:
- Accepts any reactive value and a millisecond delay (default: 300ms).
- Sets internal timeout on value changes and cleans up pending timers on unmount or subsequent updates.

#### `useOutsideClick.js`
DOM event listener hook:
- Accepts a React container `ref`, a callback handler, and an `enabled` boolean.
- Attaches `mousedown` and `touchstart` listeners to `document`.
- Fires callback when an interaction occurs outside the referenced DOM node. Used in `Dropdown`, `GlobalSearch`, and `Modal`.
