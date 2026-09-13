const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text:      { type: String, required: true, trim: true },
  authorId:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    taskKey:     { type: String, required: true },
    boardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'in-review', 'done'],
      default: 'todo',
    },
    type: {
      type: String,
      enum: ['task', 'bug', 'story', 'epic'],
      default: 'task',
    },
    assigneeId: { type: String, default: null },
    labelId:    { type: String, default: null },
    dueDate:    { type: Date,   default: null },
    order:      { type: Number, default: 0 },
    comments:   [commentSchema],
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', taskKey: 'text' });

taskSchema.statics.deleteByBoard = async function (boardId) {
  return this.deleteMany({ boardId });
};

// Shape document for client
function toClient(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id      = obj._id.toString();
  obj.boardId = obj.boardId.toString();
  if (obj.dueDate)    obj.dueDate    = obj.dueDate.toISOString();
  if (obj.createdAt)  obj.createdAt  = obj.createdAt.toISOString();
  if (obj.updatedAt)  obj.updatedAt  = obj.updatedAt.toISOString();
  if (obj.comments) {
    obj.comments = obj.comments.map((c) => ({
      ...c,
      id: c._id.toString(),
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    }));
  }
  return obj;
}

taskSchema.methods.toClient = function () { return toClient(this); };
taskSchema.statics.toClient = toClient;

module.exports = mongoose.model('Task', taskSchema);
