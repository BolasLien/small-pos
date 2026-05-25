import { useMemo } from 'react';
import type { Product } from '../../products/types';
import { formatChannelLabel, type CartItem, type SaleRecord } from '../../sales/types';

export type BreakdownMode = 'series' | 'product';

export type ItemAmount = {
  key: string;
  label: string;
  quantity: number;
  revenue: number;
};

export type ChannelGroup = {
  label: string;
  revenue: number;
  count: number;
  byItem: ItemAmount[];
};

const UNASSIGNED_CHANNEL = '未指定通路';
const UNKNOWN_SERIES = '未知系列';

const resolveSeries = (item: CartItem, productMap: Map<string, Product>): string =>
  item.productSeries ?? productMap.get(item.productId)?.series ?? UNKNOWN_SERIES;

export const useChannelItemBreakdown = (
  sales: SaleRecord[],
  products: Product[],
  mode: BreakdownMode,
): ChannelGroup[] => {
  return useMemo(() => {
    const productMap = new Map<string, Product>();
    products.forEach((p) => productMap.set(p.id, p));

    const channelMap = new Map<
      string,
      { revenue: number; count: number; items: Map<string, ItemAmount> }
    >();

    sales.forEach((s) => {
      const label = formatChannelLabel(s.channelName, s.channelLocation) || UNASSIGNED_CHANNEL;
      const group = channelMap.get(label) ?? {
        revenue: 0,
        count: 0,
        items: new Map<string, ItemAmount>(),
      };
      group.revenue += s.totalAmount;
      group.count += 1;
      s.items.forEach((item) => {
        const key =
          mode === 'series'
            ? resolveSeries(item, productMap)
            : (item.productId || item.productName);
        const itemLabel =
          mode === 'series' ? resolveSeries(item, productMap) : item.productName;
        const prev = group.items.get(key) ?? {
          key,
          label: itemLabel,
          quantity: 0,
          revenue: 0,
        };
        prev.quantity += item.quantity;
        prev.revenue += item.subtotal;
        group.items.set(key, prev);
      });
      channelMap.set(label, group);
    });

    return [...channelMap.entries()]
      .map(([label, g]) => ({
        label,
        revenue: g.revenue,
        count: g.count,
        byItem: [...g.items.values()].sort((a, b) => b.revenue - a.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales, products, mode]);
};
