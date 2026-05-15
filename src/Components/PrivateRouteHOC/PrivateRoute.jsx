import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuth, selectAuthLoading, selectRole } from '../../redux/slices/authSlice';
 
// Usage:
//   <PrivateRoute allowedRoles={['admin']} />
//   <PrivateRoute allowedRoles={['admin', 'counsellor']} />
 
export default function PrivateRoute({ allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuth);
  const role = useSelector(selectRole);
  const authChecked = useSelector((state) => state.auth.authChecked);

  // WAIT UNTIL AUTH IS VERIFIED
  if (!authChecked) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'counsellor') return <Navigate to="/counsellor/dashboard" replace />;
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}