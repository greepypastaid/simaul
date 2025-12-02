import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { PageLoader } from '@/components/ui';

/**
 * Guest Route Component
 * Redirects to dashboard if user is already authenticated
 */
function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    // Redirect to the page they tried to visit or dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
}

export default GuestRoute;
