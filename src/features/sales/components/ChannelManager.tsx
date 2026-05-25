import { useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppContext } from '../../../store/AppContext';
import type { Channel } from '../types';

type ChannelManagerProps = {
  onClose: () => void;
};

type SortableRowProps = {
  channel: Channel;
  isEditing: boolean;
  editName: string;
  editLocation: string;
  isDragDisabled: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onChangeName: (s: string) => void;
  onChangeLocation: (s: string) => void;
  onArchive: () => void;
  onDelete: () => void;
};

const SortableRow = ({
  channel,
  isEditing,
  editName,
  editLocation,
  isDragDisabled,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onChangeName,
  onChangeLocation,
  onArchive,
  onDelete,
}: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: channel.id,
    disabled: isDragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white p-2 ${
        isDragging ? 'border-indigo-300 shadow-md' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={isDragDisabled}
          aria-label="拖曳排序"
          className={`flex h-9 w-7 shrink-0 items-center justify-center rounded text-gray-400 touch-none ${
            isDragDisabled
              ? 'opacity-30'
              : 'cursor-grab hover:bg-gray-100 active:cursor-grabbing'
          }`}
        >
          <span className="text-base leading-none">⋮⋮</span>
        </button>

        {isEditing ? (
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => onChangeName(e.target.value)}
              autoFocus
              placeholder="通路名稱"
              className="w-full rounded-lg border border-indigo-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              value={editLocation}
              onChange={(e) => onChangeLocation(e.target.value)}
              placeholder="地點（選填）"
              className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500"
              >
                儲存
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="min-w-0 flex-1 px-1">
              <p className="truncate text-sm font-medium text-gray-900">{channel.name}</p>
              {channel.location && (
                <p className="truncate text-xs text-gray-500">📍 {channel.location}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <button
                type="button"
                onClick={onArchive}
                className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                隱藏
              </button>
              <button
                type="button"
                onClick={onStartEdit}
                className="rounded-md border border-indigo-300 px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
              >
                編輯
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md border border-rose-300 px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50"
              >
                刪除
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
};

type ArchivedRowProps = {
  channel: Channel;
  onUnarchive: () => void;
  onDelete: () => void;
};

const ArchivedRow = ({ channel, onUnarchive, onDelete }: ArchivedRowProps) => (
  <li className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 opacity-80">
    <div className="min-w-0 flex-1 px-1">
      <p className="truncate text-sm font-medium text-gray-600">{channel.name}</p>
      {channel.location && (
        <p className="truncate text-xs text-gray-400">📍 {channel.location}</p>
      )}
    </div>
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        onClick={onUnarchive}
        className="rounded-md border border-indigo-300 px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
      >
        顯示
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md border border-rose-300 px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50"
      >
        刪除
      </button>
    </div>
  </li>
);

export const ChannelManager = ({ onClose }: ChannelManagerProps) => {
  const { channelsApi } = useAppContext();
  const {
    channels,
    addChannel,
    updateChannel,
    deleteChannel,
    reorderChannels,
    setChannelArchived,
  } = channelsApi;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeChannels = useMemo(() => channels.filter((c) => !c.isArchived), [channels]);
  const archivedChannels = useMemo(() => channels.filter((c) => c.isArchived), [channels]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addChannel({ name: newName, location: newLocation || undefined });
    if (!result.isOk) {
      setError(result.reason ?? '新增失敗');
      return;
    }
    setNewName('');
    setNewLocation('');
    setError(null);
  };

  const handleStartEdit = (c: Channel) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditLocation(c.location ?? '');
    setError(null);
  };

  const handleSaveEdit = () => {
    if (editingId === null) return;
    const result = updateChannel(editingId, {
      name: editName,
      location: editLocation || undefined,
    });
    if (!result.isOk) {
      setError(result.reason ?? '更新失敗');
      return;
    }
    setEditingId(null);
    setEditName('');
    setEditLocation('');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const handleDelete = (c: Channel) => {
    const label = c.location ? `${c.name} ・ ${c.location}` : c.name;
    if (!window.confirm(`刪除通路「${label}」？舊紀錄會保留不變`)) return;
    deleteChannel(c.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = channels.findIndex((c) => c.id === active.id);
    const toIndex = channels.findIndex((c) => c.id === over.id);
    if (fromIndex < 0 || toIndex < 0) return;
    reorderChannels(fromIndex, toIndex);
  };

  return (
    <div className="max-h-[85vh] space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">通路管理</h2>
          <p className="text-xs text-gray-400">不會再去的市集可以「隱藏」，舊紀錄保留</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          關閉
        </button>
      </div>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xs font-semibold text-gray-700">啟用中</h3>
          <span className="text-xs text-gray-400">{activeChannels.length} 個</span>
        </div>
        {activeChannels.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            目前沒有啟用中的通路
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeChannels.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {activeChannels.map((c) => (
                  <SortableRow
                    key={c.id}
                    channel={c}
                    isEditing={editingId === c.id}
                    editName={editName}
                    editLocation={editLocation}
                    isDragDisabled={editingId !== null}
                    onStartEdit={() => handleStartEdit(c)}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onChangeName={setEditName}
                    onChangeLocation={setEditLocation}
                    onArchive={() => setChannelArchived(c.id, true)}
                    onDelete={() => handleDelete(c)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {archivedChannels.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs font-semibold text-gray-700">已隱藏</h3>
            <span className="text-xs text-gray-400">{archivedChannels.length} 個</span>
          </div>
          <ul className="space-y-2">
            {archivedChannels.map((c) => (
              <ArchivedRow
                key={c.id}
                channel={c}
                onUnarchive={() => setChannelArchived(c.id, false)}
                onDelete={() => handleDelete(c)}
              />
            ))}
          </ul>
        </section>
      )}

      <form onSubmit={handleAdd} className="space-y-2 border-t border-gray-100 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="通路名稱（例：彩虹市集 / IG）"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="地點（選填）"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + 新增通路
        </button>
      </form>

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};
