import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Input, Pagination } from '../../components/ui';
import { toast } from 'react-toastify';
import bicycleApi from '../../api/postNewsApi';
import paymentApi from '../../api/paymentApi';
import transactionApi from '../../api/transactionApi';
import { useAuth } from '../../contexts/AuthContext';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bicycleIdInput, setBicycleIdInput] = useState('');
  const [bicycleDetail, setBicycleDetail] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  const statusLabelMap = {
    pending_payment: 'Chờ thanh toán',
    payment_received: 'Đã nhận thanh toán',
    held_in_escrow: 'Giữ tiền escrow',
    awaiting_delivery: 'Chờ giao hàng',
    delivered: 'Đã giao',
    completed: 'Hoàn tất',
    refunded: 'Đã hoàn tiền',
    disputed: 'Đang tranh chấp',
    cancelled: 'Đã hủy',
  };

  const statusBadgeVariant = (status) => {
    const normalized = (status || '').toLowerCase();
    if (['completed', 'delivered', 'payment_received'].includes(normalized)) return 'success';
    if (['pending_payment', 'held_in_escrow', 'awaiting_delivery'].includes(normalized))
      return 'warning';
    if (['refunded', 'disputed', 'cancelled', 'canceled'].includes(normalized)) return 'danger';
    return 'primary';
  };

  const pollPaymentStatus = async (txId) => {
    const MAX_ATTEMPTS = 6;
    const DELAY_MS = 3000;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      try {
        const res = await paymentApi.getPaymentStatus(txId);
        const rawStatus =
          res?.data?.data?.status || res?.data?.status || res?.data?.data?.paymentStatus;
        const status = (rawStatus || '').toLowerCase();
        if (
          ['paid', 'success', 'completed', 'payment_received', 'held_in_escrow'].includes(status)
        ) {
          return 'paid';
        }
        if (['failed', 'cancelled', 'canceled', 'payment_failed'].includes(status)) {
          return 'failed';
        }
      } catch (err) {
        console.error('Poll payment status error:', err);
      }
    }
    return 'pending';
  };

  const fetchMyTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const res = await transactionApi.getMyTransactions({ role: 'buyer' });
      const data = res?.data?.data || res?.data || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch transactions error:', err);
      toast.error(err.response?.data?.message || 'Không tải được danh sách giao dịch');
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchMyTransactions();
  }, []);

  const handleLoadBicycle = async () => {
    try {
      if (!bicycleIdInput.trim()) {
        toast.error('Vui lòng nhập bicycleId');
        return;
      }
      const res = await bicycleApi.getBicycleById(bicycleIdInput.trim());
      const bike = res?.data?.data || res?.data;
      if (!bike) {
        toast.error('Không tìm thấy xe');
        return;
      }
      setBicycleDetail(bike);
      toast.success('Đã tải thông tin xe');
    } catch (err) {
      console.error('Load bicycle error:', err);
      toast.error(err.response?.data?.message || 'Không tải được thông tin xe');
    }
  };

  const handleCheckout = async () => {
    try {
      if (!bicycleDetail) {
        toast.error('Vui lòng tải thông tin xe trước');
        return;
      }
      const bikeId = bicycleDetail?._id || bicycleDetail?.id;
      const amount = Number(bicycleDetail?.price || 0);
      if (!bikeId) {
        toast.error('Thiếu bicycleId');
        return;
      }
      if (!amount || amount <= 0) {
        toast.error('Giá xe không hợp lệ');
        return;
      }

      setLoadingCheckout(true);
      setPaymentStatus('');
      setPaymentUrl('');
      setTransactionId('');

      const transactionPayload = {
        bicycleId: bikeId,
        amount,
        type: 'full_payment',
        paymentMethod: 'e_wallet',
      };

      const txRes = await transactionApi.create(transactionPayload);
      const txData = txRes?.data?.data || txRes?.data;
      const txId = txData?._id || txData?.id || txData?.transactionId;
      if (!txId) {
        throw new Error('Không lấy được transactionId');
      }
      setTransactionId(txId);
      if (txId) localStorage.setItem('pendingTransactionId', txId);

      const zaloRes = await paymentApi.createZaloPayOrder(txId);
      const zaloData = zaloRes?.data?.data || zaloRes?.data;
      const payUrl = zaloData?.orderUrl || zaloData?.payUrl || zaloData?.deeplink;
      if (!payUrl) {
        throw new Error('Không lấy được link thanh toán');
      }
      setPaymentUrl(payUrl);
      window.open(payUrl, '_blank', 'noopener');

      const status = await pollPaymentStatus(txId);
      setPaymentStatus(status);
      if (status === 'paid') {
        toast.success('Thanh toán thành công');
      } else if (status === 'failed') {
        toast.error('Thanh toán thất bại hoặc bị hủy');
      } else {
        toast.info('Thanh toán đang chờ xác nhận');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || err.message || 'Không tạo được giao dịch');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');
  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '--';

  const goToTransaction = (id) => {
    if (!id) return;
    navigate(`/buyer/transactions/${id}`);
  };

  const inProgressStatuses = [
    'pending_payment',
    'payment_received',
    'held_in_escrow',
    'awaiting_delivery',
  ];
  const successStatuses = ['delivered', 'completed'];
  const failedStatuses = ['refunded', 'disputed', 'cancelled', 'canceled'];

  const computedFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const displayName = user?.fullName || computedFullName || user?.email || 'bạn';

  const filteredTransactions = transactions.filter((tx) => {
    const status = (tx?.status || '').toLowerCase();
    const type = (tx?.type || '').toLowerCase();
    const matchStatus = filterStatus === 'all' || status === filterStatus;
    const matchType = filterType === 'all' || type === filterType;
    return matchStatus && matchType;
  });

  const totalOrders = transactions.length;
  const inProgressOrders = transactions.filter((tx) =>
    inProgressStatuses.includes((tx?.status || '').toLowerCase())
  ).length;
  const completedOrders = transactions.filter((tx) =>
    successStatuses.includes((tx?.status || '').toLowerCase())
  ).length;
  const failedOrders = transactions.filter((tx) =>
    failedStatuses.includes((tx?.status || '').toLowerCase())
  ).length;

  const stats = [
    { label: 'Đơn hàng', value: totalOrders },
    { label: 'Đang xử lý', value: inProgressOrders },
    { label: 'Hoàn tất', value: completedOrders },
    { label: 'Hoàn / Huỷ', value: failedOrders },
  ];

  const ordersTotalPages = Math.ceil(filteredTransactions.length / ORDERS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (ordersPage - 1) * ORDERS_PER_PAGE,
    ordersPage * ORDERS_PER_PAGE
  );
  const recentOrders = paginatedTransactions.map((tx) => ({
    id: tx?._id || tx?.id,
    bike: tx?.bicycleId?.title || 'Xe đạp',
    status: statusLabelMap[tx?.status] || tx?.status || '--',
    rawStatus: tx?.status,
    price: tx?.amount,
    date: formatDate(tx?.createdAt),
  }));

  const statIcons = [
    <path
      key={0}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />,
    <path key={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
    <path key={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    <path key={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  ];

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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Greeting */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: 'var(--lux-gold)' }}
                >
                  Bảng điều khiển người mua
                </span>
              </div>
              <h1
                className="text-3xl lg:text-4xl font-bold mb-2 leading-tight"
                style={{ color: 'white', fontFamily: "'Playfair Display', serif" }}
              >
                Xin chào, <span style={{ color: 'var(--lux-gold)' }}>{displayName}</span>!
              </h1>
              <p className="text-sm max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Chào mừng bạn quay trở lại. Theo dõi đơn hàng và tìm kiếm chiếc xe đạp ưng ý tiếp
                theo của bạn.
              </p>
            </div>

            {/* Inline stat pills */}
            <div className="flex flex-wrap gap-3">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: 'var(--lux-gold)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {statIcons[i]}
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-none" style={{ color: 'white' }}>
                      {stat.value}
                    </p>
                    <p
                      className="text-xs mt-0.5 uppercase tracking-wide"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom edge fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(198,167,94,0.3), transparent)',
          }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="container-custom py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Transactions Panel (3/5) ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Filter bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 rounded-2xl"
              style={{ backgroundColor: 'white', border: '1px solid var(--lux-gray-200)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: 'var(--lux-gold)' }}
                />
                <h2 className="text-base font-bold" style={{ color: 'var(--lux-primary-900)' }}>
                  Giao dịch gần đây
                </h2>
                {filteredTransactions.length > 0 && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
                    style={{
                      backgroundColor: 'var(--lux-gray-100)',
                      color: 'var(--lux-gray-600)',
                    }}
                  >
                    {filteredTransactions.length}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setOrdersPage(1);
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl focus:outline-none"
                  style={{
                    border: '1.5px solid var(--lux-gray-200)',
                    color: 'var(--lux-gray-700)',
                    backgroundColor: 'var(--lux-gray-50)',
                  }}
                >
                  <option value="all">Tất cả loại</option>
                  <option value="full_payment">Thanh toán đủ</option>
                  <option value="deposit">Đặt cọc</option>
                  <option value="refund">Hoàn tiền</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setOrdersPage(1);
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl focus:outline-none"
                  style={{
                    border: '1.5px solid var(--lux-gray-200)',
                    color: 'var(--lux-gray-700)',
                    backgroundColor: 'var(--lux-gray-50)',
                  }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending_payment">Chờ thanh toán</option>
                  <option value="held_in_escrow">Đang giữ escrow</option>
                  <option value="awaiting_delivery">Chờ giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="refunded">Đã hoàn tiền</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Transaction list */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'white', border: '1px solid var(--lux-gray-200)' }}
            >
              {loadingTransactions ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div
                    className="w-10 h-10 rounded-full border-4 animate-spin mb-4"
                    style={{
                      borderColor: 'var(--lux-gray-200)',
                      borderTopColor: 'var(--lux-primary-800)',
                    }}
                  />
                  <p className="text-sm" style={{ color: 'var(--lux-gray-400)' }}>
                    Đang tải dữ liệu...
                  </p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'var(--lux-gray-100)' }}
                  >
                    <svg
                      className="w-7 h-7"
                      style={{ color: 'var(--lux-gray-400)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium mb-4" style={{ color: 'var(--lux-gray-500)' }}>
                    Chưa có giao dịch nào
                  </p>
                  <Button
                    className="shadow-soft"
                    style={{
                      backgroundColor: 'var(--lux-primary-800)',
                      color: 'white',
                      border: 'none',
                    }}
                    onClick={() => navigate('/market')}
                  >
                    Khám phá xe ngay
                  </Button>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div
                    className="grid grid-cols-12 px-6 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: 'var(--lux-gray-400)',
                      borderBottom: '1px solid var(--lux-gray-100)',
                      backgroundColor: 'var(--lux-gray-50)',
                    }}
                  >
                    <span className="col-span-5">Sản phẩm</span>
                    <span className="col-span-2 text-center">Ngày</span>
                    <span className="col-span-2 text-center">Mã GD</span>
                    <span className="col-span-2 text-right">Số tiền</span>
                    <span className="col-span-1"></span>
                  </div>

                  {recentOrders.map((order, idx) => (
                    <div
                      key={order.id}
                      className="group grid grid-cols-12 items-center px-6 py-4 cursor-pointer transition-colors duration-150"
                      style={{
                        borderBottom:
                          idx < recentOrders.length - 1 ? '1px solid var(--lux-gray-100)' : 'none',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = 'var(--lux-gray-50)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => goToTransaction(order.id)}
                    >
                      {/* Product */}
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'var(--lux-gray-100)' }}
                        >
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
                              strokeWidth={1.5}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: 'var(--lux-primary-900)' }}
                          >
                            {order.bike}
                          </p>
                          <Badge variant={statusBadgeVariant(order.rawStatus)} className="mt-0.5">
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-center">
                        <p className="text-xs" style={{ color: 'var(--lux-gray-500)' }}>
                          {order.date}
                        </p>
                      </div>

                      {/* ID */}
                      <div className="col-span-2 text-center">
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded-lg"
                          style={{
                            backgroundColor: 'var(--lux-gray-100)',
                            color: 'var(--lux-gray-500)',
                          }}
                        >
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 text-right">
                        <p
                          className="text-sm font-bold"
                          style={{ color: 'var(--lux-primary-800)' }}
                        >
                          {formatCurrency(order.price)} ₫
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="col-span-1 flex justify-end">
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                          style={{ color: 'var(--lux-gray-300)' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Pagination footer */}
              {recentOrders.length > 0 && (
                <div
                  className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
                  style={{
                    borderTop: '1px solid var(--lux-gray-100)',
                    backgroundColor: 'var(--lux-gray-50)',
                  }}
                >
                  {ordersTotalPages > 1 ? (
                    <>
                      <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                        Trang {ordersPage}/{ordersTotalPages} · Tổng {filteredTransactions.length}{' '}
                        giao dịch
                      </p>
                      <Pagination
                        currentPage={ordersPage}
                        totalPages={ordersTotalPages}
                        onPageChange={(p) => setOrdersPage(p)}
                      />
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                      {filteredTransactions.length} giao dịch
                    </p>
                  )}
                  <button
                    onClick={() => navigate('/buyer/transactions')}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: 'var(--lux-primary-700)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--lux-primary-900)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--lux-primary-700)')}
                  >
                    Xem toàn bộ lịch sử →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar (2/5) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Activity Summary */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--lux-gray-200)' }}
            >
              <div
                className="px-6 py-5 relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 100%)',
                }}
              >
                <div
                  className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 pointer-events-none"
                  style={{ backgroundColor: 'var(--lux-gold)' }}
                />
                <h3 className="text-sm font-bold relative z-10 mb-0.5" style={{ color: 'white' }}>
                  Tóm tắt hoạt động
                </h3>
                <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Tổng quan trạng thái đơn hàng
                </p>
              </div>

              <div className="p-5 space-y-2" style={{ backgroundColor: 'white' }}>
                {/* Pending */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-default"
                  style={{
                    backgroundColor: 'var(--lux-gray-50)',
                    border: '1px solid var(--lux-gray-100)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--lux-gray-100)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--lux-gray-50)')
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#3b82f6' }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                      Chờ thanh toán
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: 'white',
                      color: 'var(--lux-primary-900)',
                      border: '1px solid var(--lux-gray-200)',
                    }}
                  >
                    {
                      transactions.filter((t) =>
                        ['pending_payment', 'awaiting_payment'].includes(t?.status?.toLowerCase())
                      ).length
                    }
                  </span>
                </div>

                {/* In Progress */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-default"
                  style={{
                    backgroundColor: 'rgba(198,167,94,0.07)',
                    border: '1px solid rgba(198,167,94,0.2)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(198,167,94,0.12)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(198,167,94,0.07)')
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--lux-gold)' }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                      Đang xử lý
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: 'white',
                      color: 'var(--lux-primary-900)',
                      border: '1px solid rgba(198,167,94,0.25)',
                    }}
                  >
                    {inProgressOrders}
                  </span>
                </div>

                {/* Completed */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors cursor-default"
                  style={{
                    backgroundColor: 'rgba(5,150,105,0.06)',
                    border: '1px solid rgba(5,150,105,0.15)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(5,150,105,0.1)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(5,150,105,0.06)')
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--lux-primary-500)' }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                      Hoàn thành
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: 'white',
                      color: 'var(--lux-primary-900)',
                      border: '1px solid rgba(5,150,105,0.2)',
                    }}
                  >
                    {completedOrders}
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="px-5 pb-5" style={{ backgroundColor: 'white' }}>
                <div className="pt-4 mb-4" style={{ borderTop: '1px solid var(--lux-gray-100)' }}>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--lux-gray-400)' }}
                  >
                    Hành động nhanh
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        border: '1.5px solid var(--lux-gray-200)',
                        color: 'var(--lux-gray-700)',
                        backgroundColor: 'var(--lux-gray-50)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--lux-primary-800)';
                        e.currentTarget.style.color = 'var(--lux-primary-800)';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
                        e.currentTarget.style.color = 'var(--lux-gray-700)';
                        e.currentTarget.style.backgroundColor = 'var(--lux-gray-50)';
                      }}
                      onClick={() => navigate('/market')}
                    >
                      🛒 Mua xe
                    </button>
                    <button
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        border: '1.5px solid var(--lux-gray-200)',
                        color: 'var(--lux-gray-700)',
                        backgroundColor: 'var(--lux-gray-50)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--lux-primary-800)';
                        e.currentTarget.style.color = 'var(--lux-primary-800)';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
                        e.currentTarget.style.color = 'var(--lux-gray-700)';
                        e.currentTarget.style.backgroundColor = 'var(--lux-gray-50)';
                      }}
                      onClick={() => navigate('/buyer/profile')}
                    >
                      👤 Hồ sơ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Banner */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden group"
              style={{
                background:
                  'linear-gradient(135deg, var(--lux-primary-800) 0%, var(--lux-primary-900) 100%)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, var(--lux-gold) 0%, transparent 70%)',
                  transform: 'translate(30%, -30%)',
                }}
              />
              {/* Decorative icon */}
              <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none transform rotate-12 group-hover:rotate-6 transition-transform duration-500">
                <svg
                  className="w-20 h-20"
                  style={{ color: 'white' }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4 4s4-1.79 4-4c0-.88-.36-1.68-.93-2.25z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ backgroundColor: 'rgba(198,167,94,0.2)', color: 'var(--lux-gold)' }}
                >
                  Hỗ trợ 24/7
                </div>
                <h3
                  className="text-lg font-bold mb-2 leading-snug"
                  style={{ color: 'white', fontFamily: "'Playfair Display', serif" }}
                >
                  Cần hỗ trợ?
                </h3>
                <p
                  className="text-xs leading-relaxed mb-5"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn trong mọi giao dịch.
                </p>
                <Button
                  size="sm"
                  className="font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--lux-primary-800)',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  }}
                >
                  Liên hệ ngay →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
