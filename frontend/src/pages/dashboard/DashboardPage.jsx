import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Spinner, Badge } from '@/components/ui';
import { formatDate, formatCurrency, getInitials } from '@/utils';
import { ShoppingCart, Users, Package, Settings, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calendar, Clock, CheckCircle } from 'lucide-react';
import { dashboardService } from '@/services/api';

function DashboardPage() {
  const { user, logout } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardService.getStats();
      return response.data.data;
    },
    refetchInterval: 30000,
  });

  const quickActions = [
    { icon: ShoppingCart, label: 'Pesanan Baru', href: '/admin/orders/create', color: 'blue' },
    { icon: Users, label: 'Pelanggan', href: '/admin/customers', color: 'green' },
    { icon: Package, label: 'Layanan', href: '/admin/services', color: 'purple' },
    { icon: Settings, label: 'Pengaturan', href: '/admin/settings', color: 'gray' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const profitMargin = stats?.this_month?.total_revenue > 0 
    ? ((stats.this_month.net_profit / stats.this_month.total_revenue) * 100).toFixed(1)
    : 0;
  const isProfit = stats?.this_month?.net_profit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {user?.name}!</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Keluar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pesanan Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.today?.new_orders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Selesai: {stats?.today?.completed_orders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(stats?.today?.revenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Booking: {stats?.today?.new_bookings || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Pesanan Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.this_month?.total_orders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Pelanggan Baru: {stats?.this_month?.new_customers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Profit Bulan Ini</p>
                <p className={`text-2xl font-bold mt-1 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(stats?.this_month?.net_profit || 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margin: {profitMargin}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isProfit ? 'bg-green-100' : 'bg-red-100'}`}>
                {isProfit ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan & Pengeluaran Bulan Ini</CardTitle>
            <CardDescription>Ringkasan keuangan bulanan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-700">Pendapatan</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(stats?.this_month?.total_revenue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-700">Pengeluaran</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(stats?.this_month?.total_expenses || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-900 font-semibold">{isProfit ? 'Profit Bersih' : 'Rugi Bersih'}</span>
                <span className={`font-bold text-lg ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(stats?.this_month?.net_profit || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tindakan Diperlukan</CardTitle>
            <CardDescription>Pesanan yang memerlukan perhatian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Booking Baru</span>
                </div>
                <Badge variant="warning">{stats?.pending_actions?.booked || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Sedang Diproses</span>
                </div>
                <Badge variant="primary">{stats?.pending_actions?.processing || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Siap Diambil</span>
                </div>
                <Badge variant="success">{stats?.pending_actions?.ready_pickup || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900">Belum Dibayar</span>
                </div>
                <Badge variant="danger">{stats?.pending_actions?.unpaid || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.inventory_alerts?.low_stock_count > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Peringatan Stok Menipis</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {stats.inventory_alerts.low_stock_count} material perlu segera di-restock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.inventory_alerts.low_stock_items.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 font-semibold">
                      {item.stock_qty} {item.unit}
                    </span>
                    <span className="text-xs text-gray-500">
                      (Min: {item.min_stock_alert})
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {stats.inventory_alerts.low_stock_count > 5 && (
              <Link to="/admin/materials" className="block mt-3 text-sm text-red-600 hover:text-red-700 font-medium">
                Lihat semua ({stats.inventory_alerts.low_stock_count}) →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistik Cepat</CardTitle>
            <CardDescription>Ringkasan operasional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700">Karyawan Aktif</span>
                <span className="font-semibold text-gray-900">{stats?.quick_stats?.total_employees || 0} orang</span>
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-gray-700">Total Nilai Aset</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(stats?.quick_stats?.total_assets_value || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Pintasan tugas umum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <action.icon className="w-5 h-5" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
