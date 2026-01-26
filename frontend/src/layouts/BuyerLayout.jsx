import React from 'react';
import { Header } from '../components/common';

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
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚴</span>
                <h4 className="text-lg font-bold">ROUTIN</h4>
              </div>
              <p className="text-sm text-neutral-600">Chợ xe đạp uy tín. Giao dịch an toàn.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-sm">Về chúng tôi</h5>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <a href="#" className="hover:text-neutral-900">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-neutral-900">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3 text-sm">Hỗ trợ</h5>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <a href="#" className="hover:text-neutral-900">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-neutral-900">
                    Chính sách
                  </a>
                </li>
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
