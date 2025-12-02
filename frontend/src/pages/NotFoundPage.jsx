import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mt-2 mb-8">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link to="/">
          <Button>Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
