import React, { useState } from 'react';
import { Avatar, Badge } from '../components/ui';
import { Header } from '../components/common';

const DashboardLayout = ({
  children,
  role = 'seller',
  onNavigate,
  user,
  onLogout,
  isAuthenticated = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = {
    seller: [
      { icon: '', label: 'Dashboard', path: 'dashboard' },
      { icon: '', label: 'Đăng tin mới', path: 'create-listing' },
      { icon: '', label: 'Quản lý tin đăng', path: 'manage-listings' },
      { icon: '', label: 'Quản lý đơn hàng', path: 'orders' },
      { icon: '', label: 'Uy tín & Đánh giá', path: 'reputation' },
      { icon: '', label: 'Yêu cầu kiểm định', path: 'inspection' },
      { icon: '', label: 'Tin nhắn', path: 'messages', badge: 3 },
    ],
    inspector: [
      { icon: '', label: 'Dashboard', path: 'dashboard' },
      { icon: '', label: 'Hàng đợi kiểm định', path: 'queue' },
      { icon: '', label: 'Đang kiểm định', path: 'active' },
      { icon: '', label: 'Báo cáo đã hoàn thành', path: 'reports' },
      { icon: '', label: 'Hỗ trợ tranh chấp', path: 'disputes' },
      { icon: '', label: 'Thống kê', path: 'stats' },
    ],
    admin: [
      { icon: '', label: 'Dashboard', path: 'dashboard' },
      { icon: '', label: 'Quản lý người dùng', path: 'users' },
      { icon: '', label: 'Kiểm duyệt tin đăng', path: 'moderation' },
      { icon: '', label: 'Giải quyết tranh chấp', path: 'disputes' },
      { icon: '', label: 'Quản lý danh mục', path: 'categories' },
      { icon: '', label: 'Quản lý giao dịch', path: 'transactions' },
      { icon: '', label: 'Báo cáo hệ thống', path: 'reports' },
    ],
  };

  const roleNames = {
    seller: 'Người bán',
    inspector: 'Kiểm định viên',
    admin: 'Quản trị viên',
  };

  const roleColors = {
    seller: 'from-blue-500 to-cyan-600',
    inspector: 'from-green-500 to-emerald-600',
    admin: 'from-purple-500 to-pink-600',
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden">
        <Header
          isAuthenticated={isAuthenticated}
          role={role}
          onNavigate={onNavigate}
          userName={user?.fullName || 'User'}
          userEmail={user?.email || 'user@example.com'}
          onLogout={onLogout}
        />
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex bg-white border-r border-neutral-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex-col`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-neutral-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚴</span>
              <h1 className="text-xl font-bold gradient-text">Bicycle-Marketplace</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <span className="text-lg">{sidebarOpen ? '«' : '»'}</span>
          </button>
        </div>

        {/* Role Badge */}
        <div
          className={`mx-4 my-4 p-3 rounded-lg bg-gradient-to-r ${roleColors[role]} text-white text-center`}
        >
          {sidebarOpen ? (
            <div>
              <div className="text-2xl mb-1">
                {role === 'seller' ? '🏪' : role === 'inspector' ? '✅' : '👨‍💼'}
              </div>
              <div className="text-sm font-semibold">{roleNames[role]}</div>
            </div>
          ) : (
            <div className="text-2xl">
              {role === 'seller' ? '🏪' : role === 'inspector' ? '✅' : '👨‍💼'}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {menuItems[role].map((item, index) => (
            <a
              key={index}
              href={`#${item.path}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700 hover:text-neutral-900 relative"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-danger-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {!sidebarOpen && item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-neutral-200 p-4">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 w-full hover:bg-neutral-100 rounded-lg p-2 transition-colors"
            >
              <Avatar name="Nguyễn Văn A" size="sm" />
              {sidebarOpen && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Nguyễn Văn A</div>
                  <div className="text-xs text-neutral-500">admin@Bicycle-Marketplace.vn</div>
                </div>
              )}
            </button>

            {showProfile && sidebarOpen && (
              <div className="dropdown bottom-full mb-2 left-0 right-0">
                <div
                  className="dropdown-item cursor-pointer"
                  onClick={() => {
                    onNavigate && onNavigate('profile');
                    setShowProfile(false);
                  }}
                >
                  <span className="mr-2">👤</span>
                  Tài khoản
                </div>
                <div className="dropdown-item">
                  <span className="mr-2">⚙️</span>
                  Cài đặt
                </div>
                <div className="border-t border-neutral-200 my-1"></div>
                <div className="dropdown-item text-danger-600" onClick={onLogout}>
                  <span className="mr-2">🚪</span>
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200">
          <div
            className={`p-4 mb-2 mx-4 rounded-lg bg-gradient-to-r ${roleColors[role]} text-white text-center`}
          >
            <div className="text-2xl mb-1">
              {role === 'seller' ? '🏪' : role === 'inspector' ? '✅' : '👨‍💼'}
            </div>
            <div className="text-sm font-semibold">{roleNames[role]}</div>
          </div>
          <nav className="px-2 pb-4">
            {menuItems[role].map((item, index) => (
              <a
                key={index}
                href={`#${item.path}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-neutral-700"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-danger-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-neutral-900">Dashboard</h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <span className="text-xl md:text-2xl">🔔</span>
              <span className="notification-badge">5</span>
            </button>

            {/* Messages */}
            <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <span className="text-xl md:text-2xl">💬</span>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200 px-4 md:px-6 py-4">
          <div className="text-xs md:text-sm text-neutral-600 text-center">
            &copy; 2024 Bicycle-Marketplace. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
