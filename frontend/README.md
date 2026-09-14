# Mini Jira - Frontend Application

A client-side single-page application replicating Jira's Kanban interface, built with React 19, Redux Toolkit, TanStack Query, React Router v7, and Tailwind CSS.

---

## Table of Contents

- [Overview](#overview)
- [Architecture and State Management](#architecture-and-state-management)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Configuration and Scripts](#configuration-and-scripts)
- [Routing and Views](#routing-and-views)
- [Component Structure](#component-structure)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)

---

## Overview

The Mini Jira frontend provides a user interface modeled on Jira:
- Projects dashboard displaying all boards with aggregated task metrics.
- Kanban board featuring smooth drag-and-drop task movement across status columns.
- Grouping options by Status, Assignee, or Label.
- Global search dropdown for instant navigation to projects and tasks.
- Deep-linked task detail modal with editable fields and commenting.
- Token-by-token AI streaming demo at `/ai-demo`.
- Custom 404 Not Found page for unmapped routes.

---

## Architecture and State Management

State is divided into three distinct layers:

```
[ UI Components ]
        |
        +---> Client UI State: Redux Toolkit (src/store/)
        |       - Modal visibility (createTask, createBoard, boardSettings)
        |       - Sidebar collapsed / expanded state
        |       - Board grouping criteria (status, assignee, label)
        |
        +---> Server Cache: TanStack Query (src/hooks/)
        |       - Task and project queries with 60-second stale time
        |       - Optimistic updates during drag-and-drop and edits
        |       - Automatic query invalidation on mutation success
        |
        +---> URL Route State: React Router v7 (src/router/)
                - Active board ID (/board/:boardId)
                - Active task ID (/board/:boardId/task/:taskId)
                - Synced query params (?status=...&assigneeId=...&search=...)
```

---

## Tech Stack

- **UI Library**: React 19
- **Build System**: Vite 8.x
- **Routing**: React Router v7
- **Server Cache**: TanStack Query v5
- **Client State**: Redux Toolkit 2.x
- **Drag and Drop**: @hello-pangea/dnd 18.x
- **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer
- **Markdown**: react-markdown
- **Dates**: date-fns 4.x
- **Linter**: oxlint

---

## Directory Structure

```
frontend/
├── public/
│   ├── favicon.svg             # Jira icon
│   └── icons.svg               # SVG icons
├── src/
│   ├── api/
│   │   ├── apiClient.js        # Fetch wrapper with standardized error handling
│   │   ├── boards.js           # Project board API endpoints
│   │   ├── queryClient.js      # QueryClient configuration
│   │   ├── search.js           # Global search query endpoint
│   │   └── tasks.js            # Task CRUD, reorder, and comment endpoints
│   ├── components/
│   │   ├── Accordion/          # Compound accordion component
│   │   ├── Avatar/             # User avatar with fallback initials
│   │   ├── Badge/              # Status badge component
│   │   ├── Dropdown/           # Custom select dropdown
│   │   ├── Icon/               # Issue type and priority icons
│   │   ├── Modal/              # Accessible modal dialog
│   │   ├── Navbar/             # Top navbar and GlobalSearch
│   │   ├── Sidebar/            # Collapsible navigation sidebar
│   │   ├── Spinner/            # SVG loading spinner
│   │   └── Tabs/               # Compound tabs component
│   ├── constants/
│   │   ├── data.js             # Static data (users, labels, columns)
│   │   └── statuses.js         # Status keys, labels, and filter definitions
│   ├── features/
│   │   ├── ai-demo/            # AI assistant streaming demo page
│   │   ├── boards/             # Projects listing and creation modals
│   │   ├── not-found/          # 404 Not Found page
│   │   └── tasks/              # Kanban board, Column, Card, and TaskDetailModal
│   ├── hooks/
│   │   ├── useAiChat.js        # AI chat streaming hook
│   │   ├── useBoards.js        # Projects query and mutation hooks
│   │   ├── useCreateBoardForm.js # Board creation form logic and validation
│   │   ├── useCreateTaskForm.js  # Task creation form logic and validation
│   │   ├── useDebouncedValue.js  # Reactive value debounce hook
│   │   ├── useGlobalSearch.js    # Debounced global search hook
│   │   ├── useOutsideClick.js    # Outside-click detection hook
│   │   ├── useRecentBoards.js    # LocalStorage recent boards manager
│   │   ├── useRenameBoardForm.js # Board rename form logic
│   │   └── useTasks.js           # Tasks queries, mutations, and optimistic reorder
│   ├── router/
│   │   └── index.jsx           # Route definitions and AppShell layout
│   ├── store/
│   │   ├── index.js            # Redux store setup
│   │   ├── selectors.js        # Reselect memoized selectors
│   │   └── uiSlice.js          # Redux slice for UI and modal state
│   ├── App.jsx                 # Provider root (Redux, QueryClient, Router)
│   ├── index.css               # Tailwind directives and design tokens
│   └── main.jsx                # Application DOM entry point
├── .oxlintrc.json              # Oxlint rules configuration
├── index.html                  # HTML entry template
├── package.json                # Dependencies and npm scripts
├── tailwind.config.js          # Tailwind theme and colors
└── vite.config.js              # Vite server and proxy configuration
```

---

## Configuration and Scripts

### Development Proxy (`vite.config.js`)
All `/api` requests in development are proxied to the backend at `http://localhost:5000`:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Scripts

- **`npm run dev`**: Starts the Vite development server on `http://localhost:5173`.
- **`npm run build`**: Runs `vite build` to produce optimized production assets in `dist/`.
- **`npm run preview`**: Starts a local web server to preview the production `dist/` bundle.
- **`npm run lint`**: Runs `oxlint` across all source files.

---

## Routing and Views

Configured in `src/router/index.jsx` via `createBrowserRouter`:

| Path | Component | Description |
|---|---|---|
| `/` | `BoardsPage` | List of all project boards |
| `/board/:boardId` | `BoardPage` | Kanban board with column cards and filters |
| `/board/:boardId/task/:taskId` | `TaskDetailModal` | Deep-linked modal view of task details |
| `/ai-demo` | `AiDemoPage` | AI assistant token streaming demo (code-split) |
| `*` | `NotFoundPage` | 404 page for unmatched URLs |

---

## Component Structure

### Kanban Board
- **`BoardPage.jsx`**: Coordinates board queries, URL filter state, and the `<DragDropContext>`.
- **`Column.jsx`**: Memoized column container with `<Droppable>`, card count badges, and create task triggers.
- **`Card.jsx`**: Memoized draggable card with issue key, type icon, due date indicator, and assignee avatar. Uses CSS isolation so dragging follows pointer coordinates smoothly.
- **`TaskDetailModal.jsx`**: Code-split modal displaying editable fields, tabs (Details, Comments, Activity), and inline status editing.

### Design System
- **`Modal/`**: Focus-trapping modal dialog with backdrop dismissal.
- **`Dropdown/`**: Keyboard-navigable custom select with arrow-key traversal.
- **`Tabs/`**: Compound tabs supporting arrow key and `Home`/`End` navigation.
- **`Accordion/`**: Expandable disclosure panels with animated height transitions.
- **`Navbar/`**: Header with project links, global search, and AI assistant shortcut.
- **`Sidebar/`**: Collapsible panel listing projects with in-place active highlighting and quick filters.

---

## Performance Optimizations

1. **Component Memoization**: `Card` and `Column` are wrapped in `React.memo` to prevent sibling re-renders during drag-and-drop.
2. **Code Splitting**: `TaskDetailModal` and `AiDemoPage` are loaded asynchronously via `React.lazy` and `Suspense`.
3. **Reselect Memoization**: Filtered task groupings are computed using `createSelector` to avoid re-filtering when unrelated state updates occur.
4. **Optimistic Updates**: Reordering tasks immediately updates the TanStack Query cache before the server responds, ensuring instantaneous visual placement.
5. **Debounced Inputs**: Global search and board filter inputs are debounced to prevent excessive query calls.

---

## Accessibility

- Modals implement `role="dialog"`, `aria-modal="true"`, and focus trapping.
- Dropdown menus implement `role="listbox"` and `role="option"`.
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#0052CC]`) on all interactive controls.
- Semantic HTML tags (`header`, `main`, `nav`, `button`) utilized throughout the layout.
