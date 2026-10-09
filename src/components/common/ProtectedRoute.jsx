import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute - Frontend Demo Route Guard
 * 
 * Enforces role-based dashboard access in the UI:
 * - Guest (not logged in) -> redirected to /login with return intent
 * - Patient attempting to access /doctor/dashboard or /admin/dashboard -> redirected to /patient/dashboard
 * - Doctor attempting to access /admin/dashboard -> redirected to /doctor/dashboard
 *
 * NOTE: This is client-side demo protection for prototype routing.
 * Real production security must be enforced by Spring Security JWT filters on REST endpoints.
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  // 1. If not authenticated, redirect to /login
  if (!currentUser) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Please sign in to access your MediCare dashboard.' 
        }} 
        replace 
      />
    );
  }

  // 2. Check if the user's role is permitted
  const currentRole = currentUser.role?.toLowerCase();
  const isAllowed = allowedRoles.length === 0 || allowedRoles.map(r => r.toLowerCase()).includes(currentRole);

  if (!isAllowed) {
    // Determine the user's appropriate home dashboard
    let targetDashboard = '/patient/dashboard';
    if (currentRole === 'doctor') {
      targetDashboard = '/doctor/dashboard';
    } else if (currentRole === 'admin') {
      targetDashboard = '/admin/dashboard';
    }

    const deniedMessage = `Access Denied: As a ${currentUser.role?.toUpperCase()}, you do not have permission to access that dashboard. You have been redirected to your dashboard.`;

    return (
      <Navigate 
        to={targetDashboard} 
        state={{ 
          alert: deniedMessage,
          alertType: 'warning'
        }} 
        replace 
      />
    );
  }

  // User is authenticated and authorized
  return children;
}
