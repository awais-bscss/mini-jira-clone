const { isValidObjectId } = require('../utils/helpers');
const { BadRequestError } = require('../utils/errors');

function validateObjectIdParam(paramName = 'id') {
  return (req, _res, next) => {
    const id = req.params[paramName];
    if (!id || !isValidObjectId(id)) {
      return next(new BadRequestError(`Invalid ${paramName} format`));
    }
    next();
  };
}

module.exports = {
  validateObjectIdParam,
};
