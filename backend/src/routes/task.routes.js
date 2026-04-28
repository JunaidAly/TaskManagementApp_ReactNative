const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, getTaskById, createTask, updateTask, toggleSubtask,
  deleteTask, getTaskStats, getAnalytics,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in-progress', 'done']),
  body('category').optional().isIn(['work', 'personal', 'health', 'shopping', 'finance', 'other']),
];

router.use(protect);

router.get('/stats/summary', getTaskStats);
router.get('/analytics', getAnalytics);
router.get('/', getTasks);
router.post('/', taskValidation, createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);
router.delete('/:id', deleteTask);

module.exports = router;
