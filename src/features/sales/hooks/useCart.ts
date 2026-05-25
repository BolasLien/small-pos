import { useCallback, useMemo, useState } from 'react';
import type { Product } from '../../products/types';
import type { CartItem } from '../types';

export type UseCartResult = {
  cartItems: CartItem[];
  totalAmount: number;
  addToCart: (product: Product) => { isAdded: boolean; reason?: string };
  increase: (productId: string, stockLimit: number) => void;
  decrease: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const recompute = (item: CartItem): CartItem => ({
  ...item,
  subtotal: item.price * item.quantity,
});

export const useCart = (): UseCartResult => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.subtotal, 0),
    [cartItems],
  );

  const addToCart = useCallback<UseCartResult['addToCart']>((product) => {
    if (!product.isActive) return { isAdded: false, reason: '商品未上架' };
    let result: { isAdded: boolean; reason?: string } = { isAdded: true };
    setCartItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      const currentQty = existing?.quantity ?? 0;
      if (currentQty + 1 > product.stock) {
        result = { isAdded: false, reason: '庫存不足' };
        return prev;
      }
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id ? recompute({ ...it, quantity: it.quantity + 1 }) : it,
        );
      }
      return [
        ...prev,
        recompute({
          productId: product.id,
          productName: product.name,
          productSeries: product.series,
          price: product.price,
          quantity: 1,
          subtotal: 0,
        }),
      ];
    });
    return result;
  }, []);

  const increase = useCallback((productId: string, stockLimit: number) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.productId === productId && it.quantity < stockLimit
          ? recompute({ ...it, quantity: it.quantity + 1 })
          : it,
      ),
    );
  }, []);

  const decrease = useCallback((productId: string) => {
    setCartItems((prev) =>
      prev
        .map((it) =>
          it.productId === productId ? recompute({ ...it, quantity: it.quantity - 1 }) : it,
        )
        .filter((it) => it.quantity > 0),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.productId !== productId));
  }, []);

  const clear = useCallback(() => setCartItems([]), []);

  return { cartItems, totalAmount, addToCart, increase, decrease, remove, clear };
};
