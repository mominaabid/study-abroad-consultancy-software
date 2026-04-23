import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUser } from "./redux/slices/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout + Route Guards
import PrivateRoute from "./Components/PrivateRouteHOC/PrivateRoute";
import PrivateLayout from "./Components/PrivateLayoutHOC/PrivateLayout";

// Auth
import Login from "./Pages/Auth/Login";
import SetupPassword from "./Pages/Auth/SetupPassword";
import SetupCounsellorPassword from "./Pages/Auth/SetupCounsellorPassword";

// Admin Pages
import { AdminDashboard } from "./Pages/AdminPage/AdminDashboard";
import Leads from "./Pages/AdminPage/Leads";
import { Counsellor } from "./Pages/AdminPage/Counsellor";

// Counsellor Pages
import { CounsellorDashboard } from "./Pages/CounsellorPage/CounsellorDashboard";
import CounsellorLeads from "./Pages/CounsellorPage/Counsellorleads";

import "./App.css";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Setup Routes */}
        <Route path="/setup-password" element={<SetupPassword />} />
        <Route
          path="/counsellor/setup-password"
          element={<SetupCounsellorPassword />}
        />

        {/* ── Admin ── */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route element={<PrivateLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/leads" element={<Leads />} />
            <Route path="/admin/counsellors" element={<Counsellor />} />
          </Route>
        </Route>

        {/* ── Counsellor ── */}
        <Route element={<PrivateRoute allowedRoles={["counsellor"]} />}>
          <Route element={<PrivateLayout />}>
            <Route
              path="/counsellor/dashboard"
              element={<CounsellorDashboard />}
            />
            <Route path="/counsellor/leads" element={<CounsellorLeads />} />

            <Route
              path="/counsellor/applications"
              element={
                <div className="p-10 text-gray-500">
                  Applications — coming soon
                </div>
              }
            />

            <Route
              path="/counsellor/chats"
              element={
                <div className="p-10 text-gray-500">Chats — coming soon</div>
              }
            />
          </Route>
        </Route>

        {/* ── Student ── */}
        <Route element={<PrivateRoute allowedRoles={["student"]} />}>
          <Route element={<PrivateLayout />}>
            <Route
              path="/student/dashboard"
              element={
                <div className="p-10 text-gray-500">
                  Student Dashboard — coming soon
                </div>
              }
            />
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
