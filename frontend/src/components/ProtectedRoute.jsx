import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Only toast once to avoid spamming
    if (location.pathname !== '/login') {
      toast.info('Please log in to access this page', { toastId: 'auth-redirect' });
    }
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('Unauthorized access to this section', { toastId: 'unauth-redirect' });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
