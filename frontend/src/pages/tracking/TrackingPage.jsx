import { useState } from 'react';
import { Search, CheckCircle2, Circle, Clock, AlertCircle, Package } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/utils';

const STATUS_CONFIG = {
  BOOKED: { label: 'Dipesan', color: 'blue' },
  PENDING: { label: 'Diterima', color: 'yellow' },
  WASHING: { label: 'Dicuci', color: 'cyan' },
  DRYING: { label: 'Dikeringkan', color: 'orange' },
  IRONING: { label: 'Disetrika', color: 'purple' },
  COMPLETED: { label: 'Selesai', color: 'green' },
  TAKEN: { label: 'Diambil', color: 'emerald' },
  CANCELLED: { label: 'Dibatalkan', color: 'red' },
};

const STATUS_ORDER = ['BOOKED', 'PENDING', 'WASHING', 'DRYING', 'IRONING', 'COMPLETED', 'TAKEN'];

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await api.get(`/tracking/${trackingCode.trim()}`);
      setOrder(response.data.data);
    } catch (err) {
      setOrder(null);
      setError(err.response?.status === 404 ? 'Kode tracking tidak ditemukan' : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return STATUS_ORDER.indexOf(order.status);
  };

  const getStepStatus = (stepIndex) => {
    const currentIndex = getCurrentStatusIndex();
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const renderTimeline = () => {
    if (!order) return null;

    const currentIndex = getCurrentStatusIndex();
    const timelineSteps = STATUS_ORDER.slice(0, Math.max(currentIndex + 1, 1));

    if (order.status === 'CANCELLED') {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-600">Pesanan Dibatalkan</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {STATUS_ORDER.map((status, index) => {
          const stepStatus = getStepStatus(index);
          const historyItem = order.timeline?.find((h) => h.status === status);
          const config = STATUS_CONFIG[status];

          return (
            <div key={status} className="relative flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    stepStatus === 'completed' && "bg-green-500 border-green-500",
                    stepStatus === 'current' && "bg-blue-500 border-blue-500 ring-4 ring-blue-100",
                    stepStatus === 'upcoming' && "bg-white border-gray-300"
                  )}
                >
                  {stepStatus === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : stepStatus === 'current' ? (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                {index < STATUS_ORDER.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 mt-2",
                      stepStatus === 'completed' ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={cn(
                    "font-medium",
                    stepStatus === 'completed' && "text-green-700",
                    stepStatus === 'current' && "text-blue-700",
                    stepStatus === 'upcoming' && "text-gray-400"
                  )}
                >
                  {config.label}
                </p>
                {historyItem && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {historyItem.date} • {historyItem.time}
                  </p>
                )}
                {historyItem?.notes && (
                  <p className="text-sm text-gray-600 mt-1">{historyItem.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
          <p className="text-gray-600 mt-1">Masukkan kode tracking untuk melihat status</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode tracking"
              className="w-full px-4 py-4 pl-12 pr-24 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-mono uppercase bg-white shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              disabled={isLoading || !trackingCode.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                'Cari'
              )}
            </button>
          </div>
        </form>

        {error && searched && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">Tidak Ditemukan</p>
            <p className="text-gray-500">Kode tracking "{trackingCode}" tidak ditemukan</p>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm opacity-80">Kode Tracking</span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    order.status === 'COMPLETED' || order.status === 'TAKEN'
                      ? "bg-green-400/20 text-green-100"
                      : "bg-white/20"
                  )}
                >
                  {STATUS_CONFIG[order.status]?.label}
                </span>
              </div>
              <p className="text-2xl font-mono font-bold">{order.tracking_code}</p>
              <p className="text-sm opacity-80 mt-2">{order.customer_name}</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500">Layanan</p>
                  <p className="font-medium">{order.services?.map((s) => s.name).join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-medium text-blue-600">{order.final_price}</p>
                </div>
                {order.pickup_date && (
                  <div>
                    <p className="text-gray-500">Tanggal Pickup</p>
                    <p className="font-medium">{order.pickup_date}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Pembayaran</p>
                  <p className="font-medium">{order.payment_status}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
                {renderTimeline()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
