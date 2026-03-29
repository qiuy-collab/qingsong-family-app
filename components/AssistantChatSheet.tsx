import React from 'react';
import type { AssistantItem } from './assistantData';

interface AssistantChatSheetProps {
  open: boolean;
  onClose: () => void;
  items: AssistantItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const AssistantChatSheet: React.FC<AssistantChatSheetProps> = ({
  open,
  onClose,
  items,
  selectedId,
  onSelect,
}) => {
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  return (
    <div
      className={`fixed inset-0 z-[60] transition-all duration-300 ${
        open ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <section
        className={`absolute bottom-24 left-1/2 w-[calc(100%-1rem)] max-w-[398px] -translate-x-1/2 rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="松小暖助手"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined fill-icon">smart_toy</span>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">松小暖</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                我可以先带你快速了解家属端已有功能。
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

        <div className="px-5 pb-5 pt-4">
          <div className="flex flex-wrap gap-2">
            {items.map((item) => {
              const active = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 min-h-36 rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
            {!selectedItem ? (
              <div className="flex min-h-28 flex-col justify-center gap-2">
                <p className="text-sm font-bold text-slate-800">你好，我是松小暖。</p>
                <p className="text-sm leading-6 text-slate-600">
                  你可以先点上面的快捷问题，我会用当前家属端已经有的功能来回答你。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                  {selectedItem.label}
                </div>
                <p className="text-sm leading-6 text-slate-700">{selectedItem.answer}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AssistantChatSheet;
