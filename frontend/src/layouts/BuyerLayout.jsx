import React, { useState } from 'react';
import { Avatar, Badge, Button } from '../components/ui';

const BuyerLayout = ({ children, currentPage = 'home', onNavigate }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const notifications = [
        { id: 1, type: 'message', text: 'Bạn có tin nhắn mới từ người bán', time: '5 phút trước' },
        { id: 2, type: 'order', text: 'Đơn hàng #1234 đã được giao', time: '1 giờ trước' },
        { id: 3, type: 'price', text: 'Xe bạn yêu thích giảm giá 10%', time: '2 giờ trước' },
    ];

    const handleHomeClick = () => {
        if (onNavigate) {
            onNavigate('landing');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <button onClick={handleHomeClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <span className="text-2xl md:text-3xl">🚴</span>
                            <h1 className="text-lg md:text-2xl font-bold gradient-text hidden sm:block">Bicycle-Marketplace</h1>
                            <h1 className="text-lg font-bold gradient-text sm:hidden">BCM</h1>
                        </button>

                        {/* Search Bar - Hidden on mobile */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm xe đạp..."
                                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">🔍</span>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Wishlist */}
                            <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                                <span className="text-xl md:text-2xl">❤️</span>
                                <span className="notification-badge">3</span>
                            </button>

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
                                                <div key={notif.id} className="dropdown-item border-b border-neutral-100 last:border-0">
                                                    <p className="text-sm font-medium text-neutral-900">{notif.text}</p>
                                                    <p className="text-xs text-neutral-500 mt-1">{notif.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-4 py-3 border-t border-neutral-200 text-center">
                                            <a href="#" className="text-sm text-primary-600 hover:underline">Xem tất cả</a>
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
                                    <Avatar name="Nguyễn Văn A" size="sm" />
                                    <span className="text-sm font-medium hidden md:inline">Nguyễn Văn A</span>
                                    <span className="text-neutral-600">▼</span>
                                </button>

                                {showProfile && (
                                    <div className="dropdown right-0">
                                        <div className="dropdown-item">
                                            <span className="mr-2"></span>
                                            Tài khoản của tôi
                                        </div>
                                        <div className="dropdown-item">
                                            <span className="mr-2"></span>
                                            Đơn hàng của tôi
                                        </div>
                                        <div className="dropdown-item">
                                            <span className="mr-2"></span>
                                            Cài đặt
                                        </div>
                                        <div className="border-t border-neutral-200 my-1"></div>
                                        <div className="dropdown-item text-danger-600">
                                            <span className="mr-2"></span>
                                            Đăng xuất
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="md:hidden pb-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">🔍</span>
                        </div>
                    </div>

                    {/* Secondary Navigation - Desktop */}
                    <div className="hidden md:block border-t border-neutral-200">
                        <div className="flex gap-6 py-3 overflow-x-auto">
                            <a href="#" className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'home' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}>
                                Trang chủ
                            </a>
                            <a href="#" className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'search' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}>
                                Tìm kiếm nâng cao
                            </a>
                            <a href="#" className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'wishlist' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}>
                                Yêu thích
                            </a>
                            <a href="#" className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'orders' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}>
                                Đơn hàng
                            </a>
                            <a href="#" className={`text-sm font-medium transition-colors whitespace-nowrap ${currentPage === 'dashboard' ? 'text-primary-600' : 'text-neutral-700 hover:text-neutral-900'}`}>
                                Dashboard
                            </a>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-neutral-200 py-2">
                            <a href="#" className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Trang chủ
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Tìm kiếm nâng cao
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Yêu thích
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Đơn hàng
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Tin nhắn
                            </a>
                            <a href="#" className="block px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                                Dashboard
                            </a>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-180px)]">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-neutral-200 mt-12">
                <div className="container-custom py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🚴</span>
                                <h4 className="text-lg font-bold">ROUTIN</h4>
                            </div>
                            <p className="text-sm text-neutral-600">
                                Chợ xe đạp uy tín. Giao dịch an toàn.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-3 text-sm">Về chúng tôi</h5>
                            <ul className="space-y-2 text-sm text-neutral-600">
                                <li><a href="#" className="hover:text-neutral-900">Giới thiệu</a></li>
                                <li><a href="#" className="hover:text-neutral-900">Liên hệ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-3 text-sm">Hỗ trợ</h5>
                            <ul className="space-y-2 text-sm text-neutral-600">
                                <li><a href="#" className="hover:text-neutral-900">Trung tâm trợ giúp</a></li>
                                <li><a href="#" className="hover:text-neutral-900">Chính sách</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-3 text-sm">Liên hệ</h5>
                            <ul className="space-y-2 text-sm text-neutral-600">
                                <li> support@routin.vn</li>
                                <li> 1900-xxxx</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-neutral-200 mt-6 pt-6 text-center text-sm text-neutral-500">
                        <p>&copy; 2024 ROUTIN. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BuyerLayout;
