const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    key:      { type: String, required: true, trim: true, uppercase: true },
    iconType: { type: String, default: 'code' },
    color:    { type: String, default: '#0052CC' },
    category: { type: String, default: 'Software project' },
  },
  { timestamps: true }
);

boardSchema.index({ name: 'text', key: 'text' });

boardSchema.methods.toClient = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('Board', boardSchema);
