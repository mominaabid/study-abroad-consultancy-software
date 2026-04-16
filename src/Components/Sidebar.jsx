import React, { useState } from 'react';
import { Home, Settings, User, BarChart, Menu, X } from 'lucide-react';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: <Home size={20} /> },
    { name: 'Analytics', icon: <BarChart size={20} /> },
    { name: 'Profile', icon: <User size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div 
      className={`min-h-screen bg-slate-900 text-white transition-all duration-300 p-4 flex flex-col
      ${isOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Header / Toggle Button */}
      <div className="flex items-center justify-between mb-8">
        {isOpen && <h1 className="text-xl font-bold font-mono tracking-tight">APP_LOGO</h1>}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-blue-600 transition-all group"
          >
            <div className="min-w-[24px]">{item.icon}</div>
            {isOpen && (
              <span className="ml-4 font-medium whitespace-nowrap opacity-100 transition-opacity">
                {item.name}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-800 pt-4 mt-auto">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0" />
          {isOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">Alex Developer</p>
              <p className="text-xs text-slate-400 truncate">alex@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

