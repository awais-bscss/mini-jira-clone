const aiService = require('../services/aiService');

class AiController {
  async chat(req, res, next) {
    try {
      const { prompt } = req.body;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      await aiService.streamChat(prompt, (chunk) => {
        res.write(chunk);
      });

      res.end();
    } catch (err) {
      if (!res.headersSent) {
        res.removeHeader('Transfer-Encoding');
        next(err);
      } else {
        res.end();
      }
    }
  }
}

module.exports = new AiController();
