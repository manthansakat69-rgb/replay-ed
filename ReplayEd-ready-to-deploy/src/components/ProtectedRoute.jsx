import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config/mockUsers';

/**
 * ProtectedRoute Wrapper
 * Ensures the student dashboard or portal is always immediately visible
 * and auto-authenticates the user without blocking them behind a login wall.
 */
export default function ProtectedRoute({ children, allowedRole = ROLES.STUDENT }) {
  const { user, isAuthenticated, demoLogin } = useAuth();

  useEffect(() => {
    // If not authenticated or if role differs, automatically synchronize to allowedRole
    if (!isAuthenticated || !user?.role || (allowedRole && user.role !== allowedRole)) {
      demoLogin(allowedRole);
    }
  }, [isAuthenticated, user, allowedRole, demoLogin]);

  return children;
}
