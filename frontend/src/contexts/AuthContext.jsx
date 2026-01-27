import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, role: null };
  }

  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');

    if (!savedUser || !savedToken) {
      return { isAuthenticated: false, user: null, role: null };
    }

    const userData = JSON.parse(savedUser);
    const normalizedRole = userData?.roleName?.toLowerCase() || 'buyer';
    const validRoles = ['guest', 'buyer', 'seller', 'inspector', 'admin'];

    if (!validRoles.includes(normalizedRole)) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      return { isAuthenticated: false, user: null, role: null };
    }

    return {
      isAuthenticated: true,
      user: { ...userData, roleName: normalizedRole },
      role: normalizedRole,
    };
  } catch (error) {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    return { isAuthenticated: false, user: null, role: null };
  }
};

export const AuthProvider = ({ children }) => {
  const stored = readStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(stored.isAuthenticated);
  const [user, setUser] = useState(stored.user);
  const [role, setRole] = useState(stored.role);

  // Use useCallback to memoize login function so it doesn't change on every render
  const login = useCallback((userData, userRole, accessToken = null) => {
    setIsAuthenticated(true);
    setUser(userData);
    setRole(userRole);

    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
    }
  }, []);

  // Use useCallback to memoize logout function
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
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
