const router = require('express').Router();
const taskController = require('../controllers/taskController');
const { validateObjectIdParam } = require('../middleware/validate');

router.get('/:id', validateObjectIdParam('id'), taskController.getTaskById);
router.post('/', taskController.createTask);
router.patch('/:id', validateObjectIdParam('id'), taskController.updateTask);
router.delete('/:id', validateObjectIdParam('id'), taskController.deleteTask);
router.post('/:id/comments', validateObjectIdParam('id'), taskController.addComment);

module.exports = router;
