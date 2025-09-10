import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import GoogleSuccess from "../pages/GoogleSuccess";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

export const AppRoutes = () => {

    return (
        <Routes>
            <Route element={<AuthLayout/>}>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/google/success" element={<GoogleSuccess />} />
            </Route>

            <Route path="/home/:id" element={
                <MainLayout>
                    <Home />
                </MainLayout>
}           />
        </Routes>
    )
}