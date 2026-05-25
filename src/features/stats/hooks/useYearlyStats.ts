import { useMemo } from 'react';
import type { PaymentMethod, SaleRecord } from '../../sales/types';

export type MonthSummary = {
  month: number;
  revenue: number;
  count: number;
};

export type YearlyStats = {
  yearSales: SaleRecord[];
  totalRevenue: number;
  transactionCount: number;
  monthSummaries: MonthSummary[];
  revenueByPayment: Record<PaymentMethod, number>;
};

const emptyPaymentMap = (): Record<PaymentMethod, number> => ({
  現金: 0,
  'Line Pay': 0,
  街口支付: 0,
  轉帳: 0,
  其他: 0,
});

export const useYearlyStats = (sales: SaleRecord[], year: number): YearlyStats => {
  return useMemo(() => {
    const yearSales = sales.filter((s) => new Date(s.createdAt).getFullYear() === year);

    const totalRevenue = yearSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const revenueByPayment = emptyPaymentMap();
    const monthMap = new Map<number, { revenue: number; count: number }>();

    yearSales.forEach((s) => {
      revenueByPayment[s.paymentMethod] += s.totalAmount;
      const m = new Date(s.createdAt).getMonth();
      const prev = monthMap.get(m) ?? { revenue: 0, count: 0 };
      monthMap.set(m, { revenue: prev.revenue + s.totalAmount, count: prev.count + 1 });
    });

    const monthSummaries: MonthSummary[] = Array.from({ length: 12 }, (_, m) => ({
      month: m,
      revenue: monthMap.get(m)?.revenue ?? 0,
      count: monthMap.get(m)?.count ?? 0,
    }));

    return {
      yearSales,
      totalRevenue,
      transactionCount: yearSales.length,
      monthSummaries,
      revenueByPayment,
    };
  }, [sales, year]);
};
