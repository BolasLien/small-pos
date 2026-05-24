export type SeriesFilter = string | null;

type SeriesTabsProps = {
  seriess: string[];
  value: SeriesFilter;
  onChange: (next: SeriesFilter) => void;
};

export const SeriesTabs = ({ seriess, value, onChange }: SeriesTabsProps) => {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-2 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            value === null
              ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
          }`}
        >
          全部
        </button>
        {seriess.map((s) => {
          const isActive = s === value;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                isActive
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
};
