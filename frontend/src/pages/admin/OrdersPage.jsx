import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  ShoppingCart,
  Eye,
  Clock,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Loader,
  Package,
  Printer,
} from 'lucide-react';
import { orderService } from '@/services/api';
import { PaymentMethodSelector, PaymentStatusSelector } from '@/components';
import { formatCurrency, formatDate, formatDateTime, printReceipt } from '@/utils';
import { 
  Button, 
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  EmptyState,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '@/components/ui';

const ORDER_STATUSES = [
  { value: '', label: 'Semua Status' },
  { value: 'BOOKED', label: 'Dipesan' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'WASHING', label: 'Dicuci' },
  { value: 'DRYING', label: 'Dikeringkan' },
  { value: 'IRONING', label: 'Disetrika' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'TAKEN', label: 'Diambil' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

const PAYMENT_STATUSES = [
  { value: '', label: 'Semua Pembayaran' },
  { value: 'UNPAID', label: 'Belum Bayar' },
  { value: 'PARTIAL', label: 'Sebagian' },
  { value: 'PAID', label: 'Lunas' },
];

const STATUS_TRANSITIONS = {
  BOOKED: ['PENDING', 'CANCELLED'],
  PENDING: ['WASHING', 'CANCELLED'],
  WASHING: ['DRYING', 'CANCELLED'],
  DRYING: ['IRONING', 'COMPLETED', 'CANCELLED'],
  IRONING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['TAKEN', 'CANCELLED'],
};

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const status = searchParams.get('status') || '';
  const payment = searchParams.get('payment') || '';
  const search = searchParams.get('search') || '';

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, status, payment, search }],
    queryFn: async () => {
      const response = await orderService.getAll({ 
        page, 
        status: status || undefined, 
        payment_status: payment || undefined,
        search: search || undefined,
        per_page: 10 
      });
      return response.data;
    },
  });

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleUpdatePayment = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const orders = data?.data?.data || [];
  const pagination = data?.data?.meta || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-500 mt-1">Kelola semua pesanan laundry</p>
        </div>
        <Link to="/admin/orders/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Pesanan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kode tracking atau nama pelanggan..."
              value={search}
              onChange={(e) => {
                setSearchParams(prev => {
                  if (e.target.value) {
                    prev.set('search', e.target.value);
                  } else {
                    prev.delete('search');
                  }
                  return prev;
                });
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setSearchParams(prev => {
                if (e.target.value) {
                  prev.set('status', e.target.value);
                } else {
                  prev.delete('status');
                }
                return prev;
              });
            }}
            options={ORDER_STATUSES}
            placeholder="Status"
            className="w-full sm:w-40"
          />
          <Select
            value={payment}
            onChange={(e) => {
              setSearchParams(prev => {
                if (e.target.value) {
                  prev.set('payment', e.target.value);
                } else {
                  prev.delete('payment');
                }
                return prev;
              });
            }}
            options={PAYMENT_STATUSES}
            placeholder="Pembayaran"
            className="w-full sm:w-40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Belum ada pesanan"
            description="Pesanan yang masuk akan tampil di sini"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Tracking</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className="font-mono font-medium text-blue-600">
                        {order.tracking_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customer?.name || '-'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customer?.phone || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentBadge status={order.payment_status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.final_price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{formatDate(order.created_at)}</p>
                        {order.pickup_date && (
                          <p className="text-xs text-gray-500">
                            Ambil: {formatDate(order.pickup_date)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => printReceipt(order)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Cetak Label"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!['TAKEN', 'CANCELLED'].includes(order.status) && (
                          <button
                            onClick={() => handleUpdateStatus(order)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Update Status"
                          >
                            <Loader className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination.last_page > 1 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }}
        order={selectedOrder}
        onUpdateStatus={() => { setShowDetailModal(false); handleUpdateStatus(selectedOrder); }}
        onUpdatePayment={() => { setShowDetailModal(false); handleUpdatePayment(selectedOrder); }}
      />

      {/* Status Update Modal */}
      <UpdateStatusModal
        open={showStatusModal}
        onClose={() => { setShowStatusModal(false); setSelectedOrder(null); }}
        order={selectedOrder}
      />

      {/* Payment Update Modal */}
      <UpdatePaymentModal
        open={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setSelectedOrder(null); }}
        order={selectedOrder}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    BOOKED: { variant: 'warning', label: 'Dipesan' },
    PENDING: { variant: 'info', label: 'Menunggu' },
    WASHING: { variant: 'primary', label: 'Dicuci' },
    DRYING: { variant: 'primary', label: 'Dikeringkan' },
    IRONING: { variant: 'primary', label: 'Disetrika' },
    COMPLETED: { variant: 'success', label: 'Selesai' },
    TAKEN: { variant: 'success', label: 'Diambil' },
    CANCELLED: { variant: 'danger', label: 'Dibatalkan' },
  };

  const { variant, label } = config[status] || { variant: 'default', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

function PaymentBadge({ status }) {
  const config = {
    UNPAID: { variant: 'danger', label: 'Belum Bayar' },
    PARTIAL: { variant: 'warning', label: 'Sebagian' },
    PAID: { variant: 'success', label: 'Lunas' },
  };

  const { variant, label } = config[status] || { variant: 'default', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

function OrderDetailModal({ open, onClose, order, onUpdateStatus, onUpdatePayment }) {
  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader onClose={onClose}>
        Detail Pesanan
      </ModalHeader>
      <ModalBody className="space-y-6">
        {/* Order Info */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">Kode Tracking</p>
            <p className="text-xl font-mono font-bold text-blue-600">{order.tracking_code}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Pelanggan</h4>
          <p className="font-medium text-gray-900">{order.customer?.name}</p>
          <p className="text-sm text-gray-500">{order.customer?.phone}</p>
          {order.customer?.address && (
            <p className="text-sm text-gray-500 mt-1">{order.customer?.address}</p>
          )}
        </div>

        {/* Order Items */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Item Pesanan</h4>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.service?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.qty} {item.service?.unit_type} x {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(order.total_price)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500">Diskon</span>
              <span className="text-green-600">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(order.final_price)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-500">Status Pembayaran</span>
            <PaymentBadge status={order.payment_status} />
          </div>
          {order.paid_amount > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-500">Dibayar</span>
              <span className="text-gray-900">{formatCurrency(order.paid_amount)}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tanggal Pesan</p>
            <p className="font-medium text-gray-900">{formatDateTime(order.created_at)}</p>
          </div>
          {order.pickup_date && (
            <div>
              <p className="text-gray-500">Tanggal Ambil</p>
              <p className="font-medium text-gray-900">{formatDateTime(order.pickup_date)}</p>
            </div>
          )}
        </div>

        {order.notes && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Catatan</p>
            <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{order.notes}</p>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button 
          variant="outline" 
          onClick={() => printReceipt(order)}
          className="mr-auto"
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak Label
        </Button>
        {order.payment_status !== 'PAID' && (
          <Button variant="outline" onClick={onUpdatePayment}>
            Update Pembayaran
          </Button>
        )}
        {!['TAKEN', 'CANCELLED'].includes(order.status) && (
          <Button onClick={onUpdateStatus}>
            Update Status
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

function UpdateStatusModal({ open, onClose, order }) {
  const [newStatus, setNewStatus] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status) => orderService.updateStatus(order.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboard']);
      onClose();
    },
  });

  if (!order) return null;

  const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        Update Status Pesanan
      </ModalHeader>
      <ModalBody className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Kode Tracking</p>
          <p className="font-mono font-bold text-blue-600">{order.tracking_code}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Status Saat Ini</p>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Baru
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allowedTransitions.map((status) => (
              <button
                key={status}
                onClick={() => setNewStatus(status)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  newStatus === status
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <StatusBadge status={status} />
              </button>
            ))}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Batal
        </Button>
        <Button 
          onClick={() => mutation.mutate(newStatus)}
          disabled={!newStatus}
          isLoading={mutation.isPending}
        >
          Update Status
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function UpdatePaymentModal({ open, onClose, order }) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => orderService.updatePayment(order.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['dashboard']);
      onClose();
    },
  });

  if (!order) return null;

  const remaining = order.final_price - (order.paid_amount || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Jika status PAID, otomatis bayar penuh. Jika UNPAID, tidak update amount
    const amount = paymentStatus === 'PAID' ? remaining : 0;
    
    mutation.mutate({
      amount,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        Update Pembayaran
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">{formatCurrency(order.final_price)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Dibayar</span>
              <span>{formatCurrency(order.paid_amount || 0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-900 font-medium">Sisa</span>
              <span className="font-bold text-red-600">{formatCurrency(remaining)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <PaymentMethodSelector
            value={paymentMethod}
            onChange={setPaymentMethod}
          />

          {/* Payment Status */}
          <PaymentStatusSelector
            value={paymentStatus}
            onChange={setPaymentStatus}
          />

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              {paymentStatus === 'PAID' 
                ? `✓ Akan mencatat pembayaran sebesar ${formatCurrency(remaining)} dan menandai sebagai LUNAS` 
                : '⚠ Pesanan akan tetap tercatat sebagai BELUM LUNAS'
              }
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Simpan Pembayaran
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
