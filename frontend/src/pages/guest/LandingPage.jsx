import React, { useEffect, useState, useRef } from 'react';
import { Button, Card, Badge, Rating, Input, Select } from '../../components/ui';
import { Header, Footer } from '../../components/common';
import bicycleApi from '../../api/postNewsApi';
import BicycleFolder from '../../component/BicycleFolder';
/* ─── Clockwise Orbiting Bicycles ─── */
const OrbitingBicycles = ({ bikes, onBikeClick }) => {
  const orbitRef = useRef(null);
  const animationRef = useRef(null);
  const angleRef = useRef(0);
  const [hoveredId, setHoveredId] = useState(null);

  // Elliptical orbit parameters
  const RX = 420; // horizontal radius
  const RY = 100; // vertical radius (tilt)
  const RZ = 200; // depth radius for 3D effect

  useEffect(() => {
    let last = performance.now();
    const speed = 0.25; // degrees per normalised frame (clockwise)

    const tick = (now) => {
      const dt = (now - last) / 16.67;
      last = now;
      if (!hoveredId) angleRef.current += speed * dt;

      const items = orbitRef.current?.children;
      if (!items) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      const count = bikes.length;
      for (let i = 0; i < count; i++) {
        const el = items[i];
        if (!el) continue;
        // Each item offset evenly around the circle, moving clockwise
        const theta = ((angleRef.current + (360 / count) * i) * Math.PI) / 180;
        const x = Math.cos(theta) * RX;
        const y = Math.sin(theta) * RY;
        const z = Math.sin(theta) * RZ;

        // Scale & opacity based on depth (items in front are bigger)
        const depthNorm = (Math.sin(theta) + 1) / 2; // 0 = far, 1 = near
        const scale = 0.6 + depthNorm * 0.5;
        const opacity = 0.45 + depthNorm * 0.55;

        el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
        el.style.opacity = opacity;
        el.style.zIndex = Math.round(depthNorm * 100);
      }
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, [bikes.length, hoveredId, RX, RY, RZ]);

  if (!bikes.length) {
    return (
      <div className="orbit-track flex items-center justify-center">
        <div className="text-white/40 text-center">
          <div className="text-5xl mb-3">🚲</div>
          <p className="text-sm">Đang tải xe nổi bật...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orbit-wrapper">
      {/* Elliptical glow ring */}
      <div className="orbit-ring" />
      <div ref={orbitRef} className="orbit-track">
        {bikes.map((bike) => (
          <div
            key={bike.id}
            className="orbit-item"
            onMouseEnter={() => setHoveredId(bike.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={(e) => {
              e.stopPropagation();
              onBikeClick(bike.id);
            }}
          >
            <div
              className={`orbit-item-inner ${hoveredId === bike.id ? 'orbit-item-hovered' : ''}`}
            >
              <img src={bike.image} alt={bike.name} loading="lazy" />
            </div>
            <span className="orbit-item-label">
              {bike.name?.length > 22 ? bike.name.slice(0, 22) + '…' : bike.name}
              {bike.price ? ` · ${bike.price.toLocaleString('vi-VN')}₫` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
      color: 'from-themeSecondary to-primary-800',
    },
    { name: 'Xe Đạp Đường Trường', icon: '🚴‍♂️', count: 189, color: 'from-indigo-500 to-sky-500' },
    { name: 'Xe Đạp Hybrid', icon: '🛣️', count: 156, color: 'from-emerald-500 to-teal-500' },
    { name: 'Xe Đạp BMX', icon: '🏆', count: 78, color: 'from-amber-500 to-orange-500' },
  ];

  const [featuredBikes, setFeaturedBikes] = useState([]);
  const conditionLabelMap = {
    new: 'Mới 100%',
    'like-new': 'Như mới',
    good: 'Tốt',
    fair: 'Khá',
    poor: 'Cần sửa chữa',
  };

  const getSellerName = (bike) => {
    const sellerFromId = bike?.sellerId;
    const nameFromSellerId = sellerFromId
      ? `${sellerFromId.firstName || ''} ${sellerFromId.lastName || ''}`.trim()
      : '';
    const profile = bike?.seller?.profile || bike?.sellerProfile || bike?.profile;
    const fromProfile = profile
      ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      : '';
    return (
      nameFromSellerId ||
      fromProfile ||
      bike?.seller?.fullName ||
      bike?.sellerName ||
      user?.fullName ||
      'Người bán'
    );
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await bicycleApi.getAllBicycles();
        const apiData = response?.data?.data || response?.data || [];
        const mapped = apiData
          .filter((bike) => bike?.status === 'active')
          .slice(0, 30)
          .map((bike) => ({
            id: bike?._id || bike?.id,
            name: bike?.title || 'Không có tiêu đề',
            price: bike?.price || 0,
            oldPrice: bike?.oldPrice,
            image:
              bike?.media?.mainImage ||
              bike?.media?.images?.[0] ||
              '/mountain_bike_hero_1768417732962.png',
            condition: conditionLabelMap[bike?.condition?.overall] || 'Chưa xác định',
            verified: !!bike?.inspection?.isInspected,
            rating: bike?.rating || 0,
            reviews: bike?.reviewsCount || 0,
            seller: getSellerName(bike),
            type: bike?.specifications?.type || 'other',
          }));

        setFeaturedBikes(mapped);
      } catch (error) {
        console.error('Error fetching featured bikes:', error);
        setFeaturedBikes([]);
      }
    };

    fetchFeatured();
  }, []);

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

  const mainCategory = categories[0];
  const secondaryCategories = categories.slice(1, 3);
  const remainingCategories = categories.slice(3);

  const primaryBike = featuredBikes[0];
  const leftBikes = featuredBikes.slice(0, 2);
  const rightBikes = featuredBikes.slice(2, 5);

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
    <div className="min-h-screen bg-gradient-to-b from-neutral-offwhite to-white">
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

      {/* 1️⃣ FULL SCREEN HERO EXPERIENCE */}
      <section className="relative min-h-[100vh] bg-primary-900 text-white">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(5,46,43,0.97) 0%, rgba(5,150,105,0.6) 50%, rgba(198,167,94,0.15) 100%), url(${heroSlides[activeSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />

        <div className="container-custom relative flex flex-col min-h-[100vh]">
          {/* Top: Centered hero text */}
          <div className="flex-1 flex items-center justify-center pt-20 lg:pt-28 pb-8">
            <div className="text-center max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
                <span className="size-2 rounded-full bg-themeGreenLight animate-pulse" />
                <span className="text-sm font-semibold text-primary-800Lighter uppercase tracking-wide">
                  {heroSlides[activeSlide].accent}
                </span>
              </div>

              <div className="space-y-5">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-soft">
                  {heroSlides[activeSlide].title}
                </h1>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                  {heroSlides[activeSlide].subtitle}
                </p>
                <p className="text-sm text-white/70">
                  Giao dịch minh bạch, kiểm định rõ ràng, hỗ trợ bởi đội ngũ chuyên gia xe đạp.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="primary"
                  className="h-12 md:h-14 px-8 md:px-10 text-base md:text-lg shadow-frontShadow"
                  onClick={handleSearch}
                >
                  Khám phá marketplace
                </Button>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('register')}
                  className="text-sm font-semibold text-white/80 hover:text-white underline-offset-4 hover:underline"
                >
                  Đăng ký người bán →
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeSlide
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/50 hover:bg-white/90 backdrop-blur-md'
                    }`}
                    aria-label={`Chuyển tới slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================== Category Folders with Bike Images ========================================================= */}

      {(() => {
        // Group bikes by type into 3 categories
        const categoryMap = {
          mountain: { name: 'Xe Đạp Địa Hình', icon: '⛰️', color: '#059669' },
          road: { name: 'Xe Đạp Đường Trường', icon: '🚴‍♂️', color: '#3B82F6' },
          hybrid: { name: 'Xe Đạp Hybrid', icon: '🛣️', color: '#8B5CF6' },
        };
        const groupedBikes = {};
        featuredBikes.forEach((bike) => {
          const type = bike.type || 'other';
          if (!groupedBikes[type]) groupedBikes[type] = [];
          groupedBikes[type].push(bike);
        });

        // Pick top 3 categories that have bikes, fallback to first 3 groups
        const categoryKeys = Object.keys(categoryMap).filter(
          (k) => groupedBikes[k] && groupedBikes[k].length > 0
        );
        // If not enough typed categories, fill with 'other' groups
        if (categoryKeys.length < 3) {
          Object.keys(groupedBikes).forEach((k) => {
            if (!categoryKeys.includes(k) && categoryKeys.length < 3) {
              categoryKeys.push(k);
            }
          });
        }
        // If still not enough bikes, split all bikes into 3 chunks
        let folderData;
        if (categoryKeys.length === 0 && featuredBikes.length > 0) {
          const chunkSize = Math.ceil(featuredBikes.length / 3);
          folderData = [
            { ...categoryMap.mountain, bikes: featuredBikes.slice(0, chunkSize) },
            { ...categoryMap.road, bikes: featuredBikes.slice(chunkSize, chunkSize * 2) },
            { ...categoryMap.hybrid, bikes: featuredBikes.slice(chunkSize * 2) },
          ];
        } else {
          folderData = categoryKeys.slice(0, 3).map((key) => {
            let bikes = [...(groupedBikes[key] || [])];
            // If this category has fewer than 5 bikes, fill from other categories
            if (bikes.length < 5) {
              const usedIds = new Set(bikes.map((b) => b.id));
              for (const otherKey of Object.keys(groupedBikes)) {
                if (bikes.length >= 5) break;
                if (otherKey === key) continue;
                for (const b of groupedBikes[otherKey]) {
                  if (bikes.length >= 5) break;
                  if (!usedIds.has(b.id)) {
                    bikes.push(b);
                    usedIds.add(b.id);
                  }
                }
              }
            }
            return {
              name: categoryMap[key]?.name || key.charAt(0).toUpperCase() + key.slice(1),
              icon: categoryMap[key]?.icon || '🚲',
              color: categoryMap[key]?.color || '#059669',
              bikes,
            };
          });
        }

        if (featuredBikes.length === 0) return null;

        return (
          <section className="section">
            <div className="container-custom">
              <div className="text-center mb-12">
                <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3">
                  Bộ sưu tập theo danh mục
                </p>
                <h3 className="text-3xl md:text-4xl font-bold font-display">
                  Khám phá xe theo loại
                </h3>
                <p className="text-warmgray-500 mt-2 max-w-lg mx-auto">
                  Bấm vào xe đạp để xem các xe trong danh mục, bấm vào hình xe để xem chi tiết.
                </p>
              </div>

              <div
                style={{
                  marginTop: '150px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: '250px',
                  flexWrap: 'wrap',
                  minHeight: '380px',
                  padding: '40px 0 60px',
                }}
              >
                {folderData.map((cat) => (
                  <div
                    key={cat.name}
                    style={{
                      textAlign: 'center',
                      width: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <BicycleFolder
                      size={2}
                      color={cat.color}
                      className="custom-bicycle"
                      items={cat.bikes.slice(0, 5).map((bike) => (
                        <div
                          key={bike.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(bike.id);
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                          title={`${bike.name} - ${bike.price.toLocaleString('vi-VN')}₫`}
                        >
                          <img
                            src={bike.image}
                            alt={bike.name}
                            style={{
                              width: '100%',
                              height: '70%',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              pointerEvents: 'none',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '7px',
                              fontWeight: 600,
                              marginTop: '2px',
                              color: '#333',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                              lineHeight: 1.2,
                            }}
                          >
                            {bike.name?.length > 12 ? bike.name.slice(0, 12) + '…' : bike.name}
                          </span>
                          <span
                            style={{
                              fontSize: '6px',
                              color: '#059669',
                              fontWeight: 700,
                            }}
                          >
                            {bike.price.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      ))}
                    />
                    <p
                      style={{
                        marginTop: '100px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1c1917',
                      }}
                    >
                      {cat.icon} {cat.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#78716c' }}>
                      {cat.bikes.length} xe đang bán
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}
      {/* ==================================== End Category Folders ========================================================= */}

      {/* =========================== Orbit ==================================================== */}
      {/* Bottom: Clockwise Orbiting Bicycles */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-display">
          Bộ sưu tập được yêu thích nhất
        </h2>
        <p className="text-warmgray-500 mt-2 max-w-lg mx-auto">
          Bấm vào xe đạp để xem các xe trong danh mục, bấm vào hình xe để xem chi tiết.
        </p>
      </div>
      <div className="pb-10 lg:pb-16">
        <OrbitingBicycles bikes={featuredBikes} onBikeClick={handleProductClick} />
      </div>

      {/* ===========================ENd Orbit ==================================================== */}

      {/* 2️⃣ FEATURED COLLECTION – CURATED */}
      <section className="section">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-14">
            <div className="space-y-3 max-w-2xl">
              <p className="text-sm font-semibold text-gold uppercase tracking-widest">
                Bộ sưu tập nổi bật
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-display">
                Những chiếc xe được chọn lọc kỹ
              </h2>
              <p className="text-warmgray-500">
                Danh sách những tin đăng nổi bật, được kiểm định và yêu thích bởi cộng đồng
                Bicycle-Marketplace.
              </p>
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Xem tất cả →
            </Button>
          </div>

          {featuredBikes.length === 0 ? (
            <p className="text-warmgray-500">Chưa có xe nổi bật. Hãy quay lại sau.</p>
          ) : (
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Left: 2 vertical cards (image on top, details below) */}
              <div className="lg:col-span-2 space-y-6">
                {leftBikes.map((bike) => (
                  <Card
                    key={bike.id}
                    variant="product"
                    className="overflow-hidden cursor-pointer hover-lift card-surface"
                    onClick={() => handleProductClick(bike.id)}
                  >
                    <div className="relative aspect-[4/3] bg-warmgray-100">
                      <img
                        src={bike.image}
                        alt={bike.name}
                        className="w-full h-full object-cover"
                      />
                      {bike.verified && (
                        <Badge variant="verified" className="absolute top-3 right-3">
                          ✓ Đã kiểm định
                        </Badge>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-semibold text-lg mb-2 line-clamp-2">{bike.name}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Rating value={bike.rating} size="sm" readonly />
                        <span className="text-sm text-warmgray-600">({bike.reviews})</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="price">{bike.price.toLocaleString('vi-VN')} ₫</span>
                        {bike.oldPrice && (
                          <span className="price-old">
                            {bike.oldPrice.toLocaleString('vi-VN')} ₫
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="success">{bike.condition}</Badge>
                        <span className="text-sm text-warmgray-600">Bởi {bike.seller}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Right: 3 horizontal rectangular cards */}
              <div className="lg:col-span-3 space-y-6">
                {rightBikes.map((bike) => (
                  <Card
                    key={bike.id}
                    variant="product"
                    className="overflow-hidden cursor-pointer hover-lift card-surface flex flex-row"
                    onClick={() => handleProductClick(bike.id)}
                  >
                    <div className="relative w-2/5 min-h-[160px] bg-warmgray-100">
                      <img
                        src={bike.image}
                        alt={bike.name}
                        className="w-full h-full object-cover"
                      />
                      {bike.verified && (
                        <Badge variant="verified" className="absolute top-3 right-3">
                          ✓ Đã kiểm định
                        </Badge>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg md:text-xl mb-2 line-clamp-2">
                          {bike.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Rating value={bike.rating} size="sm" readonly />
                          <span className="text-sm text-warmgray-600">({bike.reviews})</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="price">{bike.price.toLocaleString('vi-VN')} ₫</span>
                          {bike.oldPrice && (
                            <span className="price-old">
                              {bike.oldPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="success">{bike.condition}</Badge>
                        <span className="text-sm text-warmgray-600">Bởi {bike.seller}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3️⃣ CATEGORY SHOWCASE – EDITORIAL BLOCKS */}
      <section className="section">
        <div className="container-custom">
          <div className="flex flex-col gap-4 mb-14 text-center">
            <p className="text-sm font-semibold text-gold uppercase tracking-widest">
              Khám phá nhanh
            </p>
            <h3 className="text-3xl md:text-4xl font-bold">Danh Mục Xe Đạp</h3>
            <p className="text-warmgray-500 max-w-lg mx-auto">
              Khám phá các bộ sưu tập xe đạp theo phong cách đạp, địa hình và mục đích sử dụng.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 auto-rows-[220px]">
            {/* Wide hero category */}
            {mainCategory && (
              <button
                type="button"
                onClick={handleSearch}
                className="relative md:col-span-2 row-span-2 overflow-hidden rounded-[24px] group text-left bg-warmgray-900/5"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${mainCategory.color} opacity-90`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
                <div className="relative p-8 lg:p-10 h-full flex flex-col justify-between text-white">
                  <div className="space-y-4">
                    <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-2xl">
                      {mainCategory.icon}
                    </span>
                    <div className="space-y-2">
                      <h4 className="text-2xl lg:text-3xl font-bold font-display">
                        {mainCategory.name}
                      </h4>
                      <p className="text-sm text-white/80 max-w-md">
                        Bộ sưu tập được yêu thích nhất với đa dạng kích thước khung và cấu hình.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-6">
                    <span className="text-white/80">
                      {mainCategory.count}+ tin đăng đang hoạt động
                    </span>
                    <span className="underline underline-offset-4 text-white">
                      Xem bộ sưu tập →
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Secondary categories */}
            {secondaryCategories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={handleSearch}
                className="relative overflow-hidden rounded-[24px] group text-left bg-warmgray-50"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-70 group-hover:opacity-90 transition-opacity`}
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-6 h-full flex flex-col justify-between text-white">
                  <div className="space-y-3">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 text-2xl">
                      {category.icon}
                    </span>
                    <h4 className="text-lg font-semibold">{category.name}</h4>
                  </div>
                  <span className="text-sm text-white/80 mt-3">{category.count}+ xe đang bán</span>
                </div>
              </button>
            ))}
          </div>

          {remainingCategories.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-3 justify-center text-sm text-warmgray-600">
              {remainingCategories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={handleSearch}
                  className="px-4 py-2 rounded-full bg-warmgray-100 hover:bg-warmgray-200 transition-colors"
                >
                  {category.name} · {category.count} xe
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4️⃣ TRUST EXPERIENCE – HORIZONTAL LUXURY STRIP */}
      {/* <section className="py-20 border-y border-warmgray-100/60 bg-white">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            <div className="max-w-md space-y-4">
              <p className="text-sm font-semibold text-gold uppercase tracking-widest">
                An tâm giao dịch
              </p>
              <h3 className="text-3xl md:text-4xl font-bold font-display">
                Minh bạch. An toàn. Có trách nhiệm.
              </h3>
              <p className="text-warmgray-500">
                Từ kiểm định, ký quỹ đến vận chuyển, mỗi bước đều được thiết kế để bảo vệ cả người
                mua và người bán.
              </p>
            </div>

            <div className="flex-1 grid md:grid-cols-3 gap-8">
              {trustPoints.map((item) => (
                <div key={item.title} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-primary-800/8 text-primary-800 flex items-center justify-center text-lg">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gold font-semibold">
                        {item.pill}
                      </p>
                      <h4 className="text-base font-semibold">{item.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-warmgray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* 5️⃣ PROCESS – VERTICAL STORY TIMELINE */}
      <section id="how-it-works" className="section bg-warmgray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-4">
              Quy trình
            </p>
            <h3 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Cách Bicycle-Marketplace vận hành
            </h3>
            <p className="text-warmgray-500 max-w-2xl mx-auto">
              Một hành trình rõ ràng từ lúc bạn tìm xe đến khi hoàn tất giao dịch an toàn.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-4 top-0 bottom-0 border-l border-warmgray-200" />
            {[
              {
                step: '1',
                title: 'Đăng ký & Tìm kiếm',
                desc: 'Tạo tài khoản, lưu hồ sơ và lọc theo loại xe, giá, kích thước khung.',
              },
              {
                step: '2',
                title: 'Kiểm định & Đặt cọc',
                desc: 'Xe được kiểm định; đặt cọc qua ký quỹ an toàn, phí cấu hình linh hoạt theo nhu cầu.',
              },
              {
                step: '3',
                title: 'Nhận xe & Đánh giá',
                desc: 'Xác nhận xe đúng báo cáo kiểm định, giải ngân cho người bán và đánh giá uy tín.',
              },
            ].map((item) => (
              <div key={item.step} className="relative pl-12 py-6">
                <div className="absolute left-0 top-6 w-8 h-8 rounded-full bg-white border-2 border-gold flex items-center justify-center text-sm font-bold text-gold">
                  {item.step}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-widest text-warmgray-500">
                    BƯỚC {item.step}
                  </p>
                  <h4 className="text-lg md:text-xl font-semibold font-display">{item.title}</h4>
                  <p className="text-warmgray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ SOCIAL PROOF BAND – MINIMAL */}

      {/* 7️⃣ FINAL CTA – EXTREMELY MINIMAL */}
      <section className="py-24">
        <div className="container-custom text-center">
          <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-4">
            Bắt đầu ngay hôm nay
          </p>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Sẵn sàng cho chiếc xe tiếp theo của bạn?
          </h3>
          <p className="text-warmgray-500 max-w-2xl mx-auto mb-10">
            Tạo tài khoản trong vài phút, duyệt qua các tin đăng đã kiểm định và giao dịch trong
            không gian an toàn, minh bạch.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" onClick={handleSearch}>
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
