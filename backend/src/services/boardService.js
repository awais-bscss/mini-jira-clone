const Board = require('../models/Board');
const Task = require('../models/Task');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { escapeRegex, requireFields } = require('../utils/helpers');

const VALID_STATUSES = ['todo', 'in-progress', 'in-review', 'done'];

class BoardService {
  async getAllBoardsWithCounts() {
    const boards = await Board.find().sort({ createdAt: 1 }).lean();

    // Group task counts by board and status in one query
    const taskCounts = await Task.aggregate([
      {
        $group: {
          _id: { boardId: '$boardId', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    taskCounts.forEach(({ _id, count }) => {
      const bid = _id.boardId.toString();
      if (!countMap[bid]) {
        countMap[bid] = { taskCount: 0, doneCount: 0 };
      }
      countMap[bid].taskCount += count;
      if (_id.status === 'done') {
        countMap[bid].doneCount += count;
      }
    });

    return boards.map((b) => ({
      ...b,
      id: b._id.toString(),
      ...(countMap[b._id.toString()] || { taskCount: 0, doneCount: 0 }),
    }));
  }

  async createBoard(data = {}) {
    requireFields(data, ['name', 'key']);

    const name = String(data.name || '').trim();
    const key = String(data.key || '').trim().toUpperCase();
    const category = String(data.category || 'Software project').trim();

    if (name.length < 2) throw new BadRequestError('Project name must be at least 2 characters.');
    if (name.length > 80) throw new BadRequestError('Project name must be 80 characters or fewer.');
    if (!/^[A-Z]{2,6}$/.test(key)) throw new BadRequestError('Project key must be 2 to 6 uppercase letters (e.g. PROJ).');
    if (category.length > 50) throw new BadRequestError('Category must be 50 characters or fewer.');

    const existing = await Board.findOne({ key }).lean();
    if (existing) throw new BadRequestError(`A project with key "${key}" already exists.`);

    const board = await Board.create({
      ...data,
      name,
      key,
      category,
    });

    return {
      ...board.toObject(),
      id: board._id.toString(),
      taskCount: 0,
      doneCount: 0,
    };
  }

  async updateBoard(id, data = {}) {
    const updates = { ...data };

    if (updates.name !== undefined) {
      const name = String(updates.name).trim();
      if (name.length < 2) throw new BadRequestError('Project name must be at least 2 characters.');
      if (name.length > 80) throw new BadRequestError('Project name must be 80 characters or fewer.');
      updates.name = name;
    }

    if (updates.key !== undefined) {
      const key = String(updates.key).trim().toUpperCase();
      if (!/^[A-Z]{2,6}$/.test(key)) throw new BadRequestError('Project key must be 2 to 6 uppercase letters.');
      const existing = await Board.findOne({ key, _id: { $ne: id } }).lean();
      if (existing) throw new BadRequestError(`A project with key "${key}" already exists.`);
      updates.key = key;
    }

    if (updates.category !== undefined) {
      const category = String(updates.category).trim();
      if (category.length > 50) throw new BadRequestError('Category must be 50 characters or fewer.');
      updates.category = category;
    }

    const board = await Board.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!board) throw new NotFoundError('Board not found');
    return { ...board, id: board._id.toString() };
  }

  async deleteBoard(id) {
    const board = await Board.findByIdAndDelete(id);
    if (!board) throw new NotFoundError('Board not found');

    // Cascade delete tasks
    await Task.deleteMany({ boardId: id });
    return true;
  }

  async getBoardTasks(boardId, queryParams = {}) {
    const {
      status,
      assigneeId,
      labelId,
      search,
      page = '1',
      limit = '1000',
    } = queryParams;

    const query = { boardId };
    if (status) query.status = status;
    if (assigneeId) {
      // 'unassigned' is a sentinel value meaning "tasks with no assignee"
      query.assigneeId = assigneeId === 'unassigned' ? null : assigneeId;
    }
    if (labelId) query.labelId = labelId;
    if (search) {
      const re = { $regex: escapeRegex(search), $options: 'i' };
      query.$or = [{ title: re }, { taskKey: re }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(1000, parseInt(limit, 10) || 1000);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ order: 1 }).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(query),
    ]);

    return {
      tasks: tasks.map((t) => Task.toClient(t)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async reorderBoardTasks(boardId, payload = {}) {
    const { taskId, newStatus, newOrder, oldStatus } = payload;

    if (!taskId || !newStatus || newOrder === undefined) {
      throw new BadRequestError('taskId, newStatus, and newOrder are required');
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestError(`newStatus must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status: newStatus, order: Number(newOrder) },
      { new: true }
    );

    if (!task) throw new NotFoundError('Task not found');

    // Re-index target column
    const destTasks = await Task.find({ boardId, status: newStatus })
      .sort({ order: 1, _id: 1 })
      .select('_id');

    const destBulk = destTasks.map((t, i) => ({
      updateOne: { filter: { _id: t._id }, update: { $set: { order: i } } },
    }));

    if (destBulk.length) {
      await Task.bulkWrite(destBulk);
    }

    // Re-index previous column if moved across columns
    if (oldStatus && oldStatus !== newStatus) {
      const srcTasks = await Task.find({ boardId, status: oldStatus })
        .sort({ order: 1, _id: 1 })
        .select('_id');

      const srcBulk = srcTasks.map((t, i) => ({
        updateOne: { filter: { _id: t._id }, update: { $set: { order: i } } },
      }));

      if (srcBulk.length) {
        await Task.bulkWrite(srcBulk);
      }
    }

    const updated = await Task.findById(taskId).lean();
    return Task.toClient(updated);
  }
}

module.exports = new BoardService();
