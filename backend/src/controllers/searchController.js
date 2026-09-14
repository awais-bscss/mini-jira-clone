const searchService = require('../services/searchService');

class SearchController {
  async search(req, res, next) {
    try {
      const results = await searchService.search(req.query.q);
      res.json(results);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
