import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Loader2, X } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/utils';

export default function POSDashboard() {
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchService, setSearchService] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchCustomer.length >= 2) {
        searchCustomers();
      } else {
        setCustomers([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCustomer]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const searchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await api.get(`/customers/search?q=${searchCustomer}`);
      setCustomers(response.data.data || []);
      setShowCustomerDropdown(true);
    } catch (err) {
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const filteredServices = useMemo(() => {
    if (!searchService.trim()) return services;
    return services.filter((s) =>
      s.name.toLowerCase().includes(searchService.toLowerCase())
    );
  }, [services, searchService]);

  const addToCart = (service) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service_id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service_id === service.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          service_id: service.id,
          name: service.name,
          price: service.price,
          unit_type: service.unit_type,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (serviceId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.service_id === serviceId
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (serviceId) => {
    setCart((prev) => prev.filter((item) => item.service_id !== serviceId));
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSearchCustomer(customer.name);
    setShowCustomerDropdown(false);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setSearchCustomer('');
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const processOrder = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const payload = {
        customer_id: selectedCustomer?.id,
        customer_name: selectedCustomer?.name || searchCustomer || 'Walk-in Customer',
        phone: selectedCustomer?.phone || '000000000000',
        items: cart.map((item) => ({
          service_id: item.service_id,
          qty: item.qty,
        })),
        payment_status: 'UNPAID',
      };

      const response = await api.post('/orders', payload);
      setOrderSuccess(response.data.data);
      setCart([]);
      setSelectedCustomer(null);
      setSearchCustomer('');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses pesanan');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h2>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Kode Tracking</p>
            <p className="text-3xl font-mono font-bold text-blue-600">
              {orderSuccess.tracking_code}
            </p>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Buat Pesanan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">SIMAUL POS</h1>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                placeholder="Cari layanan..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {isLoadingServices ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => addToCart(service)}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-blue-600 font-medium mt-1">
                      {service.formatted_price}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">per {service.unit_type}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-fit lg:sticky lg:top-6">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Pelanggan</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchCustomer}
                  onChange={(e) => {
                    setSearchCustomer(e.target.value);
                    setSelectedCustomer(null);
                  }}
                  onFocus={() => customers.length > 0 && setShowCustomerDropdown(true)}
                  placeholder="Cari atau ketik nama..."
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    selectedCustomer ? "border-green-500 bg-green-50" : "border-gray-300"
                  )}
                />
                {selectedCustomer && (
                  <button
                    onClick={clearCustomer}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                {showCustomerDropdown && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-gray-500 text-xs">{customer.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
                {isLoadingCustomers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto max-h-80">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.service_id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-blue-600">{formatPrice(item.price * item.qty)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.service_id, -1)}
                          className="p-1 bg-white border rounded hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.service_id, 1)}
                          className="p-1 bg-white border rounded hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.service_id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-blue-600">{formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={processOrder}
                disabled={cart.length === 0 || isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Proses Pesanan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
