/**
 * Task Controller
 * Handles CRUD operations for tasks
 */

const { validationResult } = require('express-validator');
const Task = require('../models/Task.model');

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 * @query   status, priority, isArchived, sortBy, order
 */
const getTasks = async (req, res) => {
  try {
    const { status, priority, isArchived, sortBy = 'createdAt', order = 'desc', search } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (isArchived !== undefined) query.isArchived = isArchived === 'true';

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const tasks = await Task.find(query).sort(sortObj);

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, dueDate, priority, status } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      userId: req.user._id
    });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating task',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, isArchived } = req.body;

    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (isArchived !== undefined) task.isArchived = isArchived;

    await task.save();

    res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating task',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting task',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/tasks/stats/summary
 * @desc    Get task statistics for dashboard
 * @access  Private
 */
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, archivedTasks] = await Promise.all([
      Task.countDocuments({ userId, isArchived: false }),
      Task.countDocuments({ userId, status: 'todo', isArchived: false }),
      Task.countDocuments({ userId, status: 'in-progress', isArchived: false }),
      Task.countDocuments({ userId, status: 'done', isArchived: false }),
      Task.countDocuments({ userId, isArchived: true })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        archivedTasks
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task statistics',
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};
