export type NavKey = 'sales' | 'products' | 'stats' | 'records';

type NavItem = {
  key: NavKey;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'sales', label: '銷售', icon: '🛒' },
  { key: 'products', label: '商品', icon: '💎' },
  { key: 'stats', label: '統計', icon: '📊' },
  { key: 'records', label: '紀錄', icon: '📝' },
];

type BottomNavProps = {
  current: NavKey;
  onChange: (key: NavKey) => void;
};

export const BottomNav = ({ current, onChange }: BottomNavProps) => {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {NAV_ITEMS.map(({ key, label, icon }) => {
          const isActive = key === current;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange(key)}
                className={`flex w-full flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className={isActive ? 'font-semibold' : ''}>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
