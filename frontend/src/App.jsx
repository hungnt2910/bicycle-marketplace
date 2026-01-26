import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guest Pages
import LandingPage from './pages/guest/LandingPage';

// Auth Pages
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Marketplace from './pages/buyer/Marketplace';
import ProductDetail from './pages/buyer/ProductDetail';
import Profile from './pages/buyer/Profile';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import CreateListingEnhanced from './pages/seller/CreateListingEnhanced';
import ManageListings from './pages/seller/ManageListings';
import SellerOrders from './pages/seller/SellerOrders';
import Reputation from './pages/seller/Reputation';
import InspectionRequests from './pages/seller/InspectionRequests';
import Messages from './pages/seller/Messages';

// Inspector Pages
import InspectorDashboard from './pages/inspector/InspectorDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

const AppContent = () => {
  const { isAuthenticated, role, user, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        // Ensure role is lowercase
        const normalizedRole = userData.roleName?.toLowerCase() || 'buyer';
        const validRoles = ['guest', 'buyer', 'seller', 'inspector', 'admin'];

        if (validRoles.includes(normalizedRole)) {
          const normalizedUser = { ...userData, roleName: normalizedRole };
          login(normalizedUser, normalizedRole);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        // console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  }, [login]);

  // Use role directly (no dev override needed)
  const effectiveRole = role;

  // Handle navigation
  const handleNavigate = (page, productId = null) => {
    // console.log('handleNavigate called with page:', page); // DEBUG
    if (page === 'landing') {
      // When navigating to landing page, reset page
      setCurrentPage('landing');
    } else {
      setCurrentPage(page);
      if (productId) {
        setSelectedProductId(productId);
      }
    }
  };

  const handleLogin = (userData) => {
    // console.log('handleLogin - userData:', userData); // DEBUG

    const userRole = userData.roleName?.toLowerCase() || 'buyer';
    const validRoles = ['guest', 'buyer', 'seller', 'inspector', 'admin'];
    if (!validRoles.includes(userRole)) {
      // console.error('Invalid role:', userData.roleName);
      return;
    }

    // console.log('handleLogin - calling login with:', userData, userRole); // DEBUG
    login(userData, userRole);
  };

  // Watch for successful authentication to navigate to home (only if on landing/auth pages)
  useEffect(() => {
    if (
      isAuthenticated &&
      role &&
      (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')
    ) {
      setCurrentPage('home');
    }
  }, [isAuthenticated, role]);

  // Handle registration
  const handleRegister = (userData) => {
    const userRole = userData.roleName?.toLowerCase() || 'buyer';

    const validRoles = ['guest', 'buyer', 'seller', 'inspector', 'admin'];
    if (!validRoles.includes(userRole)) {
      // console.error('Invalid role:', userData.roleName);
      return;
    }

    login(userData, userRole);
    // Don't set currentPage here, let useEffect handle it after role is updated
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    setCurrentPage('landing');
  };

  if (!isAuthenticated) {
    // Login page
    if (currentPage === 'login') {
      return (
        <>
          <Login onLoginSuccess={handleLogin} onNavigate={handleNavigate} />
        </>
      );
    }

    if (currentPage === 'register') {
      return (
        <>
          <Register onRegisterSuccess={handleRegister} onNavigate={handleNavigate} />
        </>
      );
    }

    // Allow guests to view marketplace
    if (currentPage === 'marketplace') {
      return (
        <>
          <BuyerLayout
            currentPage={currentPage}
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
            isAuthenticated={false}
          >
            <Marketplace onNavigate={handleNavigate} />
          </BuyerLayout>
        </>
      );
    }

    // Allow guests to view product details
    if (currentPage === 'product-detail') {
      return (
        <>
          <BuyerLayout
            currentPage={currentPage}
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
            isAuthenticated={false}
          >
            <ProductDetail productId={selectedProductId} />
          </BuyerLayout>
        </>
      );
    }

    return (
      <>
        <LandingPage onNavigate={handleNavigate} />
      </>
    );
  }

  // Buyer Routes
  if (effectiveRole === 'buyer') {
    console.log('Rendering buyer route - currentPage:', currentPage); // DEBUG
    return (
      <>
        <BuyerLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        >
          {currentPage === 'home' && <Marketplace onNavigate={handleNavigate} />}
          {currentPage === 'dashboard' && <BuyerDashboard />}
          {currentPage === 'marketplace' && <Marketplace onNavigate={handleNavigate} />}
          {currentPage === 'product-detail' && <ProductDetail productId={selectedProductId} />}
          {currentPage === 'profile' && <Profile />}
        </BuyerLayout>
      </>
    );
  }

  // Seller Routes
  if (effectiveRole === 'seller') {
    return (
      <>
        <DashboardLayout
          role="seller"
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        >
          {currentPage === 'home' && <SellerDashboard />}
          {currentPage === 'dashboard' && <SellerDashboard />}
          {currentPage === 'create-listing' && <CreateListingEnhanced />}
          {currentPage === 'manage-listings' && <ManageListings />}
          {currentPage === 'orders' && <SellerOrders />}
          {currentPage === 'reputation' && <Reputation />}
          {currentPage === 'inspection' && <InspectionRequests />}
          {currentPage === 'messages' && <Messages />}
          {currentPage === 'profile' && <Profile />}
        </DashboardLayout>
      </>
    );
  }

  // Inspector Routes
  if (effectiveRole === 'inspector') {
    return (
      <>
        <DashboardLayout
          role="inspector"
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        >
          {currentPage === 'profile' && <Profile />}
          {currentPage !== 'profile' && <InspectorDashboard />}
        </DashboardLayout>
      </>
    );
  }

  // Admin Routes
  if (effectiveRole === 'admin') {
    return (
      <>
        <DashboardLayout
          role="admin"
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        >
          {currentPage === 'profile' && <Profile />}
          {currentPage !== 'profile' && <AdminDashboard />}
        </DashboardLayout>
      </>
    );
  }

  if (isAuthenticated && role) {
    return (
      <>
        <BuyerLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        >
          {currentPage === 'home' && <Marketplace onNavigate={handleNavigate} />}
          {currentPage === 'dashboard' && <BuyerDashboard />}
          {currentPage === 'marketplace' && <Marketplace onNavigate={handleNavigate} />}
          {currentPage === 'product-detail' && <ProductDetail productId={selectedProductId} />}
        </BuyerLayout>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">404</h1>
          <p className="text-neutral-600">Trang không tồn tại</p>
        </div>
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
