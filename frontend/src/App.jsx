import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guest Pages
import LandingPage from './pages/guest/LandingPage';

// Auth Pages
import Register from './pages/auth/Register';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Marketplace from './pages/buyer/Marketplace';
import ProductDetail from './pages/buyer/ProductDetail';

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
  const { isAuthenticated, role, login } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [devRole, setDevRole] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Allow dev to override role for testing
  const effectiveRole = devRole || role;

  // Handle navigation
  const handleNavigate = (page, productId = null) => {
    if (page === 'landing') {
      // When navigating to landing page, reset role
      setDevRole(null);
      setCurrentPage('landing');
    } else {
      setCurrentPage(page);
      if (productId) {
        setSelectedProductId(productId);
      }
    }
  };

  // Handle login
  const handleLogin = (userData, userRole) => {
    login(userData, userRole);
    setCurrentPage('home');
  };

  // Handle registration
  const handleRegister = (userRole) => {
    login({ name: 'New User' }, userRole);
    setCurrentPage('home');
  };

  // Dev Panel to switch roles
  const DevPanel = () => (
    <div className="fixed bottom-4 right-4 bg-neutral-900 text-white p-4 rounded-xl shadow-2xl z-50 opacity-90 hover:opacity-100 transition-opacity">
      <p className="font-bold mb-3 text-sm">🧪 Dev Panel - Chọn vai trò</p>
      <div className="space-y-2">
        {['guest', 'buyer', 'seller', 'inspector', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => {
              if (r === 'guest') {
                setDevRole(null);
                setCurrentPage('landing');
              } else {
                setDevRole(r);
                setCurrentPage('home');
              }
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(r === 'guest' && !devRole) || devRole === r
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
          >
            {r === 'guest' ? '🌐 Guest' : r === 'buyer' ? '🛒 Buyer' : r === 'seller' ? '🏪 Seller' : r === 'inspector' ? '✅ Inspector' : '👨‍💼 Admin'}
          </button>
        ))}
      </div>
    </div>
  );

  // Guest/Unauthenticated Routes
  if (!isAuthenticated && !devRole) {
    if (currentPage === 'register') {
      return (
        <>
          <Register onRegisterSuccess={handleRegister} />
          <DevPanel />
        </>
      );
    }

    // Allow guests to view marketplace
    if (currentPage === 'marketplace') {
      return (
        <>
          <BuyerLayout currentPage={currentPage} onNavigate={handleNavigate}>
            <Marketplace onNavigate={handleNavigate} />
          </BuyerLayout>
          <DevPanel />
        </>
      );
    }

    // Allow guests to view product details
    if (currentPage === 'product-detail') {
      return (
        <>
          <BuyerLayout currentPage={currentPage} onNavigate={handleNavigate}>
            <ProductDetail productId={selectedProductId} />
          </BuyerLayout>
          <DevPanel />
        </>
      );
    }

    return (
      <>
        <LandingPage onNavigate={handleNavigate} />
        <DevPanel />
      </>
    );
  }

  // Buyer Routes
  if (effectiveRole === 'buyer') {
    return (
      <>
        <BuyerLayout currentPage={currentPage} onNavigate={handleNavigate}>
          {currentPage === 'home' && <Marketplace onNavigate={handleNavigate} />}
          {currentPage === 'dashboard' && <BuyerDashboard />}
          {currentPage === 'marketplace' && <Marketplace onNavigate={handleNavigate} />}
          {currentPage === 'product-detail' && <ProductDetail productId={selectedProductId} />}
        </BuyerLayout>
        <DevPanel />
      </>
    );
  }

  // Seller Routes
  if (effectiveRole === 'seller') {
    return (
      <>
        <DashboardLayout role="seller" onNavigate={handleNavigate}>
          {currentPage === 'home' && <SellerDashboard />}
          {currentPage === 'dashboard' && <SellerDashboard />}
          {currentPage === 'create-listing' && <CreateListingEnhanced />}
          {currentPage === 'manage-listings' && <ManageListings />}
          {currentPage === 'orders' && <SellerOrders />}
          {currentPage === 'reputation' && <Reputation />}
          {currentPage === 'inspection' && <InspectionRequests />}
          {currentPage === 'messages' && <Messages />}
        </DashboardLayout>
        <DevPanel />
      </>
    );
  }

  // Inspector Routes
  if (effectiveRole === 'inspector') {
    return (
      <>
        <DashboardLayout role="inspector">
          <InspectorDashboard />
        </DashboardLayout>
        <DevPanel />
      </>
    );
  }

  // Admin Routes
  if (effectiveRole === 'admin') {
    return (
      <>
        <DashboardLayout role="admin">
          <AdminDashboard />
        </DashboardLayout>
        <DevPanel />
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
      <DevPanel />
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
