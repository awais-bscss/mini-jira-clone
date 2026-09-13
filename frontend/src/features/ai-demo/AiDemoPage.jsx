import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import { useAiChat } from '../../hooks/useAiChat.js';

export function AiDemoPage() {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const {
    output,
    isStreaming,
    isDone,
    error,
    lastPrompt,
    ask,
    stop,
    retry,
    setError,
  } = useAiChat();

  const handleAsk = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed || isStreaming) return;
    ask(trimmed);
  }, [prompt, isStreaming, ask]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="flex-1 h-full overflow-y-auto w-full bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-10 pb-28">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0052CC] flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Assistant</h1>
            <p className="text-sm text-slate-500">How can I help you today?</p>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6">
          <textarea
            id="ai-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="How can I help you today? Ask a question..."
            rows={3}
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none"
            disabled={isStreaming}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Press Enter to ask</p>
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                  Stop
                </button>
              ) : (
                <>
                  {lastPrompt && (
                    <button
                      type="button"
                      onClick={retry}
                      className="btn-secondary text-xs flex items-center gap-1.5"
                      title={`Retry: "${lastPrompt}"`}
                    >
                      <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAsk}
                    disabled={!prompt.trim()}
                    className="btn-primary text-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Ask
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <div className="flex items-center gap-3">
              {lastPrompt && (
                <button
                  type="button"
                  onClick={retry}
                  className="font-semibold underline text-red-700 hover:text-red-900"
                >
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Response */}
        {(output || isStreaming) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-semibold text-slate-700">AI Response</span>
              {isStreaming ? (
                <span className="flex items-center gap-1.5 text-xs text-[#0052CC] font-medium">
                  <svg className="w-3.5 h-3.5 animate-spin text-[#0052CC]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Streaming
                </span>
              ) : isDone ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium mr-2">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete
                  </span>
                  <button
                    type="button"
                    onClick={retry}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                    title="Regenerate response"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="p-6 text-sm text-slate-700 leading-relaxed break-words space-y-2">
              <Markdown>{output}</Markdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
