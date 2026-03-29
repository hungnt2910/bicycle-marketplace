import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Avatar } from '../components/ui';
import { Footer } from '../components/common';

const DashboardLayout = ({
  children,
  role = 'seller',
  onNavigate,
  user,
  onLogout,
  isAuthenticated = false,
  currentPage,
}) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-detect currentPage from URL if not provided
  const detectedPage =
    currentPage ||
    (() => {
      const path = location.pathname;
      // Extract page from path like /seller/messages -> messages
      const match = path.match(/\/(seller|inspector|admin)\/([^/]+)/);
      return match ? match[2] : 'dashboard';
    })();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const menuItems = {
    seller: [
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
        label: 'Dashboard',
        path: 'dashboard',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ),
        label: 'Đăng tin mới',
        path: 'create-listing',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        ),
        label: 'Quản lý tin đăng',
        path: 'manage-listings',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        ),
        label: 'Quản lý đơn hàng',
        path: 'orders',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ),
        label: 'Uy tín & Đánh giá',
        path: 'reputation',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm0 2c2.761 0 5 2.239 5 5v3H7v-3c0-2.761 2.239-5 5-5z"
            />
          </svg>
        ),
        label: 'Phí & dịch vụ',
        path: 'fees',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: 'Yêu cầu kiểm định',
        path: 'inspection',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        ),
        label: 'Tin nhắn',
        path: 'messages',
        // badge: 3,
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-2m0-4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2m-4 0h.01"
            />
          </svg>
        ),
        label: 'Ví',
        path: 'wallet',
      },
    ],
    inspector: [
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
        label: 'Dashboard',
        path: 'dashboard',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: 'Hàng đợi kiểm định',
        path: 'queue',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        ),
        label: 'Đang kiểm định',
        path: 'active',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        label: 'Báo cáo đã hoàn thành',
        path: 'reports',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        label: 'Hỗ trợ tranh chấp',
        path: 'disputes',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
        label: 'Thống kê',
        path: 'stats',
      },
    ],
    admin: [
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
        label: 'Dashboard',
        path: 'dashboard',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ),
        label: 'Quản lý người dùng',
        path: 'users',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
        label: 'Quản lý chuyên viên kiểm định',
        path: 'inspectormanagement',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        ),
        label: 'Kiểm duyệt tin đăng',
        path: 'moderation',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-2m0-4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2m-4 0h.01"
            />
          </svg>
        ),
        label: 'Ví',
        path: 'wallet',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m4 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: 'Duyệt rút tiền',
        path: 'withdrawals',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        label: 'Giải quyết tranh chấp',
        path: 'disputes',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
        label: 'Quản lý danh mục',
        path: 'categories',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
        label: 'Cài đặt hệ thống',
        path: 'settings',
      },
      {
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        label: 'Quản lý giao dịch',
        path: 'transactions',
      },
    ],
  };

  const roleNames = {
    seller: 'Người bán',
    inspector: 'Kiểm định viên',
    admin: 'Quản trị viên',
  };

  const roleConfig = {
    seller: {
      gradient: 'from-primary-800 to-gold',
      bgColor: 'bg-primary-800/10',
      textColor: 'text-primary-800',
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M9 22V12h6v10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    inspector: {
      gradient: 'from-gold to-primary-600',
      bgColor: 'bg-gold/15',
      textColor: 'text-gold',
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.2"
          />
        </svg>
      ),
    },
    admin: {
      gradient: 'from-primary-700 to-gold',
      bgColor: 'bg-primary-700/10',
      textColor: 'text-primary-700',
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  };

  const config = roleConfig[role];

  const handleNavigateItem = (path) => {
    if (onNavigate) {
      // Nếu path bắt đầu với '/', dùng path đó trực tiếp (absolute path)
      // Nếu không, construct path theo role
      const fullPath = path.startsWith('/')
        ? path
        : role === 'seller'
          ? `/seller/${path}`
          : role === 'inspector'
            ? `/inspector/${path}`
            : role === 'admin'
              ? `/admin/${path}`
              : `/${path}`;
      onNavigate(fullPath);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-warmgray-100/50 flex overflow-hidden">
      {/* Sidebar - Desktop — Dark matte */}
      <aside
        className={`hidden lg:flex flex-col bg-primary-900 transition-all duration-300 ${
          sidebarOpen ? 'w-[260px]' : 'w-20'
        }`}
      >
        {/* Logo & Toggle */}
        <div
          className={`h-[72px] border-b border-white/10 flex items-center ${
            sidebarOpen ? 'justify-between px-6' : 'justify-center px-2'
          }`}
        >
          {sidebarOpen && <div className="flex items-center gap-2"></div>}
          {!sidebarOpen && (
            <div
              className="flex flex-col items-center gap-1.5 w-full cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              title="Mở rộng sidebar"
            >
              <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-gold to-gold-light p-1.5 shadow-md">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary-900">
                  <path
                    d="M5 18c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                    fill="currentColor"
                  />
                  <path
                    d="M16 8.5l-3-1-3 1L7.8 6.3c-.2-.2-.5-.3-.8-.3-.6 0-1 .4-1 1 0 .3.1.6.3.8L8.5 10l-.5 5h2l.5-5 2.5-1 2 2v4h2v-4.5c0-.4-.2-.8-.5-1l-2-2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="text-center w-full px-1">
                <p className="text-[9px] font-semibold text-warmgray-400 break-words leading-tight">
                  {user?.fullName?.split(' ').slice(0, 2).join(' ') || 'User'}
                </p>
              </div>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-white/10 rounded-[12px] transition-colors"
              title="Thu gọn"
            >
              <svg
                className="w-5 h-5 text-warmgray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-[12px] transition-colors"
              title="Mở rộng"
            >
              <svg
                className="w-4 h-4 text-warmgray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Role Badge */}
        <div className={`${sidebarOpen ? 'px-5 py-8' : 'px-2 py-6'}`}>
          <div
            className={`${sidebarOpen ? 'p-6' : 'p-2'} rounded-[16px] bg-white/8 border border-white/10 text-white transition-all overflow-hidden`}
          >
            {sidebarOpen ? (
              <div className="text-center">
                <div className="w-11 h-11 mx-auto mb-3 text-gold">{config.icon}</div>
                <div className="text-gold font-bold text-sm">{roleNames[role]}</div>
                <div className="text-warmgray-400 text-xs mt-1 truncate px-2">
                  {user?.fullName || 'User'}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-7 h-7 mx-auto mb-1 text-gold">{config.icon}</div>
                <p className="text-[8px] font-bold leading-tight break-words text-warmgray-400">
                  {user?.fullName?.split(' ').slice(0, 2).join(' ') || 'User'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items — generous spacing */}
        <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems[role].map((item, index) => {
            const isActive = detectedPage === item.path;
            return (
              <button
                key={index}
                onClick={() => handleNavigateItem(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] transition-all group relative ${
                  isActive
                    ? 'bg-white/10 text-gold font-semibold border-l-[3px] border-gold'
                    : 'text-warmgray-400 hover:bg-white/5 hover:text-warmgray-200'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span
                  className={`transition-colors ${isActive ? 'text-gold' : 'text-warmgray-500 group-hover:text-warmgray-300'}`}
                >
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <>
                    <span className="text-sm flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 p-4">
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-[12px] transition-all ${
                sidebarOpen ? '' : 'justify-center'
              }`}
            >
              <Avatar name={user?.fullName || 'User'} size="sm" />
              {sidebarOpen && (
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-semibold text-warmgray-200 truncate">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-xs text-warmgray-500 truncate">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              )}
              {sidebarOpen && (
                <svg
                  className={`w-4 h-4 text-warmgray-500 transition-transform ${showProfile ? 'rotate-180' : ''}`}
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
              )}
            </button>

            {showProfile && sidebarOpen && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-[14px] shadow-elevated border border-white/10 overflow-hidden z-50">
                <button
                  className="w-full px-4 py-3 text-left text-sm text-warmgray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                  onClick={() => {
                    handleNavigateItem('profile');
                    setShowProfile(false);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Tài khoản
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-sm text-warmgray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                  onClick={() => {
                    handleNavigateItem('settings');
                    setShowProfile(false);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Cài đặt
                </button>
                <div className="border-t border-white/10">
                  <button
                    className="w-full px-4 py-3 text-left text-sm text-danger hover:bg-white/5 transition-colors flex items-center gap-2 font-medium"
                    onClick={() => {
                      onLogout && onLogout();
                      setShowProfile(false);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-primary-900/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-primary-900 h-full max-w-[280px] w-full shadow-elevated overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-gold to-gold-light p-1.5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary-900">
                    <path
                      d="M5 18c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      fill="currentColor"
                    />
                    <path
                      d="M16 8.5l-3-1-3 1L7.8 6.3c-.2-.2-.5-.3-.8-.3-.6 0-1 .4-1 1 0 .3.1.6.3.8L8.5 10l-.5 5h2l.5-5 2.5-1 2 2v4h2v-4.5c0-.4-.2-.8-.5-1l-2-2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h1 className="text-lg font-bold text-gold">Bicycle-MP</h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-[12px] text-warmgray-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-5">
              <div className="p-5 rounded-[16px] bg-white/8 border border-white/10 text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 text-gold">{config.icon}</div>
                <div className="text-sm font-bold text-gold">{roleNames[role]}</div>
                <div className="text-xs text-warmgray-400 mt-1 truncate px-2">
                  {user?.fullName || 'User'}
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems[role].map((item, index) => {
                  const isActive = detectedPage === item.path;
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavigateItem(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all ${
                        isActive
                          ? 'bg-white/10 text-gold border-l-[3px] border-gold font-semibold'
                          : 'text-warmgray-400 hover:bg-white/5'
                      }`}
                    >
                      <span className={isActive ? 'text-gold' : 'text-warmgray-500'}>
                        {item.icon}
                      </span>
                      <span className="text-sm flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Mobile Header Bar */}
        <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-warmgray-200/60 h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-warmgray-100/60 rounded-[12px] transition-colors"
          >
            <svg
              className="w-6 h-6 text-primary-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="text-sm font-bold text-primary-900">Bicycle-MP</span>
          <Avatar name={user?.fullName || 'User'} size="sm" />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto bg-neutral-offwhite">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
