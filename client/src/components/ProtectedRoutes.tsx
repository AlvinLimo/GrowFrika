// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Also check for user object as fallback
  let hasAuth: boolean = Boolean(token && userId);
  
  if (!hasAuth) {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        hasAuth = Boolean(token && parsedUser?.id);
      } catch {
        hasAuth = false;
      }
    }
  }

  if (!hasAuth) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;