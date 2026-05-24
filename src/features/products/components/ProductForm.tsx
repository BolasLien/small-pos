import { useEffect, useState } from 'react';
import { PRODUCT_CATEGORIES, type Product, type ProductDraft } from '../types';

type ProductFormProps = {
  initial?: Product | null;
  onSubmit: (draft: ProductDraft) => void;
  onCancel: () => void;
};

const emptyDraft: ProductDraft = {
  name: '',
  category: '耳環',
  price: 0,
  stock: 0,
  isActive: true,
};

export const ProductForm = ({ initial, onSubmit, onCancel }: ProductFormProps) => {
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);

  useEffect(() => {
    if (initial) {
      const { name, category, price, stock, isActive } = initial;
      setDraft({ name, category, price, stock, isActive });
    } else {
      setDraft(emptyDraft);
    }
  }, [initial]);

  const isInvalid = draft.name.trim() === '' || draft.price < 0 || draft.stock < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;
    onSubmit({ ...draft, name: draft.name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900">
        {initial ? '編輯商品' : '新增商品'}
      </h2>

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">商品名稱</span>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
          placeholder="例如：珍珠耳環"
          required
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">分類</span>
        <select
          value={draft.category}
          onChange={(e) =>
            setDraft((d) => ({ ...d, category: e.target.value as ProductDraft['category'] }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-sm text-gray-600">價格</span>
          <input
            type="number"
            min={0}
            value={draft.price}
            onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) || 0 }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-gray-600">庫存</span>
          <input
            type="number"
            min={0}
            value={draft.stock}
            onChange={(e) => setDraft((d) => ({ ...d, stock: Number(e.target.value) || 0 }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700">上架販售</span>
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isInvalid}
          className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {initial ? '儲存' : '新增'}
        </button>
      </div>
    </form>
  );
};
