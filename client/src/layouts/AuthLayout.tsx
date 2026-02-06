// src/layouts/AuthLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function AuthLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (token && userId) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // Show nothing while checking auth status
  if (isChecking) {
    return (
      <div className="min-h-screen  flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  // If authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="w-screen min-h-screen items-center justify-center flex flex-col bg-white">
      {/* Centered content area for auth pages */}
      <div className="w-full flex flex-grow items-center justify-center">
        <div className="w-full items-center justify-center flex">
          {/* Render child routes here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;