import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/components/ui';
import { 
  Sparkles, 
  Clock, 
  Shield, 
  Truck, 
  Search, 
  Calendar,
  Star,
  ChevronRight
} from 'lucide-react';

/**
 * Home Page - Modern Landing Page for Laundry Service
 */
function HomePage() {
  const services = [
    {
      title: 'Cuci Reguler',
      description: 'Layanan cuci harian dengan hasil bersih maksimal',
      price: 'Mulai Rp 7.000/kg',
      icon: Sparkles,
    },
    {
      title: 'Express 6 Jam',
      description: 'Layanan cepat untuk kebutuhan mendesak',
      price: 'Mulai Rp 15.000/kg',
      icon: Clock,
    },
    {
      title: 'Dry Cleaning',
      description: 'Perawatan khusus untuk pakaian premium',
      price: 'Mulai Rp 25.000/pcs',
      icon: Shield,
    },
    {
      title: 'Antar Jemput',
      description: 'Gratis antar jemput dalam radius 5km',
      price: 'Gratis',
      icon: Truck,
    },
  ];

  const stats = [
    { value: '10K+', label: 'Pelanggan Puas' },
    { value: '50K+', label: 'Pesanan Selesai' },
    { value: '4.9', label: 'Rating Bintang' },
    { value: '24/7', label: 'Layanan' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Laundry Terpercaya Sejak 2020
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Pakaian Bersih,
          <br />
          <span className="text-blue-600">Hidup Lebih Nyaman</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Simaul hadir dengan layanan laundry profesional. 
          Cuci, setrika, dan antar langsung ke rumah Anda.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/booking">
            <Button size="lg" className="w-full sm:w-auto">
              <Calendar className="w-5 h-5 mr-2" />
              Booking Sekarang
            </Button>
          </Link>
          <Link to="/tracking">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Search className="w-5 h-5 mr-2" />
              Lacak Pesanan
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 rounded-2xl p-8 sm:p-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-blue-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Layanan Kami</h2>
          <p className="text-gray-600 mt-2">Pilih layanan sesuai kebutuhan Anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{service.title}</h3>
                <p className="text-gray-500 text-sm mt-1 mb-4">{service.description}</p>
                <p className="text-blue-600 font-medium">{service.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 rounded-2xl p-8 sm:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Cara Kerja</h2>
          <p className="text-gray-600 mt-2">Mudah dan cepat dalam 4 langkah</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Booking Online', desc: 'Pilih layanan dan jadwal melalui website' },
            { step: '2', title: 'Penjemputan', desc: 'Kurir kami akan menjemput pakaian Anda' },
            { step: '3', title: 'Proses Cuci', desc: 'Pakaian dicuci dengan standar terbaik' },
            { step: '4', title: 'Pengantaran', desc: 'Pakaian bersih diantar ke rumah Anda' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12">
        <div className="flex items-center justify-center gap-1 text-yellow-300 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-6 h-6 fill-yellow-300" />
          ))}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Bergabung dengan 10.000+ Pelanggan Puas
        </h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Nikmati kemudahan layanan laundry profesional dengan harga terjangkau
        </p>
        <Link to="/booking">
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
            Mulai Sekarang
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
