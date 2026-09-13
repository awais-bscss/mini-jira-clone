# Mini Jira - Backend Service

A RESTful API service for the Mini Jira project management application, built with Node.js, Express, and MongoDB (Mongoose).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Environment Configuration](#environment-configuration)
- [Setup and Execution](#setup-and-execution)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
  - [Projects and Boards](#projects-and-boards)
  - [Tasks](#tasks)
  - [Global Search](#global-search)
  - [AI Assistant](#ai-assistant)
  - [Health Check](#health-check)
- [Error Handling and Lifecycle](#error-handling-and-lifecycle)

---

## Overview

The Mini Jira backend provides a REST API powering project boards, Kanban task management, real-time drag-and-drop task reordering, global cross-entity search, and AI assistant response streaming.

---

## Architecture

The backend follows a layered architecture:

```
[ Incoming HTTP Request ]
           |
[ Express Routes (src/routes/) ]
           |
[ Validation Middleware (src/middleware/) ]
           |
[ Controller Layer (src/controllers/) ]
           |
[ Service Layer (src/services/) ]
           |
[ Mongoose Models (src/models/) ]
           |
[ MongoDB Database ]
```

- **Routes**: Define URL paths and link them to controller actions.
- **Middleware**: Validates request parameters and handles application-wide errors.
- **Controllers**: Parse input, call services, and return HTTP responses.
- **Services**: Implement business logic, validation rules, aggregations, and atomic updates.
- **Models**: Define Mongoose schemas for Boards, Tasks, and Sequence Counters.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 4.x
- **Database**: MongoDB with Mongoose 8.x
- **CORS**: cors
- **Environment**: dotenv
- **Dev Tool**: nodemon

---

## Directory Structure

```
backend/
├── src/
│   ├── app.js                 # Express application setup, routes, and middleware
│   ├── config/
│   │   └── db.js              # MongoDB connection and disconnect handlers
│   ├── controllers/
│   │   ├── aiController.js    # AI chat endpoint controller
│   │   ├── boardController.js # Projects and boards controller
│   │   ├── searchController.js# Global search controller
│   │   └── taskController.js  # Tasks and comments controller
│   ├── middleware/
│   │   ├── errorHandler.js    # Centralized HTTP error handler
│   │   └── validate.js        # Request body and parameter validators
│   ├── models/
│   │   ├── Board.js           # Project/Board schema
│   │   ├── Counter.js         # Atomic auto-increment sequence counter
│   │   └── Task.js            # Task and embedded comment schema
│   ├── routes/
│   │   ├── ai.js              # AI streaming route
│   │   ├── boards.js          # Board and project routes
│   │   ├── search.js          # Global search route
│   │   └── tasks.js           # Task routes
│   ├── seed/
│   │   ├── data.js            # Seed dataset with 3 boards and initial tasks
│   │   └── seeder.js          # Database seed script
│   ├── services/
│   │   ├── aiService.js       # Google Gemini streaming service
│   │   ├── boardService.js    # Board business logic and task reordering
│   │   ├── searchService.js   # Cross-entity search query logic
│   │   └── taskService.js     # Task CRUD, key generation, and comments
│   └── utils/
│       ├── errors.js          # Custom HTTP error class definitions
│       └── helpers.js         # Shared utility functions
├── server.js                  # Entry point, HTTP listener, and graceful shutdown
├── .env.example               # Environment variable definitions
├── package.json               # Scripts and dependencies
└── README.md                  # Backend documentation
```

---

## Environment Configuration

Configure environment variables in `backend/.env` using the provided template:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini-jira
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/mini-jira` |
| `CORS_ORIGIN` | Allowed origin for frontend requests | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant streaming | None |

---

## Setup and Execution

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Database
Populates MongoDB with 3 sample projects ("Design System & UI", "Fullstack Platform", "React Engineering"), initial tasks, and sequence counters:
```bash
npm run seed
```

### 3. Start Development Server
Starts the server with nodemon auto-reloading:
```bash
npm run dev
```

### 4. Start Production Server
Runs the server directly with Node:
```bash
npm start
```

---

## Database Models

### 1. Board (`src/models/Board.js`)
- `name`: String, required, 2 to 80 characters.
- `key`: String, required, 2 to 6 uppercase letters (e.g. `DS`, `FP`).
- `category`: String, default `'Software project'`.
- `color`: String, hex color token.
- `iconType`: String (`code`, `layout`, etc.).
- Indexes: Text index on `name` and `key`.

### 2. Task (`src/models/Task.js`)
- `taskKey`: String, required (e.g. `DS-1`, `FP-5`).
- `boardId`: ObjectId reference to `Board`.
- `title`: String, required.
- `description`: String.
- `status`: String enum (`todo`, `in-progress`, `in-review`, `done`).
- `type`: String enum (`task`, `bug`, `story`, `epic`).
- `assigneeId`: String or null.
- `labelId`: String or null.
- `dueDate`: Date or null.
- `order`: Number, position index within the status column.
- `comments`: Array of `{ text, authorId, createdAt }`.
- Indexes: Text index on `title` and `taskKey`.

### 3. Counter (`src/models/Counter.js`)
- `_id`: String, corresponding to the board key (e.g. `'DS'`).
- `seq`: Number, atomically incremented using `findOneAndUpdate` with `$inc` to produce sequential task keys (`KEY-1`, `KEY-2`).

---

## API Endpoints

All endpoints are prefixed with `/api`. Routes mapped to `/api/boards` and `/api/projects` share the same controller.

### Projects and Boards

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | Get all projects with aggregated `taskCount` and `doneCount` |
| `POST` | `/api/projects` | Create a new project board |
| `PATCH` | `/api/projects/:id` | Update project details (name, key, category) |
| `DELETE` | `/api/projects/:id` | Delete project and cascade-delete all its tasks |
| `GET` | `/api/projects/:boardId/tasks` | Get all tasks for a project (supports `status`, `assigneeId`, `labelId`, `search`) |
| `PATCH` | `/api/projects/:boardId/tasks/reorder` | Drag-and-drop reorder with atomic MongoDB bulk re-indexing |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks/:id` | Get task details by ID including comments |
| `POST` | `/api/tasks` | Create task with auto-generated sequential task key |
| `PATCH` | `/api/tasks/:id` | Update task fields (title, description, status, type, etc.) |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `POST` | `/api/tasks/:id/comments` | Add comment to a task |

### Global Search

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search?q=:query` | Full-text search across projects and tasks with batch project resolution |

### AI Assistant

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Real-time chunked response stream via Google Gemini API |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ status: "ok" }` |

---

## Error Handling and Lifecycle

- **Centralized Middleware (`src/middleware/errorHandler.js`)**:
  - Handles Mongoose `CastError` (invalid ObjectId).
  - Handles Mongoose `ValidationError` (schema constraint failures).
  - Handles MongoDB `11000` duplicate key errors.
  - Formats errors uniformly as `{ error: string }`.
- **Server Lifecycle (`server.js`)**:
  - Connects to MongoDB before accepting HTTP requests.
  - Listens for `SIGINT` and `SIGTERM` signals.
  - Closes HTTP server and invokes `mongoose.disconnect()` for graceful termination.
