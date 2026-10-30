import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user']
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return v && v.trim().length > 0;
        },
        message: 'Task title cannot be an empty string'
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority level. Must be low, medium, or high'
      },
      default: 'medium',
      lowercase: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

taskSchema.pre('save', function (next) {
  if (this.title && typeof this.title === 'string') {
    this.title = this.title.trim();
  }
  next();
});

taskSchema.index({ title: 'text', description: 'text' });

/* ==========================================================================
   Query Optimization: Compound Indexes
   Enables Index Scan (IXSCAN) for user-scoped filtering and sorting.
   ========================================================================== */
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, completed: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
