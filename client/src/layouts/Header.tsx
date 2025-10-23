import { LogOut, Settings, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMenu } from "react-icons/io5";

interface HeaderProps {
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface User {
  id: string;
  username: string;
  email: string;
}

function Header({ setIsOpen, darkMode, toggleDarkMode }: HeaderProps) {
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
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/users/getbyID/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          console.error("An error occurred:", err);
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
    <div className={`w-full h-16 shadow-lg flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-b border-gray-700' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="flex items-center transition-all duration-300">
        <button 
          onClick={() => setIsOpen(true)} 
          className={`mr-4 p-2 rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'text-green-400 hover:bg-gray-700' 
              : 'text-green-600 hover:bg-gray-100'
          }`}
        >
          <IoMenu size={24} />
        </button>

        <h1 className={`text-md font-bold transition-colors duration-200 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          GrowFrika
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-200 ${
              darkMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-200 hover:bg-green-300 text-green-700'
            }`}
          >
            {user ? getInitials(user.username) : "U"}
          </button>

          {dropdownOpen && (
            <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-40 transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className={`p-4 border-b transition-colors duration-200 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`font-semibold transition-colors duration-200 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.username}
                </p>
                <p className={`text-sm transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.email}
                </p>
              </div>
              
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => navigate("/profile")}
              >
                <Settings size={18} /> Profile Settings
              </button>
              
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-200 ${
                  darkMode 
                    ? 'text-red-400 hover:bg-gray-700' 
                    : 'text-red-600 hover:bg-gray-100'
                }`}
                onClick={handleLogout}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
