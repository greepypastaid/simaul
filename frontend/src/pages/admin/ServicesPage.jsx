import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Package,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { serviceService } from '@/services/api';
import { 
  Button, 
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  EmptyState,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import { formatCurrency } from '@/utils';

const UNIT_TYPES = [
  { value: 'KG', label: 'Kilogram (KG)' },
  { value: 'PCS', label: 'Pieces (PCS)' },
  { value: 'METER', label: 'Meter' },
  { value: 'SET', label: 'Set' },
];

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['services', { search }],
    queryFn: async () => {
      const response = await serviceService.getAll({ search });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setShowDeleteModal(false);
      setSelectedService(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => serviceService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
    },
  });

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const services = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Layanan</h1>
          <p className="text-gray-500 mt-1">Kelola layanan laundry Anda</p>
        </div>
        <Button onClick={() => { setSelectedService(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={Package}
            title="Belum ada layanan"
            description="Tambahkan layanan laundry pertama Anda"
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Layanan
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.unit_type}</p>
                  </div>
                </div>
                <Badge variant={service.is_active ? 'success' : 'default'}>
                  {service.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              {service.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Harga</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(service.price)}/{service.unit_type}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleMutation.mutate(service.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title={service.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {service.is_active ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ServiceFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedService(null); }}
        service={selectedService}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader onClose={() => setShowDeleteModal(false)}>
          Hapus Layanan
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus layanan <strong>{selectedService?.name}</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button 
            variant="danger" 
            onClick={() => deleteMutation.mutate(selectedService?.id)}
            isLoading={deleteMutation.isPending}
          >
            Hapus
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function ServiceFormModal({ open, onClose, service }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit_type: 'KG',
    estimated_duration: '',
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        unit_type: service.unit_type || 'KG',
        estimated_duration: service.estimated_duration || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        unit_type: 'KG',
        estimated_duration: '',
      });
    }
  }, [service, open]);

  const mutation = useMutation({
    mutationFn: (data) => 
      service 
        ? serviceService.update(service.id, data)
        : serviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {service ? 'Edit Layanan' : 'Tambah Layanan'}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <Input
            label="Nama Layanan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Cuci Kering"
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi layanan (opsional)"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
              required
            />
            <Select
              label="Satuan"
              value={formData.unit_type}
              onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
              options={UNIT_TYPES}
            />
          </div>
          <Input
            label="Estimasi Durasi (jam)"
            type="number"
            value={formData.estimated_duration}
            onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
            placeholder="Contoh: 24"
          />
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {service ? 'Simpan' : 'Tambah'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
