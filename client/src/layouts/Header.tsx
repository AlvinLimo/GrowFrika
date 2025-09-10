import {  LogOut, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMenu } from "react-icons/io5";

interface HeaderProps {
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
}

function Header({ setIsOpen, isOpen }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromURL = queryParams.get("token");
    const idFromURL = queryParams.get("id");

    if (tokenFromURL && idFromURL) {
      localStorage.setItem("token", tokenFromURL);
      localStorage.setItem("userId", idFromURL);
      navigate("/home", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      let id = localStorage.getItem("userId");

      if (!id) {
        const userString = localStorage.getItem("user");
        if (userString) {
          try {
            const parsedUser = JSON.parse(userString);
            id = parsedUser?.id;
          } catch (err) {
            console.error("Failed to parse user from localStorage", err);
          }
        }
      }

      if (!token || !id) {
        console.error("Token or User ID missing. Please log in.");
      }

      try {
        const response = await axios.get(`http://localhost:5000/users/getbyID/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          console.error("An error occurred:", err);
          console.error(err.response.data?.message || "Failed to fetch user");
          console.error("An unexpected error occurred:", err);
          console.error("An unexpected error occurred");
        }
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30">
     <div className="flex items-center transition-all duration-300">
        <button onClick={() => setIsOpen(true)} className="text-green-700 mr-0">
          <IoMenu  size={28} />
        </button>

        <p
          className={`text-2xl font-bold text-black transition-all duration-300 ${
            isOpen ? "ml-28" : "ml-0"
          }`}
        >
          GrowFrika
        </p>
      </div>
              

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold"
        >
          {user ? getInitials(user.username) : "U"}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-40">
            <div className="p-4 border-b">
              <p className="font-semibold">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={() => navigate("/profile")}
            >
              <Settings size={16} /> Profile Settings
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
