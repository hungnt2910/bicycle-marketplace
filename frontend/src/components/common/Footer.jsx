import React from 'react';

const Footer = () => {
  return (
    <footer
      className="bg-primary-900 text-white"
      style={{ backgroundColor: '#1a2e1a', color: '#fff' }}
    >
      {/* Main footer content */}
      <div className="container-custom py-20 lg:py-24">
        <div className="grid md:grid-cols-3 gap-14 lg:gap-20">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl"></span>
              <h4
                className="text-xl font-bold font-display text-white tracking-wide"
                style={{ color: '#d4af37' }}
              >
                Bicycle-Marketplace
              </h4>
            </div>
            <p className="text-warmgray-400 leading-relaxed text-[15px] max-w-sm">
              Chợ xe đạp uy tín. Giao dịch an toàn với hệ thống ký quỹ. Cộng đồng tin cậy.
            </p>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 gap-10 md:col-span-2 lg:gap-20">
            <div>
              <h5
                className="font-semibold mb-8 font-display tracking-wide text-sm uppercase"
                style={{ color: '#d4af37' }}
              >
                Về chúng tôi
              </h5>
              <ul className="space-y-5 text-warmgray-400">
                <li>
                  <a href="#" className="hover:text-primary transition-colors text-[15px]">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors text-[15px]">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors text-[15px]">
                    Tuyển dụng
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5
                className="font-semibold mb-8 font-display tracking-wide text-sm uppercase"
                style={{ color: '#d4af37' }}
              >
                Hỗ trợ
              </h5>
              <ul className="space-y-5 text-warmgray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors text-[15px]">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors text-[15px]">
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors text-[15px]">
                    Điều khoản sử dụng
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-warmgray-500 text-sm">
            &copy; 2026 Bicycle-Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-warmgray-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              support@Bicycle-Marketplace.vn
            </a>
            <a href="#" className="hover:text-white transition-colors">
              19796886
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
