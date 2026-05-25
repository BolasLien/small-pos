import { useMemo, useState } from 'react';
import { useAppContext } from '../../../store/AppContext';
import { useYearlyStats } from '../hooks/useYearlyStats';
import {
  useChannelItemBreakdown,
  type BreakdownMode,
} from '../hooks/useChannelItemBreakdown';
import { StatCard } from './StatCard';
import { ChannelItemBreakdown } from './ChannelItemBreakdown';
import { BreakdownModeToggle } from './BreakdownModeToggle';
import { PAYMENT_METHODS, formatChannelLabel } from '../../sales/types';
import { downloadCsv, toCsv } from '../../../utils/csv';

const currentYear = new Date().getFullYear();

const pad = (n: number): string => n.toString().padStart(2, '0');

const COLUMN_LABEL: Record<BreakdownMode, string> = {
  series: '系列',
  product: '商品名稱',
};

const UNKNOWN_SERIES = '未知系列';

export const YearlyReport = () => {
  const { salesApi, productsApi } = useAppContext();
  const [year, setYear] = useState<number>(currentYear);
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('series');

  const stats = useYearlyStats(salesApi.sales, year);
  const breakdown = useChannelItemBreakdown(
    stats.yearSales,
    productsApi.products,
    breakdownMode,
  );

  const peakMonth = useMemo(
    () => stats.monthSummaries.reduce((max, m) => (m.revenue > max ? m.revenue : max), 0),
    [stats.monthSummaries],
  );

  const handleExport = () => {
    const headers = ['月份', '通路', COLUMN_LABEL[breakdownMode], '數量', '收入'];
    const productMap = new Map(productsApi.products.map((p) => [p.id, p]));
    const rows: (string | number)[][] = [];

    for (let m = 0; m < 12; m++) {
      const monthLabel = `${year}-${pad(m + 1)}`;
      const monthSales = stats.yearSales.filter(
        (s) => new Date(s.createdAt).getMonth() === m,
      );
      const grouped = new Map<
        string,
        Map<string, { label: string; quantity: number; revenue: number }>
      >();
      monthSales.forEach((s) => {
        const channelLabel =
          formatChannelLabel(s.channelName, s.channelLocation) || '未指定通路';
        const chMap = grouped.get(channelLabel) ?? new Map();
        s.items.forEach((item) => {
          let key: string;
          let label: string;
          if (breakdownMode === 'series') {
            const series =
              item.productSeries ?? productMap.get(item.productId)?.series ?? UNKNOWN_SERIES;
            key = series;
            label = series;
          } else {
            key = item.productId || item.productName;
            label = item.productName;
          }
          const prev = chMap.get(key) ?? { label, quantity: 0, revenue: 0 };
          prev.quantity += item.quantity;
          prev.revenue += item.subtotal;
          chMap.set(key, prev);
        });
        grouped.set(channelLabel, chMap);
      });
      grouped.forEach((itemMap, channelLabel) => {
        itemMap.forEach((v) => {
          rows.push([monthLabel, channelLabel, v.label, v.quantity, v.revenue]);
        });
      });
    }

    if (rows.length === 0) return;
    const csv = toCsv(headers, rows);
    downloadCsv(`yearly-${year}-${breakdownMode}.csv`, csv);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setYear((y) => y - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="上一年"
        >
          ◀
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-500">年報</p>
          <p className="text-base font-semibold text-gray-900">{year} 年</p>
        </div>
        <button
          type="button"
          onClick={() => setYear((y) => y + 1)}
          disabled={year >= currentYear}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="下一年"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="本年總收入" value={`$${stats.totalRevenue}`} />
        <StatCard label="交易筆數" value={`${stats.transactionCount}`} hint="筆" />
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">各月份收入</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {stats.transactionCount === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">本年沒有銷售紀錄</p>
          ) : (
            <ul className="space-y-2">
              {stats.monthSummaries.map((m) => {
                const ratio = peakMonth > 0 ? m.revenue / peakMonth : 0;
                return (
                  <li key={m.month}>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="w-10 shrink-0 text-gray-600">{m.month + 1} 月</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.max(0, ratio * 100)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-right">
                        <span className="font-semibold text-gray-900">${m.revenue}</span>
                        <span className="ml-1 text-gray-400">・{m.count}筆</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-700">
            通路 × {breakdownMode === 'series' ? '系列' : '商品'}（全年）
          </h2>
          <div className="flex items-center gap-2">
            <BreakdownModeToggle value={breakdownMode} onChange={setBreakdownMode} />
            <button
              type="button"
              onClick={handleExport}
              disabled={stats.transactionCount === 0}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              匯出 CSV
            </button>
          </div>
        </div>
        <ChannelItemBreakdown groups={breakdown} mode={breakdownMode} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">各支付方式收入</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <ul className="divide-y divide-gray-100">
            {PAYMENT_METHODS.map((method) => (
              <li key={method} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700">{method}</span>
                <span className="font-semibold text-gray-900">
                  ${stats.revenueByPayment[method]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
