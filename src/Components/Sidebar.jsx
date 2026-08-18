// Sidebar.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home,
  Settings,
  FileText,
  User,
  BarChart,
  MessageSquare,
  LogOut,
  CreditCard,
  X,
  ChevronDown,
  ChevronRight,
  Bot,
  Box,
} from "lucide-react";
import logo from "../assets/favicon.png";
import ExpandedLogo from "../assets/Educatia-Logo.png";

import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectRole } from "../redux/slices/authSlice";
import { selectTotalUnread } from "../redux/slices/chatSlice";

const ADMIN_MENU = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/admin/dashboard" },
  {
    name: "Configuration",
    icon: <Settings size={20} />,
    submenu: [
      { name: "Countries", path: "/admin/countries" },
      { name: "Cities", path: "/admin/cities" },
      { name: "Universities", path: "/admin/universities" },
      { name: "Miscellaneous Config", path: "/admin/config" },
    ],
  },
  { name: "Leads", icon: <BarChart size={20} />, path: "/admin/leads" },
  {
    name: "Applications",
    icon: <FileText size={20} />,
    path: "/admin/applications",
  },
  { name: "Accounts", icon: <CreditCard size={20} />, path: "/admin/accounts" },
  { name: "Chats", icon: <MessageSquare size={20} />, path: "/admin/chats" },
  { name: "Counsellors", icon: <User size={20} />, path: "/admin/counsellors" },
  {
    name: "Chatbot Panel",
    icon: <Bot size={20} />,
    path: "/admin/chatbot-panel",
    submenu: [
      { name: "Dashboard", path: "/admin/chatbot-panel" },
      {
        category: "Locations",
        items: [
          { name: "Countries", path: "/admin/chatbot-panel?table=countries" },
          { name: "States", path: "/admin/chatbot-panel?table=states" },
          { name: "Cities", path: "/admin/chatbot-panel?table=cities" },
        ],
      },
      {
        category: "Academics",
        items: [
          { name: "Universities", path: "/admin/chatbot-panel?table=institutes" },
          { name: "Campuses", path: "/admin/chatbot-panel?table=campuses" },
          { name: "Programs", path: "/admin/chatbot-panel?table=programs" },
          { name: "Program Fees", path: "/admin/chatbot-panel?table=program_fees" },
          { name: "Scholarships", path: "/admin/chatbot-panel?table=scholarships" },
        ],
      },
      {
        category: "Admissions",
        items: [
          { name: "Pathways", path: "/admin/chatbot-panel?table=admission_pathways" },
          { name: "Master Docs", path: "/admin/chatbot-panel?table=required_docs" },
          { name: "English Requirements", path: "/admin/chatbot-panel?table=english_requirements" },
          { name: "Program Docs", path: "/admin/chatbot-panel?table=program_required_documents" },
        ],
      },
      {
        category: "Chatbot Leads & Logs",
        items: [
          { name: "Chatbot Leads", path: "/admin/chatbot-panel?table=student_leads" },
          { name: "Chat Sessions", path: "/admin/chatbot-panel?table=chat_sessions" },
          { name: "Chat Messages", path: "/admin/chatbot-panel?table=chat_messages" },
        ],
      },
      {
        category: "Office Info",
        items: [
          { name: "Office Contact", path: "/admin/chatbot-panel?table=business_info" },
        ],
      },
    ],
  },
];

const COUNSELLOR_MENU = [
  { name: "Dashboard", icon: <Home size={20} />, path: "/counsellor/dashboard" },
  {
    name: "Configuration",
    icon: <Settings size={20} />,
    submenu: [
      { name: "Countries", path: "/counsellor/countries" },
      { name: "Cities", path: "/counsellor/cities" },
      { name: "Universities", path: "/counsellor/universities" },
      { name: "Miscellaneous Config", path: "/counsellor/config" },
    ],
  },
  { name: "Leads", icon: <BarChart size={20} />, path: "/counsellor/leads" },
  {
    name: "Applications",
    icon: <FileText size={20} />,
    path: "/counsellor/applications",
  },
  { name: "Chats", icon: <MessageSquare size={20} />, path: "/counsellor/chats" },
  {
    name: "Chatbot Panel",
    icon: <Bot size={20} />,
    path: "/counsellor/chatbot-panel",
    submenu: [
      { name: "Dashboard", path: "/counsellor/chatbot-panel" },
      {
        category: "Locations",
        items: [
          { name: "Countries", path: "/counsellor/chatbot-panel?table=countries" },
          { name: "States", path: "/counsellor/chatbot-panel?table=states" },
          { name: "Cities", path: "/counsellor/chatbot-panel?table=cities" },
        ],
      },
      {
        category: "Academics",
        items: [
          { name: "Universities", path: "/counsellor/chatbot-panel?table=institutes" },
          { name: "Campuses", path: "/counsellor/chatbot-panel?table=campuses" },
          { name: "Programs", path: "/counsellor/chatbot-panel?table=programs" },
          { name: "Program Fees", path: "/counsellor/chatbot-panel?table=program_fees" },
          { name: "Scholarships", path: "/counsellor/chatbot-panel?table=scholarships" },
        ],
      },
      {
        category: "Admissions",
        items: [
          { name: "Pathways", path: "/counsellor/chatbot-panel?table=admission_pathways" },
          { name: "Master Docs", path: "/counsellor/chatbot-panel?table=required_docs" },
          { name: "English Requirements", path: "/counsellor/chatbot-panel?table=english_requirements" },
          { name: "Program Docs", path: "/counsellor/chatbot-panel?table=program_required_documents" },
        ],
      },
      {
        category: "Chatbot Leads & Logs",
        items: [
          { name: "Chatbot Leads", path: "/counsellor/chatbot-panel?table=student_leads" },
          { name: "Chat Sessions", path: "/counsellor/chatbot-panel?table=chat_sessions" },
          { name: "Chat Messages", path: "/counsellor/chatbot-panel?table=chat_messages" },
        ],
      },
      {
        category: "Office Info",
        items: [
          { name: "Office Contact", path: "/counsellor/chatbot-panel?table=business_info" },
        ],
      },
    ],
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
  const [expandedMenus, setExpandedMenus] = useState({});

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

  // Toggle submenu expansion
  const toggleSubmenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const [expandedCategories, setExpandedCategories] = useState({
    "Academics": true,
    "Chatbot Leads & Logs": true,
    "Locations": true,
    "Admissions": true,
  });

  const toggleCategory = (catName, e) => {
    if (e) e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  // Ref for active sidebar item to handle auto-scrolling
  const activeItemRef = useRef(null);

  // Automatically expand parent category when navigating to a submodule
  useEffect(() => {
    const current = location.pathname + location.search;
    if (!menuItems || !Array.isArray(menuItems)) return;
    menuItems.forEach((menu) => {
      if (menu?.submenu && Array.isArray(menu.submenu)) {
        menu.submenu.forEach((sub) => {
          if (sub?.category && sub?.items && Array.isArray(sub.items)) {
            const isMatch = sub.items.some((nested) => nested?.path === current);
            if (isMatch) {
              setExpandedCategories((prev) => ({
                ...prev,
                [sub.category]: true,
              }));
            }
          }
        });
      }
    });
  }, [location.pathname, location.search, menuItems]);

  // Scroll active item into view when sidebar is hovered / expanded
  useEffect(() => {
    if (isExpanded && activeItemRef.current) {
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, location.pathname, location.search]);

  const isSubmenuActive = (submenu) => {
    const current = location.pathname + location.search;
    return submenu?.some((item) => {
      if (item.path && (current === item.path || location.pathname === item.path)) return true;
      if (item.items) {
        return item.items.some((sub) => current === sub.path || location.pathname === sub.path);
      }
      return false;
    });
  };

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
            const isActive = item.path ? location.pathname === item.path : false;
            const isSubActive = item.submenu ? isSubmenuActive(item.submenu) : false;
            const isExpandedMenu = expandedMenus[item.name] || isSubActive;

            // If item has submenu, render it differently
            if (item.submenu) {
              return (
                <div key={index} className="space-y-1">
                  {/* Main menu item with submenu toggle */}
                  <div
                    onClick={() => {
                      if (item.path) navigate(item.path);
                      if (isExpanded) {
                        toggleSubmenu(item.name);
                      } else {
                        // If sidebar is collapsed, expand it first
                        if (isDesktop && !isExpanded) {
                          setIsHovered(true);
                          if (onHoverChange) onHoverChange(true);
                        }
                        toggleSubmenu(item.name);
                      }
                    }}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSubActive
                        ? "bg-[#009E99]/10 text-[#009E99]"
                        : "hover:bg-[#009E99]/10 hover:text-[#009E99]"
                    }`}
                  >
                    <div className="min-w-[20px]">{item.icon}</div>
                    {isExpanded && (
                      <div className="ml-4 flex items-center justify-between w-full">
                        <span className="whitespace-nowrap text-sm font-medium">
                          {item.name}
                        </span>
                        {isExpandedMenu ? (
                          <ChevronDown size={16} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submenu items */}
                  {isExpanded && isExpandedMenu && (
                    <div className="ml-6 space-y-1.5 border-l-2 border-gray-100 pl-2">
                      {item.submenu.map((subItem, subIndex) => {
                        const currentPath = location.pathname + location.search;

                        // Check if this subItem is a Category with sub-items
                        if (subItem.category) {
                          const isCategoryExpanded = expandedCategories[subItem.category] !== false;
                          const hasActiveNested = subItem.items.some(
                            (nested) => currentPath === nested.path
                          );

                          return (
                            <div key={subIndex} className="space-y-1">
                              {/* Category Header */}
                              <div
                                onClick={(e) => toggleCategory(subItem.category, e)}
                                className={`flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-all text-[11px] font-bold uppercase tracking-wider ${
                                  hasActiveNested
                                    ? "text-[#009E99] bg-[#009E99]/10 border-l-2 border-[#009E99] pl-1.5"
                                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <span className="truncate">{subItem.category}</span>
                                {isCategoryExpanded ? (
                                  <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
                                )}
                              </div>

                              {/* Nested Submodules */}
                              {isCategoryExpanded && (
                                <div className="ml-2.5 space-y-1 border-l border-teal-200/60 pl-2">
                                  {subItem.items.map((nested, nIdx) => {
                                    const isNestedActive = currentPath === nested.path;
                                    return (
                                      <div
                                        key={nIdx}
                                        ref={isNestedActive ? activeItemRef : null}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(nested.path);
                                          if (!isDesktop) setIsOpen(false);
                                        }}
                                        className={`flex items-center px-2.5 py-1.5 rounded-md cursor-pointer transition-all duration-150 text-xs ${
                                          isNestedActive
                                            ? "bg-[#009E99] text-white shadow-sm font-bold scale-[1.02]"
                                            : "hover:bg-[#009E99]/10 hover:text-[#009E99] text-gray-600 font-medium"
                                        }`}
                                      >
                                        <span className="truncate">{nested.name}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular subItem (like Dashboard)
                        const isSubItemActive =
                          currentPath === subItem.path ||
                          (subItem.path === location.pathname && !location.search);
                        return (
                          <div
                            key={subIndex}
                            ref={isSubItemActive ? activeItemRef : null}
                            onClick={() => {
                              navigate(subItem.path);
                              if (!isDesktop) setIsOpen(false);
                            }}
                            className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                              isSubItemActive
                                ? "bg-[#009E99] text-white shadow-md font-bold scale-[1.02]"
                                : "hover:bg-[#009E99]/10 hover:text-[#009E99] text-gray-600 font-medium"
                            }`}
                          >
                            <span className="ml-1">{subItem.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular menu item (no submenu)
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