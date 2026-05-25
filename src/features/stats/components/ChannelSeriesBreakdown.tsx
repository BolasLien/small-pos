import type { ChannelGroup } from '../hooks/useChannelSeriesBreakdown';

type ChannelSeriesBreakdownProps = {
  groups: ChannelGroup[];
};

const RANK_BADGE_CLASS = (idx: number): string => {
  if (idx === 0) return 'bg-yellow-100 text-yellow-700';
  if (idx === 1) return 'bg-gray-100 text-gray-700';
  if (idx === 2) return 'bg-orange-100 text-orange-700';
  return 'bg-gray-50 text-gray-500';
};

export const ChannelSeriesBreakdown = ({ groups }: ChannelSeriesBreakdownProps) => {
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
            {g.bySeries.map((s) => (
              <li
                key={s.series}
                className="flex items-center justify-between gap-2 py-1.5 text-xs"
              >
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600">
                  {s.series}
                </span>
                <span className="text-gray-700">
                  {s.quantity} 件
                  <span className="ml-2 font-semibold text-gray-900">${s.revenue}</span>
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};
