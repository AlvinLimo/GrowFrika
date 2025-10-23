import { Link, useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { 
  Home, 
  Leaf, 
  Calendar, 
  Search, 
  Settings as SettingsIcon,
  BarChart3
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  darkMode: boolean;
}

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Plants", href: "/plants", icon: Leaf },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Disease Detection", href: "/disease-detection", icon: Search },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

function Sidebar({ isOpen, setIsOpen, darkMode }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Backdrop - Only show on mobile screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full shadow-xl z-40 transition-all duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          darkMode 
            ? 'bg-gray-800 border-r border-gray-700' 
            : 'bg-white border-r border-gray-200'
        }`}
        style={{ width: "280px" }}
      >
        {/* Header - Only show when sidebar is open */}
        {isOpen && (
          <div className={`flex justify-between items-center p-4 border-b transition-colors duration-200 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold transition-colors duration-200 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Menu
            </h2>
            <button
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={22} />
            </button>
          </div>
        )}

        {/* Navigation - Only show when sidebar is open */}
        {isOpen && (
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.href;
                const IconComponent = item.icon;
                
                return (
                  <li key={index}>
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? darkMode
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 border border-green-200'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Footer - Only show when sidebar is open */}
        {isOpen && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t transition-colors duration-200 ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-sm text-center transition-colors duration-200 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              GrowFrika v1.0
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;