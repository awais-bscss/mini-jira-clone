const taskService = require('../services/taskService');

class TaskController {
  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.json(task);
    } catch (err) {
      next(err);
    }
  }

  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      res.json(task);
    } catch (err) {
      next(err);
    }
  }

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getTaskComments(req, res, next) {
    try {
      const result = await taskService.getTaskComments(req.params.id, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async addComment(req, res, next) {
    try {
      const comment = await taskService.addComment(req.params.id, req.body);
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TaskController();
