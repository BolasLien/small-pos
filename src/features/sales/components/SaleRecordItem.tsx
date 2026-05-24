import { formatDateTime } from '../../../utils/date';
import type { SaleRecord } from '../types';

type SaleRecordItemProps = {
  record: SaleRecord;
  onDelete: (id: string) => void;
};

export const SaleRecordItem = ({ record, onDelete }: SaleRecordItemProps) => {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{formatDateTime(record.createdAt)}</p>
          <p className="mt-1 text-xs text-gray-500">
            支付方式：<span className="text-gray-700">{record.paymentMethod}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">${record.totalAmount}</p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定刪除這筆交易？庫存會加回去。')) {
                onDelete(record.id);
              }
            }}
            className="mt-1 text-xs text-rose-500 hover:underline"
          >
            刪除
          </button>
        </div>
      </header>
      <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
        {record.items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-2 text-gray-700">
            <span className="truncate">
              {item.productName}
              <span className="ml-1 text-xs text-gray-400">
                ${item.price} × {item.quantity}
              </span>
            </span>
            <span className="shrink-0 font-medium">${item.subtotal}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
