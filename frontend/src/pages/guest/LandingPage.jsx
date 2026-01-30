import React, { useEffect, useState } from 'react';
import { Button, Card, Badge, Rating, Input, Select } from '../../components/ui';
import { Header, Footer } from '../../components/common';

const LandingPage = ({
  onNavigate,
  isAuthenticated = false,
  role = null,
  user = null,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchFilters, setSearchFilters] = useState({ location: '', category: '' });

  const heroSlides = [
    {
      title: 'Tìm xe đạp chất lượng với giá tốt',
      subtitle: 'Hơn 2.500 tin đăng uy tín, kiểm định minh bạch, giao dịch an toàn.',
      image: '/marketplace_hero_banner_1768417779045.png',
      accent: 'Giao dịch an toàn',
    },
    {
      title: 'Đăng tin bán xe trong 60 giây',
      subtitle: 'Giao diện tối ưu cho người bán, hỗ trợ kiểm định và quản lý đơn hàng.',
      image: '/road_bike_hero_1768417748558.png',
      accent: 'Đăng tin miễn phí',
    },
    {
      title: 'Mua xe đã kiểm định, hoàn tiền nếu không đúng mô tả',
      subtitle: 'Đội ngũ kiểm định viên chuyên nghiệp, quy trình ký quỹ minh bạch.',
      image: '/mountain_bike_hero_1768417732962.png',
      accent: 'Kiểm định chuyên nghiệp',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5200);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const categories = [
    {
      name: 'Xe Đạp Địa Hình',
      icon: '⛰️',
      count: 245,
      color: 'from-themeSecondary to-themePrimary',
    },
    { name: 'Xe Đạp Đường Trường', icon: '🚴‍♂️', count: 189, color: 'from-indigo-500 to-sky-500' },
    { name: 'Xe Đạp Hybrid', icon: '🛣️', count: 156, color: 'from-emerald-500 to-teal-500' },
    { name: 'Xe Đạp BMX', icon: '🏆', count: 78, color: 'from-amber-500 to-orange-500' },
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
    { label: 'Người dùng', value: '10,000+', icon: '👥' },
    { label: 'Xe đang bán', value: '2,500+', icon: '🚲' },
    { label: 'Giao dịch thành công', value: '8,000+', icon: '✅' },
    { label: 'Đánh giá 5 sao', value: '95%', icon: '⭐' },
  ];

  const searchSuggestions = ['Trek Domane size M', 'Giant TCR dưới 20 triệu', 'Hybrid daily ride'];

  const trustPoints = [
    {
      title: 'Kiểm định chuyên sâu',
      desc: 'Báo cáo 18 hạng mục khung, phanh, truyền động và bánh.',
      pill: 'Bởi chuyên gia',
      icon: '🛠️',
    },
    {
      title: 'Ký quỹ an toàn',
      desc: 'Giữ tiền đến khi xác nhận xe đúng mô tả; hoàn tiền nếu sai.',
      pill: 'Escrow',
      icon: '🛡️',
    },
    {
      title: 'Vận chuyển & bảo hiểm',
      desc: 'Giao nhận có bảo hiểm, cập nhật trạng thái theo thời gian thực.',
      pill: 'Shipping+',
      icon: '📦',
    },
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
      <Header
        isAuthenticated={isAuthenticated}
        role={role}
        currentPage="landing"
        onNavigate={onNavigate}
        userName={user?.fullName}
        userEmail={user?.email}
        onLogout={onLogout}
      />

      {/* Hero Section */}
      <section className="relative bg-themeBlackAlt text-white">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(0,19,36,0.95) 10%, rgba(24,73,169,0.8) 55%, rgba(99,102,241,0.45) 90%), url(${heroSlides[activeSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-themePrimary/30" />

        <div className="container-custom relative pt-16 lg:pt-20 pb-36 lg:pb-44">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 max-w-2xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
                <span className="size-2 rounded-full bg-themeGreenLight animate-pulse" />
                <span className="text-sm font-semibold text-themePrimaryLighter uppercase tracking-wide">
                  {heroSlides[activeSlide].accent}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
                {heroSlides[activeSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                {heroSlides[activeSlide].subtitle}
              </p>

              <div className="flex flex-wrap gap-3">
                {['Kiểm định chuyên nghiệp', 'Ký quỹ an toàn', 'Giao dịch 24/7'].map((chip) => (
                  <span
                    key={chip}
                    className="px-3 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-medium text-white/90"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  className="h-12 md:h-14 px-6 md:px-8 shadow-frontShadow"
                  onClick={handleSearch}
                >
                  Khám phá marketplace
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Chuyển tới slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative lg:justify-self-end w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-frontShadow ring-1 ring-white/15 backdrop-blur card-surface">
                <img
                  src={heroSlides[activeSlide].image}
                  alt="Bicycle Marketplace"
                  className="w-full h-full object-cover max-h-[420px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-xl p-4 text-neutral-900 shadow-lg backdrop-blur">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-full bg-themePrimary/10 text-themePrimary flex items-center justify-center font-semibold">
                        24h
                      </span>
                      <div>
                        <p className="text-sm text-neutral-500">Báo cáo kiểm định</p>
                        <p className="font-semibold">Trong 24h bởi chuyên gia</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                        Escrow
                      </span>
                      <div>
                        <p className="text-sm text-neutral-500">Ký quỹ an toàn</p>
                        <p className="font-semibold">Hoàn tiền nếu sai mô tả</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section pt-28 md:pt-32">
        <div className="container-custom">
          <div className="flex flex-col gap-3 mb-10 text-center">
            <p className="text-sm font-semibold text-themePrimary/80">Khám phá nhanh</p>
            <h3 className="text-3xl font-bold">Danh Mục Xe Đạp</h3>
            <p className="text-neutral-600">
              Lọc theo nhu cầu: địa hình, đường trường, hybrid, BMX
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card
                key={index}
                hover
                className="p-6 text-center cursor-pointer group card-surface"
                onClick={handleSearch}
              >
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-3xl transform group-hover:scale-110 transition-transform text-white shadow-[0_18px_36px_-18px_rgba(0,0,0,0.4)]`}
                >
                  {category.icon}
                </div>
                <h4 className="font-semibold text-lg mb-1">{category.name}</h4>
                <p className="text-neutral-600">{category.count} xe</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="section pt-12 pb-8">
        <div className="container-custom">
          <div className="flex flex-col gap-2 mb-8 text-center">
            <p className="text-sm font-semibold text-themePrimary/80">An tâm giao dịch</p>
            <h3 className="text-3xl font-bold">Minh bạch - An toàn - Nhanh chóng</h3>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Từ kiểm định đến ký quỹ và vận chuyển, mọi bước đều có lớp bảo vệ rõ ràng.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {trustPoints.map((item) => (
              <Card key={item.title} className="card-surface p-6 h-full flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-xl bg-themePrimary/10 text-themePrimary flex items-center justify-center text-xl">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-themePrimary font-semibold">
                      {item.pill}
                    </p>
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                  </div>
                </div>
                <p className="text-neutral-600 leading-relaxed flex-1">{item.desc}</p>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-themePrimary"></span>
                  <span>Theo dõi tiến trình thời gian thực</span>
                </div>
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
            {[
              {
                step: '1',
                title: 'Đăng ký & Tìm kiếm',
                desc: 'Tạo tài khoản, lọc theo loại xe, giá, kích thước khung.',
              },
              {
                step: '2',
                title: 'Kiểm định & Đặt cọc',
                desc: 'Xe được kiểm định; đặt cọc qua ký quỹ an toàn, phí cấu hình linh hoạt.',
              },
              {
                step: '3',
                title: 'Nhận xe & Đánh giá',
                desc: 'Xác nhận nhận xe đúng báo cáo kiểm định, giải ngân cho người bán và đánh giá uy tín.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center card-surface p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-themePrimary/10 text-themePrimary flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h4 className="font-semibold text-xl mb-3">{item.title}</h4>
                <p className="text-neutral-600">{item.desc}</p>
              </div>
            ))}
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
                className="overflow-hidden cursor-pointer hover-lift card-surface"
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
                  <h4 className="font-semibold text-lg mb-2 line-clamp-2">{bike.name}</h4>
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
      <Footer />
    </div>
  );
};

export default LandingPage;
