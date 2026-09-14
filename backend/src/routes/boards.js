const router = require('express').Router();
const boardController = require('../controllers/boardController');
const { validateObjectIdParam } = require('../middleware/validate');

router.get('/', boardController.getBoards);
router.post('/', boardController.createBoard);
router.patch('/:id', validateObjectIdParam('id'), boardController.updateBoard);
router.delete('/:id', validateObjectIdParam('id'), boardController.deleteBoard);

// Board tasks & reordering
router.get('/:boardId/tasks', validateObjectIdParam('boardId'), boardController.getBoardTasks);
router.patch('/:boardId/tasks/reorder', validateObjectIdParam('boardId'), boardController.reorderTasks);

module.exports = router;
