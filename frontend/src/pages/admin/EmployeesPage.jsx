import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, UserCog, DollarSign, Edit2, Trash2, Calendar } from 'lucide-react';
import { employeeService } from '@/services/api';
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

const POSITIONS = [
  { value: '', label: 'Semua Posisi' },
  { value: 'WASHER', label: 'Pencuci' },
  { value: 'IRONER', label: 'Penyetrika' },
  { value: 'PACKER', label: 'Packing' },
  { value: 'DELIVERY', label: 'Kurir' },
  { value: 'HELPER', label: 'Helper' },
];

export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [position, setPosition] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { page, position, search }],
    queryFn: async () => {
      const response = await employeeService.getAll({
        page,
        position: position || undefined,
        search: search || undefined,
        per_page: 15,
      });
      return response.data;
    },
  });

  // Normalize API response so components always work with an array
  const rawEmployees = data;
  const employees = Array.isArray(rawEmployees)
    ? rawEmployees
    : Array.isArray(rawEmployees?.data)
    ? rawEmployees.data
    : Array.isArray(rawEmployees?.data?.data)
    ? rawEmployees.data.data
    : [];
  const employeesPagination = rawEmployees && !Array.isArray(rawEmployees)
    ? (rawEmployees.meta ?? { current_page: rawEmployees.current_page, last_page: rawEmployees.last_page })
    : null;

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['dashboard']);
    },
  });

  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handlePaySalary = (employee) => {
    setSelectedEmployee(employee);
    setShowSalaryModal(true);
  };

  const handleDelete = (employee) => {
    if (confirm(`Hapus karyawan "${employee.name}"?`)) {
      deleteMutation.mutate(employee.id);
    }
  };

  const getPositionLabel = (value) => {
    return POSITIONS.find(p => p.value === value)?.label || value;
  };

  const getPositionBadge = (position) => {
    const variants = {
      WASHER: 'primary',
      IRONER: 'info',
      PACKER: 'success',
      DELIVERY: 'warning',
      HELPER: 'default',
    };
    return <Badge variant={variants[position] || 'default'}>{getPositionLabel(position)}</Badge>;
  };

  const getStatusBadge = (status) => {
    return status === 'ACTIVE' ? (
      <Badge variant="success">Aktif</Badge>
    ) : (
      <Badge variant="danger">Tidak Aktif</Badge>
    );
  };

  const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length || 0;
  const totalSalary = employees.filter(e => e.status === 'ACTIVE').reduce((sum, e) => sum + parseFloat(e.base_salary || 0), 0) || 0;
  const averageSalary = activeEmployees > 0 ? totalSalary / activeEmployees : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Karyawan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data karyawan dan gaji</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Karyawan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Karyawan Aktif</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCog className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Gaji Pokok</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalSalary)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rata-rata Gaji</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(averageSalary)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau nomor telepon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {POSITIONS.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="Belum ada karyawan"
            description="Mulai tambahkan data karyawan"
            action={
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Karyawan
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead className="text-right">Gaji Pokok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        {employee.address && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {employee.address}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPositionBadge(employee.position)}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{formatDate(employee.join_date)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(employee.base_salary)}
                    </TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePaySalary(employee)}
                          className="text-green-600 hover:text-green-700"
                          title="Bayar Gaji"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee)}
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

            {employeesPagination && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={employeesPagination.current_page || 1}
                  totalPages={employeesPagination.last_page || 1}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {showSalaryModal && (
        <PaySalaryModal
          employee={selectedEmployee}
          open={showSalaryModal}
          onClose={() => setShowSalaryModal(false)}
        />
      )}
    </div>
  );
}

function EmployeeModal({ employee, open, onClose }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    position: employee?.position || 'WASHER',
    phone: employee?.phone || '',
    address: employee?.address || '',
    join_date: employee?.join_date || new Date().toISOString().split('T')[0],
    base_salary: employee?.base_salary || '',
    status: employee?.status || 'ACTIVE',
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) =>
      employee ? employeeService.update(employee.id, data) : employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['dashboard']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          {employee ? 'Edit Karyawan' : 'Tambah Karyawan'}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posisi *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {POSITIONS.filter(p => p.value).map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="08XXXXXXXXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Masuk *
              </label>
              <input
                type="date"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Alamat lengkap..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gaji Pokok *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {employee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function PaySalaryModal({ employee, open, onClose }) {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    bonus: 0,
    deduction: 0,
    payment_date: currentDate.toISOString().split('T')[0],
    notes: '',
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => employeeService.paySalary(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['dashboard']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const totalSalary = parseFloat(employee?.base_salary || 0) + 
                     parseFloat(formData.bonus || 0) - 
                     parseFloat(formData.deduction || 0);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          Bayar Gaji - {employee?.name}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Posisi</p>
                <p className="font-medium">{POSITIONS.find(p => p.value === employee?.position)?.label}</p>
              </div>
              <div>
                <p className="text-gray-500">Gaji Pokok</p>
                <p className="font-semibold text-green-600">{formatCurrency(employee?.base_salary)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan *
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun *
              </label>
              <input
                type="number"
                min="2020"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potongan
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.deduction}
                onChange={(e) => setFormData({ ...formData, deduction: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Pembayaran *
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gaji Pokok:</span>
                <span className="font-medium">{formatCurrency(employee?.base_salary)}</span>
              </div>
              {formData.bonus > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Bonus:</span>
                  <span className="font-medium">+{formatCurrency(formData.bonus)}</span>
                </div>
              )}
              {formData.deduction > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Potongan:</span>
                  <span className="font-medium">-{formatCurrency(formData.deduction)}</span>
                </div>
              )}
              <div className="border-t border-blue-300 pt-2 flex justify-between">
                <span className="font-semibold">Total Gaji:</span>
                <span className="font-bold text-lg text-blue-600">{formatCurrency(totalSalary)}</span>
              </div>
            </div>
          </div>

          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {mutation.error.response?.data?.message || 'Terjadi kesalahan saat membayar gaji'}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Bayar Gaji
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
