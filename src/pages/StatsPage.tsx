import { useAppContext } from '../store/AppContext';
import { useTodayStats } from '../features/stats/hooks/useTodayStats';
import { StatCard } from '../features/stats/components/StatCard';
import { formatTodayLabel } from '../utils/date';
import { PAYMENT_METHODS } from '../features/sales/types';

export const StatsPage = () => {
  const { salesApi } = useAppContext();
  const stats = useTodayStats(salesApi.sales);

  return (
    <div className="space-y-5 pb-24">
      <header>
        <h1 className="text-xl font-bold text-gray-900">今日統計</h1>
        <p className="text-xs text-gray-500">{formatTodayLabel()}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="今日總收入" value={`$${stats.totalRevenue}`} />
        <StatCard label="交易筆數" value={`${stats.transactionCount}`} hint="筆" />
      </div>

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

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">今日商品銷售排行</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {stats.productRanks.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">今天還沒有銷售紀錄</p>
          ) : (
            <ol className="divide-y divide-gray-100">
              {stats.productRanks.map((rank, idx) => (
                <li
                  key={rank.productId}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
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
                    <span className="text-gray-700">{rank.productName}</span>
                  </span>
                  <span className="font-semibold text-gray-900">{rank.quantity} 件</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
};
