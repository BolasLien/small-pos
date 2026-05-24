import type { ProductSeries } from '../../products/types';

export type SeriesFilter = ProductSeries | 'all';

type SeriesTabsProps = {
  seriess: ProductSeries[];
  value: SeriesFilter;
  onChange: (next: SeriesFilter) => void;
};

export const SeriesTabs = ({ seriess, value, onChange }: SeriesTabsProps) => {
  const tabs: SeriesFilter[] = ['all', ...seriess];

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-2 whitespace-nowrap">
        {tabs.map((tab) => {
          const isActive = tab === value;
          const label = tab === 'all' ? '全部' : tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                isActive
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
