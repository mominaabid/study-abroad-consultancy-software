import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { logout, selectUser } from "../redux/slices/authSlice";

export const Header = ({ toggleSideBar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside the profile area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
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
          {/* Notification Bell */}
          <button className="text-gray-500 hover:text-blue-600 transition-colors relative p-1">
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
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

                {/* <div className="py-1">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <UserIcon size={18} className="text-gray-400" />
                    View Profile
                  </button>
                </div> */}

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
