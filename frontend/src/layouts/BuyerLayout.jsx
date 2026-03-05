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
    <div className="min-h-screen bg-neutral-offwhite flex flex-col">
      {/* Top Navigation — transparent blur */}
      <Header
        isAuthenticated={isAuthenticated}
        role="buyer"
        currentPage={currentPage}
        onNavigate={onNavigate}
        userName={user?.fullName || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onLogout={onLogout}
      />

      {/* Main Content — generous vertical breathing room */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BuyerLayout;
