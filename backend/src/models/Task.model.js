const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  completed: { type: Boolean, default: false },
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'shopping', 'finance', 'other'],
    default: 'other',
  },
  isArchived: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subtasks: [subtaskSchema],
  tags: [{ type: String, trim: true, maxlength: 30 }],
  recurrence: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: { type: Number, default: 1, min: 1, max: 30 },
  },
  completedAt: { type: Date, default: null },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, isArchived: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, completedAt: 1 });

// Auto-set completedAt when status changes to done
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
