import { useState } from 'react';
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

type SeriesManagerProps = {
  onClose: () => void;
};

type SortableSeriesRowProps = {
  name: string;
  count: number;
  isEditing: boolean;
  editDraft: string;
  isDragDisabled: boolean;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onChangeDraft: (next: string) => void;
  onDelete: () => void;
};

const SortableSeriesRow = ({
  name,
  count,
  isEditing,
  editDraft,
  isDragDisabled,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onChangeDraft,
  onDelete,
}: SortableSeriesRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: name, disabled: isDragDisabled });

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
      className={`flex items-center gap-2 rounded-lg border bg-white p-2 ${
        isDragging ? 'border-indigo-300 shadow-md' : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={isDragDisabled}
        aria-label="拖曳排序"
        className={`flex h-8 w-7 shrink-0 items-center justify-center rounded text-gray-400 touch-none ${
          isDragDisabled ? 'opacity-30' : 'cursor-grab hover:bg-gray-100 active:cursor-grabbing'
        }`}
      >
        <span className="text-base leading-none">⋮⋮</span>
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editDraft}
          onChange={(e) => onChangeDraft(e.target.value)}
          autoFocus
          className="flex-1 rounded-lg border border-indigo-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSaveEdit();
            } else if (e.key === 'Escape') {
              onCancelEdit();
            }
          }}
        />
      ) : (
        <div className="flex flex-1 items-center gap-2 px-1">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <span className="text-xs text-gray-400">{count} 項</span>
        </div>
      )}

      <div className="flex shrink-0 gap-1">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onSaveEdit}
              className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500"
            >
              儲存
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </li>
  );
};

export const SeriesManager = ({ onClose }: SeriesManagerProps) => {
  const { seriesApi } = useAppContext();
  const { seriess, addSeries, renameSeries, deleteSeries, reorderSeries, countBySeries } =
    seriesApi;

  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addSeries(newName);
    if (!result.isOk) {
      setError(result.reason ?? '新增失敗');
      return;
    }
    setNewName('');
    setError(null);
  };

  const handleStartEdit = (name: string) => {
    setEditingName(name);
    setEditDraft(name);
    setError(null);
  };

  const handleSaveEdit = () => {
    if (editingName === null) return;
    const result = renameSeries(editingName, editDraft);
    if (!result.isOk) {
      setError(result.reason ?? '更新失敗');
      return;
    }
    setEditingName(null);
    setEditDraft('');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingName(null);
    setError(null);
  };

  const handleDelete = (name: string) => {
    const count = countBySeries(name);
    if (count > 0) {
      window.alert(`「${name}」目前有 ${count} 個商品使用，無法刪除`);
      return;
    }
    if (!window.confirm(`確定刪除系列「${name}」？`)) return;
    const result = deleteSeries(name);
    if (!result.isOk) {
      setError(result.reason ?? '刪除失敗');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = seriess.indexOf(String(active.id));
    const toIndex = seriess.indexOf(String(over.id));
    if (fromIndex < 0 || toIndex < 0) return;
    reorderSeries(fromIndex, toIndex);
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">系列管理</h2>
          <p className="text-xs text-gray-400">長按左側 ⋮⋮ 拖曳排序</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          關閉
        </button>
      </div>

      {seriess.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
          還沒有系列
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={seriess} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {seriess.map((s) => (
                <SortableSeriesRow
                  key={s}
                  name={s}
                  count={countBySeries(s)}
                  isEditing={editingName === s}
                  editDraft={editDraft}
                  isDragDisabled={editingName !== null}
                  onStartEdit={() => handleStartEdit(s)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onChangeDraft={setEditDraft}
                  onDelete={() => handleDelete(s)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 border-t border-gray-100 pt-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新增系列名稱"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          新增
        </button>
      </form>

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};
