// src/layouts/MainLayout.tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Profile from "../pages/Profile";

interface MainLayoutProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

function MainLayout({ darkMode, toggleDarkMode }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    // Listen for profile modal open event
    const handleOpenProfile = () => {
      setProfileOpen(true);
    };

    window.addEventListener('openProfile', handleOpenProfile);

    return () => {
      window.removeEventListener('openProfile', handleOpenProfile);
    };
  }, []);

  return (
    <div className={`min-h-screen w-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Fixed Header */}
      <Header 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      {/* Sidebar - toggles on mobile, persistent on desktop */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        darkMode={darkMode}
      />
      
      {/* Main Content Area - Outlet renders child routes */}
      <div 
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[280px]' : 'ml-0'
        }`}
      >
        <div className=" w-full h-full">
          <Outlet /> {/* This renders Home or other protected routes */}
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Modal */}
      <Profile 
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        darkMode={darkMode}
        userId={userId}
      />
    </div>
  );
}

export default MainLayout;