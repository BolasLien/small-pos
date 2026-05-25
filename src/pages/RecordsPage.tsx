import { useMemo, useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { SaleRecordItem } from '../features/sales/components/SaleRecordItem';
import { downloadCsv, toCsv } from '../utils/csv';
import { formatDateTime } from '../utils/date';
import { formatChannelLabel } from '../features/sales/types';

const ALL = '__all__';

export const RecordsPage = () => {
  const { salesApi, productsApi, channelsApi } = useAppContext();
  const { sales, deleteSale } = salesApi;
  const { adjustStock } = productsApi;
  const { channels } = channelsApi;

  const [channelFilter, setChannelFilter] = useState<string>(ALL);

  const channelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    channels.forEach((c) => labelSet.add(formatChannelLabel(c.name, c.location)));
    sales.forEach((s) => {
      const label = formatChannelLabel(s.channelName, s.channelLocation);
      if (label) labelSet.add(label);
    });
    return [...labelSet].filter((s) => s !== '');
  }, [channels, sales]);

  const filteredSales = useMemo(() => {
    if (channelFilter === ALL) return sales;
    return sales.filter(
      (s) => formatChannelLabel(s.channelName, s.channelLocation) === channelFilter,
    );
  }, [sales, channelFilter]);

  const handleDelete = (id: string) => {
    const removed = deleteSale(id);
    if (!removed) return;
    removed.items.forEach((it) => adjustStock(it.productId, it.quantity));
  };

  const handleExport = () => {
    const headers = [
      '交易時間',
      '通路',
      '地點',
      '備註',
      '支付方式',
      '商品名稱',
      '單價',
      '數量',
      '小計',
      '交易總額',
    ];
    const rows = filteredSales.flatMap((sale) =>
      sale.items.map((item) => [
        formatDateTime(sale.createdAt),
        sale.channelName ?? '',
        sale.channelLocation ?? '',
        sale.note ?? '',
        sale.paymentMethod,
        item.productName,
        item.price,
        item.quantity,
        item.subtotal,
        sale.totalAmount,
      ]),
    );
    const csv = toCsv(headers, rows);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`sales-${stamp}.csv`, csv);
  };

  return (
    <div className="space-y-4 pb-24">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900">銷售紀錄</h1>
          <p className="text-xs text-gray-500">共 {filteredSales.length} 筆</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={filteredSales.length === 0}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          匯出 CSV
        </button>
      </header>

      {channelOptions.length > 0 && (
        <label className="block space-y-1">
          <span className="text-xs text-gray-500">依通路篩選</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value={ALL}>全部通路</option>
            {channelOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      {filteredSales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          {sales.length === 0 ? '還沒有銷售紀錄' : '此通路沒有紀錄'}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredSales.map((record) => (
            <li key={record.id}>
              <SaleRecordItem record={record} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
