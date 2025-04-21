import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import GoogleSuccess from "../pages/GoogleSuccess";

export const AppRoutes = () => {

    return (
        <Routes>
            <Route path='/' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/home/:id' element={<Home/>}/>
            <Route path='/google/success' element={<GoogleSuccess />} />
        </Routes>
    )
}