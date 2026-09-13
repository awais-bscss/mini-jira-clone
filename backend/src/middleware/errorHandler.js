// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (!err.status || err.status >= 500) {
    console.error(`[ERROR] [${req.method} ${req.path}]`, err.stack || err.message);
  }

  // Handle invalid Mongoose ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Handle schema validation failure
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Handle duplicate unique key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `Duplicate value for ${field}` });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
