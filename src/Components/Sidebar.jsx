import React, { useState } from "react";
import {
  Home, Settings, User, BarChart, X,
  MessageSquare, Bell, GraduationCap,
  DollarSign, LogOut, FileText,
} from "lucide-react";
import logo from "../assets/favicon.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectRole } from "../redux/slices/authSlice";

// ── Menu definitions per role ──────────────────────────────────────────────────
const ADMIN_MENU = [
  { name: "Dashboard",    icon: <Home size={20} />,         path: "/admin/dashboard" },
  { name: "Leads",        icon: <BarChart size={20} />,     path: "/admin/leads" },
  { name: "Counselors",   icon: <User size={20} />,         path: "/admin/counsellors" },
  { name: "Applications", icon: <Settings size={20} />,     path: "/admin/applications" },
  { name: "Payments",     icon: <DollarSign size={20} />,   path: "/admin/payments" },
  { name: "Chats",        icon: <MessageSquare size={20} />,path: "/admin/chats" },
  { name: "Notifications",icon: <Bell size={20} />,         path: "/admin/notifications" },
];

const COUNSELLOR_MENU = [
  { name: "Dashboard",    icon: <Home size={20} />,         path: "/counsellor/dashboard" },
  { name: "My Leads",     icon: <BarChart size={20} />,     path: "/counsellor/leads" },
  { name: "Applications", icon: <FileText size={20} />,     path: "/counsellor/applications" },
  { name: "Chats",        icon: <MessageSquare size={20} />,path: "/counsellor/chats" },
  { name: "Notifications",icon: <Bell size={20} />,         path: "/counsellor/notifications" },
];

const STUDENT_MENU = [
  { name: "Dashboard",    icon: <Home size={20} />,         path: "/student/dashboard" },
  { name: "Application",  icon: <FileText size={20} />,     path: "/student/application" },
  { name: "Documents",    icon: <GraduationCap size={20} />,path: "/student/documents" },
  { name: "Payments",     icon: <DollarSign size={20} />,   path: "/student/payments" },
  { name: "Chats",        icon: <MessageSquare size={20} />,path: "/student/chats" },
];

// ── Component ──────────────────────────────────────────────────────────────────
export const Sidebar = ({ isOpen, setIsOpen, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const role      = useSelector(selectRole);

  // Pick menu based on role
  const menuItems =
    role === "admin"      ? ADMIN_MENU :
    role === "counsellor" ? COUNSELLOR_MENU :
    role === "student"    ? STUDENT_MENU :
    ADMIN_MENU;

  const homePath =
    role === "admin"      ? "/admin/dashboard" :
    role === "counsellor" ? "/counsellor/dashboard" :
    "/student/dashboard";

  const handleMouseEnter = () => { setIsHovered(true);  if (onHoverChange) onHoverChange(true);  };
  const handleMouseLeave = () => { setIsHovered(false); if (onHoverChange) onHoverChange(false); };
  const isExpanded = isHovered || (isOpen && window.innerWidth < 768);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <>
      {/* Mobile overlay */}
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
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div
            className="flex items-center gap-3 min-w-max cursor-pointer"
            onClick={() => navigate(homePath)}
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

        {/* Role badge */}
        {isExpanded && role && (
          <div className="mb-4 px-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full
              ${role === "admin"      ? "bg-teal-50 text-teal-700" :
                role === "counsellor" ? "bg-purple-50 text-purple-700" :
                "bg-amber-50 text-amber-700"}`}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={index}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
                  ${isActive
                    ? "bg-[#009E99] text-white shadow-md"
                    : "hover:bg-[#009E99]/10 hover:text-[#009E99]"
                  }`}
              >
                <div className="min-w-[20px]">{item.icon}</div>
                {isExpanded && (
                  <span className="ml-4 whitespace-nowrap text-sm font-medium">
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-red-50 hover:text-red-600 transition-all mt-2 border-t border-gray-100 pt-4"
        >
          <div className="min-w-[20px]"><LogOut size={20} /></div>
          {isExpanded && (
            <span className="ml-4 whitespace-nowrap text-sm font-medium">Logout</span>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;