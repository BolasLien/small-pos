import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../../../utils/storage';
import { createId } from '../../../utils/id';
import type { CartItem, MarketInfo, PaymentMethod, SaleRecord } from '../types';

const STORAGE_KEY = 'small-pos:sales';

export type UseSalesResult = {
  sales: SaleRecord[];
  addSale: (
    paymentMethod: PaymentMethod,
    items: CartItem[],
    market?: MarketInfo,
  ) => SaleRecord;
  deleteSale: (id: string) => SaleRecord | undefined;
};

export const useSales = (): UseSalesResult => {
  const [sales, setSales] = useState<SaleRecord[]>(() =>
    readStorage<SaleRecord[]>(STORAGE_KEY, []),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEY, sales);
  }, [sales]);

  const addSale = useCallback<UseSalesResult['addSale']>((paymentMethod, items, market) => {
    const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);
    const record: SaleRecord = {
      id: createId(),
      createdAt: new Date().toISOString(),
      paymentMethod,
      totalAmount,
      items,
      marketName: market?.name?.trim() || undefined,
      marketLocation: market?.location?.trim() || undefined,
    };
    setSales((prev) => [record, ...prev]);
    return record;
  }, []);

  const deleteSale = useCallback(
    (id: string): SaleRecord | undefined => {
      const target = sales.find((s) => s.id === id);
      setSales((prev) => prev.filter((s) => s.id !== id));
      return target;
    },
    [sales],
  );

  return { sales, addSale, deleteSale };
};
