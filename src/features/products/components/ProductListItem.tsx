import type { Product } from '../types';

type ProductListItemProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export const ProductListItem = ({ product, onEdit, onDelete }: ProductListItemProps) => {
  const { name, series, price, stock, isActive, imageUrl } = product;

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl">💎</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
            {series}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isActive ? '上架' : '下架'}
          </span>
        </div>
        <p className="mt-1 truncate text-base font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">
          ${price} ・ 庫存 {stock}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
        >
          編輯
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`確定刪除「${name}」？`)) onDelete(product.id);
          }}
          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50"
        >
          刪除
        </button>
      </div>
    </article>
  );
};
