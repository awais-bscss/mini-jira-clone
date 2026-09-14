const boardService = require('../services/boardService');

class BoardController {
  async getBoards(_req, res, next) {
    try {
      const boards = await boardService.getAllBoardsWithCounts();
      res.json(boards);
    } catch (err) {
      next(err);
    }
  }

  async createBoard(req, res, next) {
    try {
      const board = await boardService.createBoard(req.body);
      res.status(201).json(board);
    } catch (err) {
      next(err);
    }
  }

  async updateBoard(req, res, next) {
    try {
      const board = await boardService.updateBoard(req.params.id, req.body);
      res.json(board);
    } catch (err) {
      next(err);
    }
  }

  async deleteBoard(req, res, next) {
    try {
      await boardService.deleteBoard(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getBoardTasks(req, res, next) {
    try {
      const data = await boardService.getBoardTasks(req.params.boardId, req.query);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async reorderTasks(req, res, next) {
    try {
      const updatedTask = await boardService.reorderBoardTasks(req.params.boardId, req.body);
      res.json(updatedTask);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BoardController();
