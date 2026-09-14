const Task = require('../models/Task');
const Counter = require('../models/Counter');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { isValidObjectId } = require('../utils/helpers');

class TaskService {
  async getTaskById(id) {
    const task = await Task.findById(id).lean();
    if (!task) throw new NotFoundError('Task not found');
    return Task.toClient(task);
  }

  async createTask(data = {}) {
    const { title, boardId, status = 'todo', description = '', labelId } = data;

    const trimmedTitle = String(title || '').trim();
    if (!trimmedTitle)              throw new BadRequestError('Title is required.');
    if (trimmedTitle.length < 3)    throw new BadRequestError('Title must be at least 3 characters.');
    if (trimmedTitle.length > 120)  throw new BadRequestError('Title must be 120 characters or fewer.');
    if (String(description).length > 5000) throw new BadRequestError('Description must be 5,000 characters or fewer.');
    if (!labelId)                   throw new BadRequestError('A label is required.');
    if (!isValidObjectId(boardId))  throw new BadRequestError('A valid boardId is required.');

    const seq         = await Counter.nextSeq('taskKey');
    const columnCount = await Task.countDocuments({ boardId, status });

    const task = await Task.create({
      ...data,
      title:   trimmedTitle,
      taskKey: `TASK-${seq}`,
      order:   columnCount,
    });

    return task.toClient();
  }

  async updateTask(id, updates = {}) {
    // Prevent overwriting protected fields
    // eslint-disable-next-line no-unused-vars
    const { taskKey, boardId, _id, ...allowedUpdates } = updates;

    const task = await Task.findByIdAndUpdate(id, allowedUpdates, { new: true, runValidators: true }).lean();
    if (!task) throw new NotFoundError('Task not found');
    return Task.toClient(task);
  }

  async deleteTask(id) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw new NotFoundError('Task not found');
    return true;
  }

  async getTaskComments(taskId, queryParams = {}) {
    const task = await Task.findById(taskId).lean();
    if (!task) throw new NotFoundError('Task not found');

    const { page = '1', limit = '20', search = '' } = queryParams;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    let allComments = task.comments || [];

    // Optional search within comments
    const trimmedSearch = String(search || '').trim().toLowerCase();
    if (trimmedSearch) {
      allComments = allComments.filter((c) =>
        c.text && c.text.toLowerCase().includes(trimmedSearch)
      );
    }

    // Sort newest first
    allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = allComments.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const skip = (pageNum - 1) * limitNum;
    const paginated = allComments.slice(skip, skip + limitNum);

    const formatted = paginated.map((c) => ({
      id:        c._id ? c._id.toString() : c.id,
      text:      c.text,
      authorId:  c.authorId,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : (c.createdAt || new Date().toISOString()),
    }));

    return {
      comments:   formatted,
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages,
      hasMore:    pageNum < totalPages,
    };
  }

  async addComment(taskId, commentData = {}) {
    const { text, authorId } = commentData;

    if (!text || String(text).trim() === '') throw new BadRequestError('Comment text is required.');

    const task = await Task.findById(taskId);
    if (!task) throw new NotFoundError('Task not found');

    task.comments.push({ text: text.trim(), authorId: authorId || 'user-1' });
    await task.save();

    const added = task.comments[task.comments.length - 1];
    return {
      id:        added._id.toString(),
      text:      added.text,
      authorId:  added.authorId,
      createdAt: added.createdAt.toISOString(),
    };
  }
}

module.exports = new TaskService();
