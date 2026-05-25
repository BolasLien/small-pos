import { useState } from 'react';
import type { Channel } from '../types';

type ChannelPickerProps = {
  channels: Channel[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onOpenManager: () => void;
  onQuickAdd: (draft: { name: string; location?: string }) => {
    isOk: boolean;
    reason?: string;
    channel?: Channel;
  };
};

export const ChannelPicker = ({
  channels,
  currentId,
  onSelect,
  onOpenManager,
  onQuickAdd,
}: ChannelPickerProps) => {
  const visibleChannels = channels.filter((c) => !c.isArchived);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onQuickAdd({ name: newName, location: newLocation || undefined });
    if (!result.isOk) {
      setError(result.reason ?? '新增失敗');
      return;
    }
    if (result.channel) onSelect(result.channel.id);
    setNewName('');
    setNewLocation('');
    setError(null);
    setIsAdding(false);
  };

  return (
    <section className="space-y-2 rounded-2xl border border-gray-200 bg-white p-3">
      <header className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">📍 銷售通路</span>
        <button
          type="button"
          onClick={onOpenManager}
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          管理
        </button>
      </header>

      {visibleChannels.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-3 text-center text-xs text-gray-500">
          {channels.length === 0
            ? '還沒有通路，點下方「+ 新增通路」或右上「管理」開始建立'
            : '所有通路目前都已隱藏，至「管理」可重新顯示'}
        </p>
      ) : (
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
          {visibleChannels.map((c) => {
            const isActive = c.id === currentId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={`max-w-full truncate rounded-full border px-3 py-1.5 text-sm transition ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                }`}
              >
                {c.name}
                {c.location && (
                  <span className={`ml-1 text-xs ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                    @{c.location}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isAdding ? (
        <form onSubmit={handleQuickAdd} className="space-y-2 rounded-lg bg-gray-50 p-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="通路名稱"
              autoFocus
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="地點（選填）"
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewName('');
                setNewLocation('');
                setError(null);
              }}
              className="rounded-md px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              新增並選用
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full rounded-lg border border-dashed border-gray-300 py-1.5 text-xs text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
        >
          + 新增通路
        </button>
      )}
    </section>
  );
};
