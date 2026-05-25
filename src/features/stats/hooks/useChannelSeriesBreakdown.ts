import { useMemo } from 'react';
import type { Product } from '../../products/types';
import { formatChannelLabel, type SaleRecord } from '../../sales/types';

export type SeriesAmount = {
  series: string;
  quantity: number;
  revenue: number;
};

export type ChannelGroup = {
  label: string;
  revenue: number;
  count: number;
  bySeries: SeriesAmount[];
};

const UNASSIGNED_CHANNEL = '未指定通路';
const UNKNOWN_SERIES = '未知系列';

export const useChannelSeriesBreakdown = (
  sales: SaleRecord[],
  products: Product[],
): ChannelGroup[] => {
  return useMemo(() => {
    const productMap = new Map<string, Product>();
    products.forEach((p) => productMap.set(p.id, p));

    const channelMap = new Map<
      string,
      {
        revenue: number;
        count: number;
        series: Map<string, SeriesAmount>;
      }
    >();

    sales.forEach((s) => {
      const label = formatChannelLabel(s.channelName, s.channelLocation) || UNASSIGNED_CHANNEL;
      const group = channelMap.get(label) ?? {
        revenue: 0,
        count: 0,
        series: new Map<string, SeriesAmount>(),
      };
      group.revenue += s.totalAmount;
      group.count += 1;
      s.items.forEach((item) => {
        const series =
          item.productSeries ?? productMap.get(item.productId)?.series ?? UNKNOWN_SERIES;
        const prev = group.series.get(series) ?? { series, quantity: 0, revenue: 0 };
        prev.quantity += item.quantity;
        prev.revenue += item.subtotal;
        group.series.set(series, prev);
      });
      channelMap.set(label, group);
    });

    return [...channelMap.entries()]
      .map(([label, g]) => ({
        label,
        revenue: g.revenue,
        count: g.count,
        bySeries: [...g.series.values()].sort((a, b) => b.revenue - a.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales, products]);
};
