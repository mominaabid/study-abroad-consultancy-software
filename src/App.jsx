// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import DashboardLayout from "./Components/DashboardLayout";
// import { AdminDashboard } from "./Pages/AdminPage/AdminDashboard";
// import Leads from "./Pages/AdminPage/Leads";
// import Counsellor from "./Pages/AdminPage/Counsellor";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route element={<DashboardLayout />}>
//           <Route index element={<AdminDashboard />} />
//           <Route path="/leads" element={<Leads />} />
//           <Route path="/counsellor" element={<Counsellor />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';

// Layout + Route Guards
import PrivateRoute   from './Components/PrivateRouteHOC/PrivateRoute';
import PrivateLayout  from './Components/PrivateLayoutHOC/PrivateLayout';

// Auth
import Login from './Pages/Auth/Login';

// Admin Pages
import { AdminDashboard } from "./Pages/AdminPage/AdminDashboard";
import Leads          from './Pages/AdminPage/Leads';
import Counsellor     from './Pages/AdminPage/Counsellor';
// import Counsellors from './Pages/AdminPage/Counsellors';   ← add as you build
// import Applications from './Pages/AdminPage/Applications';
// import Payments     from './Pages/AdminPage/Payments';

// Counsellor Pages
// import CounsellorDashboard from './Pages/CounsellorPage/CounsellorDashboard';
// import MyLeads             from './Pages/CounsellorPage/MyLeads';

// Student Pages
// import StudentDashboard from './Pages/StudentPage/StudentDashboard';

import './App.css';

export default function App() {
  const dispatch = useDispatch();

  // On every app load: check if a saved token is still valid
  // This runs ONCE — keeps user logged in on refresh
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
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/leads"     element={<Leads />} />
            <Route path="/admin/counsellors" element={<Counsellor />} />
            {/* <Route path="/admin/applications" element={<Applications />} /> */}
            {/* <Route path="/admin/payments"     element={<Payments />} /> */}
          </Route>
        </Route>

        {/* ── Counsellor Routes ── */}
        <Route element={<PrivateRoute allowedRoles={['counsellor']} />}>
          <Route element={<PrivateLayout />}>
            {/* <Route path="/counsellor/dashboard" element={<CounsellorDashboard />} /> */}
            {/* <Route path="/counsellor/leads"     element={<MyLeads />} /> */}
            <Route path="/counsellor/dashboard" element={<div style={{padding:40}}>Counsellor Dashboard — coming soon</div>} />
          </Route>
        </Route>

        {/* ── Student Routes ── */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route element={<PrivateLayout />}>
            {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
            <Route path="/student/dashboard" element={<div style={{padding:40}}>Student Dashboard — coming soon</div>} />
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
