import { apiClient } from './apiClient.js';

export async function streamAiChat({ prompt, signal, onChunk }) {
  const trimmed = prompt?.trim();
  if (!trimmed) throw new Error('Prompt is required');

  const res = await apiClient.stream('/api/ai/chat', {
    body: { prompt: trimmed },
    signal,
    fallbackMessage: 'AI request failed',
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onChunk(chunk);
  }
}
