import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🚴</span>
              <h4 className="text-xl font-bold">Bicycle-Marketplace</h4>
            </div>
            <p className="text-neutral-400">
              Chợ xe đạp uy tín. Giao dịch an toàn. Cộng đồng tin cậy.
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Về chúng tôi</h5>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Hỗ trợ</h5>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Liên hệ</h5>
            <ul className="space-y-2 text-neutral-400">
              <li>📧 support@routin.vn</li>
              <li>📱 1900-xxxx</li>
              <li>🌐 www.routin.vn</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; 2026 Bicycle-Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
