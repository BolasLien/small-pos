import { useEffect, useRef, useState } from 'react';
import { PRODUCT_SERIES, type Product, type ProductDraft } from '../types';
import { resizeImageToDataUrl } from '../../../utils/image';

type ProductFormProps = {
  initial?: Product | null;
  onSubmit: (draft: ProductDraft) => void;
  onCancel: () => void;
};

const emptyDraft: ProductDraft = {
  name: '',
  series: '耳環',
  price: 0,
  stock: 0,
  isActive: true,
  imageUrl: undefined,
};

export const ProductForm = ({ initial, onSubmit, onCancel }: ProductFormProps) => {
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initial) {
      const { name, series, price, stock, isActive, imageUrl } = initial;
      setDraft({ name, series, price, stock, isActive, imageUrl });
    } else {
      setDraft(emptyDraft);
    }
    setErrorText(null);
  }, [initial]);

  const isInvalid = draft.name.trim() === '' || draft.price < 0 || draft.stock < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;
    onSubmit({ ...draft, name: draft.name.trim() });
  };

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorText(null);
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setDraft((d) => ({ ...d, imageUrl: dataUrl }));
    } catch {
      setErrorText('圖片處理失敗，請換一張試試');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setDraft((d) => ({ ...d, imageUrl: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900">
        {initial ? '編輯商品' : '新增商品'}
      </h2>

      <div className="space-y-2">
        <span className="text-sm text-gray-600">商品圖片</span>
        <div className="flex items-center gap-3">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
            {draft.imageUrl ? (
              <img src={draft.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400">尚未上傳</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
            >
              {isProcessing ? '處理中…' : draft.imageUrl ? '更換圖片' : '上傳圖片'}
            </button>
            {draft.imageUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                移除圖片
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickImage}
            />
          </div>
        </div>
        {errorText && <p className="text-xs text-rose-500">{errorText}</p>}
      </div>

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
        <span className="text-sm text-gray-600">系列</span>
        <select
          value={draft.series}
          onChange={(e) =>
            setDraft((d) => ({ ...d, series: e.target.value as ProductDraft['series'] }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
        >
          {PRODUCT_SERIES.map((s) => (
            <option key={s} value={s}>
              {s}
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
          disabled={isInvalid || isProcessing}
          className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {initial ? '儲存' : '新增'}
        </button>
      </div>
    </form>
  );
};
