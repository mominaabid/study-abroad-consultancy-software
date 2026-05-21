import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import Header from "../Header";
import FloatingWhatsApp from "../../Components/WhatsAppWidget/FloatingWhatsApp";
import "./PrivateLayout.css";

export default function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const location = useLocation();
  const isStudentRoute = location.pathname.startsWith("/student");

  return (
    <div className="private-layout">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onHoverChange={setSidebarHovered}
      />

      {/* Right side shifts when sidebar is hovered/expanded */}
      <div
        className="private-layout__right"
        style={{ marginLeft: sidebarHovered ? "256px" : "80px" }}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="private-layout__content">
          <Outlet />
        </main>

        {isStudentRoute && <FloatingWhatsApp />}
      </div>
    </div>
  );
}
