import { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { User, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 mt-1">Kelola profil dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>Profil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nama"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Nama lengkap"
            />
            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              placeholder="email@example.com"
            />
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Profil
            </Button>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-yellow-600" />
              </div>
              <CardTitle>Ubah Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Password Saat Ini"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              placeholder="••••••••"
            />
            <Input
              label="Password Baru"
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              placeholder="••••••••"
            />
            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={passwordData.new_password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
              placeholder="••••••••"
            />
            <Button variant="secondary" className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Ubah Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* App Info */}
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-lg">Simaul</h3>
            <p className="text-gray-500 text-sm mt-1">Sistem Manajemen Laundry</p>
            <p className="text-gray-400 text-xs mt-2">Versi 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
