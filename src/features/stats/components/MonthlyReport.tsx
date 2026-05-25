import { useMemo, useState } from 'react';
import { useAppContext } from '../../../store/AppContext';
import { useMonthlyStats } from '../hooks/useMonthlyStats';
import {
  useChannelItemBreakdown,
  type BreakdownMode,
} from '../hooks/useChannelItemBreakdown';
import { StatCard } from './StatCard';
import { ChannelItemBreakdown } from './ChannelItemBreakdown';
import { BreakdownModeToggle } from './BreakdownModeToggle';
import { PAYMENT_METHODS } from '../../sales/types';
import { downloadCsv, toCsv } from '../../../utils/csv';

type YM = { year: number; month: number };

const today = new Date();
const initialYM: YM = { year: today.getFullYear(), month: today.getMonth() };

const shiftMonth = ({ year, month }: YM, delta: number): YM => {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
};

const isAfter = (a: YM, b: YM): boolean =>
  a.year > b.year || (a.year === b.year && a.month > b.month);

const pad = (n: number): string => n.toString().padStart(2, '0');

const COLUMN_LABEL: Record<BreakdownMode, string> = {
  series: '分類',
  product: '商品名稱',
};

export const MonthlyReport = () => {
  const { salesApi, productsApi } = useAppContext();
  const [ym, setYm] = useState<YM>(initialYM);
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('series');

  const stats = useMonthlyStats(salesApi.sales, ym.year, ym.month);
  const breakdown = useChannelItemBreakdown(
    stats.monthSales,
    productsApi.products,
    breakdownMode,
  );

  const isNextDisabled = useMemo(
    () => isAfter(shiftMonth(ym, 1), initialYM),
    [ym],
  );

  const handleExport = () => {
    const headers = ['通路', COLUMN_LABEL[breakdownMode], '數量', '收入'];
    const rows = breakdown.flatMap((g) =>
      g.byItem.map((it) => [g.label, it.label, it.quantity, it.revenue]),
    );
    if (rows.length === 0) return;
    const csv = toCsv(headers, rows);
    downloadCsv(
      `monthly-${ym.year}-${pad(ym.month + 1)}-${breakdownMode}.csv`,
      csv,
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setYm((cur) => shiftMonth(cur, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="上一個月"
        >
          ◀
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-500">月報</p>
          <p className="text-base font-semibold text-gray-900">
            {ym.year} 年 {ym.month + 1} 月
          </p>
        </div>
        <button
          type="button"
          onClick={() => setYm((cur) => shiftMonth(cur, 1))}
          disabled={isNextDisabled}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="下一個月"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="本月總收入" value={`$${stats.totalRevenue}`} />
        <StatCard label="交易筆數" value={`${stats.transactionCount}`} hint="筆" />
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">各通路收入</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {stats.channelBreakdowns.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">本月沒有銷售紀錄</p>
          ) : (
            <ul className="space-y-3">
              {stats.channelBreakdowns.map((b, idx) => (
                <li key={b.label} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          idx === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : idx === 1
                              ? 'bg-gray-100 text-gray-700'
                              : idx === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate text-gray-800">{b.label}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-semibold text-gray-900">${b.revenue}</span>
                      <span className="ml-1 text-xs text-gray-500">・{b.count} 筆</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.max(2, b.share * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs text-gray-500">
                      {(b.share * 100).toFixed(1)}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-700">
            通路 × {breakdownMode === 'series' ? '分類' : '商品'}
          </h2>
          <div className="flex items-center gap-2">
            <BreakdownModeToggle value={breakdownMode} onChange={setBreakdownMode} />
            <button
              type="button"
              onClick={handleExport}
              disabled={breakdown.length === 0}
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
