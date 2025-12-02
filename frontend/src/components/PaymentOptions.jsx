import { Wallet, QrCode, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Reusable Payment Method Selector
 */
export function PaymentMethodSelector({ value, onChange, className = '' }) {
  const methods = [
    { value: 'CASH', label: 'Tunai', icon: Wallet },
    { value: 'QRIS', label: 'QRIS', icon: QrCode },
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Metode Pembayaran
      </label>
      <div className="grid grid-cols-2 gap-2">
        {methods.map(({ value: methodValue, label, icon: Icon }) => (
          <button
            key={methodValue}
            type="button"
            onClick={() => onChange(methodValue)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all ${
              value === methodValue
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable Payment Status Selector
 */
export function PaymentStatusSelector({ value, onChange, className = '' }) {
  const statuses = [
    { value: 'PAID', label: 'Lunas', icon: CheckCircle2, color: 'green' },
    { value: 'UNPAID', label: 'Belum Lunas', icon: XCircle, color: 'orange' },
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Status Pembayaran
      </label>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map(({ value: statusValue, label, icon: Icon, color }) => (
          <button
            key={statusValue}
            type="button"
            onClick={() => onChange(statusValue)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all ${
              value === statusValue
                ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
            style={
              value === statusValue
                ? {
                    borderColor: color === 'green' ? '#22c55e' : '#f97316',
                    backgroundColor: color === 'green' ? '#f0fdf4' : '#fff7ed',
                    color: color === 'green' ? '#15803d' : '#c2410c',
                  }
                : {}
            }
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
