import type { Product } from '../../features/products/types';

type ProductCardProps = {
  product: Product;
  cartQuantity: number;
  onSelect: (product: Product) => void;
};

export const ProductCard = ({ product, cartQuantity, onSelect }: ProductCardProps) => {
  const { name, category, price, stock } = product;
  const isSoldOut = stock <= 0;
  const isMaxed = !isSoldOut && cartQuantity >= stock;
  const isDisabled = isSoldOut || isMaxed;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(product)}
      className={`relative flex h-full w-full flex-col items-start gap-1 rounded-2xl border p-4 text-left shadow-sm transition active:scale-[0.98] ${
        isDisabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
        {category}
      </span>
      <span className="mt-1 text-base font-semibold text-gray-900">{name}</span>
      <span className="text-lg font-bold text-gray-900">${price}</span>
      <span className={`text-xs ${stock <= 3 ? 'text-rose-500' : 'text-gray-500'}`}>
        庫存 {stock}
      </span>
      {cartQuantity > 0 && (
        <span className="absolute right-3 top-3 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-indigo-600 px-2 text-sm font-semibold text-white">
          ×{cartQuantity}
        </span>
      )}
      {isSoldOut && (
        <span className="absolute right-3 top-3 rounded-full bg-gray-700 px-2 py-0.5 text-xs text-white">
          缺貨
        </span>
      )}
    </button>
  );
};
