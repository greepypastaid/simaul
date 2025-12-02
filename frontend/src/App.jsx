import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MainLayout, AuthLayout, AdminLayout } from '@/components/layout';
import { ProtectedRoute, GuestRoute } from '@/components';
import { useAuthStore } from '@/stores';
import { PageLoader } from '@/components/ui';
import {
  HomePage,
  AboutPage,
  NotFoundPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  BookingForm,
  TrackingPage,
  POSDashboard,
  AdminDashboard,
  CustomersPage,
  ServicesPage,
  MaterialsPage,
  OrdersPage,
  CreateOrderPage,
  SettingsPage,
} from '@/pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      {/* Public Booking & Tracking */}
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/tracking" element={<TrackingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/orders/new" element={<CreateOrderPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/services" element={<ServicesPage />} />
        <Route path="/admin/materials" element={<MaterialsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      {/* Legacy routes - redirect or keep */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
