// src/layouts/AuthLayout.tsx
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sprout, Leaf } from "lucide-react";

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
    <main className="min-h-screen min-w-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-green-200 opacity-20 animate-float">
          <Sprout size={80} />
        </div>
        <div className="absolute bottom-20 right-10 text-emerald-200 opacity-20 animate-float-delayed">
          <Leaf size={100} />
        </div>
        <div className="absolute top-1/2 left-1/4 text-teal-200 opacity-10 animate-float">
          <Sprout size={60} />
        </div>
        <div className="absolute top-1/3 right-1/4 text-green-200 opacity-10 animate-float-delayed">
          <Leaf size={70} />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            GrowFrika
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Empowering African Agriculture
          </p>
        </div>
        
        {/* Page content (Login, Register, etc.) */}
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
      `}</style>
    </main>
  );
}

export default AuthLayout;