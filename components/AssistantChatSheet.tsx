import React, { useEffect, useMemo, useRef } from 'react';
import type { AssistantMessage, AssistantSuggestion } from '../types';

interface AssistantChatSheetProps {
  open: boolean;
  onClose: () => void;
  messages: AssistantMessage[];
  suggestions: AssistantSuggestion[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (content?: string) => void;
  loading: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const AssistantChatSheet: React.FC<AssistantChatSheetProps> = ({
  open,
  onClose,
  messages,
  suggestions,
  inputValue,
  onInputChange,
  onSend,
  loading,
  errorMessage,
  onRetry,
}) => {
  const messageViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const viewport = messageViewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  const hasMessages = messages.length > 0;
  const introSuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  return (
    <div
      className={`fixed inset-0 z-[60] transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <section
        className={`absolute bottom-24 left-1/2 flex h-[min(72vh,620px)] w-[calc(100%-1rem)] max-w-[398px] -translate-x-1/2 flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="松小暖对话助手"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined fill-icon">smart_toy</span>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">松小暖</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                我可以帮你介绍机构、解释健康数据、查看服务日志，也能告诉你签约怎么走。
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors active:scale-95"
            aria-label="关闭松小暖助手"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div ref={messageViewportRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {!hasMessages && !loading && (
            <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
              <p className="text-sm font-bold text-slate-800">你好，我是松小暖。</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                你可以直接输入问题，也可以先点一个快捷问题，我会结合家属端当前的数据和功能来回答。
              </p>
            </div>
          )}

          {!hasMessages && (
            <div className="flex flex-wrap gap-2">
              {introSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSend(item.prompt)}
                  className="rounded-full bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {messages.map((message) => {
            const isAssistant = message.role === 'assistant';
            return (
              <div key={message.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[84%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                    isAssistant
                      ? 'rounded-tl-md bg-slate-50 text-slate-700'
                      : 'rounded-tr-md bg-primary text-white'
                  }`}
                >
                  <p>{message.content}</p>
                  {message.error_state && (
                    <p className="mt-2 text-[11px] font-semibold text-red-500">本次回复未成功写入模型结果，可稍后重试。</p>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-[22px] rounded-tl-md bg-slate-50 px-4 py-3 text-sm text-slate-500 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary/40" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary/80 [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-4">
          {errorMessage && (
            <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
              <div className="flex items-start justify-between gap-3">
                <span>{errorMessage}</span>
                {onRetry && (
                  <button onClick={onRetry} className="shrink-0 font-bold text-red-700">
                    重试
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => onSend(item.prompt)}
                className="whitespace-nowrap rounded-full bg-primary/5 px-3 py-2 text-[11px] font-bold text-primary"
              >
                {item.label}
              </button>
            ))}
          </div>

          <form
            className="flex items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              onSend();
            }}
          >
            <textarea
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="输入你想问的问题"
              rows={1}
              className="max-h-28 min-h-[48px] flex-1 resize-none rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-all disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              aria-label="发送消息"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AssistantChatSheet;
