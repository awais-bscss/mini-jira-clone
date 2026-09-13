const Board = require('../models/Board');
const Task = require('../models/Task');
const { escapeRegex } = require('../utils/helpers');

class SearchService {
  async search(queryString) {
    const q = queryString?.trim();
    if (!q) return { boards: [], tasks: [] };

    const regex = new RegExp(escapeRegex(q), 'i');

    const [boards, tasks] = await Promise.all([
      Board.find({ $or: [{ name: regex }, { key: regex }] }).limit(5).lean(),
      Task.find({ $or: [{ title: regex }, { taskKey: regex }] }).limit(8).lean(),
    ]);

    // Batch load boards to avoid N+1 queries
    const boardIds = [...new Set(tasks.map((t) => t.boardId.toString()))];
    const taskBoards = await Board.find({ _id: { $in: boardIds } }).lean();
    const boardMap = Object.fromEntries(
      taskBoards.map((b) => [b._id.toString(), b.name])
    );

    const mappedProjects = boards.map((b) => ({
      id:   b._id.toString(),
      name: b.name,
      key:  b.key,
    }));

    return {
      projects: mappedProjects,
      boards:   mappedProjects,
      tasks: tasks.map((t) => ({
        ...Task.toClient(t),
        projectName: boardMap[t.boardId.toString()] || 'Unknown project',
        boardName:   boardMap[t.boardId.toString()] || 'Unknown project',
      })),
    };
  }
}

module.exports = new SearchService();
