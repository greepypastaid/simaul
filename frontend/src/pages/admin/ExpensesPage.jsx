import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, DollarSign, Calendar, Trash2, Edit2 } from 'lucide-react';
import { expenseService } from '@/services/api';
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

const CATEGORIES = [
  { value: '', label: 'Semua Kategori' },
  { value: 'OPERATIONAL', label: 'Operasional' },
  { value: 'UTILITY', label: 'Utilitas (Listrik, Air)' },
  { value: 'MAINTENANCE', label: 'Perawatan & Perbaikan' },
  { value: 'SALARY', label: 'Gaji Karyawan' },
  { value: 'MARKETING', label: 'Marketing & Promosi' },
  { value: 'INVENTORY', label: 'Pembelian Bahan' },
  { value: 'OTHER', label: 'Lainnya' },
];

const PAYMENT_TYPES = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'TRANSFER', label: 'Transfer' },
];

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', { page, category, search }],
    queryFn: async () => {
      const response = await expenseService.getAll({
        page,
        category: category || undefined,
        search: search || undefined,
        per_page: 15,
      });
      return response.data;
    },
  });

  // Normalize API response so components always work with an array
  const rawExpenses = data;
  const expenses = Array.isArray(rawExpenses)
    ? rawExpenses
    : Array.isArray(rawExpenses?.data)
    ? rawExpenses.data
    : Array.isArray(rawExpenses?.data?.data)
    ? rawExpenses.data.data
    : [];
  const expensesPagination = rawExpenses && !Array.isArray(rawExpenses)
    ? (rawExpenses.meta ?? { current_page: rawExpenses.current_page, last_page: rawExpenses.last_page })
    : null;

  const { data: summary } = useQuery({
    queryKey: ['expenses-summary'],
    queryFn: async () => {
      const response = await expenseService.getSummary();
      return response.data.data;
    },
  });

  const handleAdd = () => {
    setSelectedExpense(null);
    setShowModal(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const getCategoryLabel = (value) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getCategoryBadge = (category) => {
    const variants = {
      OPERATIONAL: 'info',
      UTILITY: 'warning',
      MAINTENANCE: 'danger',
      SALARY: 'success',
      MARKETING: 'primary',
      INVENTORY: 'default',
      OTHER: 'default',
    };
    return <Badge variant={variants[category] || 'default'}>{getCategoryLabel(category)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengeluaran</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola catatan pengeluaran bisnis</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengeluaran
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.total)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kategori Terbanyak</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {Object.entries(summary.summary || {}).length > 0
                    ? Object.entries(summary.summary).sort((a, b) => b[1].total - a[1].total)[0][1].label
                    : '-'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Periode</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
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
                placeholder="Cari deskripsi atau catatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="Belum ada pengeluaran"
            description="Mulai catat pengeluaran bisnis Anda"
            action={
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengeluaran
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.expense_date)}</TableCell>
                    <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        {expense.notes && (
                          <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.payment_type === 'CASH' ? 'success' : 'info'}>
                        {expense.payment_type === 'CASH' ? 'Tunai' : 'Transfer'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {expensesPagination && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={expensesPagination.current_page || 1}
                  totalPages={expensesPagination.last_page || 1}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <ExpenseModal
          expense={selectedExpense}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function ExpenseModal({ expense, open, onClose }) {
  const [formData, setFormData] = useState({
    category: expense?.category || 'OPERATIONAL',
    payment_type: expense?.payment_type || 'CASH',
    amount: expense?.amount || '',
    description: expense?.description || '',
    notes: expense?.notes || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) =>
      expense ? expenseService.update(expense.id, data) : expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['expense-summary']);
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
          {expense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {CATEGORIES.filter(c => c.value).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={formData.payment_type}
                onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {PAYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Bayar listrik bulan Desember"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Catatan tambahan..."
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {expense ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
