import { useState } from 'react';
import { useAppContext } from '../../../store/AppContext';

type SeriesManagerProps = {
  onClose: () => void;
};

export const SeriesManager = ({ onClose }: SeriesManagerProps) => {
  const { seriesApi } = useAppContext();
  const { seriess, addSeries, renameSeries, deleteSeries, countBySeries } = seriesApi;

  const [newName, setNewName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = (name: string) => {
    const count = countBySeries(name);
    const msg =
      count > 0
        ? `「${name}」目前有 ${count} 個商品使用，無法刪除`
        : `確定刪除系列「${name}」？`;
    if (count > 0) {
      window.alert(msg);
      return;
    }
    if (!window.confirm(msg)) return;
    const result = deleteSeries(name);
    if (!result.isOk) {
      setError(result.reason ?? '刪除失敗');
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">系列管理</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          關閉
        </button>
      </div>

      <ul className="space-y-2">
        {seriess.length === 0 && (
          <li className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
            還沒有系列
          </li>
        )}
        {seriess.map((s) => {
          const isEditing = editingName === s;
          const count = countBySeries(s);
          return (
            <li
              key={s}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2"
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-lg border border-indigo-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      setEditingName(null);
                    }
                  }}
                />
              ) : (
                <div className="flex flex-1 items-center gap-2 px-1">
                  <span className="text-sm font-medium text-gray-900">{s}</span>
                  <span className="text-xs text-gray-400">{count} 項</span>
                </div>
              )}
              <div className="flex shrink-0 gap-1">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                    >
                      儲存
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(null);
                        setError(null);
                      }}
                      className="rounded-md border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(s)}
                      className="rounded-md border border-indigo-300 px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      className="rounded-md border border-rose-300 px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50"
                    >
                      刪除
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

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
