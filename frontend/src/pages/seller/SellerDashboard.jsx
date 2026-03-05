import React, { useState } from 'react';
import { Button } from '../../components/ui';

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
    <div className="dash-content">
      <div className="page-header">
        <h1>Bảng điều khiển người bán</h1>
        <p>Quản lý tin đăng, đơn hàng và uy tín của bạn</p>
      </div>

      {/* Stats Cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Tin đang bán', value: sellerStats.activeListings, icon: '' },
            { label: 'Đã bán', value: sellerStats.soldListings, icon: '' },
            {
              label: 'Doanh thu',
              value: `${(sellerStats.totalEarnings / 1000000).toFixed(0)}M`,
              icon: '',
            },
            { label: 'Điểm uy tín', value: sellerStats.trustScore, icon: '' },
          ].map((stat, idx) => (
            <div key={idx} className="lux-panel">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <p className="text-warmgray-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-10 border-b border-warmgray-200/60 flex-wrap">
        {[
          { key: 'overview', label: ' Tổng quan' },
          { key: 'listings', label: ' Quản lý tin đăng' },
          { key: 'orders', label: ' Đơn hàng & Cọc' },
          { key: 'reviews', label: ' Đánh giá' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-gold border-gold'
                : 'text-warmgray-500 border-transparent hover:text-primary-900 hover:border-warmgray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-display text-primary-900">
              Quản lý tin đăng ({listings.length})
            </h2>
            <button className="bg-primary-700 text-white px-5 py-2.5 rounded-full hover:bg-primary-800 font-medium text-sm transition-colors">
              + Đăng tin mới
            </button>
          </div>

          {listings.map((listing) => (
            <div key={listing.id} className="lux-panel">
              <div className="flex gap-5">
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-24 h-24 rounded-[16px] object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-primary-900">{listing.name}</h3>
                      <p className="text-sm text-warmgray-600">Đăng ngày: {listing.createdDate}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-bold ${
                        listing.status === 'active'
                          ? 'bg-success/10 text-green-800'
                          : listing.status === 'pending_inspection'
                            ? 'bg-gold/10 text-yellow-800'
                            : 'bg-warmgray-100 text-warmgray-800'
                      }`}
                    >
                      {listing.status === 'active'
                        ? ' Đang bán'
                        : listing.status === 'pending_inspection'
                          ? ' Chờ kiểm định'
                          : ' Đã bán'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-warmgray-600">Giá bán</p>
                      <p className="font-bold">{(listing.price / 1000000).toFixed(0)}M</p>
                    </div>
                    <div>
                      <p className="text-warmgray-600">Lượt xem</p>
                      <p className="font-bold">{listing.views}</p>
                    </div>
                    <div>
                      <p className="text-warmgray-600">Quan tâm</p>
                      <p className="font-bold">{listing.interests}</p>
                    </div>
                  </div>

                  {listing.inspectionStatus === 'pending' && (
                    <div className="bg-gold/5 p-2 rounded text-sm text-yellow-900 mb-2">
                      <strong> Chờ kiểm định:</strong> Yêu cầu kiểm định để có thể nhận cọc
                    </div>
                  )}

                  {listing.inspectionStatus === 'passed' && (
                    <div className="bg-success/5 p-2 rounded text-sm text-green-900 mb-2">
                      <strong> Đã kiểm định:</strong> Hạn hữu hiệu đến {listing.inspectionExpiry}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="text-primary-700 hover:underline text-sm font-medium">
                      Chỉnh sửa
                    </Button>
                    {listing.status === 'pending_inspection' && (
                      <Button className="text-gold hover:underline text-sm font-medium">
                        Yêu cầu kiểm định
                      </Button>
                    )}
                    {listing.status === 'active' && (
                      <Button className="text-danger hover:underline text-sm font-medium">
                        Ẩn tin
                      </Button>
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
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-primary-900 mb-4">
            Quản lý đơn hàng & Tiền cọc
          </h2>

          {orders.map((order) => (
            <div key={order.id} className="lux-panel">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-primary-900">{order.bikeName}</h3>
                  <p className="text-sm text-warmgray-600">Người mua: {order.buyer}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-bold ${
                    order.status === 'confirmed'
                      ? 'bg-success/10 text-green-800'
                      : 'bg-gold/10 text-yellow-800'
                  }`}
                >
                  {order.status === 'confirmed' ? ' Xác nhận' : 'Chờ xác nhận'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-warmgray-600">Tiền cọc</p>
                  <p className="font-bold text-primary-700">
                    {(order.depositAmount / 1000000).toFixed(0)}M
                  </p>
                </div>
                <div>
                  <p className="text-warmgray-600">Giá bán</p>
                  <p className="font-bold">{(order.totalPrice / 1000000).toFixed(0)}M</p>
                </div>
                <div>
                  <p className="text-warmgray-600">Dự kiến giao</p>
                  <p className="font-bold">{order.expectedDeliveryDate}</p>
                </div>
                <div>
                  <p className="text-warmgray-600">Trạng thái cọc</p>
                  <p className="font-bold text-success">Ký quỹ</p>
                </div>
              </div>

              <div className="bg-primary-800/5 p-2 rounded text-sm text-primary-900 mb-3">
                <strong> Thanh toán:</strong> Tiền cọc được giữ an toàn bởi hệ thống. Sẽ được giải
                ngân sau khi người mua xác nhận nhận xe.
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-primary-700 text-white py-2.5 rounded-full hover:bg-primary-800 font-medium text-sm transition-colors">
                  Nhắn tin người mua
                </button>
                <button className="flex-1 border border-warmgray-200 py-2.5 rounded-full hover:bg-warmgray-50 font-medium text-sm transition-colors">
                  Cập nhật trạng thái giao hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-primary-900 mb-4">
            Đánh giá & Uy tín ({reviews.length} đánh giá)
          </h2>

          <div className="lux-panel !p-8 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-warmgray-600 text-sm">Đánh giá trung bình</p>
                <p className="text-3xl font-bold text-gold">{sellerStats.trustScore}</p>
              </div>
              <div>
                <p className="text-warmgray-600 text-sm">Tổng đánh giá</p>
                <p className="text-3xl font-bold text-primary-900">{sellerStats.totalReviews}</p>
              </div>
              <div>
                <p className="text-warmgray-600 text-sm">Tỷ lệ hài lòng</p>
                <p className="text-3xl font-bold text-success">98%</p>
              </div>
            </div>
          </div>

          {reviews.map((review) => (
            <div key={review.id} className="lux-panel">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-primary-900">{review.buyer}</h4>
                  <p className="text-xs text-warmgray-600">{review.date}</p>
                </div>
                <span className="text-gold font-bold">{'⭐'.repeat(review.rating)}</span>
              </div>
              <p className="text-warmgray-700 mb-2">{review.text}</p>
              <p className="text-xs text-warmgray-600">Sản phẩm: {review.bikeId}</p>
            </div>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Recent Activities */}
          <div className="lux-panel">
            <h2 className="text-lg font-bold font-display text-primary-900 mb-6">
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              {[
                ' Đăng tin mới: Giant XTC SLR 29 (ngày hôm nay)',
                ' Tin đăng: Trek Domane SLR 7 vượt kiểm định',
                ' Nhận cọc: 5M từ Nguyễn Văn A',
                ' Nhận đánh giá 5 sao từ Trần Minh B',
              ].map((activity, idx) => (
                <p key={idx} className="text-warmgray-700 text-sm">
                  {activity}
                </p>
              ))}
            </div>
          </div>

          {/* Need Attention */}
          <div className="bg-gold/5 backdrop-blur-sm rounded-[20px] shadow-soft p-8 border border-gold/20">
            <h2 className="text-lg font-bold font-display text-yellow-900 mb-6"> Cần chú ý</h2>
            <ul className="space-y-3 text-yellow-900 text-sm">
              <li> Tin đăng "Trek Domane SLR 7" đang chờ kiểm định</li>
              <li> Tin đăng "Specialized Tarmac SL7" sắp hết hạn kiểm định (5 ngày)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
