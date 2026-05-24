import { useEffect, useState } from 'react';
import type { MarketInfo } from '../types';

type MarketSessionBarProps = {
  market: MarketInfo;
  onChange: (next: MarketInfo) => void;
};

export const MarketSessionBar = ({ market, onChange }: MarketSessionBarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<MarketInfo>(market);

  useEffect(() => {
    if (!isEditing) setDraft(market);
  }, [market, isEditing]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(market);
    setIsEditing(false);
  };

  const hasInfo = market.name !== '' || market.location !== '';

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="space-y-2 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3"
      >
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="市集名稱"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            value={draft.location}
            onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
            placeholder="地點"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            儲存
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
        hasInfo
          ? 'border-indigo-200 bg-white hover:bg-indigo-50/40'
          : 'border-dashed border-gray-300 bg-white hover:border-indigo-300'
      }`}
    >
      <div className="min-w-0 flex-1">
        {hasInfo ? (
          <>
            <p className="truncate text-sm font-medium text-gray-900">
              📍 {market.name || '未命名市集'}
            </p>
            {market.location && (
              <p className="truncate text-xs text-gray-500">{market.location}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">📍 設定市集與地點（會記錄在每筆交易）</p>
        )}
      </div>
      <span className="shrink-0 text-xs font-medium text-indigo-600">編輯</span>
    </button>
  );
};
