import { useAuthStore } from '@/stores';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { formatDate, getInitials } from '@/utils';

/**
 * Dashboard Page
 * Protected page for authenticated users
 */
function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.name}!
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-gray-600 dark:text-gray-400">Total Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-gray-600 dark:text-gray-400">Completed Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-gray-600 dark:text-gray-400">Pending Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name ? getInitials(user.name) : 'U'}
              </span>
            </div>
            
            {/* User Info */}
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col">
              <span className="text-2xl mb-2">➕</span>
              <span>New Project</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <span className="text-2xl mb-2">📝</span>
              <span>Add Task</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <span className="text-2xl mb-2">👥</span>
              <span>Team</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <span className="text-2xl mb-2">⚙️</span>
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
