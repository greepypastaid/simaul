import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

/**
 * Home Page
 * Landing page with feature highlights
 */
function HomePage() {
  const features = [
    {
      title: 'React + Vite',
      description: 'Lightning-fast development with Hot Module Replacement',
      icon: '⚡',
    },
    {
      title: 'TailwindCSS',
      description: 'Utility-first CSS framework for rapid UI development',
      icon: '🎨',
    },
    {
      title: 'Laravel 12 API',
      description: 'Robust backend with RESTful API architecture',
      icon: '🚀',
    },
    {
      title: 'Authentication',
      description: 'Secure authentication with Laravel Sanctum',
      icon: '🔐',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Welcome to <span className="text-blue-600">Simaul</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A modern full-stack application with React.js, TailwindCSS, and Laravel 12
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link to="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl mb-2">⚛️</div>
            <p className="font-medium text-gray-900 dark:text-white">React.js</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🎨</div>
            <p className="font-medium text-gray-900 dark:text-white">TailwindCSS</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🐘</div>
            <p className="font-medium text-gray-900 dark:text-white">Laravel 12</p>
          </div>
          <div className="p-4">
            <div className="text-3xl mb-2">🗄️</div>
            <p className="font-medium text-gray-900 dark:text-white">REST API</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
