import React, { useState } from 'react';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const [sellerStats] = useState({
    totalListings: 12,
    activeListings: 8,
    soldListings: 4,
    totalEarnings: 125000000,
    pendingDeposits: 15000000,
    trustScore: 4.8,
    totalReviews: 47,
  });

  const [listings] = useState([
    {
      id: 1,
      name: 'Giant XTC SLR 29',
      price: 25000000,
      status: 'active',
      views: 245,
      interests: 12,
      image: 'https://via.placeholder.com/100',
      createdDate: '2024-12-01',
      inspectionStatus: 'passed',
      inspectionDate: '2024-12-02',
      inspectionExpiry: '2025-06-02',
    },
    {
      id: 2,
      name: 'Trek Domane SLR 7',
      price: 30000000,
      status: 'pending_inspection',
      views: 189,
      interests: 8,
      image: 'https://via.placeholder.com/100',
      createdDate: '2024-12-15',
      inspectionStatus: 'pending',
      inspectionDate: null,
    },
    {
      id: 3,
      name: 'Specialized Tarmac SL7',
      price: 35000000,
      status: 'sold',
      views: 512,
      interests: 25,
      image: 'https://via.placeholder.com/100',
      createdDate: '2024-11-20',
      soldDate: '2024-12-10',
      inspectionStatus: 'passed',
    },
  ]);

  const [orders] = useState([
    {
      id: 1,
      bikeId: 'BIKE001',
      bikeName: 'Giant XTC SLR 29',
      buyer: 'Nguyễn Văn A',
      depositAmount: 5000000,
      totalPrice: 25000000,
      status: 'confirmed',
      depositDate: '2024-12-20',
      expectedDeliveryDate: '2024-12-25',
      paymentStatus: 'escrowed',
    },
    {
      id: 2,
      bikeId: 'BIKE002',
      bikeName: 'Trek Domane SLR 7',
      buyer: 'Trần Minh B',
      depositAmount: 6000000,
      totalPrice: 30000000,
      status: 'pending',
      depositDate: '2024-12-18',
      expectedDeliveryDate: '2024-12-28',
      paymentStatus: 'escrowed',
    },
  ]);

  const [reviews] = useState([
    {
      id: 1,
      buyer: 'Trần Minh B',
      rating: 5,
      date: '2024-12-15',
      text: 'Xe chất lượng, giao hàng nhanh, người bán rất tử tế!',
      bikeId: 'BIKE001',
    },
    {
      id: 2,
      buyer: 'Lê Hải C',
      rating: 4,
      date: '2024-12-10',
      text: 'Tốt nhưng có vết xước nhỏ trên khung',
      bikeId: 'BIKE002',
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển người bán</h1>
        <p className="text-gray-600">Quản lý tin đăng, đơn hàng và uy tín của bạn</p>
      </div>

      {/* Stats Cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tin đang bán', value: sellerStats.activeListings, icon: '📋' },
            { label: 'Đã bán', value: sellerStats.soldListings, icon: '✓' },
            {
              label: 'Doanh thu',
              value: `${(sellerStats.totalEarnings / 1000000).toFixed(0)}M`,
              icon: '💰',
            },
            { label: 'Điểm uy tín', value: sellerStats.trustScore, icon: '⭐' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 flex-wrap">
        {[
          { key: 'overview', label: '📊 Tổng quan' },
          { key: 'listings', label: '📋 Quản lý tin đăng' },
          { key: 'orders', label: '💳 Đơn hàng & Cọc' },
          { key: 'reviews', label: '⭐ Đánh giá' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.key
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Quản lý tin đăng ({listings.length})</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
              + Đăng tin mới
            </button>
          </div>

          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex gap-4">
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{listing.name}</h3>
                      <p className="text-sm text-gray-600">Đăng ngày: {listing.createdDate}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-bold ${listing.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : listing.status === 'pending_inspection'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {listing.status === 'active'
                        ? '✓ Đang bán'
                        : listing.status === 'pending_inspection'
                          ? '⏳ Chờ kiểm định'
                          : '✓ Đã bán'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Giá bán</p>
                      <p className="font-bold">{(listing.price / 1000000).toFixed(0)}M</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Lượt xem</p>
                      <p className="font-bold">{listing.views}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quan tâm</p>
                      <p className="font-bold">{listing.interests}</p>
                    </div>
                  </div>

                  {listing.inspectionStatus === 'pending' && (
                    <div className="bg-yellow-50 p-2 rounded text-sm text-yellow-900 mb-2">
                      <strong>⚠️ Chờ kiểm định:</strong> Yêu cầu kiểm định để có thể nhận cọc
                    </div>
                  )}

                  {listing.inspectionStatus === 'passed' && (
                    <div className="bg-green-50 p-2 rounded text-sm text-green-900 mb-2">
                      <strong>✓ Đã kiểm định:</strong> Hạn hữu hiệu đến {listing.inspectionExpiry}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:underline text-sm font-medium">
                      Chỉnh sửa
                    </button>
                    {listing.status === 'pending_inspection' && (
                      <button className="text-orange-600 hover:underline text-sm font-medium">
                        Yêu cầu kiểm định
                      </button>
                    )}
                    {listing.status === 'active' && (
                      <button className="text-red-600 hover:underline text-sm font-medium">
                        Ẩn tin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Quản lý đơn hàng & Tiền cọc</h2>

          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{order.bikeName}</h3>
                  <p className="text-sm text-gray-600">Người mua: {order.buyer}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-bold ${order.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {order.status === 'confirmed' ? '✓ Xác nhận' : '⏳ Chờ xác nhận'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-600">Tiền cọc</p>
                  <p className="font-bold text-blue-600">
                    {(order.depositAmount / 1000000).toFixed(0)}M
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Giá bán</p>
                  <p className="font-bold">{(order.totalPrice / 1000000).toFixed(0)}M</p>
                </div>
                <div>
                  <p className="text-gray-600">Dự kiến giao</p>
                  <p className="font-bold">{order.expectedDeliveryDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trạng thái cọc</p>
                  <p className="font-bold text-green-600">🔒 Ký quỹ</p>
                </div>
              </div>

              <div className="bg-blue-50 p-2 rounded text-sm text-blue-900 mb-3">
                <strong>💼 Thanh toán:</strong> Tiền cọc được giữ an toàn bởi hệ thống. Sẽ được giải
                ngân sau khi người mua xác nhận nhận xe.
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                  💬 Nhắn tin người mua
                </button>
                <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 font-medium">
                  Cập nhật trạng thái giao hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Đánh giá & Uy tín ({reviews.length} đánh giá)</h2>

          <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm">Đánh giá trung bình</p>
                <p className="text-3xl font-bold text-yellow-500">⭐ {sellerStats.trustScore}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tổng đánh giá</p>
                <p className="text-3xl font-bold text-gray-900">{sellerStats.totalReviews}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tỷ lệ hài lòng</p>
                <p className="text-3xl font-bold text-green-600">98%</p>
              </div>
            </div>
          </div>

          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">{review.buyer}</h4>
                  <p className="text-xs text-gray-600">{review.date}</p>
                </div>
                <span className="text-yellow-500 font-bold">{'⭐'.repeat(review.rating)}</span>
              </div>
              <p className="text-gray-700 mb-2">{review.text}</p>
              <p className="text-xs text-gray-600">Sản phẩm: {review.bikeId}</p>
            </div>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-3">
              {[
                '📋 Đăng tin mới: Giant XTC SLR 29 (ngày hôm nay)',
                '✓ Tin đăng: Trek Domane SLR 7 vượt kiểm định',
                '💳 Nhận cọc: 5M từ Nguyễn Văn A',
                '⭐ Nhận đánh giá 5 sao từ Trần Minh B',
              ].map((activity, idx) => (
                <p key={idx} className="text-gray-700 text-sm">
                  {activity}
                </p>
              ))}
            </div>
          </div>

          {/* Need Attention */}
          <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <h2 className="text-lg font-bold text-yellow-900 mb-4">⚠️ Cần chú ý</h2>
            <ul className="space-y-2 text-yellow-900 text-sm">
              <li>🔔 Tin đăng "Trek Domane SLR 7" đang chờ kiểm định</li>
              <li>📅 Tin đăng "Specialized Tarmac SL7" sắp hết hạn kiểm định (5 ngày)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
