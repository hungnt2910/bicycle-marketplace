import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Use useCallback to memoize login function so it doesn't change on every render
  const login = useCallback((userData, userRole) => {
    setIsAuthenticated(true);
    setUser(userData);
    setRole(userRole);
  }, []);

  // Use useCallback to memoize logout function
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
  }, []);

  const value = {
    isAuthenticated,
    user,
    role,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
