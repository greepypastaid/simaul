import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Tentang Simaul</h1>
        <p className="mt-4 text-gray-600">
          Sistem Manajemen Laundry - Solusi lengkap untuk bisnis laundry Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fitur Utama</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Manajemen pesanan dan pelanggan</li>
            <li>Tracking pesanan secara real-time</li>
            <li>Sistem booking online</li>
            <li>Laporan penjualan dan statistik</li>
            <li>Manajemen inventori material</li>
            <li>Multi-layanan dengan harga fleksibel</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teknologi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>React + Vite</li>
                <li>TailwindCSS</li>
                <li>React Query</li>
                <li>Zustand</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Laravel 12</li>
                <li>Laravel Sanctum</li>
                <li>MySQL</li>
                <li>RESTful API</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AboutPage;
