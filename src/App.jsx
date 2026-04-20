import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';

// Layout + Route Guards
import PrivateRoute  from './Components/PrivateRouteHOC/PrivateRoute';
import PrivateLayout from './Components/PrivateLayoutHOC/PrivateLayout';

// Auth
import Login from './Pages/Auth/Login';

// Admin Pages
import { AdminDashboard }    from './Pages/AdminPage/AdminDashboard';
import Leads                 from './Pages/AdminPage/Leads';
import { Counsellor }        from './Pages/AdminPage/Counsellor';

// Counsellor Pages
import { CounsellorDashboard } from './Pages/CounsellorPage/CounsellorDashboard';
// import CounsellorLeads      from './Pages/CounsellorPage/CounsellorLeads';

// Student Pages
// import StudentDashboard from './Pages/StudentPage/StudentDashboard';

import './App.css';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/"      element={<Navigate to="/login" replace />} />

        {/* ── Admin Routes ── */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<PrivateLayout />}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/leads"       element={<Leads />} />
            <Route path="/admin/counsellors" element={<Counsellor />} />
          </Route>
        </Route>

        {/* ── Counsellor Routes ── */}
        <Route element={<PrivateRoute allowedRoles={['counsellor']} />}>
          <Route element={<PrivateLayout />}>
            <Route path="/counsellor/dashboard"   element={<CounsellorDashboard />} />
            {/* <Route path="/counsellor/leads"    element={<CounsellorLeads />} /> */}
            <Route path="/counsellor/leads"       element={<div className="p-10 text-gray-500">My Leads — coming soon</div>} />
            <Route path="/counsellor/applications"element={<div className="p-10 text-gray-500">Applications — coming soon</div>} />
            <Route path="/counsellor/chats"       element={<div className="p-10 text-gray-500">Chats — coming soon</div>} />
          </Route>
        </Route>

        {/* ── Student Routes ── */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route element={<PrivateLayout />}>
            <Route path="/student/dashboard"  element={<div className="p-10 text-gray-500">Student Dashboard — coming soon</div>} />
            <Route path="/student/application"element={<div className="p-10 text-gray-500">Application — coming soon</div>} />
            <Route path="/student/documents"  element={<div className="p-10 text-gray-500">Documents — coming soon</div>} />
            <Route path="/student/payments"   element={<div className="p-10 text-gray-500">Payments — coming soon</div>} />
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}