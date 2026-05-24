import type { CartItem } from '../../features/sales/types';
import type { Product } from '../../features/products/types';

type CartPanelProps = {
  cartItems: CartItem[];
  totalAmount: number;
  products: Product[];
  onIncrease: (productId: string, stockLimit: number) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
};

export const CartPanel = ({
  cartItems,
  totalAmount,
  products,
  onIncrease,
  onDecrease,
  onRemove,
}: CartPanelProps) => {
  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        點選上方商品加入交易
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700">本次交易</h3>
      <ul className="divide-y divide-gray-100">
        {cartItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const stockLimit = product?.stock ?? item.quantity;
          const isAtMax = item.quantity >= stockLimit;
          return (
            <li key={item.productId} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500">
                  ${item.price} × {item.quantity}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDecrease(item.productId)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg text-gray-700 active:bg-gray-100"
                  aria-label="減少數量"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onIncrease(item.productId, stockLimit)}
                  disabled={isAtMax}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg text-gray-700 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="增加數量"
                >
                  +
                </button>
                <span className="w-16 text-right text-sm font-semibold">${item.subtotal}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="ml-1 text-xs text-rose-500 hover:underline"
                >
                  移除
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-600">總金額</span>
        <span className="text-2xl font-bold text-gray-900">${totalAmount}</span>
      </div>
    </div>
  );
};
