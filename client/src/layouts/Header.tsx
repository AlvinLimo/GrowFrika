/* eslint-disable react-hooks/exhaustive-deps */
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
  user_id: string;
  username: string;
  email: string;
}

// Helper function to decode JWT and extract user_id
const getUserIdFromToken = (token: string): string | null => {
  try {
    // Split the token and get the payload (middle part)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    
    // Extract user_id from the userData object in the token
    const userId = decoded?.userData?.user_id || decoded?.user_id || null;
    
    return userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

function Header({ setIsOpen, isOpen, darkMode, toggleDarkMode }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle OAuth callback tokens
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromURL = queryParams.get("token");
    const idFromURL = queryParams.get("id");

    if (tokenFromURL && idFromURL) {
      localStorage.setItem("token", tokenFromURL);
      localStorage.setItem("userId", idFromURL);
      // Remove query params from URL after storing
      navigate("/home", { replace: true });
    }
  }, [location.search, navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        let id = user ? JSON.parse(user).user_id : null;

        // If no userId in localStorage, try to decode it from the token
        if (!id && token) {
          console.log('No userId found, attempting to decode from token...');
          id = getUserIdFromToken(token);
          if (id) {
            console.log('Successfully extracted userId from token:', id);
            // Save it for future use
            localStorage.setItem("userId", id);
          } else {
            console.error('Failed to extract userId from token');
          }
        }

        // Fallback to user object if userId still not found
        if (!id) {
          console.log('Checking for user object in localStorage...');
          const userString = localStorage.getItem("user");
          if (userString) {
            try {
              const parsedUser = JSON.parse(userString);
              id = parsedUser?.user_id || parsedUser?.id;
              if (id) {
                localStorage.setItem("userId", id);
              }
            } catch (err) {
              console.error("Failed to parse user from localStorage", err);
            }
          }
        }

        // Final check
        if (!token) {
          console.error("No token found. Redirecting to login...");
          handleLogout();
          return;
        }

        if (!id) {
          console.error("No userId found after all attempts. Redirecting to login...");
          handleLogout();
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/getbyID/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("Error fetching user:", err);
          console.error("Error response:", err.response?.data);
          console.error("Error status:", err.response?.status);
          
          // If unauthorized, logout
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.log('Unauthorized - logging out');
            handleLogout();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Close dropdown when clicking outside
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
    console.log('Logging out - clearing localStorage');
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Max 2 characters
  };

  return (
    <div className={`w-full h-16 shadow-lg flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-b border-gray-700' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="flex items-center transition-all duration-300">
        {/* Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`mr-4 p-2 rounded-lg transition-colors duration-200 ${
            darkMode 
              ? 'text-green-400 hover:bg-gray-700' 
              : 'text-green-600 hover:bg-gray-100'
          }`}
          aria-label="Toggle sidebar"
        >
          <IoMenu size={24} />
        </button>

        {/* Logo */}
        <h2 className={`text-xl font-bold transition-colors duration-200 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          GrowFrika
        </h2>
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
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-200 ${
              darkMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-200 hover:bg-green-300 text-green-700'
            } ${loading ? 'opacity-50 cursor-wait' : ''}`}
            aria-label="User menu"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              user ? getInitials(user.username) : "U"
            )}
          </button>

          {dropdownOpen && !loading && (
            <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-40 transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              {/* User Info */}
              <div className={`p-4 border-b transition-colors duration-200 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`font-semibold transition-colors duration-200 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.username || 'User'}
                </p>
                <p className={`text-sm transition-colors duration-200 truncate ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              
              {/* Profile Settings */}
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-200 ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setDropdownOpen(false);
                  window.dispatchEvent(new CustomEvent('openProfile'));
                }}
              >
                <Settings size={18} /> Profile Settings
              </button>
              
              {/* Logout */}
              <button
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-200 rounded-b-lg ${
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