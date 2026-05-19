import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectRole } from "../../redux/slices/authSlice";
import { Sidebar } from "../Sidebar";
import Header from "../Header";
import FloatingWhatsApp from "../../Components/WhatsAppWidget/FloatingWhatsApp";
import "./PrivateLayout.css";

const modulesByRole = {
  admin: [
    { label: "Dashboard", path: "dashboard" },
    { label: "Leads", path: "leads" },
    { label: "Applications", path: "applications" },
    { label: "Payments", path: "payments" },
    { label: "Profile", path: "profile" },
    { label: "Chats", path: "chats" },
    { label: "Counsellors", path: "counsellors" },
  ],
  counsellor: [
    { label: "Dashboard", path: "dashboard" },
    { label: "Profile", path: "profile" },
    { label: "Leads", path: "leads" },
    { label: "Applications", path: "applications" },
    { label: "Chats", path: "chats" },
  ],
  student: [
    { label: "Dashboard", path: "dashboard" },
    { label: "Application", path: "application" },
    { label: "Payments", path: "payments" },
    { label: "Chats", path: "chats" },
    { label: "Profile", path: "profile" },
  ],
};

export default function PrivateLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const role = useSelector(selectRole);
  const location = useLocation();
  const isStudentRoute = location.pathname.startsWith("/student");

  if (!role) {
    return (
      <div className="private-layout">
        {/* you can show a spinner or null */}
      </div>
    );
  }

  const modules = modulesByRole[role] || [];
  const dashboardBasePath = `/${role}/dashboard`;
  const isDashboardPage =
    location.pathname === dashboardBasePath ||
    location.pathname.startsWith(`${dashboardBasePath}/`);

  // ---- NEW: Hide tabs on Lead modal routes (Add/Edit/Assign) ----
  // Remove the role prefix (e.g., /admin or /counsellor) to match clean paths
  const pathWithoutRole = location.pathname.replace(
    /^\/(admin|counsellor)/,
    "",
  );
  const isLeadModalRoute = /\/leads\/(new|\d+\/edit|\d+\/assign)$/.test(
    pathWithoutRole,
  );
  const hideTabs = isLeadModalRoute;
  // -------------------------------------------------------------

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

        {/* ------ MODULE TABS – hidden on Dashboard pages AND Lead Modal pages ------ */}
        {modules.length > 0 && !isDashboardPage && !hideTabs && (
          <div className="border-b border-gray-200 bg-white px-4 sm:px-6">
            <nav
              className="flex space-x-6 overflow-x-auto pt-4"
              aria-label="Modules"
            >
              {modules.map((module) => (
                <NavLink
                  key={module.path}
                  to={`/${role}/${module.path}`}
                  end={module.path === "dashboard"}
                  className={({ isActive }) =>
                    `whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "border-teal-600 text-teal-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`
                  }
                >
                  {module.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        <main className="private-layout__content">
          <Outlet />
        </main>
        {isStudentRoute && <FloatingWhatsApp />}
      </div>
    </div>
  );
}
