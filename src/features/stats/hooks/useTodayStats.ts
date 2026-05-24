import { useMemo } from 'react';
import { isSameLocalDay } from '../../../utils/date';
import type { PaymentMethod, SaleRecord } from '../../sales/types';

export type ProductSalesRank = {
  productId: string;
  productName: string;
  quantity: number;
};

export type TodayStats = {
  todaySales: SaleRecord[];
  totalRevenue: number;
  transactionCount: number;
  revenueByPayment: Record<PaymentMethod, number>;
  productRanks: ProductSalesRank[];
};

const emptyPaymentMap = (): Record<PaymentMethod, number> => ({
  現金: 0,
  'Line Pay': 0,
  街口支付: 0,
  轉帳: 0,
  其他: 0,
});

export const useTodayStats = (sales: SaleRecord[]): TodayStats => {
  return useMemo(() => {
    const todaySales = sales.filter((s) => isSameLocalDay(s.createdAt));
    const totalRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const revenueByPayment = emptyPaymentMap();
    const rankMap = new Map<string, ProductSalesRank>();

    todaySales.forEach((s) => {
      revenueByPayment[s.paymentMethod] += s.totalAmount;
      s.items.forEach((item) => {
        const prev = rankMap.get(item.productId);
        if (prev) {
          prev.quantity += item.quantity;
        } else {
          rankMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
          });
        }
      });
    });

    const productRanks = [...rankMap.values()].sort((a, b) => b.quantity - a.quantity);

    return {
      todaySales,
      totalRevenue,
      transactionCount: todaySales.length,
      revenueByPayment,
      productRanks,
    };
  }, [sales]);
};
