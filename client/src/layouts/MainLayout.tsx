import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex flex-col flex-1 min-h-screen">
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />
        <main className="pt-20 px-6">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
