import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, TrendingUp, Package, Briefcase, UserCog, DollarSign, Calendar } from 'lucide-react';
import { reportService } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils';
import { Spinner, Badge } from '@/components/ui';

const TABS = [
  { id: 'financial', label: 'Keuangan', icon: DollarSign },
  { id: 'profit-loss', label: 'Laba Rugi', icon: TrendingUp },
  { id: 'inventory', label: 'Inventori', icon: Package },
  { id: 'assets', label: 'Aset', icon: Briefcase },
  { id: 'employees', label: 'Karyawan', icon: UserCog },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('financial');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <p className="text-sm text-gray-500 mt-1">Laporan keuangan dan operasional</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'financial' && <FinancialReport month={month} year={year} setMonth={setMonth} setYear={setYear} />}
          {activeTab === 'profit-loss' && <ProfitLossReport />}
          {activeTab === 'inventory' && <InventoryReport />}
          {activeTab === 'assets' && <AssetReport />}
          {activeTab === 'employees' && <EmployeeReport />}
        </div>
      </div>
    </div>
  );
}

function FinancialReport({ month, year, setMonth, setYear }) {
  const { data, isLoading } = useQuery({
    queryKey: ['financial-summary', { month, year }],
    queryFn: async () => {
      const response = await reportService.getFinancialSummary({ month, year });
      return response.data;
    },
  });

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const profitMarginColor = data.data.profit_margin >= 30 ? 'text-green-600' :
                            data.data.profit_margin >= 15 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <input
          type="number"
          min="2020"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <p className="text-sm text-green-700 font-medium">Pendapatan</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(data.data.revenue)}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <p className="text-sm text-red-700 font-medium">Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {formatCurrency(data.data.expenses)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
          <p className="text-sm text-orange-700 font-medium">Gaji</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            {formatCurrency(data.data.salaries)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <p className="text-sm text-blue-700 font-medium">Profit</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatCurrency(data.data.profit)}
          </p>
          <p className={`text-sm ${profitMarginColor} mt-1 font-semibold`}>
            Margin: {data.data.profit_margin}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan Harian</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {data.data.revenue_by_day.length > 0 ? (
              <div className="space-y-2">
                {data.data.revenue_by_day.map((item) => (
                  <div key={item.day} className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-sm text-gray-600">Tanggal {item.day}</span>
                    <span className="font-semibold text-green-600">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Tidak ada data</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengeluaran per Kategori</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {data.data.expenses_by_category.length > 0 ? (
              <div className="space-y-3">
                {data.data.expenses_by_category.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.total / data.data.total_expenses) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Tidak ada data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfitLossReport() {
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: ['profit-loss', { fromDate, toDate }],
    queryFn: async () => {
      const response = await reportService.getProfitLoss({ from_date: fromDate, to_date: toDate });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const isProfit = data.data.net_profit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dari</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sampai</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Laba Rugi</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-700 font-medium">Pendapatan</span>
            <span className="text-xl font-bold text-green-600">{formatCurrency(data.data.revenue)}</span>
          </div>

          <div>
            <p className="text-gray-700 font-medium mb-2">Pengeluaran</p>
            <div className="pl-4 space-y-2">
              {Object.entries(data.data.expenses).map(([category, amount]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span className="text-gray-600">{category}</span>
                  <span className="text-red-600">{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gaji Karyawan</span>
                <span className="text-red-600">{formatCurrency(data.data.salaries)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Total Pengeluaran</span>
              <span className="text-lg font-bold text-red-600">{formatCurrency(data.data.total_expenses)}</span>
            </div>
          </div>

          <div className={`flex justify-between items-center pt-3 border-t-2 ${isProfit ? 'border-green-500' : 'border-red-500'}`}>
            <span className="text-lg font-bold text-gray-900">{isProfit ? 'Laba Bersih' : 'Rugi Bersih'}</span>
            <span className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(data.data.net_profit))}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">Profit Margin</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{data.data.profit_margin}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      const response = await reportService.getInventoryReport();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Item</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.data.total_items}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Stok Menipis</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{data.data.low_stock_count}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Nilai</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(data.data.total_value)}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min. Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga/Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Nilai</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.materials.map((material) => {
              const isLowStock = material.stock < material.min_stock;
              return (
                <tr key={material.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-900">{material.name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={isLowStock ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                      {material.stock} {material.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {material.min_stock} {material.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {formatCurrency(material.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    {formatCurrency(material.stock * material.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLowStock ? (
                      <Badge variant="danger">Stok Menipis</Badge>
                    ) : (
                      <Badge variant="success">Normal</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssetReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['asset-report'],
    queryFn: async () => {
      const response = await reportService.getAssetReport();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Aset</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.data.total_assets}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Nilai Pembelian</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(data.data.total_purchase_value)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Nilai Saat Ini</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(data.data.total_current_value)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Depresiasi</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(data.data.total_depreciation)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown per Tipe</h3>
        <div className="space-y-4">
          {data.data.by_type.map((item) => (
            <div key={item.type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900">{item.label}</h4>
                <Badge variant="default">{item.count} unit</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nilai Beli</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(item.purchase_value)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Nilai Sekarang</p>
                  <p className="font-semibold text-green-600">{formatCurrency(item.current_value)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Depresiasi</p>
                  <p className="font-semibold text-red-600">
                    {formatCurrency(item.purchase_value - item.current_value)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployeeReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-report'],
    queryFn: async () => {
      const response = await reportService.getEmployeeReport();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Karyawan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.data.total_employees}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Gaji Pokok</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(data.data.total_base_salary)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Gaji Dibayar Bulan Ini</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(data.data.current_month_paid)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown per Posisi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.data.by_position.map((item) => (
            <div key={item.position} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900">{item.label}</h4>
                <Badge variant="primary">{item.count} orang</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Gaji Pokok</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(item.total_salary)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
