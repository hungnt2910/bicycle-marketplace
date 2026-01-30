import React, { useState } from 'react';
import { Card, Badge, Rating, Button, Select, Pagination } from '../../components/ui';

const Marketplace = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    priceRange: '',
    brand: '',
    condition: '',
    verified: false,
    frame: '',
  });
  const [sortBy, setSortBy] = useState('newest');

  const handleProductClick = (bikeId) => {
    if (onNavigate) {
      onNavigate('product-detail', bikeId);
    }
  };

  const bikeTypes = [
    { value: '', label: 'Tất cả loại xe' },
    { value: 'mountain', label: 'Xe đạp địa hình' },
    { value: 'road', label: 'Xe đạp đường trường' },
    { value: 'hybrid', label: 'Xe đạp Hybrid' },
    { value: 'bmx', label: 'Xe đạp BMX' },
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
    { value: 'like-new', label: 'Như mới' },
    { value: 'excellent', label: 'Tuyệt vời' },
    { value: 'good', label: 'Tốt' },
    { value: 'fair', label: 'Khá' },
  ];

  const frameSizes = [
    { value: '', label: 'Khung (tất cả)' },
    { value: 's', label: 'Size S' },
    { value: 'm', label: 'Size M' },
    { value: 'l', label: 'Size L' },
    { value: 'xl', label: 'Size XL' },
  ];

  const bikes = [
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
      location: 'Hà Nội',
      views: 245,
      type: 'mountain',
      frame: 'm',
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
      location: 'TP.HCM',
      views: 189,
      type: 'road',
      frame: 'm',
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
      location: 'Đà Nẵng',
      views: 156,
      type: 'hybrid',
      frame: 'l',
    },
    {
      id: 4,
      name: 'Giant TCR Advanced 2',
      price: 25000000,
      image: '/road_bike_hero_1768417748558.png',
      condition: 'Like New',
      verified: true,
      rating: 4.9,
      reviews: 31,
      seller: 'Phạm Văn D',
      location: 'Hà Nội',
      views: 312,
      type: 'road',
      frame: 'l',
    },
    {
      id: 5,
      name: 'Trek Marlin 7',
      price: 14500000,
      image: '/mountain_bike_hero_1768417732962.png',
      condition: 'Excellent',
      verified: true,
      rating: 4.7,
      reviews: 22,
      seller: 'Hoàng Thị E',
      location: 'Cần Thơ',
      views: 198,
      type: 'mountain',
      frame: 'm',
    },
    {
      id: 6,
      name: 'Cannondale Quick 4',
      price: 11900000,
      image: '/hybrid_bike_hero_1768417761473.png',
      condition: 'Good',
      verified: false,
      rating: 4.5,
      reviews: 15,
      seller: 'Vũ Văn F',
      location: 'Hải Phòng',
      views: 134,
      type: 'hybrid',
      frame: 's',
    },
  ];

  // Filter bikes based on selected filters
  const getFilteredBikes = () => {
    let filtered = [...bikes];

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

    // Filter by brand (checking if brand name is in bike name)
    if (filters.brand) {
      filtered = filtered.filter((bike) =>
        bike.name.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Filter by condition
    if (filters.condition) {
      const conditionMap = {
        'like-new': 'Like New',
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
      };
      filtered = filtered.filter((bike) => bike.condition === conditionMap[filters.condition]);
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
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  return (
    <div className="section">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Marketplace</h2>
          <p className="text-neutral-600">
            Khám phá hàng ngàn xe đạp chất lượng từ người bán uy tín
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 card-surface">
              <h3 className="font-semibold text-lg mb-1">Bộ lọc</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Lọc theo loại, giá, thương hiệu, tình trạng, khung và kiểm định.
              </p>

              <div className="space-y-4">
                <Select
                  label="Loại xe"
                  options={bikeTypes}
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                />

                <Select
                  label="Mức giá"
                  options={priceRanges}
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                />

                <Select
                  label="Thương hiệu"
                  options={brands}
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                />

                <Select
                  label="Tình trạng"
                  options={conditions}
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                />

                <Select
                  label="Kích thước khung"
                  options={frameSizes}
                  value={filters.frame}
                  onChange={(e) => setFilters({ ...filters, frame: e.target.value })}
                />

                <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-800">
                      Chỉ xe đã kiểm định
                    </span>
                  </div>
                  <span className="text-xs text-themePrimary">Escrow</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      type: '',
                      priceRange: '',
                      brand: '',
                      condition: '',
                      verified: false,
                      frame: '',
                    })
                  }
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-600">
                  Tìm thấy <strong>{displayedBikes.length}</strong> xe đạp
                </span>
                <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
                  <span className="px-2 py-1 rounded-full bg-themePrimary/10 text-themePrimary pill">
                    Ký quỹ
                  </span>
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 pill">
                    Đã kiểm định
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-neutral-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-themePrimary bg-white"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>

                <div className="flex gap-1 border border-neutral-300 rounded-full p-1 bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-full text-sm font-medium ${viewMode === 'grid' ? 'bg-themePrimary text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  >
                    Lưới
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-full text-sm font-medium ${viewMode === 'list' ? 'bg-themePrimary text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  >
                    Danh sách
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            <div
              className={
                viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'
              }
            >
              {currentBikes.length > 0 ? (
                currentBikes.map((bike) =>
                  viewMode === 'grid' ? (
                    <Card
                      key={bike.id}
                      variant="product"
                      className="overflow-hidden group cursor-pointer card-surface"
                      onClick={() => handleProductClick(bike.id)}
                    >
                      <div className="relative aspect-product bg-neutral-100">
                        <img
                          src={bike.image}
                          alt={bike.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {bike.verified && (
                          <Badge variant="verified" className="absolute top-3 right-3">
                            ✓ Đã kiểm định
                          </Badge>
                        )}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <button className="px-3 py-1 bg-white/90 rounded-lg hover:bg-white transition-colors text-xs font-medium">
                            Wishlist
                          </button>
                          <button className="px-3 py-1 bg-white/90 rounded-lg hover:bg-white transition-colors text-xs font-medium">
                            So sánh
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-2 line-clamp-1">{bike.name}</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <Rating value={bike.rating} size="sm" readonly />
                          <span className="text-sm text-neutral-600">({bike.reviews})</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="price text-xl">
                            {bike.price.toLocaleString('vi-VN')} ₫
                          </span>
                          {bike.oldPrice && (
                            <span className="price-old text-sm">
                              {bike.oldPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="success">{bike.condition}</Badge>
                          <span className="text-xs text-neutral-500">{bike.views} lượt xem</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                          {bike.location}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                          <span className="px-2 py-1 rounded-full bg-neutral-100">
                            Khung: {(bike.frame || '').toUpperCase() || '—'}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-neutral-100">Ký quỹ</span>
                        </div>
                        <Button variant="primary" className="w-full">
                          Xem chi tiết
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card
                      key={bike.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer card-surface"
                      onClick={() => handleProductClick(bike.id)}
                    >
                      <div className="flex gap-4 p-4">
                        <div className="relative w-48 h-36 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={bike.image}
                            alt={bike.name}
                            className="w-full h-full object-cover"
                          />
                          {bike.verified && (
                            <Badge variant="verified" className="absolute top-2 right-2 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-xl">{bike.name}</h4>
                            <button className="px-3 py-1 hover:bg-neutral-100 rounded-lg transition-colors text-xs font-medium">
                              Wishlist
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <Rating value={bike.rating} size="sm" readonly />
                            <span className="text-sm text-neutral-600">
                              ({bike.reviews} đánh giá)
                            </span>
                            <Badge variant="success">{bike.condition}</Badge>
                          </div>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="price">{bike.price.toLocaleString('vi-VN')} ₫</span>
                            {bike.oldPrice && (
                              <span className="price-old">
                                {bike.oldPrice.toLocaleString('vi-VN')} ₫
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                            <span>Bởi {bike.seller}</span>
                            <span>•</span>
                            <span>{bike.location}</span>
                            <span>•</span>
                            <span>{bike.views} lượt xem</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                            <span className="px-2 py-1 rounded-full bg-neutral-100">
                              Khung: {(bike.frame || '').toUpperCase() || '—'}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-neutral-100">Ký quỹ</span>
                          </div>
                          <Button variant="primary">Xem chi tiết</Button>
                        </div>
                      </div>
                    </Card>
                  )
                )
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-neutral-600 text-lg mb-4">Không tìm thấy xe đạp phù hợp</p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        type: '',
                        priceRange: '',
                        brand: '',
                        condition: '',
                        verified: false,
                        frame: '',
                      })
                    }
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
