const { BadRequestError, InternalServerError } = require('../utils/errors');

const GEMINI_MODEL = 'gemini-3.6-flash';

class AiService {
  async streamChat(prompt, onChunk) {
    const trimmed = prompt?.trim();
    if (!trimmed) throw new BadRequestError('Prompt is required');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerError('GEMINI_API_KEY is not configured on the server');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: trimmed }] }],
      }),
    });

    if (!geminiRes.ok) {
      const data = await geminiRes.json().catch(() => ({}));
      const errorMsg = data?.error?.message || `Gemini API returned status ${geminiRes.status}`;
      throw new InternalServerError(errorMsg);
    }

    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6));
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) onChunk(text);
          } catch {
            // Skip non-json lines
          }
        }
      }
    }
  }
}

module.exports = new AiService();
