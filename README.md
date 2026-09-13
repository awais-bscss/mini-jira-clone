# MiniJira - Project Management Application

A Kanban project management application built with a React 19 frontend and a Node.js / Express / MongoDB REST API backend.

---

## Architecture Overview

```
Mini Jira/
├── frontend/                     # React 19 + Vite client
│   ├── src/
│   │   ├── api/                  # Fetch client and endpoint declarations
│   │   ├── components/           # Accessible UI design system (Modal, Tabs, Accordion, etc.)
│   │   ├── constants/            # Static data (users, labels, columns, statuses)
│   │   ├── features/             # Boards, Tasks, AI Demo, 404 Not Found
│   │   ├── hooks/                # Custom React hooks (tasks, boards, forms, search)
│   │   ├── router/               # React Router v7 configuration and AppShell
│   │   └── store/                # Redux Toolkit store, uiSlice, Reselect selectors
│   ├── README.md                 # Frontend documentation
│   ├── vite.config.js            # Vite configuration with /api dev proxy
│   └── package.json
│
├── backend/                      # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── config/               # MongoDB connection and shutdown handlers
│   │   ├── controllers/          # Request/response controllers
│   │   ├── middleware/           # Centralized error handler and validators
│   │   ├── models/               # Mongoose schemas: Board, Task, Counter
│   │   ├── routes/               # REST routes: projects, tasks, search, ai
│   │   ├── seed/                 # Database seeder (3 projects and initial tasks)
│   │   ├── services/             # Business logic and atomic database updates
│   │   └── utils/                # HTTP error classes and helpers
│   ├── README.md                 # Backend documentation
│   ├── server.js                 # Server entry point and HTTP listener
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── package.json                  # Root scripts (concurrent development)
├── README.md                     # Root project documentation
├── STATE_DECISIONS.md            # State management architectural rationale
└── PERFORMANCE_NOTES.md          # React profiling and rendering benchmarks
```

---

## Modular Documentation

Dedicated documentation files are maintained within their respective directories:

- **Frontend Application**: [frontend/README.md](./frontend/README.md)
  - Custom Hooks Reference: [frontend/src/hooks/README.md](./frontend/src/hooks/README.md)
  - Redux Store and Selectors: [frontend/src/store/README.md](./frontend/src/store/README.md)
  - Accessible UI Components: [frontend/src/components/README.md](./frontend/src/components/README.md)
- **Backend Service**: [backend/README.md](./backend/README.md)
  - Controller Layer: [backend/src/controllers/README.md](./backend/src/controllers/README.md)
  - Service Layer: [backend/src/services/README.md](./backend/src/services/README.md)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, Redux Toolkit, TanStack Query v5, Tailwind CSS v3, @hello-pangea/dnd, date-fns |
| **Backend** | Node.js, Express 4, MongoDB, Mongoose 8, CORS, dotenv |
| **Database** | MongoDB (local instance `mongodb://localhost:27017/mini-jira` or MongoDB Atlas) |

---

## Quick Start

### 1. Prerequisites

- Node.js 18.x or higher
- MongoDB running locally or a MongoDB Atlas connection string

### 2. Environment Setup

Create `backend/.env` based on `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini-jira
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies and Seed Database

From the project root:

```bash
# Install root, backend, and frontend dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# Seed sample projects and tasks into MongoDB
npm run seed --prefix backend
```

### 4. Start Development Servers

Run both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

Or start each service individually:
- Backend (`http://localhost:5000`): `npm run dev:backend`
- Frontend (`http://localhost:5173`): `npm run dev:frontend`

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## REST API Endpoints

All endpoints are prefixed with `/api`. Both `/api/projects` and `/api/boards` resolve to the project management routes.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects with real-time `taskCount` and `doneCount` |
| `POST` | `/api/projects` | Create a new project board |
| `PATCH` | `/api/projects/:id` | Update project details (name, key, category) |
| `DELETE` | `/api/projects/:id` | Delete project and cascade-delete all its tasks |
| `GET` | `/api/projects/:boardId/tasks` | Get tasks for a project (supports `status`, `assigneeId`, `labelId`, `search`) |
| `PATCH` | `/api/projects/:boardId/tasks/reorder` | Drag-and-drop task reordering with atomic bulk index re-sequencing |
| `GET` | `/api/tasks/:id` | Fetch task details and embedded comments |
| `POST` | `/api/tasks` | Create task with auto-generated project key (`DS-1`, `PE-2`) |
| `PATCH` | `/api/tasks/:id` | Update task fields (title, description, status, type, assignee, etc.) |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `POST` | `/api/tasks/:id/comments` | Add comment to a task |
| `GET` | `/api/search?q=` | Global search across projects and tasks with batch resolution |
| `POST` | `/api/ai/chat` | Token-by-token response streaming via Google Gemini API |
| `GET` | `/api/health` | Service health status check |

---

## Key Features

- **Project Dashboard**: View, create, and manage project boards with live progress counters.
- **Kanban Board**: Drag-and-drop task cards across columns with instant optimistic cache updates.
- **Atomic Sequential Keys**: Automatically generates project-specific keys (`DS-1`, `DS-2`, `PE-1`) via MongoDB sequence counters.
- **Dynamic Grouping and Filters**: Group columns by Status, Assignee, or Label. Filter tasks by status, assignee, and text search synced with URL search parameters.
- **Global Entity Search**: Fast debounced search across projects and tasks with direct navigation.
- **Deep Modal Routing**: Inspect task details, edit fields, and post comments via `/board/:boardId/task/:taskId`.
- **Accessible UI Components**: Built from scratch with WAI-ARIA standards (Modal, Tabs, Accordion, Dropdown).
- **AI Streaming Assistant**: Token-by-token response generation at `/ai-demo` with pause, resume, and abort controls.
- **404 Not Found Handling**: Dedicated error screen for unmatched routes with one-click return navigation.
