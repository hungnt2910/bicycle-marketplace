import React, { useState } from 'react';
import { Card, Badge, Rating, Button, ImageGallery, Avatar, Modal } from '../../components/ui';

const ProductDetail = ({ productId }) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(50);

  // Database of all bikes (same as Marketplace)
  const allBikes = [
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
      brand: 'Giant',
      year: '2024',
      frameSize: 'M (17.5")',
      description:
        'Xe đạp địa hình Giant Talon 3 2024 trong tình trạng như mới, chỉ sử dụng 3 tháng. Xe được bảo dưỡng định kỳ, tất cả linh kiện hoạt động tốt. Phù hợp cho người mới bắt đầu hoặc đi phượt địa hình nhẹ.',
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
      brand: 'Trek',
      year: '2023',
      frameSize: 'L (19")',
      description:
        'Xe đạp đường trường Trek Domane AL 2 tình trạng xuất sắc. Phù hợp cho việc đạp đường dài và tập luyện thể thao.',
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
      brand: 'Specialized',
      year: '2023',
      frameSize: 'M (17")',
      description:
        'Xe đạp Hybrid Specialized Sirrus X 3.0 đa năng, phù hợp cả đường phố và địa hình nhẹ.',
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
      brand: 'Giant',
      year: '2024',
      frameSize: 'M (18")',
      description: 'Xe đạp đua cao cấp Giant TCR Advanced 2 với khung carbon, cực kỳ nhẹ và nhanh.',
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
      brand: 'Trek',
      year: '2023',
      frameSize: 'L (19.5")',
      description: 'Trek Marlin 7 là lựa chọn tuyệt vời cho người yêu thích đạp xe địa hình.',
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
      brand: 'Cannondale',
      year: '2022',
      frameSize: 'M (17")',
      description: 'Cannondale Quick 4 - xe đạp thành phố linh hoạt, phù hợp đi làm và tập luyện.',
    },
  ];

  // Find the bike by ID, default to first bike if not found
  const bike = allBikes.find((b) => b.id === productId) || allBikes[0];

  // Build product object from bike data
  const product = {
    ...bike,
    images: [bike.image, bike.image, bike.image], // Use same image 3 times for gallery
    seller: {
      name: bike.seller,
      avatar: null,
      rating: bike.rating,
      responseTime: '< 1 giờ',
      successRate: '98%',
      totalSales: Math.floor(Math.random() * 50) + 10,
    },
    specs: {
      'Loại xe':
        bike.type === 'mountain'
          ? 'Xe đạp địa hình'
          : bike.type === 'road'
            ? 'Xe đạp đường trường'
            : 'Xe đạp Hybrid',
      'Thương hiệu': bike.brand,
      'Năm sản xuất': bike.year,
      'Kích thước khung': bike.frameSize,
      'Chất liệu khung': 'Nhôm ALUXX-Grade',
      'Hệ thống treo': bike.type === 'mountain' ? 'SR Suntour XCM 100mm' : 'N/A',
      Phanh: 'Phanh đĩa thủy lực Shimano',
      'Bộ truyền động': 'Shimano Deore 1x12',
      'Bánh xe': bike.type === 'road' ? '700c' : '27.5"',
      'Trọng lượng': '13.5 kg',
    },
    inspectionReport: bike.verified
      ? {
          score: 9.2,
          date: '10/01/2024',
          inspector: 'Trần Văn B',
          notes: 'Xe trong tình trạng xuất sắc. Tất cả linh kiện hoạt động tốt.',
        }
      : null,
  };

  const reviews = [
    {
      id: 1,
      user: 'Lê Thị C',
      rating: 5,
      comment: 'Người bán rất nhiệt tình, xe đúng như mô tả!',
      date: '12/01/2024',
    },
    {
      id: 2,
      user: 'Phạm Văn D',
      rating: 4.5,
      comment: 'Xe tốt, giao hàng nhanh.',
      date: '08/01/2024',
    },
  ];

  const similarBikes = [
    {
      id: 2,
      name: 'Trek Marlin 7',
      price: 14500000,
      image: '/mountain_bike_hero_1768417732962.png',
    },
    {
      id: 3,
      name: 'Specialized Rockhopper',
      price: 13200000,
      image: '/mountain_bike_hero_1768417732962.png',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
            <span className="hover:text-themePrimary cursor-pointer transition-colors">
              Trang chủ
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="hover:text-themePrimary cursor-pointer transition-colors">
              Marketplace
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-neutral-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery - Modern Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/50 overflow-hidden">
              <div className="p-6">
                <ImageGallery images={product.images} alt={product.name} />
              </div>
            </div>

            {/* Description - Clean Modern Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-themePrimary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-themePrimary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">Mô tả chi tiết</h3>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line text-base">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Specifications - Modern Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-themePrimary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-themePrimary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">Thông số kỹ thuật</h3>
              </div>
              <div className="grid gap-1">
                {Object.entries(product.specs).map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between py-4 px-5 rounded-xl transition-colors ${
                      index % 2 === 0 ? 'bg-neutral-50' : 'bg-white'
                    } hover:bg-themePrimary/5`}
                  >
                    <span className="font-semibold text-neutral-700 text-sm">{key}</span>
                    <span className="text-neutral-900 font-medium text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Report - Modern Verified Badge */}
            {product.verified && (
              <div className="bg-white rounded-2xl shadow-sm border-2 border-emerald-200 p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-emerald-900 mb-1">
                      Xe đã được kiểm định
                    </h3>
                    <p className="text-emerald-700 font-medium">
                      Ngày kiểm định: {product.inspectionReport.date}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-200">
                    <span className="text-lg font-semibold text-emerald-900">Điểm tổng thể</span>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-bold text-emerald-600">
                        {product.inspectionReport.score}
                      </span>
                      <span className="text-2xl text-emerald-600">/10</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-emerald-600"
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
                      <div className="flex-1">
                        <p className="text-sm text-emerald-800">
                          <span className="font-semibold">Kiểm định viên:</span>{' '}
                          {product.inspectionReport.inspector}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-emerald-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-emerald-800">
                          <span className="font-semibold">Ghi chú:</span>{' '}
                          {product.inspectionReport.notes}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200">
                    Xem báo cáo đầy đủ
                  </button>
                </div>
              </div>
            )}

            {/* Reviews - Modern Card Design */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-themePrimary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-themePrimary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">Đánh giá từ người mua</h3>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-neutral-50 rounded-xl p-5 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar name={review.user} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-neutral-900">{review.user}</div>
                          <span className="text-xs text-neutral-500">{review.date}</span>
                        </div>
                        <div className="mb-2">
                          <Rating value={review.rating} size="sm" readonly />
                        </div>
                        <p className="text-neutral-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Info - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* Price Card - Premium Design */}
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 overflow-hidden">
                {/* Header with Verified Badge */}
                <div className="px-6 pt-6 pb-4">
                  <h1 className="text-2xl font-bold text-neutral-900 mb-3 leading-tight">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-3 mb-4">
                    {product.verified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Đã kiểm định
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
                      {product.condition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Rating value={product.rating} size="sm" readonly />
                    <span className="text-sm font-medium text-neutral-700">{product.rating}</span>
                    <span className="text-sm text-neutral-500">({product.reviews} đánh giá)</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="px-6 py-5 bg-neutral-50 border-y border-neutral-200">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-themePrimary">
                      {product.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xl font-bold text-themePrimary">₫</span>
                  </div>
                  {product.oldPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-neutral-500 line-through">
                        {product.oldPrice.toLocaleString('vi-VN')} ₫
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}
                        %
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Items */}
                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-neutral-400"
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
                    <span className="text-neutral-700 font-medium">{product.location}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-neutral-400"
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
                    <span className="text-neutral-700 font-medium">{product.views} lượt xem</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 space-y-3">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="w-full px-6 py-4 bg-themePrimary text-white font-bold rounded-xl hover:bg-themePrimary/90 transition-all duration-200 shadow-lg shadow-themePrimary/25 hover:shadow-xl hover:shadow-themePrimary/30"
                  >
                    Đặt cọc ngay
                  </button>

                  <button className="w-full px-6 py-4 bg-white border-2 border-themePrimary text-themePrimary font-bold rounded-xl hover:bg-themePrimary/5 transition-all duration-200">
                    Chat với người bán
                  </button>

                  <Button variant="primary" className="w-full py-3 font-semibold rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Thêm vào yêu thích
                  </Button>
                </div>
              </div>

              {/* Seller Info - Modern Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-6">
                <h3 className="font-bold text-lg text-neutral-900 mb-4">Thông tin người bán</h3>

                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-neutral-200">
                  <Avatar name={product.seller.name} size="lg" />
                  <div className="flex-1">
                    <div className="font-bold text-neutral-900 mb-1">{product.seller.name}</div>
                    <div className="flex items-center gap-2">
                      <Rating value={product.seller.rating} size="sm" readonly />
                      <span className="text-sm text-neutral-600">
                        ({product.seller.totalSales} đã bán)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-neutral-600">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">Phản hồi</span>
                    </div>
                    <span className="font-semibold text-neutral-900 text-sm">
                      {product.seller.responseTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-neutral-600">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">Tỷ lệ thành công</span>
                    </div>
                    <span className="font-semibold text-emerald-600 text-sm">
                      {product.seller.successRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-neutral-600">
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
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span className="text-sm">Đã bán</span>
                    </div>
                    <span className="font-semibold text-neutral-900 text-sm">
                      {product.seller.totalSales} xe
                    </span>
                  </div>
                </div>

                <Button variant="primary" className="w-full py-3 font-semibold rounded-xl">
                  Xem trang người bán
                </Button>
              </div>

              {/* Safety Tips - Clean Design */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-neutral-900">Mua hàng an toàn</h3>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">
                      Chỉ đặt cọc qua hệ thống ROUTIN
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">
                      Kiểm tra xe trước khi nhận
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">
                      So sánh với báo cáo kiểm định
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-700 leading-relaxed">
                      Tiền được hoàn nếu không đúng mô tả
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Bikes - Modern Grid */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-themePrimary/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-themePrimary"
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
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">Xe đạp tương tự</h3>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarBikes.map((bike) => (
              <div
                key={bike.id}
                className="group bg-white rounded-2xl shadow-sm border border-neutral-200/50 overflow-hidden hover:shadow-xl hover:border-themePrimary/30 transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-product bg-neutral-100 relative overflow-hidden">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-neutral-900 mb-3 line-clamp-2 group-hover:text-themePrimary transition-colors">
                    {bike.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-themePrimary">
                      {bike.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-lg font-bold text-themePrimary">₫</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deposit Modal - Modern Design */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-themePrimary/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-themePrimary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">Đặt cọc xe đạp</span>
          </div>
        }
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowDepositModal(false)}
              className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Hủy
            </button>
            <button className="flex-1 px-6 py-3 bg-themePrimary text-white font-bold rounded-xl hover:bg-themePrimary/90 transition-all shadow-lg shadow-themePrimary/25">
              Xác nhận đặt cọc
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-4">
              Chọn số tiền đặt cọc ({depositAmount}%)
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="10"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-themePrimary"
            />
            <div className="flex justify-between text-sm text-neutral-600 mt-2 font-medium">
              <span>20%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-neutral-200">
              <span className="text-neutral-700 font-medium">Giá xe</span>
              <span className="font-bold text-neutral-900 text-lg">
                {product.price.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-900 font-bold text-lg">Số tiền cọc</span>
              <span className="text-3xl font-bold text-themePrimary">
                {((product.price * depositAmount) / 100).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-emerald-900 text-base">Bảo vệ người mua</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-emerald-800">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Tiền được giữ an toàn bởi hệ thống</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-emerald-800">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Hoàn tiền nếu xe không đúng mô tả</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-emerald-800">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Hỗ trợ giải quyết tranh chấp 24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;
