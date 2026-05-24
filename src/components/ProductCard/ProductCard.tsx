import type { Product } from '../../features/products/types';

type ProductCardProps = {
  product: Product;
  cartQuantity: number;
  onSelect: (product: Product) => void;
};

export const ProductCard = ({ product, cartQuantity, onSelect }: ProductCardProps) => {
  const { name, series, price, stock, imageUrl } = product;
  const isSoldOut = stock <= 0;
  const isMaxed = !isSoldOut && cartQuantity >= stock;
  const isDisabled = isSoldOut || isMaxed;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(product)}
      className={`group relative flex aspect-square w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition active:scale-[0.97] ${
        isDisabled
          ? 'cursor-not-allowed border-gray-200 opacity-60'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <div className="relative flex-1 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300">
            💎
          </div>
        )}

        <span className="absolute left-1.5 top-1.5 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-indigo-600 backdrop-blur">
          {series}
        </span>

        {cartQuantity > 0 && (
          <span className="absolute right-1.5 top-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white shadow">
            ×{cartQuantity}
          </span>
        )}

        {isSoldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
            缺貨
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-1 px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{name}</span>
        <span className="shrink-0 text-sm font-bold text-gray-900">${price}</span>
      </div>
    </button>
  );
};
