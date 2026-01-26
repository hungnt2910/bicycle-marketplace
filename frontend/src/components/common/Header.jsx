import React, { useState } from 'react';
import { Avatar, Button } from '../ui';
import Logo from './Logo';

const Header = ({
  isAuthenticated = false,
  role = null,
  currentPage = 'home',
  onNavigate,
  userName = 'User',
  userEmail = 'user@example.com',
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = [
    { id: 1, type: 'message', text: 'Bạn có tin nhắn mới từ người bán', time: '5 phút trước' },
    { id: 2, type: 'order', text: 'Đơn hàng #1234 đã được giao', time: '1 giờ trước' },
    { id: 3, type: 'price', text: 'Xe bạn yêu thích giảm giá 10%', time: '2 giờ trước' },
  ];

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('landing');
    }
  };

  // Determine if we should show search (only for buyer role)
  const showSearch = isAuthenticated && role === 'buyer';

  // Determine if we should show secondary nav (only for buyer role)
  const showSecondaryNav = isAuthenticated && role === 'buyer';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo onClick={handleLogoClick} />

          {/* Search Bar - Only for Buyer */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm xe đạp..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                  🔍
                </span>
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {!isAuthenticated ? (
              // Guest Actions
              <>
                <a
                  href="#features"
                  className="hidden md:inline text-neutral-700 hover:text-primary-600 font-medium"
                >
                  Tính năng
                </a>
                <a
                  href="#how-it-works"
                  className="hidden md:inline text-neutral-700 hover:text-primary-600 font-medium"
                >
                  Cách hoạt động
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate && onNavigate('login')}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate && onNavigate('register')}
                >
                  Đăng ký
                </Button>
              </>
            ) : (
              // Authenticated Actions
              <>
                {/* Wishlist - Only for Buyer */}
                {role === 'buyer' && (
                  <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                    <span className="text-xl md:text-2xl">❤️</span>
                    <span className="notification-badge">3</span>
                  </button>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl md:text-2xl">🔔</span>
                    <span className="notification-badge">{notifications.length}</span>
                  </button>

                  {showNotifications && (
                    <div className="dropdown right-0 w-80 max-w-[90vw]">
                      <div className="px-4 py-3 border-b border-neutral-200">
                        <h3 className="font-semibold">Thông báo</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="dropdown-item border-b border-neutral-100 last:border-0"
                          >
                            <p className="text-sm font-medium text-neutral-900">{notif.text}</p>
                            <p className="text-xs text-neutral-500 mt-1">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-neutral-200 text-center">
                        <a href="#" className="text-sm text-primary-600 hover:underline">
                          Xem tất cả
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors hidden sm:block">
                  <span className="text-xl md:text-2xl">💬</span>
                  <span className="notification-badge">2</span>
                </button>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2 hover:bg-neutral-100 rounded-lg p-1 pr-3 transition-colors"
                  >
                    <Avatar name={userName} size="sm" />
                    <span className="text-sm font-medium hidden md:inline">{userName}</span>
                    <span className="text-neutral-600">▼</span>
                  </button>

                  {showProfile && (
                    <div className="dropdown right-0">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-neutral-200">
                        <p className="text-sm font-semibold text-neutral-900">{userName}</p>
                        <p className="text-xs text-neutral-500 mt-1">{userEmail}</p>
                      </div>

                      <div
                        className="dropdown-item cursor-pointer"
                        onClick={() => {
                          console.log('Profile click - onNavigate:', onNavigate); // DEBUG
                          if (onNavigate) {
                            console.log('Calling onNavigate(profile)'); // DEBUG
                            onNavigate('profile');
                          }
                          setShowProfile(false);
                        }}
                      >
                        <span className="mr-2"></span>
                        Tài khoản của tôi
                      </div>
                      {role === 'buyer' && (
                        <div className="dropdown-item">
                          <span className="mr-2"></span>
                          Đơn hàng của tôi
                        </div>
                      )}
                      {/* <div className="dropdown-item">
                        <span className="mr-2"></span>
                        Cài đặt
                      </div> */}
                      <div className="border-t border-neutral-200 my-1"></div>
                      <div className="dropdown-item text-danger-600" onClick={onLogout}>
                        <span className="mr-2"></span>
                        Đăng xuất
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle - Only for Buyer */}
                {role === 'buyer' && (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Search - Only for Buyer */}
        {showSearch && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                🔍
              </span>
            </div>
          </div>
        )}

        {/* Secondary Navigation - Only for Buyer */}
        {showSecondaryNav && (
          <div className="hidden md:block border-t border-neutral-200">
            <div className="flex gap-6 py-3 overflow-x-auto">
              <a
                href="#"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'home' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
              >
                Trang chủ
              </a>
              <a
                href="#"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'search' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
              >
                Tìm kiếm nâng cao
              </a>
              <a
                href="#"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'wishlist' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
              >
                Yêu thích
              </a>
              <a
                href="#"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'orders' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
              >
                Đơn hàng
              </a>
              <a
                href="#"
                className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'dashboard' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}
              >
                Dashboard
              </a>
            </div>
          </div>
        )}

        {/* Mobile Menu - Only for Buyer */}
        {showSecondaryNav && mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-2">
            <a
              href="#"
              className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Trang chủ
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Tìm kiếm nâng cao
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Yêu thích
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Đơn hàng
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Tin nhắn
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Dashboard
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
