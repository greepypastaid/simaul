import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
} from 'lucide-react';
import { customerService } from '@/services/api';
import { 
  Button, 
  Input, 
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Pagination,
} from '@/components/ui';
import { formatDate } from '@/utils';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { page, search }],
    queryFn: async () => {
      const response = await customerService.getAll({ page, search, per_page: 10 });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    },
  });

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const customers = data?.data?.data || [];
  const pagination = data?.data?.meta || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-500 mt-1">Kelola data pelanggan laundry</p>
        </div>
        <Button onClick={() => { setSelectedCustomer(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada pelanggan"
            description="Mulai tambahkan pelanggan baru untuk bisnis laundry Anda"
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pelanggan
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Poin</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {customer.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          {customer.email && (
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-500 truncate max-w-[200px]">
                        {customer.address || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{customer.total_points || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500">
                        {formatDate(customer.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetail(customer)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Add/Edit Modal */}
      <CustomerFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedCustomer(null); }}
        customer={selectedCustomer}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader onClose={() => setShowDeleteModal(false)}>
          Hapus Pelanggan
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus pelanggan <strong>{selectedCustomer?.name}</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button 
            variant="danger" 
            onClick={() => deleteMutation.mutate(selectedCustomer?.id)}
            isLoading={deleteMutation.isPending}
          >
            Hapus
          </Button>
        </ModalFooter>
      </Modal>

      {/* Detail Modal */}
      <CustomerDetailModal
        open={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedCustomer(null); }}
        customer={selectedCustomer}
      />
    </div>
  );
}

function CustomerFormModal({ open, onClose, customer }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => 
      customer 
        ? customerService.update(customer.id, data)
        : customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      onClose();
    },
  });

  useState(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
      });
    } else {
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
  }, [customer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {customer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <Input
            label="Nama"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Masukkan nama pelanggan"
            required
          />
          <Input
            label="No. Telepon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="08xxxxxxxxxx"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {customer ? 'Simpan' : 'Tambah'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function CustomerDetailModal({ open, onClose, customer }) {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['customer-orders', customer?.id],
    queryFn: async () => {
      const response = await customerService.getOrders(customer.id, { per_page: 5 });
      return response.data;
    },
    enabled: !!customer?.id && open,
  });

  if (!customer) return null;

  const orders = ordersData?.data?.data || [];

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <ModalHeader onClose={onClose}>
        Detail Pelanggan
      </ModalHeader>
      <ModalBody className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {customer.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
            <div className="mt-2 space-y-1">
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {customer.address}
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{customer.total_points || 0}</span>
            </div>
            <p className="text-xs text-gray-500">Poin</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Riwayat Pesanan Terakhir</h4>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada pesanan</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.tracking_code}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Tutup
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function getStatusVariant(status) {
  const variants = {
    BOOKED: 'warning',
    PENDING: 'info',
    WASHING: 'primary',
    DRYING: 'primary',
    IRONING: 'primary',
    COMPLETED: 'success',
    TAKEN: 'success',
    CANCELLED: 'danger',
  };
  return variants[status] || 'default';
}
