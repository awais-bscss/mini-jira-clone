# MiniJira — Project Management Application

A production-quality **Kanban project management application** built with a **React 19** frontend and a **Node.js / Express / MongoDB** backend.

---

## Architecture Overview

```
Mini Jira/
├── frontend/               # React 19 + Vite client
│   ├── src/
│   │   ├── api/            # Real REST API calls (fetch)
│   │   ├── components/     # Accessible UI (Modal, Tabs, Accordion, Dropdown, etc.)
│   │   ├── constants/      # Static data (users, labels, columns, statuses)
│   │   ├── features/       # Boards, Tasks, AI Demo
│   │   ├── hooks/          # React Query hooks & utility hooks
│   │   ├── router/         # React Router v7 config
│   │   └── store/          # Redux Toolkit store, uiSlice, selectors
│   ├── vite.config.js      # /api proxy to localhost:5000
│   └── package.json
│
├── backend/                # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── models/         # Mongoose models: Board, Task, Counter
│   │   ├── routes/         # REST routes: boards, tasks, search
│   │   ├── middleware/     # Centralized error handler
│   │   └── seed/           # Database seeder (3 boards × 15 tasks)
│   ├── server.js           # Express app & MongoDB connection
│   ├── .env                # PORT, MONGO_URI, CORS_ORIGIN
│   └── package.json
│
├── package.json            # Root convenience scripts
├── README.md
├── STATE_DECISIONS.md      # State management design rationale
└── PERFORMANCE_NOTES.md    # React rendering & performance findings
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Redux Toolkit, TanStack Query v5, Tailwind CSS v3, @hello-pangea/dnd |
| **Backend** | Node.js, Express, MongoDB (Mongoose), CORS, Dotenv |
| **Database** | MongoDB (Local `mongodb://localhost:27017/mini-jira` or MongoDB Atlas) |

---

## Quick Start

### 1. Backend Setup

Make sure MongoDB is running locally (or provide your MongoDB Atlas connection string in `backend/.env`).

```bash
cd backend
npm install
npm run seed     # Seeds 3 boards and 45 tasks into MongoDB
npm run dev      # Starts Express on http://localhost:5000
```

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev      # Starts Vite on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).

> **Convenience**: From the root directory, you can also run `npm run dev` to start the frontend, or `npm run dev:backend` to start the backend.

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/boards` | List all boards with real-time task counts |
| `POST` | `/api/boards` | Create a new board |
| `PATCH` | `/api/boards/:id` | Update board name / details |
| `DELETE` | `/api/boards/:id` | Delete board and cascade-delete all its tasks |
| `GET` | `/api/boards/:boardId/tasks` | Fetch tasks for a board (filters: `status`, `assigneeId`, `search`) |
| `PATCH` | `/api/boards/:boardId/tasks/reorder` | Drag-and-drop reorder with atomic index re-sequencing |
| `GET` | `/api/tasks/:id` | Fetch task details and embedded comments |
| `POST` | `/api/tasks` | Create task with auto-incremented key (`TASK-X`) |
| `PATCH` | `/api/tasks/:id` | Update task fields |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `POST` | `/api/tasks/:id/comments` | Add comment to a task |
| `GET` | `/api/search?q=` | Global search across boards and tasks |

---

## Features

- **Multi-board Management**: Create, rename, delete project boards.
- **Kanban Drag-and-Drop**: Reorder tasks within columns or move across columns with optimistic UI updates.
- **Auto-increment Task Keys**: Atomic counter sequence (`TASK-1`, `TASK-2`, etc.) via MongoDB `Counter`.
- **Filtering & Grouping**: Group board columns by Status, Assignee, or Label. Filter by status, assignee, and text search synced with URL search params.
- **Full Keyboard Accessibility**: Accessible dialogs, focus trapping, compound tabs, and accordion components.
- **Token-by-Token AI Simulation**: Live streaming simulation page at `/ai-demo` with pause, resume, and abort controls.
