import { useState, useRef, useCallback, useEffect } from 'react';
import { streamAiChat } from '../api/ai.js';

export function useAiChat() {
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState(null);
  const [lastPrompt, setLastPrompt] = useState('');

  const abortRef = useRef(null);

  const ask = useCallback(async (promptText) => {
    const trimmed = (promptText ?? '').trim();
    if (!trimmed || isStreaming) return;

    setLastPrompt(trimmed);
    setError(null);
    setOutput('');
    setIsDone(false);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAiChat({
        prompt: trimmed,
        signal: controller.signal,
        onChunk: (chunk) => {
          setOutput((prev) => prev + chunk);
        },
      });
      setIsDone(true);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to generate response');
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const retry = useCallback(() => {
    if (lastPrompt) ask(lastPrompt);
  }, [lastPrompt, ask]);

  const clear = useCallback(() => {
    stop();
    setOutput('');
    setError(null);
    setIsDone(false);
    setLastPrompt('');
  }, [stop]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    output,
    isStreaming,
    isDone,
    error,
    lastPrompt,
    ask,
    stop,
    retry,
    clear,
    setError,
  };
}
