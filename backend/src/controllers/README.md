# Backend Controllers

This directory contains the Express controller classes responsible for handling HTTP requests, delegating business logic to corresponding services, and shaping HTTP responses.

---

## Architecture and Responsibilities

Controllers in this service follow a strict thin-controller pattern:
- Extract path parameters (`req.params`), query strings (`req.query`), and request bodies (`req.body`).
- Pass arguments to the service layer.
- Send formatted JSON responses with appropriate HTTP status codes (200, 201, 204).
- Forward unhandled exceptions to the centralized error middleware via `next(err)`.

---

## Controllers Summary

### 1. BoardController (`boardController.js`)
Handles requests for projects/boards and task collection management for a specific board.

| Method | Express Route | Action | Status Code |
|---|---|---|---|
| `getBoards` | `GET /api/projects` / `GET /api/boards` | Retrieves all boards with aggregated `taskCount` and `doneCount` | 200 OK |
| `createBoard` | `POST /api/projects` / `POST /api/boards` | Validates and creates a new project board | 201 Created |
| `updateBoard` | `PATCH /api/projects/:id` | Updates name, key, or category of an existing board | 200 OK |
| `deleteBoard` | `DELETE /api/projects/:id` | Cascade deletes a board and all associated tasks | 204 No Content |
| `getBoardTasks` | `GET /api/projects/:boardId/tasks` | Fetches filtered tasks for the specified board | 200 OK |
| `reorderTasks` | `PATCH /api/projects/:boardId/tasks/reorder` | Atomically updates card positions within or across columns | 200 OK |

### 2. TaskController (`taskController.js`)
Handles individual task operations and comments.

| Method | Express Route | Action | Status Code |
|---|---|---|---|
| `getTaskById` | `GET /api/tasks/:id` | Fetches task document including embedded comments | 200 OK |
| `createTask` | `POST /api/tasks` | Generates sequential task key and persists new task | 201 Created |
| `updateTask` | `PATCH /api/tasks/:id` | Updates task fields (title, description, status, etc.) | 200 OK |
| `deleteTask` | `DELETE /api/tasks/:id` | Removes task document | 204 No Content |
| `addComment` | `POST /api/tasks/:id/comments` | Appends comment subdocument to the task | 201 Created |

### 3. SearchController (`searchController.js`)
Provides global multi-entity search across projects and tasks.

| Method | Express Route | Action | Status Code |
|---|---|---|---|
| `search` | `GET /api/search?q=:query` | Executes regex-based text search on boards and tasks | 200 OK |

### 4. AiController (`aiController.js`)
Manages real-time AI assistant streaming via Google Gemini.

| Method | Express Route | Action | Response Type |
|---|---|---|---|
| `chat` | `POST /api/ai/chat` | Streams token responses using HTTP chunked transfer | `text/plain; charset=utf-8` |

- Configures `Transfer-Encoding: chunked` headers.
- Writes chunks to `res` as SSE data arrives from the Gemini API.
- If an error occurs before streaming starts, removes the chunked header and delegates to `next(err)` to return clean JSON error payloads.
