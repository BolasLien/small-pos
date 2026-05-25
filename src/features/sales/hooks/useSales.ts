import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '../../../utils/storage';
import { createId } from '../../../utils/id';
import type { CartItem, Channel, PaymentMethod, SaleRecord } from '../types';

const STORAGE_KEY = 'small-pos:sales';

type LegacySaleRecord = SaleRecord & {
  marketName?: string;
  marketLocation?: string;
};

const loadInitial = (): SaleRecord[] => {
  const raw = readStorage<LegacySaleRecord[]>(STORAGE_KEY, []);
  return raw.map(({ marketName, marketLocation, ...rest }) => ({
    ...rest,
    channelName: rest.channelName ?? marketName,
    channelLocation: rest.channelLocation ?? marketLocation,
  }));
};

export type UseSalesResult = {
  sales: SaleRecord[];
  addSale: (
    paymentMethod: PaymentMethod,
    items: CartItem[],
    channel?: Channel | null,
    note?: string,
  ) => SaleRecord;
  deleteSale: (id: string) => SaleRecord | undefined;
};

export const useSales = (): UseSalesResult => {
  const [sales, setSales] = useState<SaleRecord[]>(() => loadInitial());

  useEffect(() => {
    writeStorage(STORAGE_KEY, sales);
  }, [sales]);

  const addSale = useCallback<UseSalesResult['addSale']>(
    (paymentMethod, items, channel, note) => {
      const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);
      const trimmedNote = note?.trim();
      const record: SaleRecord = {
        id: createId(),
        createdAt: new Date().toISOString(),
        paymentMethod,
        totalAmount,
        items,
        channelName: channel?.name?.trim() || undefined,
        channelLocation: channel?.location?.trim() || undefined,
        note: trimmedNote || undefined,
      };
      setSales((prev) => [record, ...prev]);
      return record;
    },
    [],
  );

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
