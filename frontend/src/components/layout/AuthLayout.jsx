import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
