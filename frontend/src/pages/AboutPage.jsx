import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

/**
 * About Page
 */
function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          About This Project
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          A full-stack application built with modern technologies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Structure</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert">
          <h4 className="font-semibold text-gray-900 dark:text-white">Frontend (React + Vite)</h4>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 mb-4">
            <li>React 18 with Vite for fast development</li>
            <li>TailwindCSS for styling</li>
            <li>React Router for navigation</li>
            <li>Zustand for state management</li>
            <li>React Query for data fetching</li>
            <li>Axios for HTTP requests</li>
          </ul>

          <h4 className="font-semibold text-gray-900 dark:text-white">Backend (Laravel 12)</h4>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
            <li>Laravel 12 with PHP 8.2+</li>
            <li>Laravel Sanctum for API authentication</li>
            <li>RESTful API architecture</li>
            <li>API versioning (v1)</li>
            <li>Form Request validation</li>
            <li>API Resources for response transformation</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Practices Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>Component-based architecture</li>
                <li>Separation of concerns</li>
                <li>Custom hooks for logic reuse</li>
                <li>Centralized state management</li>
                <li>Protected & Guest routes</li>
                <li>Consistent API service layer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backend</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                <li>API versioning</li>
                <li>Standardized API responses</li>
                <li>Request validation</li>
                <li>Resource transformation</li>
                <li>CORS configuration</li>
                <li>Token-based authentication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AboutPage;
