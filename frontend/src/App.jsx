import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompareProvider } from './contexts/CompareContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import BuyerLayout from './layouts/BuyerLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guest Pages
import LandingPage from './pages/guest/LandingPage';
import Blog from './pages/guest/Blog';

// Auth Pages
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import Marketplace from './pages/buyer/Marketplace';
import ProductDetail from './pages/buyer/ProductDetail';
import Profile from './pages/buyer/Profile';
import Compare from './pages/buyer/Compare';
import Favourites from './pages/buyer/Favourites';
import ZaloPayReturn from './pages/payment/ZaloPayReturn';
import TransactionDetail from './pages/buyer/TransactionDetail';
import Wallet from './pages/buyer/Wallet';
import WalletPayment from './pages/buyer/WalletPayment';
import CreateDispute from './pages/buyer/CreateDispute';
import MyDisputes from './pages/buyer/MyDisputes';
import DisputeDetail from './pages/buyer/DisputeDetail';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import CreateListing from './pages/seller/CreateListing';
import EditListing from './pages/seller/EditListing';
// import CreateListingEnhanced from './pages/seller/CreateListingEnhanced';
import ManageListings from './pages/seller/ManageListings';
import SellerOrders from './pages/seller/SellerOrders';
import Reputation from './pages/seller/Reputation';
import InspectionRequests from './pages/seller/InspectionRequests';
import Messages from './pages/seller/Messages';

// Inspector Pages
import InspectorDashboard from './pages/inspector/InspectorDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ListingModeration from './pages/admin/ListingModeration';
import DisputeResolution from './pages/admin/DisputeResolution';
import CategoryManagement from './pages/admin/CategoryManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import SystemReports from './pages/admin/SystemReports';
import SystemSettings from './pages/admin/SystemSettings';
import UserManagement from './pages/admin/UserManagement';

// Route Guard
import PrivateRoute from './routes/PrivateRoute';
import InspectorManagement from './pages/admin/InspectorManagement';

const pageToPath = (page, productId = null, role = 'buyer') => {
  switch (page) {
    case 'landing':
      return '/';
    case 'blog':
      return '/blog';
    case 'marketplace':
    case 'home':
      return '/marketplace';
    case 'compare':
      return '/compare';
    case 'favorites':
    case 'favourites':
      return '/favorites';
    case 'product-detail':
      return productId ? `/product/${productId}` : '/product';
    case 'login':
      return '/login';
    case 'register':
      return '/register';
    case 'dashboard':
      if (role === 'seller') return '/seller/dashboard';
      if (role === 'inspector') return '/inspector/dashboard';
      if (role === 'admin') return '/admin/dashboard';
      return '/buyer/dashboard';
    case 'profile':
      if (role === 'seller') return '/seller/profile';
      if (role === 'inspector') return '/inspector/profile';
      if (role === 'admin') return '/admin/profile';
      return '/buyer/profile';
    case 'create-listing':
      return '/seller/create-listing';
    case 'manage-listings':
      return '/seller/manage-listings';
    case 'orders':
      return '/seller/orders';
    case 'wallet':
      if (role === 'seller') return '/seller/wallet';
      if (role === 'admin') return '/admin/wallet';
      return '/buyer/wallet';
    case 'disputes':
      return '/buyer/disputes';
    case 'reputation':
      return '/seller/reputation';
    case 'inspection':
      return '/seller/inspection';
    case 'messages':
      return '/seller/messages';
    default:
      return '/';
  }
};

const ProductDetailRoute = ({ onNavigate }) => {
  const { id } = useParams();
  return <ProductDetail productId={id || null} onNavigate={onNavigate} />;
};

const AppRoutes = () => {
  const { isAuthenticated, role, user, login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
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
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  }, [login]);

  const effectiveRole = role || 'guest';

  const handleNavigate = (page, productId = null) => {
    // If page starts with '/', treat it as a full path
    if (typeof page === 'string' && page.startsWith('/')) {
      navigate(page);
    } else {
      const targetPath = pageToPath(page, productId, effectiveRole);
      navigate(targetPath);
    }
  };

  const handleLogin = (userData) => {
    const userRole = userData.roleName?.toLowerCase() || 'buyer';
    const validRoles = ['guest', 'buyer', 'seller', 'inspector', 'admin'];
    if (!validRoles.includes(userRole)) return;
    login(userData, userRole);
    navigate('/');
  };

  const handleRegister = (userData) => {
    const userRole = userData.roleName?.toLowerCase() || 'buyer';
    const validRoles = ['guest', 'buyer', 'seller', 'inspector', 'admin'];
    if (!validRoles.includes(userRole)) return;
    login(userData, userRole);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const buyerShell = (page, child) => (
    <BuyerLayout
      currentPage={page}
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
      isAuthenticated={isAuthenticated}
    >
      {child}
    </BuyerLayout>
  );

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <LandingPage
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
            role={role}
            user={user}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLogin} onNavigate={handleNavigate} />}
      />
      <Route
        path="/blog"
        element={
          <Blog
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
            role={role}
            user={user}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/register"
        element={<Register onRegisterSuccess={handleRegister} onNavigate={handleNavigate} />}
      />
      <Route
        path="/marketplace"
        element={buyerShell('marketplace', <Marketplace onNavigate={handleNavigate} />)}
      />
      <Route path="/favorites" element={buyerShell('favorites', <Favourites />)} />
      <Route
        path="/compare"
        element={buyerShell('compare', <Compare onNavigate={handleNavigate} />)}
      />
      <Route
        path="/product/:id"
        element={buyerShell('product-detail', <ProductDetailRoute onNavigate={handleNavigate} />)}
      />
      <Route path="/payment/zalopay-return" element={<ZaloPayReturn />} />
      <Route path="/payment/checking" element={<ZaloPayReturn />} />

      {/* Buyer protected */}
      <Route
        path="/buyer/dashboard"
        element={
          <PrivateRoute allowedRoles={['buyer']}>
            {buyerShell('dashboard', <BuyerDashboard onNavigate={handleNavigate} />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/buyer/transactions/:id"
        element={
          <PrivateRoute allowedRoles={['buyer']}>
            {buyerShell('dashboard', <TransactionDetail />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/buyer/wallet"
        element={
          <PrivateRoute allowedRoles={['buyer']}>{buyerShell('wallet', <Wallet />)}</PrivateRoute>
        }
      />
      <Route
        path="/buyer/disputes"
        element={
          <PrivateRoute allowedRoles={['buyer']}>
            {buyerShell('disputes', <MyDisputes />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/buyer/disputes/create"
        element={
          <PrivateRoute allowedRoles={['buyer']}>
            {buyerShell('disputes', <CreateDispute />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/buyer/disputes/:id"
        element={
          <PrivateRoute allowedRoles={['buyer']}>
            {buyerShell('disputes', <DisputeDetail />)}
          </PrivateRoute>
        }
      />
      <Route
        path="/wallet-payment"
        element={
          <PrivateRoute allowedRoles={['buyer', 'seller']}>
            <WalletPayment />
          </PrivateRoute>
        }
      />

      {/* Seller protected */}
      <Route
        path="/seller/wallet"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
              currentPage="wallet"
            >
              <Wallet />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/buyer/profile"
        element={
          <PrivateRoute allowedRoles={['buyer']}>
            {buyerShell('profile', <Profile onNavigate={handleNavigate} />)}
          </PrivateRoute>
        }
      />

      {/* Seller protected */}
      <Route
        path="/seller/dashboard"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <SellerDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/create-listing"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <CreateListing />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/manage-listings"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <ManageListings />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/edit-listing/:id"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <EditListing />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <SellerOrders />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/reputation"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <Reputation />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/inspection"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <InspectionRequests />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/messages"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <Messages />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <PrivateRoute allowedRoles={['seller']}>
            <DashboardLayout
              role="seller"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <Profile onNavigate={handleNavigate} />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Inspector protected */}
      <Route
        path="/inspector/dashboard"
        element={
          <PrivateRoute allowedRoles={['inspector']}>
            <DashboardLayout
              role="inspector"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <InspectorDashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inspector/profile"
        element={
          <PrivateRoute allowedRoles={['inspector']}>
            <DashboardLayout
              role="inspector"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <Profile />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Admin protected */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="dashboard"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <AdminDashboard user={user} />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/wallet"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="wallet"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <Wallet />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/inspectormanagement"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="inspectormanagement"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <InspectorManagement />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="moderation"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <ListingModeration />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="disputes"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <DisputeResolution />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="categories"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <CategoryManagement />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="transactions"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <TransactionManagement />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="reports"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <SystemReports />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="settings"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <SystemSettings />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              currentPage="users"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <UserManagement />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <DashboardLayout
              role="admin"
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
            >
              <Profile />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Fallbacks */}
      <Route path="/buyer/home" element={<Navigate to="/marketplace" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <CompareProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </CompareProvider>
  </AuthProvider>
);

export default App;
