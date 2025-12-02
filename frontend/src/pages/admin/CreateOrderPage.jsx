import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  Trash2,
  Search,
  User,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { orderService, customerService, serviceService } from '@/services/api';
import { 
  Button, 
  Input,
  Spinner,
  Badge,
  Select,
} from '@/components/ui';
import { formatCurrency } from '@/utils';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [orderData, setOrderData] = useState({
    pickup_date: '',
    notes: '',
    discount: 0,
  });

  // Fetch customers
  const { data: customersData, isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: async () => {
      if (customerSearch.length < 2) return { data: [] };
      const response = await customerService.search(customerSearch);
      return response.data;
    },
    enabled: customerSearch.length >= 2,
  });

  // Fetch services
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['services-active'],
    queryFn: async () => {
      const response = await serviceService.getAll({ active: true });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => orderService.create(data),
    onSuccess: (response) => {
      navigate(`/admin/orders?highlight=${response.data.data.id}`);
    },
  });

  const customers = customersData?.data || [];
  const services = servicesData?.data || [];

  const addItem = (service) => {
    const existingItem = orderItems.find(item => item.service_id === service.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.service_id === service.id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        service_id: service.id,
        service: service,
        qty: 1,
        price: service.price,
      }]);
    }
  };

  const updateItemQty = (serviceId, qty) => {
    if (qty <= 0) {
      removeItem(serviceId);
      return;
    }
    setOrderItems(orderItems.map(item =>
      item.service_id === serviceId
        ? { ...item, qty }
        : item
    ));
  };

  const removeItem = (serviceId) => {
    setOrderItems(orderItems.filter(item => item.service_id !== serviceId));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const total = subtotal - (orderData.discount || 0);

  const handleSubmit = () => {
    createMutation.mutate({
      customer_id: selectedCustomer.id,
      items: orderItems.map(item => ({
        service_id: item.service_id,
        qty: item.qty,
        price: item.price,
      })),
      pickup_date: orderData.pickup_date || null,
      notes: orderData.notes || null,
      discount: orderData.discount || 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Pesanan Baru</h1>
          <p className="text-gray-500">Langkah {step} dari 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${
              s <= step ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Select Customer */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pilih Pelanggan
          </h2>

          {selectedCustomer ? (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                Ganti
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau nomor telepon..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {loadingCustomers && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}

              {customers.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {customerSearch.length >= 2 && customers.length === 0 && !loadingCustomers && (
                <p className="text-center text-gray-500 py-4">
                  Pelanggan tidak ditemukan
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedCustomer}
            >
              Lanjut
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Services */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pilih Layanan
            </h2>

            {loadingServices ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.filter(s => s.is_active).map((service) => (
                  <button
                    key={service.id}
                    onClick={() => addItem(service)}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(service.price)}/{service.unit_type}
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Keranjang</h3>

            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Belum ada layanan dipilih
              </p>
            ) : (
              <div className="space-y-3 mb-4">
                {orderItems.map((item) => (
                  <div key={item.service_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.service.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price)}/{item.service.unit_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItemQty(item.service_id, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateItemQty(item.service_id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.service_id)}
                        className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
                Kembali
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={orderItems.length === 0}
                className="flex-1"
              >
                Lanjut
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirm Order */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detail Tambahan
            </h2>

            <div className="space-y-4">
              <Input
                label="Tanggal Pengambilan"
                type="datetime-local"
                value={orderData.pickup_date}
                onChange={(e) => setOrderData({ ...orderData, pickup_date: e.target.value })}
              />
              <Input
                label="Diskon (Rp)"
                type="number"
                value={orderData.discount}
                onChange={(e) => setOrderData({ ...orderData, discount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Catatan</label>
                <textarea
                  value={orderData.notes}
                  onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                  placeholder="Catatan pesanan (opsional)"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ringkasan Pesanan
            </h2>

            {/* Customer */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">
                  {selectedCustomer?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedCustomer?.name}</p>
                <p className="text-sm text-gray-500">{selectedCustomer?.phone}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
              {orderItems.map((item) => (
                <div key={item.service_id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.service.name} x {item.qty} {item.service.unit_type}
                  </span>
                  <span className="font-medium">{formatCurrency(item.qty * item.price)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Diskon</span>
                  <span className="text-green-600">-{formatCurrency(orderData.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">
                Kembali
              </Button>
              <Button 
                onClick={handleSubmit}
                isLoading={createMutation.isPending}
                className="flex-1"
              >
                Buat Pesanan
              </Button>
            </div>

            {createMutation.isError && (
              <p className="text-red-500 text-sm mt-4 text-center">
                {createMutation.error?.response?.data?.message || 'Gagal membuat pesanan'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
