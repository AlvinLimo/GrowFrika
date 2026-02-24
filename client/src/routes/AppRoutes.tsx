import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import GoogleSuccess from "../pages/GoogleSuccess";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LandingPage from "../pages/LandingPage";
import VerifyEmail from "../pages/VerifyEmail";
import AboutUs from "../pages/AboutUs";
import SolutionsPage from "../pages/SolutionsPage";

type AppRoutesProps = {
    darkMode: boolean;
    toggleDarkMode: () => void;
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};

export const AppRoutes = ({ darkMode, toggleDarkMode }: AppRoutesProps) => {
    return (
        <Routes>
            {/* Public routes with AuthLayout */}
            <Route element={<AuthLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google/success" element={<GoogleSuccess />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/solutions" element={<SolutionsPage />} />
            </Route>

            {/* Protected routes with MainLayout */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                            {/* This will render the matched child route */}
                        </MainLayout>
                    </ProtectedRoute>
                }
            >
                {/* Home without conversation - new chat */}
                <Route path="/home" element={<Home darkMode={darkMode} />} />
                
                {/* Home with conversation ID - existing chat */}
                <Route path="/home/:convo_id" element={<Home darkMode={darkMode} />} />
            </Route>

            {/* Catch all - redirect to home or login */}
            <Route 
                path="*" 
                element={
                    localStorage.getItem("token") 
                        ? <Navigate to="/home" replace /> 
                        : <Navigate to="/" replace />
                } 
            />
        </Routes>
    );
};