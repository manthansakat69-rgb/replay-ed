import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS_MAP, ROLES } from '../config/mockUsers';

const AuthContext = createContext(null);

const STORAGE_KEY = 'replayed_auth_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved session from localStorage', e);
    }
    // Default to verified student user so Student Dashboard is always immediately accessible
    return MOCK_USERS_MAP[ROLES.STUDENT];
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to persist session to localStorage', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  /**
   * Log in standard user session
   */
  const loginUser = (userData) => {
    setUser(userData);
  };

  /**
   * Fast Demo Login: bypass credentials and immediately authenticate as selected role
   */
  const demoLogin = (role = ROLES.STUDENT) => {
    const defaultUser = MOCK_USERS_MAP[role] || {
      id: `usr_demo_${role}`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@replayed.edu`,
      role,
    };
    setUser(defaultUser);
    return defaultUser;
  };

  /**
   * Update current user profile fields in session & storage
   */
  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  /**
   * Log out and clear session
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user?.role,
    loginUser,
    demoLogin,
    updateUser,
    logout,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
