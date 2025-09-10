import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Plants", href: "/plants" },
  { name: "Schedule", href: "/schedule" },
  { name: "Disease Detection", href: "/disease-detection" },
  { name: "Settings", href: "/settings" },
];

function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <div
        className={`bg-white text-black h-full fixed shadow-md top-0 left-0 transition-all duration-300 z-40
          ${isOpen ? "w-48" : "w-0 overflow-hidden"}
        `}
      >
        {/* Close Button */}
        <div className="flex justify-start items-center p-3">
            <button
              className="border-2 justify-center items-center border-green-500 hover:border-green-700 hover:outline-none p-2 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none"
              onClick={() => setIsOpen(false)}
            >
              <IoClose  size={20} />
            </button>
          </div>
    <div className="p-4 justify-start items-center mt-10">
      <ul className="space-y-2 ">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.href}
              className="block hover:bg-green-600 hover:text-black text-black p-2 rounded transition justify-start items-center text-center"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default Sidebar;
