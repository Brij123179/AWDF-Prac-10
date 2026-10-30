import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Testing', 'Completed'],
      default: 'Planning'
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'DevOps', 'Mobile', 'FullStack'],
      default: 'Frontend'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    teamMembers: {
      type: [String],
      default: ['Lead Developer']
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
