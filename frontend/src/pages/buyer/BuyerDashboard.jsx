import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Input } from '../../components/ui';
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

  const recentOrders = transactions.slice(0, 5).map((tx) => ({
    id: tx?._id || tx?.id,
    bike: tx?.bicycleId?.title || 'Xe đạp',
    status: statusLabelMap[tx?.status] || tx?.status || '--',
    rawStatus: tx?.status,
    price: tx?.amount,
    date: formatDate(tx?.createdAt),
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Decorative Background - Made lighter to ensure text contrast if using dark text, or adjust if using light text */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden z-0 rounded-b-[3rem] shadow-sm border-b border-indigo-100">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/40 rounded-full blur-3xl"></div>
        <div className="absolute top-10 -left-20 w-72 h-72 bg-white/40 rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10 pt-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2 opacity-90 text-slate-600">
              <div className="p-1.5 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm">
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
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="font-bold tracking-wide text-sm uppercase">
                Bảng điều khiển người mua
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-slate-900">
              Xin chào, <span className="text-themePrimary">{displayName}</span>!
            </h1>
            <p className="text-slate-600 text-lg font-medium max-w-xl">
              Chào mừng bạn quay trở lại. Theo dõi đơn hàng và tìm kiếm chiếc xe đạp ưng ý tiếp theo
              của bạn.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <svg
                  className="w-24 h-24 text-themePrimary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {index === 0 && (
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  )}
                  {index === 1 && <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
                  {index === 2 && (
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  )}
                  {index === 3 && <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>

              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                      index === 0
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : index === 1
                          ? 'bg-gradient-to-br from-orange-400 to-orange-500'
                          : index === 2
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                            : 'bg-gradient-to-br from-rose-500 to-rose-600'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {index === 0 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      )}
                      {index === 1 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                      {index === 2 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                      {index === 3 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                    </svg>
                  </div>
                  {/* Decorative dot */}
                  <div
                    className={`w-2 h-2 rounded-full ${
                      index === 0
                        ? 'bg-blue-400'
                        : index === 1
                          ? 'bg-orange-400'
                          : index === 2
                            ? 'bg-emerald-400'
                            : 'bg-rose-400'
                    }`}
                  ></div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column - Recent Orders */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-lg bg-white overflow-hidden rounded-2xl">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white text-slate-800">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-2 h-6 bg-themePrimary rounded-full inline-block"></span>
                    Giao dịch gần đây
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 ml-4">
                    Danh sách các đơn hàng mới nhất của bạn
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/buyer/transactions')}
                  className="text-themePrimary hover:bg-themePrimary/5"
                >
                  Xem tất cả →
                </Button>
              </div>

              <div className="p-0">
                {loadingTransactions ? (
                  <div className="p-8 text-center">
                    <div className="w-10 h-10 border-4 border-themePrimary/30 border-t-themePrimary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Đang tải dữ liệu...</p>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50/50">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">Chưa có giao dịch nào</p>
                    <Button
                      className="mt-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                      onClick={() => navigate('/market')}
                    >
                      Khám phá xe ngay
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="group hover:bg-slate-50/80 transition-colors duration-200 cursor-pointer p-5 flex items-center gap-4"
                        onClick={() => goToTransaction(order.id)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-md transition-all">
                          <svg
                            className="w-6 h-6"
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

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-slate-800 text-base truncate pr-2 group-hover:text-themePrimary transition-colors">
                              {order.bike}
                            </h4>
                            <span className="font-bold text-themePrimary whitespace-nowrap">
                              {formatCurrency(order.price)} ₫
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center text-slate-400 gap-3">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {order.date}
                              </span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span className="font-mono text-xs opacity-70">
                                #{order.id.slice(-6).toUpperCase()}
                              </span>
                            </div>

                            <Badge
                              variant={statusBadgeVariant(order.rawStatus)}
                              className="shadow-sm"
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="ml-2 text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-themePrimary">
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {recentOrders.length > 0 && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => navigate('/buyer/transactions')}
                      className="text-sm font-medium text-slate-500 hover:text-themePrimary transition-colors"
                    >
                      Xem toàn bộ lịch sử giao dịch
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Side Column - Quick Status & Info */}
          <div className="space-y-6">
            {/* Payment / Activity Summary Card */}
            <Card className="bg-white rounded-2xl shadow-lg border-none overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 className="text-lg font-bold relative z-10">Tóm tắt hoạt động</h3>
                <p className="text-slate-300 text-sm relative z-10">
                  Tổng quan trạng thái đơn hàng
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-800 transition-colors hover:bg-blue-50 cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="font-medium">Chờ thanh toán</span>
                    </div>
                    <span className="font-bold bg-white px-2 py-0.5 rounded-md shadow-sm border border-blue-100">
                      {
                        transactions.filter((t) =>
                          ['pending_payment', 'awaiting_payment'].includes(t?.status?.toLowerCase())
                        ).length
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-orange-800 transition-colors hover:bg-orange-50 cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="font-medium">Đang xử lý</span>
                    </div>
                    <span className="font-bold bg-white px-2 py-0.5 rounded-md shadow-sm border border-orange-100">
                      {inProgressOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 transition-colors hover:bg-emerald-50 cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="font-medium">Hoàn thành</span>
                    </div>
                    <span className="font-bold bg-white px-2 py-0.5 rounded-md shadow-sm border border-emerald-100">
                      {completedOrders}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Hành động nhanh
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-center border-slate-200 hover:border-themePrimary hover:text-themePrimary transition-all"
                      onClick={() => navigate('/market')}
                    >
                      🛒 Mua xe
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-center border-slate-200 hover:border-themePrimary hover:text-themePrimary transition-all"
                      onClick={() => navigate('/buyer/profile')}
                    >
                      👤 Hồ sơ
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Support / Help Banner */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">Cần hỗ trợ?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn trong mọi giao dịch.
                </p>
                <Button
                  size="sm"
                  className="bg-white text-indigo-600 border-none hover:bg-indigo-50 shadow-md font-semibold"
                >
                  Liên hệ ngay
                </Button>
              </div>

              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute top-4 right-4 text-white/20 transform rotate-12">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4 4s4-1.79 4-4c0-.88-.36-1.68-.93-2.25z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
