import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Clock,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { dashboardService } from '@/services/api';
import { StatCard, Badge, Spinner } from '@/components/ui';
import { formatCurrency } from '@/utils';

export default function AdminDashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardService.getStats();
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">Gagal memuat data dashboard</p>
      </div>
    );
  }

  const { today, this_month, pending_actions, inventory_alerts } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Ringkasan bisnis laundry Anda hari ini</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pesanan Hari Ini"
          value={today?.new_orders || 0}
          icon={ShoppingCart}
          iconColor="blue"
        />
        <StatCard
          title="Pesanan Selesai"
          value={today?.completed_orders || 0}
          icon={CheckCircle}
          iconColor="green"
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(today?.revenue || 0)}
          icon={DollarSign}
          iconColor="yellow"
        />
        <StatCard
          title="Booking Baru"
          value={today?.new_bookings || 0}
          icon={Clock}
          iconColor="purple"
        />
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pesanan Bulan Ini</p>
              <p className="text-xl font-bold text-gray-900">{this_month?.total_orders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendapatan Bulan Ini</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(this_month?.total_revenue || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pelanggan Baru</p>
              <p className="text-xl font-bold text-gray-900">{this_month?.new_customers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Required Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tindakan Diperlukan</h2>
          </div>
          <div className="p-4 space-y-3">
            <ActionItem
              label="Booking Menunggu Konfirmasi"
              count={pending_actions?.booked || 0}
              href="/admin/orders?status=BOOKED"
              color="yellow"
            />
            <ActionItem
              label="Pesanan Menunggu"
              count={pending_actions?.pending || 0}
              href="/admin/orders?status=PENDING"
              color="blue"
            />
            <ActionItem
              label="Sedang Diproses"
              count={pending_actions?.processing || 0}
              href="/admin/orders?status=processing"
              color="cyan"
            />
            <ActionItem
              label="Siap Diambil"
              count={pending_actions?.ready_pickup || 0}
              href="/admin/orders?status=COMPLETED"
              color="green"
            />
            <ActionItem
              label="Belum Dibayar"
              count={pending_actions?.unpaid || 0}
              href="/admin/orders?payment=UNPAID"
              color="red"
            />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Stok Menipis</h2>
            {inventory_alerts?.low_stock_count > 0 && (
              <Badge variant="danger">
                {inventory_alerts.low_stock_count} item
              </Badge>
            )}
          </div>
          <div className="p-4">
            {inventory_alerts?.low_stock_items?.length > 0 ? (
              <div className="space-y-3">
                {inventory_alerts.low_stock_items.slice(0, 5).map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Minimal: {item.min_stock_alert} {item.unit}
                        </p>
                      </div>
                    </div>
                    <Badge variant="danger">
                      {item.stock_qty} {item.unit}
                    </Badge>
                  </div>
                ))}
                <Link 
                  to="/admin/materials"
                  className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Semua stok aman</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionItem({ label, count, href, color }) {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <Link 
      to={href}
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
        {count}
      </span>
    </Link>
  );
}
