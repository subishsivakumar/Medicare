import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read existing session from localStorage; null if logged out
  const [currentUser, setCurrentUser] = useState(() => {
    return authService.getCurrentUser();
  });

  // Login handler
  const login = async (email, password, roleHint) => {
    const result = await authService.login(email, password, roleHint);
    setCurrentUser(result.user);
    return result;
  };

  // Register handler - stores user in demo registry, does NOT set active session so user redirects to login
  const register = async (userData) => {
    const result = await authService.register(userData);
    return result;
  };

  // Logout handler - clears session state
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Quick dev switch role
  const switchRole = (role) => {
    const targetUser = mockUsers.find(u => u.role === role) || {
      id: `usr-${role}-demo`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@medicare.com`,
      role: role
    };
    localStorage.setItem('medicare_current_user', JSON.stringify(targetUser));
    localStorage.setItem('medicare_auth_token', `demo-token-${targetUser.id}`);
    setCurrentUser(targetUser);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      user: currentUser,
      login,
      register,
      logout,
      switchRole,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
