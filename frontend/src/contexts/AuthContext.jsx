import React, { createContext, useContext, useState } from 'react';

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

    const login = (userData, userRole) => {
        setIsAuthenticated(true);
        setUser(userData);
        setRole(userRole);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
    };

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
