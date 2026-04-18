import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuth, selectAuthLoading, selectRole } from '../../redux/slices/authSlice';
 
// Usage:
//   <PrivateRoute allowedRoles={['admin']} />
//   <PrivateRoute allowedRoles={['admin', 'counsellor']} />
 
export default function PrivateRoute({ allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuth);
  const loading         = useSelector(selectAuthLoading);
  const role            = useSelector(selectRole);
 
  // Still checking token on app load — show nothing (or spinner)
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: 14, color: '#6b7280',
      }}>
        <div style={{
          width: 24, height: 24, border: '2px solid #e5e7eb',
          borderTopColor: '#0d9488', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', marginRight: 10,
        }} />
        Loading...
      </div>
    );
  }
 
  // Not logged in at all → go to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;
 
  // Logged in but wrong role → go to their own dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin')      return <Navigate to="/admin/dashboard" replace />;
    if (role === 'counsellor') return <Navigate to="/counsellor/dashboard" replace />;
    if (role === 'student')    return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
 
  return <Outlet />;
}