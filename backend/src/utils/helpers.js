const mongoose = require('mongoose');
const { BadRequestError } = require('./errors');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function requireFields(obj, fields) {
  const missing = fields.filter((f) => !obj[f] || String(obj[f]).trim() === '');
  if (missing.length) {
    throw new BadRequestError(`Missing required fields: ${missing.join(', ')}`);
  }
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = {
  isValidObjectId,
  requireFields,
  escapeRegex,
};
