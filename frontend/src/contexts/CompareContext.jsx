import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Clear compare items when authentication state changes
  useEffect(() => {
    // Always clear compare list when user changes (login/logout)
    setCompareItems([]);
  }, [user?.id, isAuthenticated]);

  const addToCompare = (bike) => {
    if (compareItems.length >= 2) {
      return false; // Cannot add more than 2 items
    }
    if (compareItems.some((item) => item.id === bike.id)) {
      return false; // Item already in compare list
    }
    setCompareItems([...compareItems, bike]);
    return true;
  };

  const removeFromCompare = (bikeId) => {
    setCompareItems(compareItems.filter((item) => item.id !== bikeId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (bikeId) => {
    return compareItems.some((item) => item.id === bikeId);
  };

  const canAddMore = () => {
    return compareItems.length < 2;
  };

  const value = {
    compareItems,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};
