import { PAYMENT_METHODS, type PaymentMethod } from '../types';

type PaymentMethodSelectorProps = {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
};

export const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">支付方式</p>
      <div className="flex flex-wrap gap-2">
        {PAYMENT_METHODS.map((method) => {
          const isActive = value === method;
          return (
            <button
              key={method}
              type="button"
              onClick={() => onChange(method)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
              }`}
            >
              {method}
            </button>
          );
        })}
      </div>
    </div>
  );
};
