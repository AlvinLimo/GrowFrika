import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

function MainLayout({ children, darkMode, toggleDarkMode }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
    
      <Header 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        darkMode={darkMode}
      />
      
      {/* Main Content - Adjust margin based on sidebar state */}
      <div 
        className={` transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[280px] w-screen' : 'ml-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default MainLayout;