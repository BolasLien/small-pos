import type { BreakdownMode } from '../hooks/useChannelItemBreakdown';

type BreakdownModeToggleProps = {
  value: BreakdownMode;
  onChange: (next: BreakdownMode) => void;
};

const OPTIONS: Array<{ key: BreakdownMode; label: string }> = [
  { key: 'series', label: '分類' },
  { key: 'product', label: '商品' },
];

export const BreakdownModeToggle = ({ value, onChange }: BreakdownModeToggleProps) => (
  <div className="inline-flex rounded-full border border-gray-200 bg-white p-0.5">
    {OPTIONS.map((o) => {
      const isActive = value === o.key;
      return (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
            isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);
