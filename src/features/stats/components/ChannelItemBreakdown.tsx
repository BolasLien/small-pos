import type { BreakdownMode, ChannelGroup } from '../hooks/useChannelItemBreakdown';

type ChannelItemBreakdownProps = {
  groups: ChannelGroup[];
  mode: BreakdownMode;
};

const RANK_BADGE_CLASS = (idx: number): string => {
  if (idx === 0) return 'bg-yellow-100 text-yellow-700';
  if (idx === 1) return 'bg-gray-100 text-gray-700';
  if (idx === 2) return 'bg-orange-100 text-orange-700';
  return 'bg-gray-50 text-gray-500';
};

const ITEM_PILL_CLASS: Record<BreakdownMode, string> = {
  series: 'bg-indigo-50 text-indigo-600',
  product: 'bg-emerald-50 text-emerald-700',
};

export const ChannelItemBreakdown = ({ groups, mode }: ChannelItemBreakdownProps) => {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
        此期間沒有銷售紀錄
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {groups.map((g, idx) => (
        <li key={g.label} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <header className="flex items-start justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${RANK_BADGE_CLASS(idx)}`}
              >
                {idx + 1}
              </span>
              <span className="truncate text-sm font-medium text-gray-900">{g.label}</span>
            </span>
            <span className="shrink-0 text-right text-sm">
              <span className="font-semibold text-gray-900">${g.revenue}</span>
              <span className="ml-1 text-xs text-gray-500">・{g.count} 筆</span>
            </span>
          </header>
          <ul className="mt-2 divide-y divide-gray-100 border-t border-gray-100 pt-1">
            {g.byItem.map((it) => (
              <li
                key={it.key}
                className="flex items-center justify-between gap-2 py-1.5 text-xs"
              >
                <span
                  className={`min-w-0 truncate rounded-full px-2 py-0.5 ${ITEM_PILL_CLASS[mode]}`}
                >
                  {it.label}
                </span>
                <span className="shrink-0 text-gray-700">
                  {it.quantity} 件
                  <span className="ml-2 font-semibold text-gray-900">${it.revenue}</span>
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};
