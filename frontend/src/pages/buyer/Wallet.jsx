import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import walletApi from '../../api/walletApi';
import paymentApi from '../../api/paymentApi';
import adminApi from '../../api/adminApi';
import { Badge, Button, Card, Input, Pagination, Select } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

const numberOrZero = (value) => Number(value || 0);

const Wallet = () => {
  const { role } = useAuth();
  const escrowRole = (role || '').toLowerCase() === 'seller' ? 'seller' : 'buyer';

  const [summary, setSummary] = useState(null);
  const [walletSummary, setWalletSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [toppingUp, setToppingUp] = useState(false);
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
  });
  const [minWithdraw, setMinWithdraw] = useState(100000);

  const availableBalance = useMemo(
    () =>
      numberOrZero(
        totals?.walletBalance ??
          summary?.balance ??
          walletSummary?.wallet?.balance ??
          (summary?.balance ?? summary?.currentBalance ?? 0) - (summary?.pendingBalance ?? 0)
      ),
    [summary, totals, walletSummary]
  );

  const escrowHold = useMemo(
    () =>
      numberOrZero(
        totals?.escrowHeld ??
          totals?.pendingBalance ??
          summary?.pendingBalance ??
          summary?.escrowHold
      ),
    [summary, totals]
  );

  const totalWithdrawn = useMemo(
    () =>
      numberOrZero(
        summary?.totalWithdrawn ||
          walletSummary?.wallet?.totalWithdrawn ||
          summary?.withdrawn ||
          summary?.totalPayout
      ),
    [summary, walletSummary]
  );

  const currency = summary?.currency || walletSummary?.wallet?.currency || 'VND';

  const fetchSummary = async () => {
    setLoadingSummary(true);
    setLoadingTx(true);
    try {
      const [walletRes, summaryRes, totalsRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getSummary(),
        walletApi.getTotals({ role: escrowRole }),
      ]);

      const walletData = walletRes?.data?.data || walletRes?.data || {};
      const summaryData = summaryRes?.data?.data || summaryRes?.data || {};
      const totalsData = totalsRes?.data?.data || totalsRes?.data || {};

      setSummary(walletData);
      setWalletSummary(summaryData);
      setTotals(totalsData);

      const txPayload =
        summaryData?.transactions || summaryData?.recentTransactions || summaryData?.items || [];
      const txList = Array.isArray(txPayload) ? txPayload : [];
      setTransactions(txList);
      setPagination({
        total: txList.length,
        pages: txList.length ? 1 : 0,
      });
      setPage(1);
    } catch (err) {
      console.error('Load wallet summary error:', err);
      toast.error(err?.response?.data?.message || 'Không lấy được số dư ví');
    } finally {
      setLoadingSummary(false);
      setLoadingTx(false);
    }
  };

  const fetchTransactions = async (pageParam = page, typeParam = filters.type) => {
    if (!walletApi.getTransactions) {
      setLoadingTx(false);
      return;
    }
    setLoadingTx(true);
    try {
      const res = await walletApi.getTransactions({
        type: typeParam || undefined,
        page: pageParam,
        limit,
      });
      const data = res?.data?.data || res?.data || {};
      const items = Array.isArray(data) ? data : data?.items || data?.transactions || [];
      setTransactions(items);
      const pg = res?.data?.pagination ||
        data?.pagination || {
          total: data?.total,
          pages: data?.pages,
          page: data?.page,
        };
      setPagination({
        total: pg.total || items.length,
        pages: pg.pages || Math.ceil((pg.total || items.length || limit) / limit),
      });
      setPage(pg.page || pageParam);
    } catch (err) {
      console.error('Load wallet transactions error:', err);
      toast.error(err?.response?.data?.message || 'Không lấy được lịch sử ví');
    } finally {
      setLoadingTx(false);
    }
  };

  const refreshAll = () => {
    fetchSummary();
    if (walletApi.getTransactions) {
      fetchTransactions(1);
    }
  };

  useEffect(() => {
    refreshAll();
    const fetchWalletSettings = async () => {
      try {
        const res = await adminApi.getSystemSettings();
        const settings = (res?.data?.data || res?.data || [])[0]?.name_value || [];
        const val = settings.find((i) => i.key === 'min_withdrawal_amount')?.value;
        if (val) setMinWithdraw(Number(val));
      } catch (error) {
        console.error('Error fetching wallet settings:', error);
      }
    };
    fetchWalletSettings();
  }, [escrowRole]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const statusMatch = filters.status
        ? (tx?.status || '').toLowerCase() === filters.status
        : true;
      return statusMatch;
    });
  }, [transactions, filters]);

  const handleTypeChange = (value) => {
    setFilters((prev) => ({ ...prev, type: value }));
    setPage(1);
    fetchTransactions(1, value);
  };

  const handleStatusChange = (value) => setFilters((prev) => ({ ...prev, status: value }));

  const handleWithdraw = async () => {
    const amountNumber = Number(withdrawForm.amount || 0);
    if (!amountNumber || amountNumber <= 0) {
      toast.error('Số tiền rút không hợp lệ');
      return;
    }
    if (amountNumber < minWithdraw) {
      toast.error(`Số tiền tối thiểu là ${minWithdraw.toLocaleString('vi-VN')} ${currency}`);
      return;
    }
    if (amountNumber > availableBalance) {
      toast.error('Số dư không đủ để rút');
      return;
    }
    if (!withdrawForm.bankName || !withdrawForm.bankAccount) {
      toast.error('Vui lòng nhập đủ thông tin ngân hàng');
      return;
    }

    setWithdrawing(true);
    try {
      const payload = {
        amount: amountNumber,
        bankName: withdrawForm.bankName,
        accountNumber: withdrawForm.bankAccount,
        accountHolder: withdrawForm.accountHolder,
      };
      await walletApi.requestWithdrawal(payload);
      toast.success('Yêu cầu rút tiền đã được tạo');
      setWithdrawForm({ amount: '', bankName: '', bankAccount: '', accountHolder: '' });
      refreshAll();
    } catch (err) {
      console.error('Withdraw request error:', err);
      toast.error(err?.response?.data?.message || 'Không gửi được yêu cầu rút tiền');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount || 0);
    if (!amount || amount <= 0) {
      toast.error('Vui lòng nhập số tiền muốn nạp');
      return;
    }
    if (amount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10,000 VND');
      return;
    }
    if (amount > 50000000) {
      toast.error('Số tiền nạp tối đa là 50,000,000 VND');
      return;
    }

    setToppingUp(true);
    try {
      const res = await paymentApi.createZaloPayOrder(amount);
      const data = res?.data?.data || res?.data;
      const orderUrl = data?.order_url || data?.orderUrl || data?.payUrl;

      if (!orderUrl) {
        throw new Error('Không lấy được link thanh toán từ ZaloPay');
      }

      const appTransId = data?.app_trans_id || data?.appTransId;
      if (appTransId) {
        localStorage.setItem('pendingTopUpTransId', appTransId);
      }

      toast.success('Đang chuyển đến ZaloPay...', { autoClose: 1500 });

      setTimeout(() => {
        window.location.href = orderUrl;
      }, 1000);
    } catch (err) {
      console.error('Top-up error:', err);
      toast.error(err?.response?.data?.message || err.message || 'Không thể tạo lệnh nạp tiền');
    } finally {
      setToppingUp(false);
    }
  };

  const formatMoney = (value) => `${numberOrZero(value).toLocaleString('vi-VN')} ${currency}`;
  const formatDateTime = (value) =>
    value
      ? new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--';

  const statusVariant = (status) => {
    const normalized = (status || '').toLowerCase();
    if (['completed', 'success', 'succeeded'].includes(normalized)) return 'success';
    if (['pending', 'processing'].includes(normalized)) return 'warning';
    if (['failed', 'rejected', 'canceled', 'cancelled'].includes(normalized)) return 'danger';
    return 'primary';
  };

  const typeVariant = (type) => {
    const normalized = (type || '').toLowerCase();
    if (
      ['deposit', 'refund', 'sale_payment', 'dispute_refund', 'escrow_release'].includes(normalized)
    )
      return 'success';
    if (
      [
        'withdrawal',
        'purchase',
        'commission',
        'penalty',
        'escrow_hold',
        'listing_fee',
        'service_fee',
      ].includes(normalized)
    )
      return 'danger';
    return 'gray';
  };

  const typeLabel = (type) => {
    const normalized = (type || '').toLowerCase();

    const labels = {
      deposit: 'đặt cọc',
      sale_payment: 'Nạp ví',
      refund: 'Hoàn tiền',
      dispute_refund: 'Hoàn tranh chấp',
      purchase: 'Thanh toán mua',
      withdrawal: 'Rút tiền',
      commission: 'Phí nền tảng',
      penalty: 'Phí phạt',
      escrow_hold: 'Giữ escrow',
      escrow_release: 'Giải phóng escrow',
      listing_fee: 'Phí đăng tin',
      service_fee: 'Phí dịch vụ',
    };
    return labels[normalized] || 'Khác';
  };

  const walletStats = [
    {
      label: 'Khả dụng',
      value: loadingSummary ? '...' : formatMoney(availableBalance),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
    },
    {
      label: 'Escrow',
      value: loadingSummary ? '...' : formatMoney(escrowHold),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      ),
    },
    {
      label: 'Đã rút',
      value: loadingSummary ? '...' : formatMoney(totalWithdrawn),
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
        />
      ),
    },
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
                  Ví của bạn
                </span>
              </div>
              <h1
                className="text-3xl lg:text-4xl font-bold mb-2 leading-tight"
                style={{ color: 'white', fontFamily: "'Playfair Display', serif" }}
              >
                Kiểm soát <span style={{ color: 'var(--lux-gold)' }}>dòng tiền</span>
              </h1>
              <p className="text-sm max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Xem số dư khả dụng, tiền đang giữ trong escrow và lịch sử giao dịch. Rút tiền nhanh
                chóng về ngân hàng của bạn.
              </p>
            </div>

            {/* Inline stat pills */}
            <div className="flex flex-wrap gap-3">
              {walletStats.map((stat, i) => (
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
                      {stat.icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none" style={{ color: 'white' }}>
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

          {/* Refresh button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={refreshAll}
              disabled={loadingSummary || loadingTx}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <svg
                className={`w-4 h-4 ${loadingSummary || loadingTx ? 'animate-spin' : ''}`}
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
              {loadingSummary || loadingTx ? 'Đang cập nhật...' : 'Làm mới số dư'}
            </button>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Số liệu được đồng bộ sau các sự kiện giao dịch/escrow.
            </span>
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
        <div className="grid lg:grid-cols-12 gap-8">
          {/* ── Transactions Panel (8/12) ── */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
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
                  Lịch sử ví
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
                  value={filters.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl focus:outline-none"
                  style={{
                    border: '1.5px solid var(--lux-gray-200)',
                    color: 'var(--lux-gray-700)',
                    backgroundColor: 'var(--lux-gray-50)',
                  }}
                >
                  <option value="">Tất cả loại</option>
                  <option value="purchase">Thanh toán mua</option>
                  <option value="sale_payment">Tiền bán xe</option>
                  <option value="deposit">Đặt cọc / Nạp</option>
                  <option value="escrow_release">Giải phóng escrow</option>
                  <option value="withdrawal">Rút tiền</option>
                  <option value="refund">Hoàn tiền</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl focus:outline-none"
                  style={{
                    border: '1.5px solid var(--lux-gray-200)',
                    color: 'var(--lux-gray-700)',
                    backgroundColor: 'var(--lux-gray-50)',
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Đang xử lý</option>
                  <option value="completed">Thành công</option>
                  <option value="failed">Thất bại / huỷ</option>
                </select>
              </div>
            </div>

            {/* Transaction list */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'white', border: '1px solid var(--lux-gray-200)' }}
            >
              {loadingTx ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div
                    className="w-10 h-10 rounded-full border-4 animate-spin mb-4"
                    style={{
                      borderColor: 'var(--lux-gray-200)',
                      borderTopColor: 'var(--lux-primary-800)',
                    }}
                  />
                  <p className="text-sm" style={{ color: 'var(--lux-gray-400)' }}>
                    Đang tải lịch sử ví...
                  </p>
                </div>
              ) : filteredTransactions.length === 0 ? (
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
                  <p className="text-sm font-medium" style={{ color: 'var(--lux-gray-500)' }}>
                    Chưa có giao dịch nào
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" style={{ minWidth: '700px' }}>
                    <thead>
                      <tr
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: 'var(--lux-gray-400)',
                          backgroundColor: 'var(--lux-gray-50)',
                        }}
                      >
                        <th
                          className="px-5 py-4 font-bold border"
                          style={{ borderColor: 'var(--lux-gray-100)' }}
                        >
                          Ngày
                        </th>
                        <th
                          className="px-5 py-4 font-bold border"
                          style={{ borderColor: 'var(--lux-gray-100)' }}
                        >
                          Mô tả
                        </th>
                        <th
                          className="px-5 py-4 font-bold text-center border"
                          style={{ borderColor: 'var(--lux-gray-100)' }}
                        >
                          Loại
                        </th>
                        <th
                          className="px-5 py-4 font-bold text-right border"
                          style={{ borderColor: 'var(--lux-gray-100)' }}
                        >
                          Số tiền
                        </th>
                        <th
                          className="px-5 py-4 font-bold text-center border"
                          style={{ borderColor: 'var(--lux-gray-100)' }}
                        >
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => {
                        const amount = numberOrZero(tx?.amount);
                        const isCredit = amount >= 0; // show sign based on data, not on type label
                        return (
                          <tr
                            key={tx?._id || tx?.id}
                            className="group transition-colors duration-150"
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = 'var(--lux-gray-50)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = 'transparent')
                            }
                          >
                            <td
                              className="px-5 py-4 align-middle whitespace-nowrap border"
                              style={{ borderColor: 'var(--lux-gray-100)' }}
                            >
                              <p className="text-sm" style={{ color: 'var(--lux-gray-500)' }}>
                                {formatDateTime(tx?.createdAt || tx?.date)}
                              </p>
                            </td>
                            <td
                              className="px-5 py-4 align-middle border"
                              style={{ borderColor: 'var(--lux-gray-100)', minWidth: '300px' }}
                            >
                              <p
                                className="text-sm font-semibold whitespace-normal break-words"
                                style={{ color: 'var(--lux-primary-900)' }}
                              >
                                {tx?.description || tx?.title || 'Giao dịch ví'}
                              </p>
                              {tx?.referenceId || tx?.note ? (
                                <p
                                  className="text-xs whitespace-normal break-words mt-1"
                                  style={{ color: 'var(--lux-gray-400)' }}
                                >
                                  {tx?.referenceId ? `Mã: ${tx.referenceId}` : tx?.note}
                                </p>
                              ) : null}
                            </td>
                            <td
                              className="px-5 py-4 align-middle text-center whitespace-nowrap border"
                              style={{ borderColor: 'var(--lux-gray-100)' }}
                            >
                              <Badge variant={typeVariant(tx?.type)} size="sm">
                                {typeLabel(tx?.type)}
                              </Badge>
                            </td>
                            <td
                              className="px-5 py-4 align-middle text-right whitespace-nowrap border"
                              style={{ borderColor: 'var(--lux-gray-100)' }}
                            >
                              <p
                                className="text-sm font-bold"
                                style={{
                                  color: isCredit ? 'var(--lux-primary-500)' : '#dc2626',
                                }}
                              >
                                {`${isCredit ? '+' : '-'}${formatMoney(Math.abs(amount))}`}
                              </p>
                            </td>
                            <td
                              className="px-5 py-4 align-middle text-center whitespace-nowrap border"
                              style={{ borderColor: 'var(--lux-gray-100)' }}
                            >
                              <Badge variant={statusVariant(tx?.status)} size="sm">
                                {tx?.status || 'N/A'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination footer */}
              {filteredTransactions.length > 0 && (
                <div
                  className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
                  style={{
                    borderTop: '1px solid var(--lux-gray-100)',
                    backgroundColor: 'var(--lux-gray-50)',
                  }}
                >
                  {pagination.pages > 1 ? (
                    <>
                      <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                        Trang {page}/{pagination.pages} · Tổng {pagination.total} giao dịch
                      </p>
                      <Pagination
                        currentPage={page}
                        totalPages={pagination.pages || 1}
                        onPageChange={(newPage) => fetchTransactions(newPage)}
                      />
                    </>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                      {pagination.total} giao dịch
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar (4/12) ── */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            {/* ── Nạp tiền vào ví ── */}
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
                <h3
                  className="text-sm font-bold relative z-10 mb-0.5 flex items-center gap-2"
                  style={{ color: 'white' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Nạp tiền vào ví
                </h3>
                <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Nạp tiền qua ZaloPay để mua xe hoặc thanh toán phí
                </p>
              </div>

              <div className="p-5 space-y-4" style={{ backgroundColor: 'white' }}>
                {/* Preset amounts */}
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: 'var(--lux-gray-400)' }}
                  >
                    Chọn nhanh
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[100000, 200000, 500000, 1000000, 2000000, 5000000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setTopUpAmount(String(preset))}
                        className="px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          border:
                            Number(topUpAmount) === preset
                              ? '1.5px solid var(--lux-primary-800)'
                              : '1.5px solid var(--lux-gray-200)',
                          backgroundColor:
                            Number(topUpAmount) === preset
                              ? 'var(--lux-gray-100)'
                              : 'var(--lux-gray-50)',
                          color:
                            Number(topUpAmount) === preset
                              ? 'var(--lux-primary-900)'
                              : 'var(--lux-gray-600)',
                        }}
                        onMouseEnter={(e) => {
                          if (Number(topUpAmount) !== preset) {
                            e.currentTarget.style.borderColor = 'var(--lux-primary-800)';
                            e.currentTarget.style.color = 'var(--lux-primary-800)';
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (Number(topUpAmount) !== preset) {
                            e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
                            e.currentTarget.style.color = 'var(--lux-gray-600)';
                            e.currentTarget.style.backgroundColor = 'var(--lux-gray-50)';
                          }
                        }}
                      >
                        {preset >= 1000000
                          ? `${(preset / 1000000).toFixed(preset % 1000000 === 0 ? 0 : 1)}tr`
                          : `${(preset / 1000).toFixed(0)}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <Input
                  label="Hoặc nhập số tiền"
                  type="number"
                  min="10000"
                  max="50000000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Nhập số tiền (VND)"
                />

                {/* Amount preview */}
                {Number(topUpAmount) > 0 && (
                  <div
                    className="flex items-center justify-between text-sm rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(198,167,94,0.07)',
                      border: '1px solid rgba(198,167,94,0.2)',
                    }}
                  >
                    <span className="font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                      Số tiền nạp
                    </span>
                    <span className="font-bold text-lg" style={{ color: 'var(--lux-primary-900)' }}>
                      {Number(topUpAmount).toLocaleString('vi-VN')} {currency}
                    </span>
                  </div>
                )}

                <button
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--lux-primary-800) 0%, var(--lux-primary-900) 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={handleTopUp}
                  disabled={toppingUp || !topUpAmount || Number(topUpAmount) <= 0}
                >
                  {toppingUp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
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
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Nạp tiền qua ZaloPay
                    </>
                  )}
                </button>

                <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                  Bạn sẽ được chuyển đến trang thanh toán ZaloPay. Sau khi thanh toán thành công, số
                  dư ví sẽ được cập nhật tự động.
                </p>
              </div>
            </div>

            {/* ── Rút tiền ── */}
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
                  Rút tiền về ngân hàng
                </h3>
                <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Vui lòng kiểm tra số dư khả dụng trước khi rút
                </p>
              </div>

              <div className="p-5 space-y-3" style={{ backgroundColor: 'white' }}>
                <Input
                  label="Số tiền muốn rút"
                  type="number"
                  min="0"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder={`${minWithdraw.toLocaleString('vi-VN')} ${currency}`}
                />
                <Input
                  label="Ngân hàng"
                  value={withdrawForm.bankName}
                  onChange={(e) =>
                    setWithdrawForm((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  placeholder="Tên ngân hàng"
                />
                <Input
                  label="Số tài khoản"
                  value={withdrawForm.bankAccount}
                  onChange={(e) =>
                    setWithdrawForm((prev) => ({ ...prev, bankAccount: e.target.value }))
                  }
                  placeholder="Nhập số tài khoản nhận"
                />
                <Input
                  label="Chủ tài khoản"
                  value={withdrawForm.accountHolder}
                  onChange={(e) =>
                    setWithdrawForm((prev) => ({ ...prev, accountHolder: e.target.value }))
                  }
                  placeholder="Tên chủ tài khoản"
                />

                {/* Available balance display */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(198,167,94,0.07)',
                    border: '1px solid rgba(198,167,94,0.2)',
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                    Số dư khả dụng
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--lux-primary-900)' }}>
                    {formatMoney(availableBalance)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--lux-primary-800) 0%, var(--lux-primary-900) 100%)',
                      color: 'white',
                      border: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onClick={handleWithdraw}
                    disabled={withdrawing || loadingSummary}
                  >
                    {withdrawing ? 'Đang gửi...' : 'Tạo yêu cầu rút'}
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
                    onClick={refreshAll}
                    disabled={withdrawing}
                  >
                    Làm mới
                  </button>
                </div>

                <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                  Lưu ý: Số dư trong escrow sẽ được chuyển sang ví khi buyer xác nhận giao hàng hoặc
                  admin release. Sau đó mới có thể rút.
                </p>
              </div>
            </div>

            {/* Tips Banner */}
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
                  Mẹo kiểm soát ví
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: 'var(--lux-gold)' }}
                    />
                    <span
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      Làm mới ví sau khi giao dịch hoàn tất, admin release/refund, hoặc rút tiền
                      thành công.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: 'var(--lux-gold)' }}
                    />
                    <span
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      Theo dõi các dòng credit từ escrow release để đảm bảo đơn hàng được ghi nhận.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: 'var(--lux-gold)' }}
                    />
                    <span
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      Giữ lại mã tham chiếu giao dịch khi cần đối soát với bộ phận hỗ trợ.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
