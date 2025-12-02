import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { formatDate, getInitials } from '@/utils';
import { ShoppingCart, Users, Package, Settings } from 'lucide-react';

function DashboardPage() {
  const { user, logout } = useAuthStore();

  const quickActions = [
    { icon: ShoppingCart, label: 'Pesanan Baru', href: '/admin/orders/create' },
    { icon: Users, label: 'Pelanggan', href: '/admin/customers' },
    { icon: Package, label: 'Layanan', href: '/admin/services' },
    { icon: Settings, label: 'Pengaturan', href: '/admin/settings' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {user?.name}!</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Keluar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { emoji: '📊', value: '0', label: 'Total Pesanan' },
          { emoji: '✅', value: '0', label: 'Selesai' },
          { emoji: '⏳', value: '0', label: 'Diproses' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">{stat.emoji}</div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>Detail akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bergabung</p>
                <p className="font-medium text-gray-900">
                  {user?.created_at ? formatDate(user.created_at) : '-'}
                </p>
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Button variant="outline" className="w-full h-24 flex-col gap-2">
                  <action.icon className="w-6 h-6" />
                  <span>{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
