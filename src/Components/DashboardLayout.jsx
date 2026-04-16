import React, { useState } from 'react';
import {Sidebar} from './Sidebar';
import {Header}  from './Header';
import {Footer}  from './Footer';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSideBar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed width based on state */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Container */}
      <div className="flex flex-col flex-1 transition-all duration-300">
        <Header toggleSideBar={toggleSideBar} isOpen={isSidebarOpen} />
        
        {/* Scrollable Content Area */}
        <main className="flex-grow p-4 sm:p-6">
          <Outlet /> {/* This renders AdminDashboard or other routes */}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;