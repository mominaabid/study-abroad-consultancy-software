import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react"; 

export const Header = ({ toggleSideBar }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.includes("admin-dashboard")) {
      return "Admin Dashboard";
    } else if (location.pathname.includes("leads")) {
      return "Leads Management";
    } else if (location.pathname.includes("counsellor")) {
      return "Counsellor Management";
    } else {
      return "My Dashboard";
    }
  };

  const defaultAvatar =
    "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

  return (
    <nav className="bg-white shadow-sm w-full sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSideBar} 
            className="p-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-600"
          >
            <Menu size={24} />
          </button>
          
          <span className={`text-xl ml-2 font-bold text-gray-800 ${isSearchOpen ? "hidden" : "block"}`}>
            {getTitle()}
          </span>
        </div>

        <div
          className={`flex items-center ${
            isSearchOpen ? "w-full" : ""
          } justify-end space-x-4 sm:space-x-6`}
        >
          <div
            className={`${
              isSearchOpen ? "flex w-full" : "hidden"
            } sm:flex relative items-center`}
          >
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 py-1.5 pl-4 pr-10 rounded-full text-sm transition-all outline-none w-full sm:w-64"
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 sm:pointer-events-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {!isSearchOpen && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden text-gray-500 hover:text-blue-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          <div className={`${isSearchOpen ? "hidden" : "flex"} items-center space-x-4 sm:space-x-6`}>
            <button className="text-gray-500 hover:text-blue-600 transition-colors relative p-1">
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <div className="flex items-center cursor-pointer">
              <img
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border-2 border-gray-100 hover:border-blue-500 transition-all"
                src={defaultAvatar}
                alt="User profile"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;