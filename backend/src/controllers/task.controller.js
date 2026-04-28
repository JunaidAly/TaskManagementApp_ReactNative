const { validationResult } = require('express-validator');
const Task = require('../models/Task.model');

const getTasks = async (req, res) => {
  try {
    const { status, priority, category, isArchived, sortBy = 'createdAt', order = 'desc', search } = req.query;
    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (isArchived !== undefined) query.isArchived = isArchived === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = { [sortBy]: order === 'asc' ? 1 : -1 };
    const tasks = await Task.find(query).sort(sortObj);

    res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching tasks', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });
    res.status(200).json({ status: 'success', data: { task } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching task', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, dueDate, priority, status, category, subtasks, tags, recurrence } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      category: category || 'other',
      subtasks: subtasks || [],
      tags: tags || [],
      recurrence: recurrence || { enabled: false },
      userId: req.user._id,
    });

    res.status(201).json({ status: 'success', message: 'Task created successfully', data: { task } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error creating task', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, isArchived, category, subtasks, tags, recurrence } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (isArchived !== undefined) task.isArchived = isArchived;
    if (category !== undefined) task.category = category;
    if (subtasks !== undefined) task.subtasks = subtasks;
    if (tags !== undefined) task.tags = tags;
    if (recurrence !== undefined) task.recurrence = recurrence;

    await task.save();

    res.status(200).json({ status: 'success', message: 'Task updated successfully', data: { task } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error updating task', error: error.message });
  }
};

const toggleSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ status: 'error', message: 'Subtask not found' });

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({ status: 'success', data: { task } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error toggling subtask', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });
    res.status(200).json({ status: 'success', message: 'Task deleted successfully', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error deleting task', error: error.message });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [totalTasks, todoTasks, inProgressTasks, doneTasks, archivedTasks] = await Promise.all([
      Task.countDocuments({ userId, isArchived: false }),
      Task.countDocuments({ userId, status: 'todo', isArchived: false }),
      Task.countDocuments({ userId, status: 'in-progress', isArchived: false }),
      Task.countDocuments({ userId, status: 'done', isArchived: false }),
      Task.countDocuments({ userId, isArchived: true }),
    ]);

    res.status(200).json({
      status: 'success',
      data: { totalTasks, todoTasks, inProgressTasks, doneTasks, archivedTasks },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching stats', error: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedTasks = await Task.find({
      userId,
      status: 'done',
      completedAt: { $gte: thirtyDaysAgo },
      isArchived: false,
    }).select('completedAt dueDate category');

    // Daily completion map
    const dailyMap = {};
    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const day = task.completedAt.toISOString().split('T')[0];
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      }
    });

    // Past 7 days data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      weeklyData.push({ date: key, count: dailyMap[key] || 0, label: d.toLocaleDateString('en', { weekday: 'short' }) });
    }

    // Streak calculation (consecutive days with completions)
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const checkDate = new Date();
    if (!dailyMap[today]) checkDate.setDate(checkDate.getDate() - 1);
    for (let i = 0; i < 365; i++) {
      const key = checkDate.toISOString().split('T')[0];
      if (dailyMap[key]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    // Category breakdown
    const categoryBreakdown = await Task.aggregate([
      { $match: { userId, isArchived: false } },
      { $group: { _id: '$category', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    // On-time rate
    const tasksWithDueDate = completedTasks.filter((t) => t.dueDate && t.completedAt);
    const onTime = tasksWithDueDate.filter((t) => new Date(t.completedAt) <= new Date(t.dueDate)).length;
    const onTimeRate = tasksWithDueDate.length > 0 ? Math.round((onTime / tasksWithDueDate.length) * 100) : 100;

    res.status(200).json({
      status: 'success',
      data: {
        streak,
        weeklyData,
        categoryBreakdown,
        onTimeRate,
        totalCompletedLast30Days: completedTasks.length,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching analytics', error: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, toggleSubtask, deleteTask, getTaskStats, getAnalytics };
