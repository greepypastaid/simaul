import { useState } from 'react';
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
  ShoppingCart,
} from 'lucide-react';
import { orderService, customerService, serviceService } from '@/services/api';
import { PaymentMethodSelector, PaymentStatusSelector } from '@/components';
import { Button, Spinner } from '@/components/ui';
import { formatCurrency, printReceipt } from '@/utils';

/**
 * Create Order Page - Single Form
 * Clean, simplified order creation with auto-print receipt
 */
export default function CreateOrderPage() {
  const navigate = useNavigate();
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');

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

  // Create order mutation with auto-print
  const createMutation = useMutation({
    mutationFn: (data) => orderService.create(data),
    onSuccess: (response) => {
      const order = response.data.data;
      
      // Auto-print receipt/label
      printReceipt(order);
      
      // Navigate to orders page
      navigate(`/admin/orders?highlight=${order.id}`);
    },
  });

  const customers = customersData?.data || [];
  const services = servicesData?.data || [];
  const subtotal = orderItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const total = subtotal;

  // Item management
  const addItem = (service) => {
    const existingItem = orderItems.find(item => item.service_id === service.id);
    if (existingItem) {
      updateItemQty(service.id, existingItem.qty + 1);
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
      item.service_id === serviceId ? { ...item, qty } : item
    ));
  };

  const removeItem = (serviceId) => {
    setOrderItems(orderItems.filter(item => item.service_id !== serviceId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer || orderItems.length === 0) return;
    
    createMutation.mutate({
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      items: orderItems.map(item => ({
        service_id: item.service_id,
        qty: item.qty,
      })),
      notes: notes || null,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Pesanan Baru</h1>
          <p className="text-gray-500">Isi formulir lengkap di bawah ini</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pilih Pelanggan</h2>
                  <p className="text-sm text-gray-500">Cari dan pilih pelanggan</p>
                </div>
              </div>

              {selectedCustomer ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
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
                    type="button"
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
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left border border-transparent hover:border-gray-200"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {customerSearch.length >= 2 && customers.length === 0 && !loadingCustomers && (
                    <p className="text-center text-gray-500 py-4 text-sm">
                      Pelanggan tidak ditemukan
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Services Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pilih Layanan</h2>
                  <p className="text-sm text-gray-500">Klik layanan untuk menambahkan</p>
                </div>
              </div>

              {loadingServices ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.filter(s => s.is_active).map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => addItem(service)}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(service.price)}/{service.unit_type}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-purple-600 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment & Notes - Mobile Only */}
            <div className="lg:hidden space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <PaymentStatusSelector value={paymentStatus} onChange={setPaymentStatus} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk pesanan ini..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Cart & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Keranjang</h3>
                  <p className="text-sm text-gray-500">
                    {orderItems.length} item{orderItems.length !== 1 ? '' : ''}
                  </p>
                </div>
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Belum ada layanan dipilih</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.service_id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {item.service.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(item.price)}/{item.service.unit_type}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.service_id)}
                            className="shrink-0 w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.service_id, item.qty - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium text-sm">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQty(item.service_id, item.qty + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(item.qty * item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>

                    {/* Payment Options - Desktop Only */}
                    <div className="hidden lg:block space-y-3 pt-2">
                      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                      <PaymentStatusSelector value={paymentStatus} onChange={setPaymentStatus} />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catatan (Opsional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Tambahkan catatan..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!selectedCustomer || orderItems.length === 0 || createMutation.isPending}
                      isLoading={createMutation.isPending}
                    >
                      Buat Pesanan & Cetak Label
                    </Button>

                    {createMutation.isError && (
                      <p className="text-red-500 text-sm text-center">
                        {createMutation.error?.response?.data?.message || 'Gagal membuat pesanan'}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
