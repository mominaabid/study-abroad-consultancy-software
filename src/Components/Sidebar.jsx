import React, { useState } from "react";
import {
  Home,
  Settings,
  User,
  BarChart,
  X,
  MessageSquare,
  Bell,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import logo from "../assets/favicon.png";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ isOpen, setIsOpen, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/" },
    { name: "Leads", icon: <BarChart size={20} />, path: "/leads" },
    { name: "Counselor", icon: <User size={20} />, path: "/counsellor" },
    { name: "Applications", icon: <Settings size={20} /> },
    { name: "Payments", icon: <DollarSign size={20} /> },
    { name: "Chats", icon: <MessageSquare size={20} /> },
    { name: "Notification", icon: <Bell size={20} /> },
    { name: "Courses", icon: <GraduationCap size={20} /> },
  ];

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHoverChange) onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverChange) onHoverChange(false);
  };

  const isExpanded = isHovered || (isOpen && window.innerWidth < 768);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-50 bg-white text-black transition-all duration-300 p-4 flex flex-col border-r border-gray-100 shadow-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
        ${isExpanded ? "w-64" : "w-20"}`}
      >
        <div className="flex items-center justify-between mb-8">
          <div
            className="flex items-center gap-3 min-w-max cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
            {isExpanded && (
              <span className="text-lg font-bold text-gray-800 transition-opacity duration-300">
                Educatia
              </span>
            )}
          </div>

          <button className="md:hidden p-1" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (item.path) navigate(item.path);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-[#009E99] hover:text-white transition-all group"
            >
              <div className="min-w-[20px]">{item.icon}</div>
              {isExpanded && (
                <span className="ml-4 whitespace-nowrap opacity-100 transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};
