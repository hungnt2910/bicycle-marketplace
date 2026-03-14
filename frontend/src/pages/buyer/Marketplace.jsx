import React, { useEffect, useState } from 'react';
import { Card, Badge, Rating, Button, Select, Pagination } from '../../components/ui';
import { useCompare } from '../../contexts/CompareContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import bicycleApi from '../../api/postNewsApi';
import favouriteApi from '../../api/favouriteApi';

const Marketplace = ({ onNavigate }) => {
  const { isAuthenticated, user } = useAuth();
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [bikes, setBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    priceRange: '',
    brand: '',
    condition: '',
    verified: false,
    frame: '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 100000000]);

  const { compareItems, addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const currentUserId =
    user?._id || user?.id || user?.userId || user?.user?.id || user?.user?.userId;

  const handleProductClick = (bikeId) => {
    if (onNavigate) {
      onNavigate('product-detail', bikeId);
    }
  };

  const handleCompareToggle = (e, bike) => {
    e.stopPropagation();
    if (isInCompare(bike.id)) {
      removeFromCompare(bike.id);
    } else {
      const success = addToCompare(bike);
      if (!success && !isInCompare(bike.id)) {
        alert('Bạn chỉ có thể so sánh tối đa 2 sản phẩm!');
      }
    }
  };

  const isFavourite = (id) => favouriteIds.includes(id);

  const handleFavouriteToggle = async (e, bike) => {
    e.stopPropagation();
    if (!isAuthenticated || !currentUserId) {
      toast.info('Vui lòng đăng nhập để lưu tin yêu thích');
      onNavigate && onNavigate('login');
      return;
    }

    try {
      if (isFavourite(bike.id)) {
        await favouriteApi.removeOneFromFavourites({ userId: currentUserId, bicycleId: bike.id });
        setFavouriteIds((prev) => prev.filter((x) => x !== bike.id));
        toast.success('Đã bỏ khỏi yêu thích');
      } else {
        await favouriteApi.addToFavourites({ userId: currentUserId, bicycleId: bike.id });
        setFavouriteIds((prev) => [...prev, bike.id]);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (err) {
      console.error('Toggle favourite error:', err);
      toast.error('Không thể cập nhật yêu thích, thử lại sau');
    }
  };

  const bikeTypes = [
    { value: '', label: 'Tất cả loại xe' },
    { value: 'mountain', label: 'Xe đạp địa hình' },
    { value: 'road', label: 'Xe đạp đường trường' },
    { value: 'hybrid', label: 'Xe đạp Hybrid' },
    { value: 'electric', label: 'Xe đạp điện' },
    { value: 'folding', label: 'Xe đạp gấp' },
    { value: 'bmx', label: 'Xe đạp BMX' },
    { value: 'cruiser', label: 'Xe đạp dạo phố' },
  ];

  const priceRanges = [
    { value: '', label: 'Tất cả mức giá' },
    { value: '0-5', label: 'Dưới 5 triệu' },
    { value: '5-10', label: '5 - 10 triệu' },
    { value: '10-20', label: '10 - 20 triệu' },
    { value: '20-50', label: '20 - 50 triệu' },
    { value: '50+', label: 'Trên 50 triệu' },
  ];

  const brands = [
    { value: '', label: 'Tất cả thương hiệu' },
    { value: 'giant', label: 'Giant' },
    { value: 'trek', label: 'Trek' },
    { value: 'specialized', label: 'Specialized' },
    { value: 'cannondale', label: 'Cannondale' },
  ];

  const conditions = [
    { value: '', label: 'Tất cả tình trạng' },
    { value: 'new', label: 'Mới 100%' },
    { value: 'like-new', label: 'Như mới' },
    { value: 'good', label: 'Tốt' },
    { value: 'fair', label: 'Khá' },
    { value: 'poor', label: 'Cần sửa chữa' },
  ];

  const frameSizes = [
    { value: '', label: 'Khung (tất cả)' },
    { value: 's', label: 'Size S' },
    { value: 'm', label: 'Size M' },
    { value: 'l', label: 'Size L' },
    { value: 'xl', label: 'Size XL' },
  ];

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
      nameFromSellerId || fromProfile || bike?.seller?.fullName || bike?.sellerName || 'Người bán'
    );
  };

  useEffect(() => {
    const fetchBikes = async () => {
      setLoadingBikes(true);
      try {
        const response = await bicycleApi.getAllBicycles();
        const apiData = response?.data?.data || response?.data || [];
        const mapped = apiData
          // Chỉ hiển thị xe còn bán: trạng thái active và không thuộc các trạng thái đã cọc/đang giao dich
          .filter((bike) => {
            const statusRaw = (bike?.status || '').toLowerCase();
            const reservedStatuses = [
              'reserved',
              'pending_payment',
              'payment_received',
              'held_in_escrow',
              'awaiting_delivery',
              'buyer_confirmed',
              'completed',
            ];
            return statusRaw === 'active' && !reservedStatuses.includes(statusRaw);
          })
          .map((bike) => {
            const location = [bike?.location?.district, bike?.location?.city]
              .filter(Boolean)
              .join(', ');

            const statusRaw = (bike?.status || '').toLowerCase();
            const reservedStatuses = [
              'reserved',
              'pending_payment',
              'payment_received',
              'held_in_escrow',
              'awaiting_delivery',
              'buyer_confirmed',
              'completed',
            ];

            return {
              id: bike?._id || bike?.id,
              name: bike?.title || 'Không có tiêu đề',
              price: bike?.price || 0,
              oldPrice: bike?.oldPrice,
              image:
                bike?.media?.mainImage ||
                bike?.media?.images?.[0] ||
                '/mountain_bike_hero_1768417732962.png',
              condition: conditionLabelMap[bike?.condition?.overall] || 'Chưa xác định',
              conditionValue: bike?.condition?.overall || '',
              verified: !!bike?.inspection?.isInspected,
              status: bike?.status,
              isReserved: reservedStatuses.includes(statusRaw),
              rating: bike?.rating || 0,
              reviews: bike?.reviewsCount || 0,
              seller: getSellerName(bike),
              location: location || '—',
              views: bike?.views || 0,
              type: bike?.specifications?.type || '',
              frame: (bike?.specifications?.frameSize || '').toLowerCase(),
              brand: bike?.specifications?.brand || '',
            };
          });

        setBikes(mapped);
      } catch (error) {
        console.error('Error fetching bikes:', error);
        setBikes([]);
      } finally {
        setLoadingBikes(false);
      }
    };

    fetchBikes();
  }, []);

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!currentUserId) return;
      try {
        const res = await favouriteApi.getFavouriteBicycles(currentUserId);
        const data = res?.data?.data || res?.data || [];
        const ids = data.map((item) => item?._id || item?.id).filter(Boolean);
        setFavouriteIds(ids);
      } catch (err) {
        console.error('Fetch favourites error:', err);
      }
    };

    fetchFavourites();
  }, [currentUserId]);

  // Filter bikes based on selected filters
  const getFilteredBikes = () => {
    let filtered = [...bikes];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bike) =>
          bike.name.toLowerCase().includes(query) ||
          bike.seller.toLowerCase().includes(query) ||
          bike.location.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter((bike) => bike.type === filters.type);
    }

    // Filter by price range
    if (filters.priceRange) {
      const priceInMillions = (price) => price / 1000000;
      filtered = filtered.filter((bike) => {
        const price = priceInMillions(bike.price);
        switch (filters.priceRange) {
          case '0-5':
            return price < 5;
          case '5-10':
            return price >= 5 && price < 10;
          case '10-20':
            return price >= 10 && price < 20;
          case '20-50':
            return price >= 20 && price < 50;
          case '50+':
            return price >= 50;
          default:
            return true;
        }
      });
    }

    // Filter by brand
    if (filters.brand) {
      filtered = filtered.filter((bike) =>
        (bike.brand || '').toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Filter by condition
    if (filters.condition) {
      filtered = filtered.filter((bike) => bike.conditionValue === filters.condition);
    }

    // Filter by frame size
    if (filters.frame) {
      filtered = filtered.filter(
        (bike) => (bike.frame || '').toLowerCase() === filters.frame.toLowerCase()
      );
    }

    // Filter by verified status
    if (filters.verified) {
      filtered = filtered.filter((bike) => bike.verified === true);
    }

    return filtered;
  };

  // Sort bikes based on selected sort option
  const getSortedBikes = (bikesToSort) => {
    let sorted = [...bikesToSort];

    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        // Keep original order (newest first)
        break;
    }

    return sorted;
  };

  // Get filtered and sorted bikes
  const filteredBikes = getFilteredBikes();
  const displayedBikes = getSortedBikes(filteredBikes);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(displayedBikes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBikes = displayedBikes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, searchQuery]);

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter((v) => v && v !== '').length;

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      type: '',
      priceRange: '',
      brand: '',
      condition: '',
      verified: false,
      frame: '',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--lux-gray-50)' }}>
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--lux-primary-900)' }}
      >
        {/* Ambient glows */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--lux-gold) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-40 opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, var(--lux-primary-500) 0%, transparent 70%)',
          }}
        />

        <div className="container-custom py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: 'var(--lux-gold)' }}
                >
                  Khám phá xe đạp
                </span>
              </div>
              <h1
                className="text-3xl lg:text-4xl font-bold mb-2 leading-tight"
                style={{ color: 'white', fontFamily: "'Playfair Display', serif" }}
              >
                Marketplace <span style={{ color: 'var(--lux-gold)' }}>xe đạp cao cấp</span>
              </h1>
              <p className="text-sm max-w-xl" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Khám phá những chiếc xe đạp cao cấp từ các nhà cung cấp đã được xác minh trên
                toàn quốc. Chất lượng được đảm bảo, trải nghiệm được nâng tầm.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-10 relative z-10">

        {/* Advanced Search Section */}
        <div className="mb-10">
          <div className="relative group">
            <div
              className="absolute -inset-1 rounded-[20px] blur opacity-25 group-hover:opacity-40 transition duration-300"
              style={{ backgroundColor: 'var(--lux-primary-800)' }}
            ></div>
            <div
              className="relative bg-white rounded-[20px] shadow-elevated overflow-hidden"
              style={{ border: '1px solid var(--lux-gray-200)' }}
            >
              <div className="flex items-center p-2">
                <div
                  className="flex items-center justify-center w-12 h-12"
                  style={{ color: 'var(--lux-primary-800)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, seller, location..."
                  className="flex-1 px-4 py-4 text-lg bg-transparent focus:outline-none"
                  style={{ color: 'var(--lux-gray-800)' }}
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-12 h-12 flex items-center justify-center transition-colors"
                    style={{ color: 'var(--lux-gray-400)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                ) : (
                  <Button
                    className="px-6 py-3 mr-2 rounded-[16px] font-semibold hover:shadow-soft transition-all duration-300 border-none"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 100%)',
                      color: 'var(--lux-gold)',
                    }}
                  >
                    Search
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Modern Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-4">
              <div
                className="bg-white rounded-[20px] shadow-soft overflow-hidden"
                style={{ border: '1px solid var(--lux-gray-200)' }}
              >
                <div
                  className="px-6 py-5 relative overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 100%)',
                  }}
                >
                  {/* Decorative faint glow inside header */}
                  <div
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 pointer-events-none"
                    style={{ backgroundColor: 'var(--lux-gold)' }}
                  />

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 drop-shadow-soft"
                        style={{ color: 'var(--lux-gold)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      <h3 className="font-bold text-lg" style={{ color: 'white' }}>
                        Bộ lọc
                      </h3>
                    </div>
                    {activeFiltersCount > 0 && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                      >
                        <span className="text-sm font-bold text-white drop-shadow-soft">
                          {activeFiltersCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: 'var(--lux-gray-700)' }}
                    >
                      Loại xe
                    </label>
                    <Select
                      options={bikeTypes}
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    />
                  </div>

                  <div className="pt-6" style={{ borderTop: '1px solid var(--lux-gray-100)' }}>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: 'var(--lux-gray-700)' }}
                    >
                      Khoảng giá
                    </label>
                    <Select
                      options={priceRanges}
                      value={filters.priceRange}
                      onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    />
                  </div>

                  <div className="pt-6" style={{ borderTop: '1px solid var(--lux-gray-100)' }}>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: 'var(--lux-gray-700)' }}
                    >
                      Thương hiệu
                    </label>
                    <Select
                      options={brands}
                      value={filters.brand}
                      onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    />
                  </div>

                  <div className="pt-6" style={{ borderTop: '1px solid var(--lux-gray-100)' }}>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: 'var(--lux-gray-700)' }}
                    >
                      Tình trạng
                    </label>
                    <Select
                      options={conditions}
                      value={filters.condition}
                      onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                    />
                  </div>

                  <div className="pt-6" style={{ borderTop: '1px solid var(--lux-gray-100)' }}>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: 'var(--lux-gray-700)' }}
                    >
                      Kích thước khung
                    </label>
                    <Select
                      options={frameSizes}
                      value={filters.frame}
                      onChange={(e) => setFilters({ ...filters, frame: e.target.value })}
                    />
                  </div>

                  <div className="pt-6" style={{ borderTop: '1px solid var(--lux-gray-100)' }}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                        className="w-5 h-5 rounded focus:ring-primary-600"
                        style={{
                          color: 'var(--lux-primary-800)',
                          borderColor: 'var(--lux-gray-300)',
                        }}
                      />
                      <div className="flex-1">
                        <div
                          className="text-sm font-semibold transition-colors"
                          style={{ color: 'var(--lux-gray-700)' }}
                        >
                          Đã kiểm định
                        </div>
                        <div className="text-xs" style={{ color: 'var(--lux-gray-500)' }}>
                          Chỉ hiển thị xe đã kiểm định
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5"
                        style={{ color: 'var(--lux-primary-800)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </label>
                  </div>

                  <Button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-3 font-semibold rounded-[16px] transition-colors duration-300 flex items-center justify-center gap-2 border-none"
                    style={{ backgroundColor: 'var(--lux-gray-100)', color: 'var(--lux-gray-700)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Đặt lại bộ lọc
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Advanced Toolbar */}
            <div
              className="bg-white rounded-[20px] shadow-soft p-5 mb-6"
              style={{ border: '1px solid var(--lux-gray-200)' }}
            >
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden px-5 py-2.5 text-white rounded-[16px] font-semibold hover:shadow-soft transition-all duration-300 flex items-center gap-2"
                    style={{ backgroundColor: 'var(--lux-primary-800)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <div>
                    <div className="text-sm mb-0.5" style={{ color: 'var(--lux-gray-500)' }}>
                      Hiện kết quả
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--lux-primary-900)' }}>
                      {displayedBikes.length}
                    </div>
                  </div>

                  {searchQuery && (
                    <div
                      className="px-4 py-2 rounded-[16px] text-sm font-medium"
                      style={{
                        backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                        color: 'var(--lux-primary-800)',
                      }}
                    >
                      for "{searchQuery}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-4 pr-12 py-3 bg-white rounded-[16px] font-semibold transition-all cursor-pointer focus:outline-none"
                      style={{
                        border: '2px solid var(--lux-gray-200)',
                        color: 'var(--lux-gray-700)',
                      }}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price-low">Giá: Thấp đến Cao</option>
                      <option value="price-high">Giá: Cao đến Thấp</option>
                      <option value="rating">Đánh giá cao nhất</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5"
                        style={{ color: 'var(--lux-gray-500)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 rounded-[16px] p-1.5"
                    style={{ backgroundColor: 'var(--lux-gray-100)' }}
                  >
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-[16px] transition-all duration-300 ${
                        viewMode === 'grid' ? 'bg-white shadow-soft' : ''
                      }`}
                      style={{
                        color:
                          viewMode === 'grid' ? 'var(--lux-primary-800)' : 'var(--lux-gray-500)',
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-[16px] transition-all duration-300 ${
                        viewMode === 'list' ? 'bg-white shadow-soft' : ''
                      }`}
                      style={{
                        color:
                          viewMode === 'list' ? 'var(--lux-primary-800)' : 'var(--lux-gray-500)',
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div
                  className="flex flex-wrap gap-2 mt-5 pt-5"
                  style={{ borderTop: '1px solid var(--lux-gray-100)' }}
                >
                  <span
                    className="text-sm font-semibold self-center"
                    style={{ color: 'var(--lux-gray-600)' }}
                  >
                    Active:
                  </span>
                  {filters.type && (
                    <span
                      className="px-4 py-2 rounded-[16px] text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                        border: '1px solid rgba(var(--lux-primary-800), 0.3)',
                        color: 'var(--lux-primary-800)',
                      }}
                    >
                      {bikeTypes.find((t) => t.value === filters.type)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, type: '' })}
                        className="rounded-full p-0.5 transition-colors"
                        style={{ backgroundColor: 'rgba(var(--lux-primary-800), 0.05)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filters.priceRange && (
                    <span
                      className="px-4 py-2 rounded-[16px] text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                        border: '1px solid rgba(var(--lux-primary-800), 0.3)',
                        color: 'var(--lux-primary-800)',
                      }}
                    >
                      {priceRanges.find((p) => p.value === filters.priceRange)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, priceRange: '' })}
                        className="rounded-full p-0.5 transition-colors"
                        style={{ backgroundColor: 'rgba(var(--lux-primary-800), 0.05)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filters.brand && (
                    <span
                      className="px-4 py-2 rounded-[16px] text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                        border: '1px solid rgba(var(--lux-primary-800), 0.3)',
                        color: 'var(--lux-primary-800)',
                      }}
                    >
                      {brands.find((b) => b.value === filters.brand)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, brand: '' })}
                        className="hover:bg-primary-800/20 rounded-full p-0.5 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filters.condition && (
                    <span
                      className="px-4 py-2 rounded-[16px] text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                        border: '1px solid rgba(var(--lux-primary-800), 0.3)',
                        color: 'var(--lux-primary-800)',
                      }}
                    >
                      {conditions.find((c) => c.value === filters.condition)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, condition: '' })}
                        className="rounded-full p-0.5 transition-colors"
                        style={{ backgroundColor: 'rgba(var(--lux-primary-800), 0.05)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filters.frame && (
                    <span
                      className="px-4 py-2 rounded-[16px] text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                        border: '1px solid rgba(var(--lux-primary-800), 0.3)',
                        color: 'var(--lux-primary-800)',
                      }}
                    >
                      {frameSizes.find((f) => f.value === filters.frame)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, frame: '' })}
                        className="rounded-full p-0.5 transition-colors"
                        style={{ backgroundColor: 'rgba(var(--lux-primary-800), 0.05)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filters.verified && (
                    <span
                      className="px-4 py-2 rounded-[16px] text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                        border: '1px solid rgba(var(--lux-primary-800), 0.3)',
                        color: 'var(--lux-primary-800)',
                      }}
                    >
                      Verified Only
                      <button
                        onClick={() => setFilters({ ...filters, verified: false })}
                        className="rounded-full p-0.5 transition-colors"
                        style={{ backgroundColor: 'rgba(var(--lux-primary-800), 0.05)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-[16px] text-sm font-medium transition-colors border-none"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Products */}
            <div
              className={
                viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'
              }
            >
              {currentBikes.length > 0 ? (
                currentBikes.map((bike) =>
                  viewMode === 'grid' ? (
                    <Card
                      key={bike.id}
                      variant="product"
                      className="overflow-hidden group cursor-pointer card-surface hover:shadow-elevated transition-all duration-300 border-2 border-transparent hover:border-primary-800/30 rounded-[20px]"
                      onClick={() => handleProductClick(bike.id)}
                    >
                      <div className="relative aspect-product bg-gradient-to-br from-neutral-100 to-neutral-200 overflow-hidden">
                        <img
                          src={bike.image}
                          alt={bike.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {bike.verified && (
                          <Badge
                            variant="verified"
                            className="absolute top-3 right-3 shadow-soft backdrop-blur-sm"
                          >
                            ✓ Kiểm định
                          </Badge>
                        )}

                        {bike.isReserved && (
                          <Badge
                            variant="warning"
                            className="absolute top-3 left-3 shadow-soft backdrop-blur-sm"
                          >
                            Đã đặt cọc
                          </Badge>
                        )}

                        {bike.oldPrice && (
                          <div
                            className={`absolute ${bike.isReserved ? 'top-12' : 'top-3'} left-3`}
                          >
                            <span className="px-3 py-1.5 bg-danger/50 text-white rounded-full text-xs font-bold shadow-soft">
                              -{Math.round(((bike.oldPrice - bike.price) / bike.oldPrice) * 100)}%
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                          <button
                            onClick={(e) => handleFavouriteToggle(e, bike)}
                            className={`flex-1 px-3 py-2 backdrop-blur-sm rounded-[16px] transition-colors text-xs font-semibold flex items-center justify-center gap-1 shadow-soft ${isFavourite(bike.id)
                              ? 'bg-danger/50 text-white hover:bg-danger'
                              : 'bg-white/95 hover:bg-white'
                              }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill={isFavourite(bike.id) ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            {isFavourite(bike.id) ? 'Đã thích' : 'Yêu thích'}
                          </button>
                          <button
                            onClick={(e) => handleCompareToggle(e, bike)}
                            className={`flex-1 px-3 py-2 backdrop-blur-sm rounded-[16px] transition-colors text-xs font-semibold flex items-center justify-center gap-1 shadow-soft ${isInCompare(bike.id)
                              ? 'bg-primary-800 text-white hover:bg-primary-800/90'
                              : 'bg-white/95 hover:bg-white'
                              }`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            {isInCompare(bike.id) ? 'Đã chọn' : 'So sánh'}
                          </button>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h4
                            className="font-bold text-lg mb-1 line-clamp-2 flex-1 transition-colors"
                            style={{ color: 'var(--lux-gray-800)' }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = 'var(--lux-primary-800)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = 'var(--lux-gray-800)')
                            }
                          >
                            {bike.name}
                          </h4>
                        </div>

                        {/* <div className="flex items-center gap-2 mb-4">
                          <Rating value={bike.rating} size="sm" readonly />
                          <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                            {bike.rating}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--lux-gray-500)' }}>({bike.reviews})</span>
                        </div> */}

                        <div className="flex items-baseline gap-2 mb-4">
                          <span
                            className="price text-2xl font-bold"
                            style={{ color: 'var(--lux-primary-800)' }}
                          >
                            {bike.price.toLocaleString('vi-VN')} ₫
                          </span>
                          {bike.oldPrice && (
                            <span
                              className="price-old text-sm line-through"
                              style={{ color: 'var(--lux-gray-400)' }}
                            >
                              {bike.oldPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                        </div>

                        <div
                          className="flex items-center justify-between mb-4 pb-4"
                          style={{ borderBottom: '1px solid var(--lux-gray-100)' }}
                        >
                          <Badge variant="success" className="px-3 py-1.5">
                            {bike.condition}
                          </Badge>
                        </div>

                        <Button
                          className="w-full py-3 font-semibold rounded-[16px] border-none"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 100%)',
                            color: 'var(--lux-gold)',
                          }}
                        >
                          Xem chi tiết →
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card
                      key={bike.id}
                      className="overflow-hidden hover:shadow-elevated transition-all duration-300 cursor-pointer card-surface"
                      style={{ border: '1px solid var(--lux-gray-200)' }}
                      onClick={() => handleProductClick(bike.id)}
                    >
                      <div className="flex flex-col md:flex-row gap-5 p-5">
                        <div className="relative w-full md:w-64 h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-[16px] overflow-hidden flex-shrink-0 group">
                          <img
                            src={bike.image}
                            alt={bike.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {bike.verified && (
                            <Badge
                              variant="verified"
                              className="absolute top-2 right-2 text-xs shadow-soft"
                            >
                              ✓
                            </Badge>
                          )}
                          {bike.isReserved && (
                            <Badge
                              variant="warning"
                              className="absolute top-2 left-2 text-xs shadow-soft"
                            >
                              Đã đặt cọc
                            </Badge>
                          )}
                          {bike.oldPrice && (
                            <div
                              className={`absolute ${bike.isReserved ? 'top-10' : 'top-2'} left-2`}
                            >
                              <span className="px-2.5 py-1 bg-danger/50 text-white rounded-full text-xs font-bold shadow-soft">
                                -{Math.round(((bike.oldPrice - bike.price) / bike.oldPrice) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <h4
                              className="font-bold text-2xl transition-colors"
                              style={{ color: 'var(--lux-gray-800)' }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = 'var(--lux-primary-800)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = 'var(--lux-gray-800)')
                              }
                            >
                              {bike.name}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="px-4 py-2 rounded-[16px] transition-colors text-sm font-medium flex items-center gap-2"
                              style={{
                                border: '1px solid var(--lux-gray-200)',
                                color: 'var(--lux-gray-700)',
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = 'var(--lux-gray-50)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = 'transparent')
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              Yêu thích
                            </button>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Rating value={bike.rating} size="sm" readonly />
                              <span
                                className="text-sm font-bold"
                                style={{ color: 'var(--lux-gray-700)' }}
                              >
                                {bike.rating}
                              </span>
                              <span className="text-sm" style={{ color: 'var(--lux-gray-500)' }}>
                                ({bike.reviews} đánh giá)
                              </span>
                            </div>
                            <Badge variant="success" className="px-3 py-1.5">
                              {bike.condition}
                            </Badge>
                          </div>

                          <div className="flex items-baseline gap-3 mb-4">
                            <span
                              className="price text-3xl font-bold"
                              style={{ color: 'var(--lux-primary-800)' }}
                            >
                              {bike.price.toLocaleString('vi-VN')} ₫
                            </span>
                            {bike.oldPrice && (
                              <span
                                className="price-old text-lg line-through"
                                style={{ color: 'var(--lux-gray-400)' }}
                              >
                                {bike.oldPrice.toLocaleString('vi-VN')} ₫
                              </span>
                            )}
                          </div>

                          <div
                            className="flex flex-wrap items-center gap-4 text-sm mb-4 pb-4"
                            style={{
                              borderBottom: '1px solid var(--lux-gray-100)',
                              color: 'var(--lux-gray-600)',
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                style={{ color: 'var(--lux-gray-400)' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span className="font-medium">{bike.seller}</span>
                            </div>
                            <span style={{ color: 'var(--lux-gray-300)' }}>•</span>
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                style={{ color: 'var(--lux-gray-400)' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span>{bike.location}</span>
                            </div>
                            <span style={{ color: 'var(--lux-gray-300)' }}>•</span>
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                style={{ color: 'var(--lux-gray-400)' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <span>{bike.views} lượt xem</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4">
                            <span
                              className="px-3 py-1.5 rounded-[16px] text-xs font-medium"
                              style={{
                                backgroundColor: 'var(--lux-gray-100)',
                                color: 'var(--lux-gray-700)',
                              }}
                            >
                              Khung: {(bike.frame || '').toUpperCase() || '—'}
                            </span>
                            <span
                              className="px-3 py-1.5 rounded-[16px] text-xs font-medium"
                              style={{
                                backgroundColor: 'rgba(var(--lux-primary-800), 0.1)',
                                color: 'var(--lux-primary-800)',
                              }}
                            >
                              Ký quỹ
                            </span>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              className="flex-1 py-3 font-semibold rounded-[16px] border-none"
                              style={{
                                background:
                                  'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 100%)',
                                color: 'var(--lux-gold)',
                              }}
                            >
                              Xem chi tiết →
                            </Button>
                            <button
                              onClick={(e) => handleCompareToggle(e, bike)}
                              className={`px-6 py-3 border-2 rounded-[16px] transition-all font-medium ${
                                isInCompare(bike.id) ? 'text-white' : ''
                              }`}
                              style={{
                                backgroundColor: isInCompare(bike.id)
                                  ? 'var(--lux-primary-800)'
                                  : 'transparent',
                                borderColor: isInCompare(bike.id)
                                  ? 'var(--lux-primary-800)'
                                  : 'var(--lux-gray-200)',
                                color: isInCompare(bike.id) ? 'white' : 'var(--lux-gray-800)',
                              }}
                              onMouseEnter={(e) => {
                                if (!isInCompare(bike.id)) {
                                  e.currentTarget.style.borderColor = 'var(--lux-primary-800)';
                                  e.currentTarget.style.color = 'var(--lux-primary-800)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isInCompare(bike.id)) {
                                  e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
                                  e.currentTarget.style.color = 'var(--lux-gray-800)';
                                }
                              }}
                            >
                              {isInCompare(bike.id) ? 'Đã chọn' : 'So sánh'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                )
              ) : (
                <div
                  className="col-span-full text-center py-20 bg-white rounded-[20px]"
                  style={{ border: '2px dashed var(--lux-gray-200)' }}
                >
                  <div className="max-w-md mx-auto">
                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--lux-gray-100)' }}
                    >
                      <svg
                        className="w-10 h-10"
                        style={{ color: 'var(--lux-gray-400)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-2xl font-bold mb-2"
                      style={{ color: 'var(--lux-gray-800)' }}
                    >
                      Không tìm thấy xe đạp
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--lux-gray-600)' }}>
                      Không có xe đạp nào phù hợp với bộ lọc của bạn. Thử điều chỉnh bộ lọc hoặc xóa
                      một số tiêu chí.
                    </p>
                    <Button
                      onClick={clearAllFilters}
                      className="px-8 py-3 rounded-[16px] font-semibold border-none"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 100%)',
                        color: 'var(--lux-gold)',
                      }}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Đặt lại bộ lọc
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div
                  className="bg-white rounded-[20px] p-4"
                  style={{
                    border: '1px solid var(--lux-gray-200)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Compare Bar */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up max-w-4xl w-full px-4">
          <div
            className="bg-white rounded-[16px] shadow-elevated overflow-hidden"
            style={{ border: '2px solid rgba(var(--lux-primary-800), 0.3)' }}
          >
            <div
              className="px-4 py-2"
              style={{
                background:
                  'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-[16px] flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      So sánh xe đạp ({compareItems.length}/2)
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onNavigate && onNavigate('compare')}
                    disabled={compareItems.length < 1}
                    className="font-bold px-4 py-1.5 text-sm rounded-[16px] disabled:opacity-50 disabled:cursor-not-allowed border-none"
                    style={{ backgroundColor: 'white', color: 'var(--lux-primary-800)' }}
                  >
                    {compareItems.length === 2 ? 'So sánh ngay' : 'Xem'}
                  </Button>
                  <button
                    onClick={() => {
                      compareItems.forEach((bike) => removeFromCompare(bike.id));
                    }}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-[16px] flex items-center justify-center transition-colors"
                    title="Xóa tất cả"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                {compareItems.map((bike) => (
                  <div
                    key={bike.id}
                    className="flex-1 rounded-[16px] p-2 flex items-center gap-2 transition-colors border"
                    style={{
                      backgroundColor: 'var(--lux-gray-50)',
                      borderColor: 'rgba(var(--lux-primary-800), 0.1)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = 'rgba(var(--lux-primary-800), 0.5)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = 'rgba(var(--lux-primary-800), 0.1)')
                    }
                  >
                    <img
                      src={bike.image}
                      alt={bike.name}
                      className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-semibold text-xs truncate"
                        style={{ color: 'var(--lux-gray-800)' }}
                      >
                        {bike.name}
                      </h4>
                      <p className="text-xs font-bold" style={{ color: 'var(--lux-primary-800)' }}>
                        {bike.price.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCompare(bike.id)}
                      className="w-6 h-6 rounded-md flex items-center justify-center transition-colors group"
                      style={{ backgroundColor: 'var(--lux-gray-200)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = 'var(--lux-gray-200)')
                      }
                    >
                      <svg
                        className="w-3.5 h-3.5 group-hover:text-danger"
                        style={{ color: 'var(--lux-gray-600)' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {compareItems.length === 1 && (
                  <div
                    className="flex-1 border-2 border-dashed rounded-[16px] p-2 flex items-center justify-center h-14"
                    style={{
                      backgroundColor: 'var(--lux-gray-50)',
                      borderColor: 'var(--lux-gray-300)',
                    }}
                  >
                    <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                      Chọn xe thứ 2
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
