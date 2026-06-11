// PrivateLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import Header from "../Header";
import FloatingWhatsApp from "../../Components/WhatsAppWidget/FloatingWhatsApp";
import "./PrivateLayout.css";

export default function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const isStudentRoute = location.pathname.startsWith("/student");

  // Detect mobile / desktop
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock / unlock body scroll and main container
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  const mainContainerClasses = `
    flex flex-col flex-1 min-w-0 transition-all duration-300
    ${sidebarHovered ? "md:ml-64" : "md:ml-20"}
    ${isMobile && sidebarOpen ? "mobile-sidebar-lock overflow-hidden pointer-events-none" : ""}
  `;

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onHoverChange={(sidebarHovered) => setSidebarHovered(sidebarHovered)}
      />

      <div className={mainContainerClasses}>
        <Header
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          mobileSidebarOpen={isMobile && sidebarOpen}
        />

        <main className="flex-grow">
          <Outlet />
        </main>

        {isStudentRoute && <FloatingWhatsApp />}
      </div>
    </div>
  );
}