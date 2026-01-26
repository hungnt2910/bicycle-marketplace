import React, { useState } from 'react';
import { Button, Card, Badge, Rating, Input } from '../../components/ui';
import { Header } from '../../components/common';

const LandingPage = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Xe Đạp Địa Hình', icon: '', count: 245, color: 'from-green-500 to-emerald-600' },
    { name: 'Xe Đạp Đường Trường', icon: '', count: 189, color: 'from-red-500 to-rose-600' },
    { name: 'Xe Đạp Hybrid', icon: '', count: 156, color: 'from-blue-500 to-cyan-600' },
    { name: 'Xe Đạp BMX', icon: '', count: 78, color: 'from-purple-500 to-pink-600' },
  ];

  const featuredBikes = [
    {
      id: 1,
      name: 'Giant Talon 3 2024',
      price: 12500000,
      oldPrice: 15000000,
      image: '/mountain_bike_hero_1768417732962.png',
      condition: 'Like New',
      verified: true,
      rating: 4.8,
      reviews: 24,
      seller: 'Nguyễn Văn A',
    },
    {
      id: 2,
      name: 'Trek Domane AL 2',
      price: 18900000,
      image: '/road_bike_hero_1768417748558.png',
      condition: 'Excellent',
      verified: true,
      rating: 4.9,
      reviews: 18,
      seller: 'Trần Thị B',
    },
    {
      id: 3,
      name: 'Specialized Sirrus X 3.0',
      price: 16200000,
      image: '/hybrid_bike_hero_1768417761473.png',
      condition: 'Good',
      verified: false,
      rating: 4.6,
      reviews: 12,
      seller: 'Lê Văn C',
    },
  ];

  const stats = [
    { label: 'Người dùng', value: '10,000+', icon: ' ' },
    { label: 'Xe đang bán', value: '2,500+', icon: ' ' },
    { label: 'Giao dịch thành công', value: '8,000+', icon: ' ' },
    { label: 'Đánh giá 5 sao', value: '95%', icon: ' ' },
  ];

  const handleSearch = () => {
    if (onNavigate) {
      onNavigate('marketplace');
    }
  };

  const handleProductClick = (bikeId) => {
    if (onNavigate) {
      onNavigate('product-detail', bikeId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Navigation */}
      <Header isAuthenticated={false} onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                Chợ Xe Đạp <span className="gradient-text">Uy Tín</span>
                <br />
                Giao Dịch <span className="gradient-text">An Toàn</span>
              </h2>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Nền tảng mua bán xe đạp thể thao chuyên nghiệp với hệ thống kiểm định, ký quỹ an
                toàn và cộng đồng tin cậy.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Tìm kiếm xe đạp (Giant, Trek, Specialized...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 md:h-14 text-base md:text-lg"
                  />
                </div>
                <Button
                  variant="primary"
                  className="h-12 md:h-14 px-6 md:px-8"
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl"></span>
                  <span className="text-sm font-medium text-neutral-700">
                    Kiểm định chuyên nghiệp
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl"></span>
                  <span className="text-sm font-medium text-neutral-700">Ký quỹ an toàn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl"></span>
                  <span className="text-sm font-medium text-neutral-700">Đánh giá minh bạch</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <img
                src="/marketplace_hero_banner_1768417779045.png"
                alt="Bicycle Marketplace"
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white animate-scale-in">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-custom">
          <h3 className="text-3xl font-bold text-center mb-12">Danh Mục Xe Đạp</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card
                key={index}
                hover
                className="p-6 text-center cursor-pointer group"
                onClick={handleSearch}
              >
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform`}
                >
                  {category.icon}
                </div>
                <h4 className="font-semibold text-lg mb-2">{category.name}</h4>
                <p className="text-neutral-600">{category.count} xe</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section bg-neutral-100">
        <div className="container-custom">
          <h3 className="text-3xl font-bold text-center mb-4">Cách Hoạt Động</h3>
          <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
            Quy trình đơn giản, minh bạch để mua bán xe đạp an toàn
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-xl mb-3">Đăng ký & Tìm kiếm</h4>
              <p className="text-neutral-600">
                Tạo tài khoản miễn phí và tìm kiếm xe đạp phù hợp với nhu cầu của bạn
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-xl mb-3">Kiểm định & Đặt cọc</h4>
              <p className="text-neutral-600">
                Xe được kiểm định chuyên nghiệp. Đặt cọc an toàn qua hệ thống ký quỹ
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-100 text-success-600 flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-xl mb-3">Nhận xe & Đánh giá</h4>
              <p className="text-neutral-600">
                Nhận xe, xác nhận chất lượng. Tiền được chuyển cho người bán sau khi hoàn tất
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bikes */}
      <section className="section">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold">Xe Đạp Nổi Bật</h3>
            <Button variant="outline" onClick={handleSearch}>
              Xem tất cả →
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBikes.map((bike) => (
              <Card
                key={bike.id}
                variant="product"
                className="overflow-hidden cursor-pointer hover-lift"
                onClick={() => handleProductClick(bike.id)}
              >
                <div className="relative aspect-product bg-neutral-100">
                  <img src={bike.image} alt={bike.name} className="w-full h-full object-cover" />
                  {bike.verified && (
                    <Badge variant="verified" className="absolute top-3 right-3">
                      ✓ Đã kiểm định
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-lg mb-2">{bike.name}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <Rating value={bike.rating} size="sm" readonly />
                    <span className="text-sm text-neutral-600">({bike.reviews})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="price">{bike.price.toLocaleString('vi-VN')} ₫</span>
                    {bike.oldPrice && (
                      <span className="price-old">{bike.oldPrice.toLocaleString('vi-VN')} ₫</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="success">{bike.condition}</Badge>
                    <span className="text-sm text-neutral-600">Bởi {bike.seller}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom text-center">
          <h3 className="text-4xl font-bold mb-4">Sẵn sàng bắt đầu?</h3>
          <p className="text-xl mb-8 opacity-90">
            Tham gia cộng đồng mua bán xe đạp uy tín nhất Việt Nam
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-neutral-100"
              onClick={() => onNavigate && onNavigate('register')}
            >
              Đăng ký ngay
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
              onClick={handleSearch}
            >
              Khám phá marketplace
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                  <a href="#" className="hover:text-white">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Tuyển dụng
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Hỗ trợ</h5>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
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
            <p>&copy; 2026 Bicycle-MarketPlace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
