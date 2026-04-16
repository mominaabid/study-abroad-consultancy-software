import React, { useState } from "react";
import {
  Home,
  Settings,
  User,
  BarChart,
  Menu,
  X,
  MessageSquare,
  Bell,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import logo from "../assets/favicon.png";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} /> },
    { name: "Leads", icon: <BarChart size={20} /> },
    { name: "Counselor", icon: <User size={20} /> },
    { name: "Applications", icon: <Settings size={20} /> },
    { name: "Payments", icon: <DollarSign size={20} /> },
    { name: "Chats", icon: <MessageSquare size={20} /> },
    { name: "Notification", icon: <Bell size={20} /> },
    { name: "Courses", icon: <GraduationCap size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 h-screen bg-white text-black transition-all duration-300 p-4 flex flex-col border-r border-gray-100
        ${isOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"}`}
      >
        {/* Header / Logo Section */}
        <div className="flex items-center justify-between mb-8 min-h-[40px] flex-shrink-0">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${!isOpen && "md:opacity-0 md:w-0 overflow-hidden"}`}
          >
            <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
            <span className="text-lg font-bold tracking-tight text-gray-800">
              Educatia
            </span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-[#009E99] hover:text-white transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navigation Links - Added overflow-y-auto in case menu is long */}
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-[#009E99] hover:text-white transition-all group"
              title={!isOpen ? item.name : ""}
            >
              <div className="min-w-[24px]">{item.icon}</div>
              <span
                className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${!isOpen ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
              >
                {item.name}
              </span>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 mt-auto flex-shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0" />
            <div
              className={`ml-3 transition-all duration-300 ${!isOpen ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
            >
              <p className="text-sm font-medium truncate">Nadeem Munir</p>
              <p className="text-xs text-gray-500 truncate">nadeem@admin.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
