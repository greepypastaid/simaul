import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Boxes,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { materialService } from '@/services/api';
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
  Pagination,
} from '@/components/ui';
import { formatCurrency } from '@/utils';

const UNIT_OPTIONS = [
  { value: 'PCS', label: 'Pieces' },
  { value: 'LITER', label: 'Liter' },
  { value: 'KG', label: 'Kilogram' },
  { value: 'BOX', label: 'Box' },
  { value: 'PACK', label: 'Pack' },
  { value: 'BOTTLE', label: 'Botol' },
];

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['materials', { page, search }],
    queryFn: async () => {
      const response = await materialService.getAll({ page, search, per_page: 10 });
      return response.data;
    },
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['materials-low-stock'],
    queryFn: async () => {
      const response = await materialService.getLowStock();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => materialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
      setShowDeleteModal(false);
      setSelectedMaterial(null);
    },
  });

  const handleEdit = (material) => {
    setSelectedMaterial(material);
    setShowModal(true);
  };

  const handleDelete = (material) => {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  };

  const handleAddStock = (material) => {
    setSelectedMaterial(material);
    setShowStockModal(true);
  };

  const materials = data?.data?.data || [];
  const pagination = data?.data?.meta || {};
  const lowStockCount = lowStockData?.data?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material & Inventori</h1>
          <p className="text-gray-500 mt-1">Kelola stok material laundry</p>
        </div>
        <Button onClick={() => { setSelectedMaterial(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Material
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-yellow-800">
              {lowStockCount} material dengan stok menipis
            </p>
            <p className="text-sm text-yellow-600">
              Segera lakukan restok untuk menghindari kehabisan material
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Belum ada material"
            description="Tambahkan material untuk mengelola inventori laundry"
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Material
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Min. Stok</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => {
                  const isLowStock = material.stock_qty <= material.min_stock_alert;
                  return (
                    <TableRow key={material.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isLowStock ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <Package className={`w-5 h-5 ${
                              isLowStock ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{material.name}</p>
                            {material.description && (
                              <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                {material.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {material.stock_qty} {material.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-500">
                          {material.min_stock_alert} {material.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">
                          {formatCurrency(material.purchase_price || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="danger">Stok Rendah</Badge>
                        ) : material.is_active ? (
                          <Badge variant="success">Aktif</Badge>
                        ) : (
                          <Badge variant="default">Nonaktif</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAddStock(material)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Tambah Stok"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(material)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(material)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
      <MaterialFormModal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedMaterial(null); }}
        material={selectedMaterial}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        open={showStockModal}
        onClose={() => { setShowStockModal(false); setSelectedMaterial(null); }}
        material={selectedMaterial}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader onClose={() => setShowDeleteModal(false)}>
          Hapus Material
        </ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus material <strong>{selectedMaterial?.name}</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button 
            variant="danger" 
            onClick={() => deleteMutation.mutate(selectedMaterial?.id)}
            isLoading={deleteMutation.isPending}
          >
            Hapus
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function MaterialFormModal({ open, onClose, material }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: 'PCS',
    stock_qty: '',
    min_stock_alert: '',
    purchase_price: '',
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        description: material.description || '',
        unit: material.unit || 'PCS',
        stock_qty: material.stock_qty || '',
        min_stock_alert: material.min_stock_alert || '',
        purchase_price: material.purchase_price || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        unit: 'PCS',
        stock_qty: '',
        min_stock_alert: '',
        purchase_price: '',
      });
    }
  }, [material, open]);

  const mutation = useMutation({
    mutationFn: (data) => 
      material 
        ? materialService.update(material.id, data)
        : materialService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['materials-low-stock']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      stock_qty: parseFloat(formData.stock_qty),
      min_stock_alert: parseFloat(formData.min_stock_alert),
      purchase_price: parseFloat(formData.purchase_price) || 0,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        {material ? 'Edit Material' : 'Tambah Material'}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <Input
            label="Nama Material"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Deterjen"
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi material (opsional)"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stok Awal"
              type="number"
              value={formData.stock_qty}
              onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
              placeholder="0"
              required
              disabled={!!material}
            />
            <Select
              label="Satuan"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={UNIT_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimal Stok Alert"
              type="number"
              value={formData.min_stock_alert}
              onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
              placeholder="10"
              required
            />
            <Input
              label="Harga Beli"
              type="number"
              value={formData.purchase_price}
              onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
              placeholder="0"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {material ? 'Simpan' : 'Tambah'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function AddStockModal({ open, onClose, material }) {
  const [formData, setFormData] = useState({
    qty: '',
    notes: '',
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setFormData({ qty: '', notes: '' });
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: (data) => materialService.addStock(material.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['materials-low-stock']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      qty: parseFloat(formData.qty),
      notes: formData.notes,
    });
  };

  if (!material) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        Tambah Stok - {material.name}
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Stok Saat Ini</p>
            <p className="text-xl font-bold text-gray-900">
              {material.stock_qty} {material.unit}
            </p>
          </div>
          <Input
            label={`Jumlah Tambahan (${material.unit})`}
            type="number"
            value={formData.qty}
            onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
            placeholder="0"
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan restok (opsional)"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Tambah Stok
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
