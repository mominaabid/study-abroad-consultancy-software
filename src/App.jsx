import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUser } from "./redux/slices/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import "./App.css";

import PrivateRoute from "./Components/PrivateRouteHOC/PrivateRoute";
import PrivateLayout from "./Components/PrivateLayoutHOC/PrivateLayout";

import Login from "./Pages/Auth/Login";
import SetupPassword from "./Pages/Auth/SetupPassword";
import SetupCounsellorPassword from "./Pages/Auth/SetupCounsellorPassword";

import { AdminDashboard } from "./Pages/AdminPage/AdminDashboard";
import AdminChatPage from "./Pages/AdminPage/AdminChat";
import Leads from "./Pages/AdminPage/Leads";
import { Counsellor } from "./Pages/AdminPage/Counsellor";

import { CounsellorDashboard } from "./Pages/CounsellorPage/CounsellorDashboard";
import CounsellorLeads from "./Pages/CounsellorPage/Counsellorleads";
import CounsellorChat from "./Pages/CounsellorPage/CounsellorChat";
import CounsellorDocuments from "./Pages/CounsellorPage/CounsellorDocuments";
import { CounsellorApplication } from "./Pages/CounsellorPage/CounsellorApplication";
import StudentDashboard from "./Pages/StudentPage/StudentDashboard";
import StudentChat from "./Pages/StudentPage/StudentChat";
import StudentDocuments from "./Pages/StudentPage/StudentDocuments";
import { StudentApplication } from "./Pages/StudentPage/StudentApplication";
import { StudentPayment } from "./Pages/StudentPage/StudentPayment";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="colored"
        limit={1}
        newestOnTop={true}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/setup-password" element={<SetupPassword />} />
        <Route
          path="/counsellor/setup-password"
          element={<SetupCounsellorPassword />}
        />

        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<PrivateLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="counsellors" element={<Counsellor />} />
            <Route path="/admin/chats" element={<AdminChatPage />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["counsellor"]} />}>
          <Route path="/counsellor" element={<PrivateLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CounsellorDashboard />} />
            <Route path="leads" element={<CounsellorLeads />} />
            <Route path="chats" element={<CounsellorChat />} />
            <Route path="documents" element={<CounsellorDocuments />} />

         <Route path="applications" element={<CounsellorApplication />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<PrivateLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="application" element={<StudentApplication />} />
            <Route path="documents" element={<StudentDocuments />} />
            <Route path="chats" element={<StudentChat />} />
            <Route path="payments" element={<StudentPayment />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
