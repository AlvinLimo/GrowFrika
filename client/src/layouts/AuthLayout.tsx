import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <Outlet /> {/* Page content (Login, Register, etc.) */}
    </main>
  );
}

export default AuthLayout;
