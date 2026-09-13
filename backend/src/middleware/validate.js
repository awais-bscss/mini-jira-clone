const { isValidObjectId, requireFields, escapeRegex } = require('../utils/helpers');

function validateObjectIdParam(paramName = 'id') {
  const { BadRequestError } = require('../utils/errors');
  return (req, _res, next) => {
    const id = req.params[paramName];
    if (!id || !isValidObjectId(id)) {
      return next(new BadRequestError(`Invalid ${paramName} format`));
    }
    next();
  };
}

module.exports = {
  isValidObjectId,
  validateObjectIdParam,
  requireFields,
  escapeRegex,
};
