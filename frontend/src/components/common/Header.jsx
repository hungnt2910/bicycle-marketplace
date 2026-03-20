import React, { useMemo, useState } from 'react';
import { Avatar, Button } from '../ui';
import Logo from './Logo';

const navItems = [
  { label: 'Trang chủ', page: 'landing' },
  { label: 'Marketplace', page: 'marketplace' },
  { label: 'Blog', page: 'blog' },
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

  const showSearch = isAuthenticated && role === 'buyer';

  const notifications = useMemo(
    () => [
      {
        id: 1,
        type: 'message',
        text: 'Bạn có tin nhắn mới từ người bán',
        time: '5 phút trước',
      },
      {
        id: 2,
        type: 'order',
        text: 'Đơn hàng #1234 đã được giao',
        time: '1 giờ trước',
      },
      {
        id: 3,
        type: 'price',
        text: 'Xe bạn yêu thích giảm giá 10%',
        time: '2 giờ trước',
      },
    ],
    []
  );

  // const showSearch = isAuthenticated && role === "buyer";

  const mainNavItems = useMemo(() => {
    if (isAuthenticated && role === 'buyer') {
      return [
        { label: 'Trang chủ', page: 'landing' },
        { label: 'Marketplace', page: 'marketplace' },
        { label: 'Blog', page: 'blog' },
        { label: 'Yêu thích', page: 'favorites' },
        { label: 'Ví', page: 'wallet' },
        { label: 'Đơn hàng', page: 'dashboard' },
        // { label: 'Tài khoản', page: 'profile' },

        // { label: "Trang chủ", page: "landing" },
        // { label: "Marketplace", page: "marketplace" },
        // { label: "Blog", page: "blog" },
        // { label: "Yêu thích", page: "favorites" },
        // { label: "Ví", page: "wallet" },
        // { label: "Dashboard", page: "dashboard" },
        // { label: "Tài khoản", page: "profile" },
      ];
    }

    if (isAuthenticated && role && role !== 'buyer') {
      return [
        { label: 'Trang chủ', page: 'landing' },
        { label: 'Blog', page: 'blog' },
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
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-warmgray-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Main Navigation Bar */}
      <nav>
        <div className="container-custom">
          <div className="h-18 flex items-center justify-between gap-4">
            {/* Left: Logo + Nav Links */}
            <div className="flex items-center gap-4 md:gap-8 shrink-0">
              <Logo onClick={() => handleNavigate('landing')} />

              <div className="hidden lg:flex items-center gap-1">
                {mainNavItems.slice(0, 3).map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavigate(item.page)}
                    className={`relative px-3 lg:px-4 py-2 text-sm font-semibold rounded-[12px] transition-all duration-200 ${
                      currentPage === item.page
                        ? 'text-green-600 bg-green-100 shadow-sm'
                        : 'text-warmgray-600 hover:bg-green-100 hover:text-green-600'
                    }`}
                  >
                    {item.label}
                    {currentPage === item.page && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-linear-to-r from-gold to-gold-light rounded-full" />
                    )}
                  </button>
                ))}
                {/* Show all items on XL screens */}
                <div className="hidden xl:flex items-center gap-1">
                  {mainNavItems.slice(3).map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleNavigate(item.page)}
                      className={`relative px-4 py-2 text-sm font-semibold rounded-[12px] transition-all duration-200 ${
                        currentPage === item.page
                          ? 'text-primary-800'
                          : 'text-warmgray-600 hover:text-primary-800 hover:bg-warmgray-100/60'
                      }`}
                    >
                      {item.label}
                      {currentPage === item.page && (
                        <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-gold to-gold-light rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center: Search (for authenticated buyers) */}
            {/* {showSearch && (
              <div className="hidden lg:block flex-1 max-w-xs xl:max-w-sm">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm xe đạp..."
                    className="w-full h-11 pl-11 pr-4 text-sm border border-warmgray-200/80 rounded-full bg-warmgray-50/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 focus:bg-white transition-all placeholder:text-warmgray-400"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400"
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
            )} */}

            {/* Right: Actions & User Menu */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {role === 'buyer' && isAuthenticated && (
                <button
                  className="relative p-2 lg:p-2.5 hover:bg-warmgray-100/60 rounded-full transition-colors group hidden md:flex"
                  onClick={() => handleNavigate('favorites')}
                >
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5 text-warmgray-600 group-hover:text-danger transition-colors"
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
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white" />
                </button>
              )}

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 lg:p-2.5 hover:bg-warmgray-100/60 rounded-full transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5 text-warmgray-600 group-hover:text-primary-800 transition-colors"
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
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary-800 text-white text-[10px] font-bold rounded-full border-2 border-white">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-[20px] shadow-elevated border border-warmgray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 bg-gradient-to-r from-primary-800/5 to-gold/5 border-b border-warmgray-100">
                        <h3 className="font-semibold text-primary-900">Thông báo</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="px-4 py-3 hover:bg-warmgray-50 transition-colors cursor-pointer border-b border-warmgray-50 last:border-0"
                          >
                            <p className="text-sm font-medium text-primary-900 mb-1">
                              {notif.text}
                            </p>
                            <p className="text-xs text-warmgray-500">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 bg-warmgray-50 border-t border-warmgray-100 text-center">
                        <button className="text-sm font-semibold text-primary-800 hover:text-themeSecondary transition-colors">
                          Xem tất cả
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated && (
                <button className="relative p-2 lg:p-2.5 hover:bg-warmgray-100/60 rounded-full transition-colors group hidden xl:block">
                  <svg
                    className="w-5 h-5 text-warmgray-600 group-hover:text-primary-800 transition-colors"
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
                    className="flex items-center gap-2 hover:bg-warmgray-100/60 rounded-full p-1.5 transition-colors"
                  >
                    <Avatar name={userName} size="sm" />
                    <svg
                      className={`w-4 h-4 text-warmgray-400 transition-transform hidden md:block ${showProfile ? 'rotate-180' : ''}`}
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
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-[20px] shadow-elevated border border-warmgray-100 overflow-visible z-[100]">
                      <div className="px-4 py-3 bg-gradient-to-br from-primary-800/5 to-gold/5 border-b border-warmgray-100">
                        <p className="text-sm font-semibold text-primary-900 break-words line-clamp-2">
                          {userName}
                        </p>
                        <p className="text-xs text-warmgray-500 mt-0.5 break-all line-clamp-1">
                          {userEmail}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          className="w-full px-4 py-2.5 text-left text-sm text-warmgray-700 hover:bg-warmgray-50 transition-colors flex items-center gap-2"
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

                        {/* {role === 'buyer' && ( */}

                        {role === 'buyer' && (
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-warmgray-700 hover:bg-warmgray-50 transition-colors flex items-center gap-2"
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
                        {/* {role === 'buyer' && (

                        )} */}
                        {role === 'buyer' && (
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-warmgray-700 hover:bg-warmgray-50 transition-colors flex items-center gap-2"
                            onClick={() => handleNavigate('wallet')}
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
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-2m0-4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2m-4 0h.01"
                              />
                            </svg>
                            Ví của tôi
                          </button>
                        )}
                        {role === 'buyer' && (
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-warmgray-700 hover:bg-warmgray-50 transition-colors flex items-center gap-2"
                            onClick={() => handleNavigate('disputes')}
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            Tranh chấp của tôi
                          </button>
                        )}
                        {role === 'buyer' && (
                          <button
                            className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-warmgray-700 hover:bg-warmgray-50 transition-colors"
                            onClick={() => handleNavigate('chat')}
                            title="Tin nhắn"
                          >
                            <svg
                              className="w-5 h-5 text-primary-800"
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
                            Tin nhắn
                          </button>
                        )}
                      </div>

                      <div className="border-t border-warmgray-100">
                        <button
                          className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/5 transition-colors flex items-center gap-2 font-medium"
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
                className="hidden xl:inline-flex shadow-soft hover:shadow-elevated transition-all text-sm px-5 py-2.5 rounded-full"
                onClick={handleCta}
              >
                Đăng nhập
              </Button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 hover:bg-warmgray-100/60 rounded-full transition-colors"
                aria-label="Menu"
              >
                <svg
                  className="w-5 h-5 text-warmgray-600"
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
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-b border-warmgray-200/40">
          <div className="container-custom py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm xe đạp..."
                className="w-full h-11 pl-11 pr-4 text-sm border border-warmgray-200/80 rounded-full bg-warmgray-50/60 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all placeholder:text-warmgray-400"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400"
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
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-warmgray-200/40 shadow-elevated">
          <div className="container-custom py-6 space-y-2">
            {mainNavItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                className={`w-full text-left px-5 py-3.5 text-sm font-semibold rounded-[16px] transition-all ${
                  currentPage === item.page
                    ? 'text-primary-800 bg-primary-800/5 border-l-[3px] border-gold'
                    : 'text-warmgray-600 hover:bg-warmgray-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-warmgray-200/60">
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
