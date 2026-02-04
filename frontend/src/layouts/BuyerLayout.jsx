import React from 'react';
import { Header, Footer } from '../components/common';

const BuyerLayout = ({
  children,
  currentPage = 'home',
  onNavigate,
  user,
  onLogout,
  isAuthenticated = false,
}) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <Header
        isAuthenticated={isAuthenticated}
        role="buyer"
        currentPage={currentPage}
        onNavigate={onNavigate}
        userName={user?.fullName || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-180px)]">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BuyerLayout;
