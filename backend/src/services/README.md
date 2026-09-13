# Backend Services

This directory contains the core business logic layer of the application. Services interact with Mongoose models, execute database transactions and aggregations, and integrate with external APIs.

---

## Services Summary

### 1. BoardService (`boardService.js`)
Encapsulates project board operations, aggregated metrics, and Kanban column re-indexing.

- **`getAllBoardsWithCounts()`**:
  - Fetches all boards sorted by creation date.
  - Runs MongoDB aggregation pipeline against the `Task` collection to compute `taskCount` and `doneCount` (where `status: 'done'`) per board in a single batch query.
- **`createBoard(data)`**:
  - Validates project key format (2 to 6 uppercase letters).
  - Checks for existing keys in database to prevent collisions.
  - Persists the board and returns initialized counts (`taskCount: 0`, `doneCount: 0`).
- **`updateBoard(id, data)`**:
  - Applies partial updates (`name`, `key`, `category`).
  - Verifies key uniqueness against other board records.
- **`deleteBoard(id)`**:
  - Removes the board document and cascade-deletes all associated tasks via `Task.deleteMany({ boardId: id })`.
- **`getBoardTasks(boardId, queryParams)`**:
  - Queries tasks scoped to `boardId`.
  - Applies filters: `status`, `assigneeId` (interprets `'unassigned'` as `null`), `labelId`, and regex text search on `title` or `taskKey`.
  - Sorts by `{ order: 1 }` with pagination support.
- **`reorderBoardTasks(boardId, payload)`**:
  - Handles drag-and-drop card position updates (`taskId`, `newStatus`, `newOrder`, `oldStatus`).
  - Updates target task's status and order.
  - Re-sequences target column tasks to contiguous zero-indexed order using `Task.bulkWrite()`.
  - Re-sequences previous column tasks when cards move across columns.

---

### 2. TaskService (`taskService.js`)
Manages task lifecycle, atomic sequential key generation, and comment threads.

- **`getTaskById(id)`**:
  - Fetches task document and formats timestamps and subdocuments via `Task.toClient()`.
- **`createTask(data)`**:
  - Validates board existence.
  - Retrieves atomic sequence number from `Counter.getNextSequence(board.key)`.
  - Generates immutable Jira task identifier (e.g. `DS-1`, `DS-2`).
  - Assigns initial `order` index based on current column card count.
- **`updateTask(id, data)`**:
  - Updates title, description, type, assignee, label, due date, or status.
- **`deleteTask(id)`**:
  - Deletes task and re-indexes remaining column tasks.
- **`addComment(taskId, data)`**:
  - Validates comment text and author identifier.
  - Appends comment to task `comments` array and saves.

---

### 3. SearchService (`searchService.js`)
Powers the application-wide global search.

- **`search(queryString)`**:
  - Performs case-insensitive regex search across `Board` (`name`, `key`) and `Task` (`title`, `taskKey`).
  - Limits results to 5 boards and 8 tasks for optimal response times.
  - Batch-loads parent board documents using `$in` query to attach `projectName` to matching task items without N+1 query overhead.
  - Returns unified payload containing `projects`, `boards`, and `tasks`.

---

### 4. AiService (`aiService.js`)
Integrates with Google Gemini API for real-time AI assistant generation.

- **`streamChat(prompt, onChunk)`**:
  - Calls `gemini-3.6-flash` model endpoint using `streamGenerateContent?alt=sse`.
  - Streams response body using `TextDecoder`.
  - Parses SSE lines prefixed with `data: `, extracts token parts from JSON payload, and executes the `onChunk` callback for immediate HTTP streaming.
