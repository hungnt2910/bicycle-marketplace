import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import bicycleApi from '../../api/postNewsApi';
import transactionApi from '../../api/transactionApi';
import reviewApi from '../../api/reviewApi';
import walletApi from '../../api/walletApi';

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
const fmtM = (n) => `${((Number(n) || 0) / 1_000_000).toFixed(1)}M`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

const STATUS_LABEL = {
  active: 'Đang bán',
  sold: 'Đã bán',
  pending_review: 'Chờ duyệt',
  draft: 'Nháp',
  hidden: 'Đã ẩn',
  rejected: 'Bị từ chối',
};

const STATUS_CLASS = {
  active: 'bg-green-50 text-green-800',
  sold: 'bg-warmgray-100 text-warmgray-700',
  pending_review: 'bg-gold/10 text-yellow-800',
  draft: 'bg-blue-50 text-blue-700',
  hidden: 'bg-warmgray-100 text-warmgray-500',
  rejected: 'bg-red-50 text-red-700',
};

const TXN_STATUS_LABEL = {
  deposit_paid: 'Đã đặt cọc',
  confirmed: 'Đã xác nhận',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  pending: 'Chờ xử lý',
};

const TXN_STATUS_CLASS = {
  deposit_paid: 'bg-gold/10 text-yellow-800',
  confirmed: 'bg-green-50 text-green-800',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-green-100 text-green-900',
  completed: 'bg-green-100 text-green-900',
  cancelled: 'bg-red-50 text-red-700',
  pending: 'bg-gold/10 text-yellow-800',
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [bicycles, setBicycles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [walletSummary, setWalletSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem('user') || localStorage.getItem('userInfo');
        const userInfo = JSON.parse(stored || '{}');
        const sellerId = userInfo._id || userInfo.id || userInfo.userId;

        const [bikeRes, txnRes, revRes, walletRes] = await Promise.allSettled([
          bicycleApi.getMyBicycles(sellerId),
          transactionApi.getMyTransactions(),
          reviewApi.getSellerReviews(sellerId),
          walletApi.getSummary(),
        ]);

        if (bikeRes.status === 'fulfilled') {
          const data = bikeRes.value?.data || [];
          setBicycles(Array.isArray(data) ? data : []);
        }

        if (txnRes.status === 'fulfilled') {
          const raw = txnRes.value?.data?.data || txnRes.value?.data || [];
          const all = Array.isArray(raw) ? raw : [];
          // Lọc transaction mà user là seller
          const sellerTxns = all.filter((t) => {
            const tSellerId = t.sellerId?._id || t.sellerId;
            return tSellerId === sellerId;
          });
          setTransactions(sellerTxns);
        }

        if (revRes.status === 'fulfilled') {
          const data = revRes.value?.data;
          setReviews(Array.isArray(data) ? data : data?.data || []);
        }

        if (walletRes.status === 'fulfilled') {
          setWalletSummary(walletRes.value?.data || null);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Derived stats
  const activeListings = bicycles.filter((b) => b.status === 'active').length;
  const soldListings = bicycles.filter((b) => b.status === 'sold').length;
  // walletSummary.wallet.totalEarned là doanh thu từ bán hàng
  const totalEarnings = walletSummary?.wallet?.totalEarned ?? walletSummary?.wallet?.balance ?? 0;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '—';

  const WALLET_TYPE_LABEL = {
    escrow_release: 'Nhận tiền từ giao dịch',
    inspection_fee: 'Phí kiểm định',
    fee: 'Phí đăng tin',
    withdrawal: 'Rút tiền',
    deposit: 'Nạp tiền',
    refund: 'Hoàn tiền',
  };

  // Recent activity: dùng recentTransactions từ wallet nếu có, fallback sang bicycles/orders
  const walletTxns = walletSummary?.recentTransactions || [];
  const recentActivities = walletTxns.length > 0
    ? walletTxns.slice(0, 5).map((t) => ({
        text: `${WALLET_TYPE_LABEL[t.type] || t.type}${t.description ? ` — ${t.description}` : ''}: ${t.amount > 0 ? '+' : ''}${fmt(t.amount)} ₫`,
        date: t.createdAt,
        positive: t.amount > 0,
      }))
    : [
        ...bicycles.slice(0, 2).map((b) => ({
          text: `Tin đăng "${b.title}" — ${STATUS_LABEL[b.status] || b.status}`,
          date: b.createdAt,
          positive: true,
        })),
        ...transactions.slice(0, 2).map((t) => ({
          text: `Đơn hàng "${t.bicycleId?.title || 'xe đạp'}" — ${TXN_STATUS_LABEL[t.status] || t.status}`,
          date: t.createdAt,
          positive: true,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

  // Need attention: pending review or draft bikes
  const needAttention = bicycles.filter((b) =>
    ['pending_review', 'draft', 'rejected'].includes(b.status)
  );

  if (loading) {
    return (
      <div className="dash-content flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dash-content">
      <div className="page-header">
        <h1>Bảng điều khiển người bán</h1>
        <p>Quản lý tin đăng, đơn hàng và uy tín của bạn</p>
      </div>

      {/* Stats Cards — chỉ hiển thị ở overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Tin đang bán', value: activeListings },
            { label: 'Đã bán', value: soldListings },
            { label: 'Doanh thu', value: fmtM(totalEarnings) },
            { label: 'Điểm uy tín', value: avgRating },
          ].map((stat, idx) => (
            <div key={idx} className="lux-panel">
              <p className="text-warmgray-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-10 border-b border-warmgray-200/60 flex-wrap">
        {[
          { key: 'overview', label: 'Tổng quan' },
          { key: 'listings', label: 'Quản lý tin đăng' },
          { key: 'orders', label: 'Đơn hàng & Cọc' },
          { key: 'reviews', label: 'Đánh giá' },
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

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="lux-panel">
            <h2 className="text-lg font-bold font-display text-primary-900 mb-6">
              Hoạt động gần đây
            </h2>
            {recentActivities.length === 0 ? (
              <p className="text-warmgray-500 text-sm">Chưa có hoạt động nào.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <p className={a.positive ? 'text-warmgray-700' : 'text-rose-600'}>{a.text}</p>
                    <span className="text-warmgray-400 text-xs ml-4 shrink-0">
                      {fmtDate(a.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {needAttention.length > 0 && (
            <div className="bg-gold/5 rounded-[20px] shadow-soft p-8 border border-gold/20">
              <h2 className="text-lg font-bold font-display text-yellow-900 mb-4">Cần chú ý</h2>
              <ul className="space-y-2 text-yellow-900 text-sm">
                {needAttention.map((b) => (
                  <li key={b._id}>
                    Tin đăng "{b.title}" — {STATUS_LABEL[b.status] || b.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── LISTINGS TAB ── */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-display text-primary-900">
              Quản lý tin đăng ({bicycles.length})
            </h2>
            <button
              onClick={() => navigate('/seller/create-listing')}
              className="bg-primary-700 text-white px-5 py-2.5 rounded-full hover:bg-primary-800 font-medium text-sm transition-colors"
            >
              + Đăng tin mới
            </button>
          </div>

          {bicycles.length === 0 && (
            <div className="lux-panel text-center py-12 text-warmgray-500">
              Chưa có tin đăng nào.
            </div>
          )}

          {bicycles.map((bike) => {
            const mainImage =
              bike.media?.mainImage ||
              bike.media?.images?.[0] ||
              'https://via.placeholder.com/100';
            return (
              <div key={bike._id} className="lux-panel">
                <div className="flex gap-5">
                  <img
                    src={mainImage}
                    alt={bike.title}
                    className="w-24 h-24 rounded-[16px] object-cover shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-primary-900">{bike.title}</h3>
                        <p className="text-sm text-warmgray-600">
                          Đăng ngày: {fmtDate(bike.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold shrink-0 ml-3 ${
                          STATUS_CLASS[bike.status] || 'bg-warmgray-100 text-warmgray-600'
                        }`}
                      >
                        {STATUS_LABEL[bike.status] || bike.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-warmgray-600">Giá bán</p>
                        <p className="font-bold">{fmt(bike.price)} ₫</p>
                      </div>
                      <div>
                        <p className="text-warmgray-600">Thương hiệu</p>
                        <p className="font-bold">{bike.specifications?.brand || '—'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        className="text-primary-700 hover:underline text-sm font-medium"
                        onClick={() => navigate(`/seller/edit-listing/${bike._id}`)}
                      >
                        Chỉnh sửa
                      </Button>
                      {bike.status === 'active' && (
                        <Button className="text-danger hover:underline text-sm font-medium">
                          Ẩn tin
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-primary-900 mb-4">
            Quản lý đơn hàng & Tiền cọc ({transactions.length})
          </h2>

          {transactions.length === 0 && (
            <div className="lux-panel text-center py-12 text-warmgray-500">
              Chưa có đơn hàng nào.
            </div>
          )}

          {transactions.map((txn) => {
            const bikeName = txn.bicycleId?.title || 'Xe đạp';
            const buyerName =
              txn.buyerId?.firstName && txn.buyerId?.lastName
                ? `${txn.buyerId.firstName} ${txn.buyerId.lastName}`
                : txn.buyerId?.email || 'Người mua';

            return (
              <div key={txn._id} className="lux-panel">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-primary-900">{bikeName}</h3>
                    <p className="text-sm text-warmgray-600">Người mua: {buyerName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold shrink-0 ml-3 ${
                      TXN_STATUS_CLASS[txn.status] || 'bg-warmgray-100 text-warmgray-600'
                    }`}
                  >
                    {TXN_STATUS_LABEL[txn.status] || txn.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-warmgray-600">Tiền cọc</p>
                    <p className="font-bold text-primary-700">{fmt(txn.depositAmount)} ₫</p>
                  </div>
                  <div>
                    <p className="text-warmgray-600">Tổng giá</p>
                    <p className="font-bold">{fmt(txn.totalAmount || txn.totalPrice)} ₫</p>
                  </div>
                  <div>
                    <p className="text-warmgray-600">Ngày đặt cọc</p>
                    <p className="font-bold">{fmtDate(txn.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-warmgray-600">Dự kiến giao</p>
                    <p className="font-bold">{fmtDate(txn.expectedDeliveryDate)}</p>
                  </div>
                </div>

                {txn.escrowStatus === 'held' && (
                  <div className="bg-primary-800/5 p-2 rounded text-sm text-primary-900 mb-3">
                    Tiền cọc đang được giữ an toàn bởi hệ thống. Sẽ giải ngân sau khi người mua xác nhận nhận xe.
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => navigate('/seller/messages')}
                    className="flex-1 min-w-[140px] bg-primary-700 text-white py-2.5 rounded-full hover:bg-primary-800 font-medium text-sm transition-colors"
                  >
                    Nhắn tin người mua
                  </button>
                  {['confirmed', 'deposit_paid'].includes(txn.status) && (
                    <button
                      className="flex-1 min-w-[140px] border border-warmgray-200 py-2.5 rounded-full hover:bg-warmgray-50 font-medium text-sm transition-colors"
                      onClick={() => navigate(`/seller/orders`)}
                    >
                      Cập nhật giao hàng
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-primary-900 mb-4">
            Đánh giá & Uy tín ({reviews.length} đánh giá)
          </h2>

          <div className="lux-panel !p-8 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-warmgray-600 text-sm">Đánh giá trung bình</p>
                <p className="text-3xl font-bold text-gold">{avgRating}</p>
              </div>
              <div>
                <p className="text-warmgray-600 text-sm">Tổng đánh giá</p>
                <p className="text-3xl font-bold text-primary-900">{reviews.length}</p>
              </div>
              <div>
                <p className="text-warmgray-600 text-sm">Tỷ lệ hài lòng</p>
                <p className="text-3xl font-bold text-success">
                  {reviews.length > 0
                    ? `${Math.round(
                        (reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100
                      )}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {reviews.length === 0 && (
            <div className="lux-panel text-center py-12 text-warmgray-500">
              Chưa có đánh giá nào.
            </div>
          )}

          {reviews.map((review) => (
            <div key={review._id} className="lux-panel">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-primary-900">
                    {review.reviewerId?.firstName && review.reviewerId?.lastName
                      ? `${review.reviewerId.firstName} ${review.reviewerId.lastName}`
                      : 'Người mua'}
                  </h4>
                  <p className="text-xs text-warmgray-600">{fmtDate(review.createdAt)}</p>
                </div>
                <span className="text-gold font-bold text-sm">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              </div>
              {review.comment && (
                <p className="text-warmgray-700 text-sm mb-1">{review.comment}</p>
              )}
              {review.isVerifiedPurchase && (
                <span className="text-xs text-emerald-600 font-medium">✓ Đã mua hàng</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
