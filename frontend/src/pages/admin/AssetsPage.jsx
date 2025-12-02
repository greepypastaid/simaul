import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Briefcase, TrendingDown, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { assetService } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils';
import {
  Button,
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
  Pagination,
} from '@/components/ui';

const ASSET_TYPES = [
  { value: '', label: 'Semua Tipe' },
  { value: 'WASHING_MACHINE', label: 'Mesin Cuci' },
  { value: 'DRYER', label: 'Mesin Pengering' },
  { value: 'IRON', label: 'Setrika' },
  { value: 'EQUIPMENT', label: 'Peralatan' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'VEHICLE', label: 'Kendaraan' },
  { value: 'OTHER', label: 'Lainnya' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'INACTIVE', label: 'Tidak Aktif' },
];

export default function AssetsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assets', { page, type, search }],
    queryFn: async () => {
      const response = await assetService.getAll({
        page,
        type: type || undefined,
        search: search || undefined,
        per_page: 15,
      });
      return response.data;
    },
  });

  // Normalize API response so components always work with an array
  const rawAssets = data;
  const assets = Array.isArray(rawAssets)
    ? rawAssets
    : Array.isArray(rawAssets?.data)
    ? rawAssets.data
    : Array.isArray(rawAssets?.data?.data)
    ? rawAssets.data.data
    : [];
  const assetsPagination = rawAssets && !Array.isArray(rawAssets)
    ? (rawAssets.meta ?? { current_page: rawAssets.current_page, last_page: rawAssets.last_page })
    : null;

  const { data: summary } = useQuery({
    queryKey: ['assets-summary'],
    queryFn: async () => {
      const response = await assetService.getSummary();
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => assetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      queryClient.invalidateQueries(['asset-summary']);
    },
  });

  const handleAdd = () => {
    setSelectedAsset(null);
    setShowModal(true);
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleDelete = (asset) => {
    if (confirm(`Hapus aset "${asset.name}"?`)) {
      deleteMutation.mutate(asset.id);
    }
  };

  const getTypeLabel = (value) => {
    return ASSET_TYPES.find(t => t.value === value)?.label || value;
  };

  const getTypeBadge = (type) => {
    const variants = {
      WASHING_MACHINE: 'primary',
      DRYER: 'info',
      IRON: 'warning',
      EQUIPMENT: 'default',
      FURNITURE: 'default',
      VEHICLE: 'success',
      OTHER: 'default',
    };
    return <Badge variant={variants[type] || 'default'}>{getTypeLabel(type)}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: 'success',
      MAINTENANCE: 'warning',
      INACTIVE: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aset</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola aset bisnis (mesin cuci, setrika, dll)</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Aset
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Nilai Pembelian</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.total_purchase_value)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nilai Saat Ini</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(summary.total_current_value)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Depresiasi</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(summary.total_depreciation)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, merk, atau model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : assets.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Belum ada aset"
            description="Mulai catat aset bisnis Anda"
            action={
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Aset
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Aset</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Merk/Model</TableHead>
                  <TableHead>Tanggal Beli</TableHead>
                  <TableHead className="text-right">Harga Beli</TableHead>
                  <TableHead className="text-right">Nilai Saat Ini</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        {asset.serial_number && (
                          <p className="text-sm text-gray-500">S/N: {asset.serial_number}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(asset.type)}</TableCell>
                    <TableCell>
                      {asset.brand && asset.model ? (
                        <div>
                          <p className="text-sm font-medium">{asset.brand}</p>
                          <p className="text-xs text-gray-500">{asset.model}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(asset.purchase_date)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(asset.purchase_price)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(asset.current_value)}
                    </TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {assetsPagination && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={assetsPagination.current_page || 1}
                  totalPages={assetsPagination.last_page || 1}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <AssetModal
          asset={selectedAsset}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function AssetModal({ asset, open, onClose }) {
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    type: asset?.type || 'WASHING_MACHINE',
    brand: asset?.brand || '',
    model: asset?.model || '',
    serial_number: asset?.serial_number || '',
    purchase_price: asset?.purchase_price || '',
    purchase_date: asset?.purchase_date || new Date().toISOString().split('T')[0],
    useful_life_months: asset?.useful_life_months || 60,
    description: asset?.description || '',
    status: asset?.status || 'ACTIVE',
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) =>
      asset ? assetService.update(asset.id, data) : assetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      queryClient.invalidateQueries(['asset-summary']);
      queryClient.invalidateQueries(['dashboard']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          {asset ? 'Edit Aset' : 'Tambah Aset'}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Aset *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Mesin Cuci LG 10kg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Aset *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {ASSET_TYPES.filter(t => t.value).map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Merk
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: LG"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: T2310VSPM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor Seri"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Beli *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Beli *
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umur Ekonomis (Bulan) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.useful_life_months}
                onChange={(e) => setFormData({ ...formData, useful_life_months: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Informasi tambahan tentang aset..."
            />
          </div>

          {formData.purchase_price && formData.useful_life_months && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Depresiasi per bulan:</strong>{' '}
                {formatCurrency(formData.purchase_price / formData.useful_life_months)}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {asset ? 'Simpan Perubahan' : 'Tambah Aset'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
