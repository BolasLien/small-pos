import { useAppContext } from '../store/AppContext';
import { SaleRecordItem } from '../features/sales/components/SaleRecordItem';
import { downloadCsv, toCsv } from '../utils/csv';
import { formatDateTime } from '../utils/date';

export const RecordsPage = () => {
  const { salesApi, productsApi } = useAppContext();
  const { sales, deleteSale } = salesApi;
  const { adjustStock } = productsApi;

  const handleDelete = (id: string) => {
    const removed = deleteSale(id);
    if (!removed) return;
    removed.items.forEach((it) => adjustStock(it.productId, it.quantity));
  };

  const handleExport = () => {
    const headers = ['交易時間', '支付方式', '商品名稱', '單價', '數量', '小計', '交易總額'];
    const rows = sales.flatMap((sale) =>
      sale.items.map((item) => [
        formatDateTime(sale.createdAt),
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">銷售紀錄</h1>
          <p className="text-xs text-gray-500">共 {sales.length} 筆</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={sales.length === 0}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          匯出 CSV
        </button>
      </header>

      {sales.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          還沒有銷售紀錄
        </div>
      ) : (
        <ul className="space-y-3">
          {sales.map((record) => (
            <li key={record.id}>
              <SaleRecordItem record={record} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
