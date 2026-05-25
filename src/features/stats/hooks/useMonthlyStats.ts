import { useMemo } from 'react';
import { formatChannelLabel, type PaymentMethod, type SaleRecord } from '../../sales/types';

export type ChannelBreakdown = {
  label: string;
  revenue: number;
  count: number;
  share: number;
};

export type MonthlyStats = {
  monthSales: SaleRecord[];
  totalRevenue: number;
  transactionCount: number;
  channelBreakdowns: ChannelBreakdown[];
  revenueByPayment: Record<PaymentMethod, number>;
};

const UNASSIGNED = '未指定通路';

const emptyPaymentMap = (): Record<PaymentMethod, number> => ({
  現金: 0,
  'Line Pay': 0,
  街口支付: 0,
  轉帳: 0,
  其他: 0,
});

export const useMonthlyStats = (
  sales: SaleRecord[],
  year: number,
  month: number,
): MonthlyStats => {
  return useMemo(() => {
    const monthSales = sales.filter((s) => {
      const d = new Date(s.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalRevenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const revenueByPayment = emptyPaymentMap();
    const channelMap = new Map<string, { revenue: number; count: number }>();

    monthSales.forEach((s) => {
      revenueByPayment[s.paymentMethod] += s.totalAmount;
      const label = formatChannelLabel(s.channelName, s.channelLocation) || UNASSIGNED;
      const prev = channelMap.get(label) ?? { revenue: 0, count: 0 };
      channelMap.set(label, {
        revenue: prev.revenue + s.totalAmount,
        count: prev.count + 1,
      });
    });

    const channelBreakdowns = [...channelMap.entries()]
      .map(([label, v]) => ({
        label,
        revenue: v.revenue,
        count: v.count,
        share: totalRevenue > 0 ? v.revenue / totalRevenue : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      monthSales,
      totalRevenue,
      transactionCount: monthSales.length,
      channelBreakdowns,
      revenueByPayment,
    };
  }, [sales, year, month]);
};
