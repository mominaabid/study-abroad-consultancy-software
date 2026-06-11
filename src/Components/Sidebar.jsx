// Sidebar.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  FileText,
  User,
  BarChart,
  MessageSquare,
  LogOut,
  CreditCard,
  X, // 👈 Added X icon
} from "lucide-react";
import logo from "../assets/favicon.png";
import ExpandedLogo from "../assets/Educatia-Logo.png";

import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectRole } from "../redux/slices/authSlice";
import { selectTotalUnread } from "../redux/slices/chatSlice";

const ADMIN_MENU = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/admin/dashboard" },
  { name: "Leads", icon: <BarChart size={20} />, path: "/admin/leads" },
  {
    name: "Applications",
    icon: <FileText size={20} />,
    path: "/admin/applications",
  },
  { name: "Accounts", icon: <CreditCard size={20} />, path: "/admin/accounts" },
  { name: "Chats", icon: <MessageSquare size={20} />, path: "/admin/chats" },
  { name: "Counsellors", icon: <User size={20} />, path: "/admin/counsellors" },
];

const COUNSELLOR_MENU = [
  {
    name: "Dashboard",
    icon: <Home size={20} />,
    path: "/counsellor/dashboard",
  },
  { name: "Leads", icon: <BarChart size={20} />, path: "/counsellor/leads" },
  {
    name: "Applications",
    icon: <FileText size={20} />,
    path: "/counsellor/applications",
  },
  {
    name: "Chats",
    icon: <MessageSquare size={20} />,
    path: "/counsellor/chats",
  },
];

const STUDENT_MENU = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/student/dashboard" },
  {
    name: "Applications",
    icon: <FileText size={20} />,
    path: "/student/application",
  },
  {
    name: "Accounts",
    icon: <CreditCard size={20} />,
    path: "/student/accounts",
  },
  { name: "Chats", icon: <MessageSquare size={20} />, path: "/student/chats" },
];

const useDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
};

export const Sidebar = ({ isOpen, setIsOpen, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const role = useSelector(selectRole);
  const totalUnread = useSelector(selectTotalUnread(role));
  const isDesktop = useDesktop();

  const menuItems =
    role === "admin"
      ? ADMIN_MENU
      : role === "counsellor"
        ? COUNSELLOR_MENU
        : role === "student"
          ? STUDENT_MENU
          : ADMIN_MENU;

  const homePath =
    role === "admin"
      ? "/admin/dashboard"
      : role === "counsellor"
        ? "/counsellor/dashboard"
        : "/student/dashboard";

  const handleMouseEnter = useCallback(() => {
    if (isDesktop) {
      setIsHovered(true);
      if (onHoverChange) onHoverChange(true);
    }
  }, [isDesktop, onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    if (isDesktop) {
      setIsHovered(false);
      if (onHoverChange) onHoverChange(false);
    }
  }, [isDesktop, onHoverChange]);

  const isExpanded = isDesktop ? isHovered : isOpen;

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
    if (!isDesktop) setIsOpen(false);
  }

  return (
    <>
      {/* Mobile background overlay shadow */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 bg-white text-black transition-all duration-300 ease-in-out p-4 flex flex-col border-r border-gray-100 shadow-xl
          
          /* 📱 Mobile Mode Structure */
          ${isOpen ? "w-64 translate-x-0 visible z-[100] pt-4" : "w-0 -translate-x-full invisible z-0"}
          
          /* 💻 Desktop Mode Structure */
          md:translate-x-0 md:visible md:z-30 md:pt-2
          ${isExpanded ? "md:w-64" : "md:w-20"}`}
      >
        {/* ── MOBILE HEADER BRANDING & CLOSE TOGGLE ── */}
        {!isDesktop && isOpen && (
          <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
                aria-label="Close Menu"
              >
                <X size={22} />
              </button>
              <span className="text-lg font-bold text-gray-800">
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Menu"}
              </span>
            </div>
          </div>
        )}

        {/* Top Branding Section (Desktop only) */}
        <div className="flex items-center justify-between mb-8 hidden md:flex">
          <div
            className="flex items-center gap-3 min-w-max cursor-pointer w-full"
            onClick={() => {
              navigate(homePath);
              if (!isDesktop) setIsOpen(false);
            }}
          >
            {isExpanded ? (
              <img
                src={ExpandedLogo}
                alt="Educatia Logo"
                className="h-12 w-full object-contain transition-all duration-300"
              />
            ) : (
              isDesktop && (
                <img
                  src={logo}
                  alt="Favicon"
                  className="h-8 w-12 object-contain transition-all duration-300"
                />
              )
            )}
          </div>
        </div>

        {/* Admin Badge Pill (Desktop Only now since mobile has a top header layout above) */}
        {isDesktop && isExpanded && role && (
          <div className="mb-4 px-3">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                role === "admin"
                  ? "bg-teal-50 text-teal-700"
                  : role === "counsellor"
                    ? "bg-purple-50 text-purple-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>
        )}

        {/* Nav list elements */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <div
                key={index}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (!isDesktop) setIsOpen(false);
                }}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-[#009E99] text-white shadow-md"
                    : "hover:bg-[#009E99]/10 hover:text-[#009E99]"
                }`}
              >
                <div className="min-w-[20px] relative">
                  {item.icon}
                  {!isExpanded && item.name === "Chats" && totalUnread > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="ml-4 flex items-center justify-between w-full">
                    <span className="whitespace-nowrap text-sm font-medium">
                      {item.name}
                    </span>
                    {item.name === "Chats" && totalUnread > 0 && (
                      <span
                        className={`min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold ${
                          isActive
                            ? "bg-white text-[#009E99]"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {totalUnread > 99 ? "99+" : totalUnread}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Log Out element */}
        <div
          onClick={handleLogout}
          className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-red-50 hover:text-red-600 transition-all mt-2 border-t border-gray-100 pt-4"
        >
          <div className="min-w-[20px]">
            <LogOut size={20} />
          </div>
          {isExpanded && (
            <span className="ml-4 whitespace-nowrap text-sm font-medium">
              Logout
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;