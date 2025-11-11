import React from 'react';
import { useAuth } from './AuthProvider';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, checkedSession } = useAuth();

  console.log('[DEBUG-PrivateRoute] Check:', { checkedSession, isAuthenticated, role });

  // Show loading until session is fully checked
  if (!checkedSession) {
    console.log('[DEBUG-PrivateRoute] Waiting for session check...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[DEBUG-PrivateRoute] Not authenticated → Redirect to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log('[DEBUG-PrivateRoute] Role mismatch → Redirect to /');
    return <Navigate to="/" replace />;
  }

  console.log('[DEBUG-PrivateRoute] All good → Render Outlet');
  return <Outlet />;
};

export default PrivateRoute;