import { Route, Routes, useParams, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import GoogleSuccess from "../pages/GoogleSuccess";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LandingPage from "../pages/LandingPage";
import VerifyEmail from "../pages/VerifyEmail";

type AppRoutesProps = {
    darkMode: boolean;
    toggleDarkMode: () => void;
};

function LegacyHomeRedirect(){
    const {id} = useParams()

    if(id){
        const currentUser = localStorage.getItem("userId");
        if(!currentUser){
            localStorage.setItem("userId", id);

        }
    }
    return <Navigate to="/home" replace />;
}

export const AppRoutes = ({ darkMode, toggleDarkMode }: AppRoutesProps) => {

    return (
        <Routes>
            <Route element={<AuthLayout/>}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google/success" element={<GoogleSuccess />} />
            </Route>

            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/home/:id" element={<LegacyHomeRedirect />} />

            <Route path="/home" element={
                <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Home darkMode={darkMode} />
                </MainLayout>
            } />
        </Routes>
    )
}
