import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Bell,
  Trash2,
  Clock,
} from "lucide-react";
import { logout, selectUser } from "../redux/slices/authSlice";
import {
  selectNotifications,
  selectUnreadCount,
  markAllAsRead,
  clearNotifications,
} from "../redux/slices/notificationSlice";

export const Header = ({ toggleSideBar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      dispatch(markAllAsRead());
    }
  };

  const getTitle = () => {
    if (location.pathname.includes("admin-dashboard")) return "Admin Dashboard";
    if (location.pathname.includes("leads")) return "Leads Management";
    if (location.pathname.includes("counsellor"))
      return "Counsellor Management";
    return "My Dashboard";
  };

  const userName = user?.name || "User";
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`;

  return (
    <nav className="bg-white shadow-sm w-full sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSideBar}
            className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600"
          >
            <Menu size={24} />
          </button>

          <span className="text-xl ml-2 font-bold text-gray-800">
            {getTitle()}
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* ── Notification Bell Dropdown ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotifClick}
              className="text-gray-500 hover:text-teal-600 transition-colors relative p-2 rounded-full hover:bg-gray-50 focus:outline-none"
            >
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
              <Bell size={22} />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-sm">
                    Notifications
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => dispatch(clearNotifications())}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Clear all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-default"
                      >
                        <p className="text-sm text-gray-700 leading-tight font-medium">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                          <Clock size={10} />
                          <p className="text-[10px] uppercase tracking-wider font-semibold">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-50 bg-gray-50/30"></div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <img
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                src={defaultAvatar}
                alt="User profile"
              />
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {user?.email}
                  </p>
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-blue-50 text-blue-700 rounded-md uppercase">
                    {user?.role || "User"}
                  </span>
                </div>

                <div className="border-t border-gray-50 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 font-semibold hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
