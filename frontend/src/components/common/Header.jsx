import React, { useMemo, useState } from 'react';
import { Avatar, Button } from '../ui';
import Logo from './Logo';

const navItems = [
  { label: 'Trang chủ', page: 'landing' },
  { label: 'Marketplace', page: 'marketplace' },
];

const Header = ({
  isAuthenticated = false,
  role = null,
  currentPage = 'landing',
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

  const showSearch = isAuthenticated && role === 'buyer';
  const mainNavItems = useMemo(() => {
    if (isAuthenticated && role === 'buyer') {
      return [
        { label: 'Trang chủ', page: 'landing' },
        { label: 'Marketplace', page: 'marketplace' },
        { label: 'Yêu thích', page: 'favorites' },
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Tài khoản', page: 'profile' },
      ];
    }

    if (isAuthenticated && role && role !== 'buyer') {
      return [
        { label: 'Trang chủ', page: 'landing' },
        { label: 'Dashboard', page: 'dashboard' },
      ];
    }

    return navItems;
  }, [isAuthenticated, role]);

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setMobileMenuOpen(false);
    setShowProfile(false);
  };

  const handleCta = () => {
    if (!isAuthenticated) {
      onNavigate && onNavigate('login');
      return;
    }

    if (role === 'seller') {
      onNavigate && onNavigate('create-listing');
    } else if (role === 'buyer') {
      onNavigate && onNavigate('marketplace');
    } else {
      onNavigate && onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Main Navigation Bar - Spacious and Modern */}
      <nav className="bg-white border-b border-neutral-100">
        <div className="container-custom">
          <div className="h-16 md:h-[68px] flex items-center justify-between gap-2 md:gap-4">
            {/* Left: Logo + Nav Links */}
            <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
              <Logo onClick={() => handleNavigate('landing')} />

              <div className="hidden lg:flex items-center gap-0.5">
                {mainNavItems.slice(0, 3).map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavigate(item.page)}
                    className={`px-2 lg:px-2.5 py-1.5 text-xs lg:text-[13px] font-semibold rounded-lg transition-all relative ${
                      currentPage === item.page
                        ? 'text-themePrimary bg-themePrimary/5'
                        : 'text-neutral-700 hover:text-themePrimary hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                    {currentPage === item.page && (
                      <span className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-gradient-to-r from-themePrimary to-accent rounded-full" />
                    )}
                  </button>
                ))}
                {/* Show all items on XL screens */}
                <div className="hidden xl:flex items-center gap-0.5">
                  {mainNavItems.slice(3).map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleNavigate(item.page)}
                      className={`px-2.5 py-1.5 text-[13px] font-semibold rounded-lg transition-all relative ${
                        currentPage === item.page
                          ? 'text-themePrimary bg-themePrimary/5'
                          : 'text-neutral-700 hover:text-themePrimary hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                      {currentPage === item.page && (
                        <span className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-gradient-to-r from-themePrimary to-accent rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center: Search (for authenticated buyers) */}
            {showSearch && (
              <div className="hidden lg:block flex-1 max-w-[240px] xl:max-w-sm">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm xe đạp..."
                    className="w-full h-10 pl-10 pr-4 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary focus:bg-white transition-all"
                  />
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Right: Actions & User Menu */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {role === 'buyer' && isAuthenticated && (
                <button
                  className="relative p-1.5 lg:p-2 hover:bg-neutral-50 rounded-xl transition-colors group hidden md:flex"
                  onClick={() => handleNavigate('favorites')}
                >
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5 text-neutral-600 group-hover:text-rose-500 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>
              )}

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1.5 lg:p-2 hover:bg-neutral-50 rounded-xl transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 text-neutral-600 group-hover:text-themePrimary transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-themePrimary text-white text-[10px] font-bold rounded-full border-2 border-white">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-neutral-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gradient-to-r from-themePrimary/5 to-accent/5 border-b border-neutral-100">
                        <h3 className="font-semibold text-neutral-900">Thông báo</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-50 last:border-0"
                          >
                            <p className="text-sm font-medium text-neutral-900 mb-1">
                              {notif.text}
                            </p>
                            <p className="text-xs text-neutral-500">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 text-center">
                        <button className="text-sm font-semibold text-themePrimary hover:text-themeSecondary transition-colors">
                          Xem tất cả
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated && (
                <button className="relative p-1.5 lg:p-2 hover:bg-neutral-50 rounded-xl transition-colors group hidden xl:block">
                  <svg
                    className="w-5 h-5 text-neutral-600 group-hover:text-themePrimary transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
                </button>
              )}

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-1 hover:bg-neutral-50 rounded-xl p-1 transition-colors"
                  >
                    <Avatar name={userName} size="sm" />
                    <svg
                      className={`w-4 h-4 text-neutral-400 transition-transform hidden md:block ${showProfile ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-neutral-100 overflow-visible z-[100]">
                      <div className="px-4 py-3 bg-gradient-to-br from-themePrimary/5 to-accent/5 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-900 break-words line-clamp-2">
                          {userName}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 break-all line-clamp-1">
                          {userEmail}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                          onClick={() => {
                            handleNavigate('profile');
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Tài khoản của tôi
                        </button>
                        {role === 'buyer' && (
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                            onClick={() => handleNavigate('orders')}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                            Đơn hàng của tôi
                          </button>
                        )}
                      </div>

                      <div className="border-t border-neutral-100">
                        <button
                          className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium"
                          onClick={() => {
                            onLogout && onLogout();
                            setShowProfile(false);
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                className="hidden xl:inline-flex shadow-lg shadow-themePrimary/25 hover:shadow-xl hover:shadow-themePrimary/30 transition-all text-xs px-2.5 py-1.5"
                onClick={handleCta}
              >
                Đăng tin
              </Button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-neutral-50 rounded-xl transition-colors"
                aria-label="Menu"
              >
                <svg
                  className="w-5 h-5 text-neutral-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation for Buyers */}
      {/* Mobile Search */}
      {showSearch && (
        <div className="md:hidden bg-white border-b border-neutral-100">
          <div className="container-custom py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm xe đạp..."
                className="w-full h-10 pl-10 pr-4 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-100 shadow-lg">
          <div className="container-custom py-4 space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  currentPage === item.page
                    ? 'text-themePrimary bg-themePrimary/5'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-3 mt-3 border-t border-neutral-100">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full" onClick={() => onLogout && onLogout()}>
                  Đăng xuất
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleNavigate('login')}
                >
                  Đăng nhập / Đăng ký
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
