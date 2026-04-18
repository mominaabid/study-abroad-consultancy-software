import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); 

  const toggleSideBar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onHoverChange={setIsHovered} 
      />

      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300
        ${(isSidebarOpen || isHovered) ? "md:ml-64" : "md:ml-20"}`}
      >
        <Header toggleSideBar={toggleSideBar} />
        <main className="flex-grow p-4 sm:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

