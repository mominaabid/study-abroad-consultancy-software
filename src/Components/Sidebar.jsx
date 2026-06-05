import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  Settings,
  User,
  BarChart,
  MessageSquare,
  DollarSign,
  LogOut,
  FileText,
  CreditCard, // ✅ Added for Accounts menu
} from "lucide-react";
import logo from "../assets/favicon.png";
import ExpandedLogo from "../assets/Educatia-Logo.png";

import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectRole } from "../redux/slices/authSlice";
import { selectTotalUnread } from "../redux/slices/chatSlice";

// ── Menu definitions per role ──────────────────────────────────────────────────
const ADMIN_MENU = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/admin/dashboard" },
  { name: "Leads", icon: <BarChart size={20} />, path: "/admin/leads" },
  {
    name: "Applications",
    icon: <Settings size={20} />,
    path: "/admin/applications",
  },
  {
    name: "Accounts", // ✅ New Accounts menu
    icon: <CreditCard size={20} />,
    path: "/admin/accounts",
  },
  // { name: "Payments", icon: <DollarSign size={20} />, path: "/admin/payments" },
  { name: "Chats", icon: <MessageSquare size={20} />, path: "/admin/chats" },
  { name: "Counsellors", icon: <User size={20} />, path: "/admin/counsellors" },
];

const COUNSELLOR_MENU = [
  {
    name: "Dashboard",
    icon: <Home size={20} />,
    path: "/counsellor/dashboard",
  },
  {
    name: "Leads",
    icon: <BarChart size={20} />,
    path: "/counsellor/leads",
  },
  {
    name: "Applications",
    icon: <FileText size={20} />,
    path: "/counsellor/applications",
  },
  // {
  //   name: "Accounts", // ✅ New Accounts menu
  //   icon: <CreditCard size={20} />,
  //   path: "/counsellor/accounts",
  // },
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
  // {
  //   name: "Payments",
  //   icon: <DollarSign size={20} />,
  //   path: "/student/payments",
  // },

  {
    name: "Accounts",
    icon: <CreditCard size={20} />,
    path: "/student/accounts",
  },
  { name: "Chats", icon: <MessageSquare size={20} />, path: "/student/chats" },
];

// ── Helper to check if screen is desktop ──────────────────────────────────────
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

// ── Component ──────────────────────────────────────────────────────────────────
export const Sidebar = ({ isOpen, setIsOpen, onHoverChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const role = useSelector(selectRole);
  const totalUnread = useSelector(selectTotalUnread(role));

  const isDesktop = useDesktop();

  // Force sidebar closed on mobile when component mounts or screen size becomes mobile
  useEffect(() => {
    if (!isDesktop && isOpen) {
      setIsOpen(false);
    }
  }, [isDesktop, isOpen, setIsOpen]);

  // Pick menu based on role
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

  // Handle hover only on desktop
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

  // Determine expanded state: on desktop = hover, on mobile = only when open
  const isExpanded = isDesktop ? isHovered : isOpen;

  function handleLogout() {
    dispatch(logout());
    navigate("/login");

    if (!isDesktop) setIsOpen(false);
  }

  // Transform classes for mobile off-canvas
  const mobileTransform = !isDesktop
    ? isOpen
      ? "translate-x-full"
      : "-translate-x-0"
    : "md:translate-x-0";

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed inset-y-0 left-0 z-50 bg-white text-black transition-all duration-300 p-4 flex flex-col border-r border-gray-100 shadow-xl
          ${mobileTransform}
          ${isExpanded ? "w-64" : "w-20"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div
            className="flex items-center gap-3 min-w-max cursor-pointer w-full"
            onClick={() => navigate(homePath)}
          >
            {isExpanded ? (
              <img
                src={ExpandedLogo}
                alt="Educatia Logo"
                className="h-12 w-180 object-contain transition-all duration-300"
              />
            ) : (
              <img
                src={logo}
                alt="Favicon"
                className="h-8 w-12 object-contain transition-all duration-300"
              />
            )}
          </div>
        </div>

        {/* Role badge */}
        {isExpanded && role && (
          <div className="mb-4 px-3">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full
              ${
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

        {/* Nav */}
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
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#009E99] text-white shadow-md"
                      : "hover:bg-[#009E99]/10 hover:text-[#009E99]"
                  }`}
              >
                {/* Icon */}
                <div className="min-w-[20px] relative">
                  {item.icon}

                  {/* Collapsed badge */}
                  {!isExpanded && item.name === "Chats" && totalUnread > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="ml-4 flex items-center justify-between w-full">
                    <span className="whitespace-nowrap text-sm font-medium">
                      {item.name}
                    </span>

                    {/* Chats Badge */}
                    {item.name === "Chats" && totalUnread > 0 && (
                      <span
                        className={`min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold
                        ${
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

        {/* Logout */}
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
