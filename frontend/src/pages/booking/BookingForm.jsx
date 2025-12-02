import { useState, useEffect } from 'react';
import { Copy, Check, Loader2, Send } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/utils';

export default function BookingForm() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    service_id: '',
    pickup_date: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [error, setError] = useState(null);
  const [trackingCode, setTrackingCode] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.data || []);
    } catch (err) {
      setError('Gagal memuat layanan');
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/bookings', formData);
      setTrackingCode(response.data.data.tracking_code);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat booking');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (trackingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h2>
          <p className="text-gray-600 mb-6">Simpan kode tracking ini untuk melacak pesanan Anda</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Kode Tracking</p>
            <p className="text-3xl font-mono font-bold text-blue-600">{trackingCode}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Salin Kode Tracking
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">SIMAUL Laundry</h1>
          <p className="text-gray-600 mt-1">Booking Layanan Laundry</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Layanan</label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              required
              disabled={isLoadingServices}
              className={cn(
                "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                isLoadingServices && "bg-gray-100"
              )}
            >
              <option value="">
                {isLoadingServices ? 'Memuat layanan...' : 'Pilih layanan'}
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.formatted_price}/{service.unit_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pickup</label>
            <input
              type="datetime-local"
              name="pickup_date"
              value={formData.pickup_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Buat Booking
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
