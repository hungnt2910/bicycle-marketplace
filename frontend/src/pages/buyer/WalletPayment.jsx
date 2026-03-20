import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import walletApi from '../../api/walletApi';
import transactionApi from '../../api/transactionApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');

const typeLabels = {
  full_payment: 'Mua xe',
  deposit: 'Đặt cọc',
  pay_balance: 'Thanh toán phần còn lại',
  fee: 'Phí đăng tin',
  inspection_fee: 'Phí kiểm định',
};

const WalletPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();

  // Parse params from URL
  const type = searchParams.get('type') || '';
  const amount = Number(searchParams.get('amount') || 0);
  const bicycleId = searchParams.get('bicycleId') || '';
  const depositRate = Number(searchParams.get('depositRate') || 0);
  const transactionId = searchParams.get('transactionId') || '';
  const title = searchParams.get('title') || '';
  const returnUrl = searchParams.get('returnUrl') || '/';

  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const isInsufficientBalance = walletBalance !== null && walletBalance < amount;
  const remainingBalance = walletBalance !== null ? walletBalance - amount : null;

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        const res = await walletApi.getWallet();
        const data = res?.data?.data || res?.data || {};
        const balance =
          data?.availableBalance ??
          (data?.balance ?? data?.currentBalance ?? 0) - (data?.pendingBalance ?? 0);
        setWalletBalance(Number(balance));
      } catch (err) {
        console.error('Fetch wallet error:', err);
        toast.error('Không lấy được thông tin ví');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleConfirm = async () => {
    if (isInsufficientBalance) {
      toast.error('Số dư ví không đủ. Vui lòng nạp thêm tiền.');
      return;
    }

    setConfirming(true);
    try {
      let res;

      if (type === 'full_payment') {
        res = await transactionApi.create({
          bicycleId,
          amount,
          type: 'full_payment',
          paymentMethod: 'e_wallet',
        });
      } else if (type === 'deposit') {
        res = await transactionApi.createDeposit({
          bicycleId,
          depositRate,
          paymentMethod: 'e_wallet',
        });
      } else if (type === 'pay_balance') {
        res = await transactionApi.payRemainingBalance(transactionId);
      } else if (type === 'fee' || type === 'inspection_fee') {
        res = await transactionApi.payFee({
          bicycleId,
          amount,
          type,
          paymentMethod: 'e_wallet',
        });
      } else {
        throw new Error('Loại giao dịch không hợp lệ');
      }

      toast.success('Thanh toán từ ví thành công!');

      // Navigate to appropriate page after success
      if (type === 'pay_balance' && transactionId) {
        navigate(`/buyer/transactions/${transactionId}`);
      } else if (returnUrl && returnUrl !== '/') {
        navigate(returnUrl);
      } else if (role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const message = err?.response?.data?.message || err.message || 'Thanh toán thất bại';
      toast.error(message);
    } finally {
      setConfirming(false);
    }
  };

  const handleTopUp = () => {
    const walletPath = role === 'seller' ? '/seller/wallet' : '/buyer/wallet';
    navigate(walletPath);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: 'var(--lux-offwhite)' }}
      >
        <div
          className="w-12 h-12 border-4 rounded-full mb-5"
          style={{
            borderColor: 'var(--lux-gray-200)',
            borderTopColor: 'var(--lux-primary-600)',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <p className="text-base font-medium" style={{ color: 'var(--lux-gray-500)' }}>
          Đang tải thông tin ví...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: 'var(--lux-offwhite)' }}>
      {/* ═══════════════════════════════════════════════
          HERO: Full-width Wallet Banner
          ═══════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-800) 50%, var(--lux-primary-700) 100%)',
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(198,167,94,0.15) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(198,167,94,0.06) 0%, transparent 50%)',
          }}
        />

        <div className="container-custom px-4 md:px-8 py-10 md:py-14 relative z-10">
          {/* Checkout Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {[
              { num: '1', label: 'Chọn phương thức', active: true },
              { num: '2', label: 'Xác nhận', active: true },
              { num: '3', label: 'Hoàn tất', active: false },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                {idx > 0 && (
                  <div
                    className="w-10 md:w-20 h-0.5 rounded-full"
                    style={{
                      backgroundColor: step.active
                        ? 'rgba(198,167,94,0.5)'
                        : 'rgba(255,255,255,0.15)',
                    }}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: step.active ? 'var(--lux-gold)' : 'rgba(255,255,255,0.1)',
                      color: step.active ? 'var(--lux-primary-900)' : 'rgba(255,255,255,0.35)',
                      boxShadow: step.active ? '0 4px 12px rgba(198,167,94,0.35)' : 'none',
                    }}
                  >
                    {step.num}
                  </div>
                  <span
                    className="text-xs font-semibold hidden sm:inline"
                    style={{
                      color: step.active ? 'var(--lux-gold-light)' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Wallet Balance — Hero Display */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(198,167,94,0.2)',
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--lux-gold-light)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                  />
                </svg>
              </div>
              <p
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: 'var(--lux-gold)' }}
              >
                Số dư ví hiện tại
              </p>
            </div>

            <p
              className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3"
              style={{
                color: isInsufficientBalance ? '#fca5a5' : 'white',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {formatCurrency(walletBalance)}
              <span className="text-xl font-medium ml-2" style={{ color: 'var(--lux-gold)' }}>
                ₫
              </span>
            </p>

            {/* Status pill */}
            <div className="flex justify-center">
              {isInsufficientBalance ? (
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5"
                  style={{
                    borderRadius: '999px',
                    backgroundColor: 'rgba(252,165,165,0.15)',
                    border: '1px solid rgba(252,165,165,0.2)',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: '#fca5a5' }}
                  />
                  <span className="text-xs font-semibold" style={{ color: '#fca5a5' }}>
                    Số dư không đủ để thanh toán
                  </span>
                </div>
              ) : (
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5"
                  style={{
                    borderRadius: '999px',
                    backgroundColor: 'rgba(110,231,183,0.1)',
                    border: '1px solid rgba(110,231,183,0.2)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6ee7b7' }} />
                  <span className="text-xs font-semibold" style={{ color: '#6ee7b7' }}>
                    Sẵn sàng thanh toán
                  </span>
                </div>
              )}
            </div>

            {/* 3 summary stat cards */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              <div
                className="px-4 py-4 text-center"
                style={{
                  borderRadius: 'var(--lux-radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(198,167,94,0.12)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--lux-gold-light)' }}
                >
                  Số dư hiện tại
                </p>
                <p className="text-lg md:text-xl font-bold" style={{ color: 'white' }}>
                  {formatCurrency(walletBalance)} ₫
                </p>
              </div>
              <div
                className="px-4 py-4 text-center"
                style={{
                  borderRadius: 'var(--lux-radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(198,167,94,0.12)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--lux-gold-light)' }}
                >
                  Cần thanh toán
                </p>
                <p className="text-lg md:text-xl font-bold" style={{ color: 'var(--lux-gold)' }}>
                  -{formatCurrency(amount)} ₫
                </p>
              </div>
              <div
                className="px-4 py-4 text-center"
                style={{
                  borderRadius: 'var(--lux-radius-md)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(198,167,94,0.12)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--lux-gold-light)' }}
                >
                  Còn lại sau GD
                </p>
                <p
                  className="text-lg md:text-xl font-bold"
                  style={{ color: isInsufficientBalance ? '#fca5a5' : '#6ee7b7' }}
                >
                  {formatCurrency(remainingBalance)} ₫
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT: Payment Details Card
          ═══════════════════════════════════════════════ */}
      <div className="container-custom px-4 md:px-8 -mt-4 relative z-20">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* ── Insufficient Balance Warning (full width) ── */}
          {isInsufficientBalance && (
            <Card
              className="p-6 overflow-hidden relative"
              style={{
                borderRadius: 'var(--lux-radius-lg)',
                border: '1px solid rgba(127,29,29,0.12)',
                boxShadow: 'var(--lux-shadow-elevated)',
              }}
            >
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{
                  background: 'linear-gradient(to right, var(--lux-danger), var(--lux-warning))',
                }}
              />
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderRadius: '14px',
                    backgroundColor: 'rgba(127,29,29,0.06)',
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--lux-danger)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold mb-1" style={{ color: 'var(--lux-danger)' }}>
                    Số dư ví không đủ để thực hiện giao dịch
                  </p>
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: 'var(--lux-gray-600)' }}
                  >
                    Bạn cần nạp thêm{' '}
                    <strong style={{ color: 'var(--lux-danger)' }}>
                      {formatCurrency(amount - (walletBalance || 0))} ₫
                    </strong>{' '}
                    vào ví trước khi có thể tiếp tục thanh toán.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleTopUp}
                    className="py-3 px-8 text-sm font-bold"
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 6px 20px rgba(6,78,59,0.25)',
                    }}
                  >
                    <span className="flex items-center gap-2">
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Nạp tiền vào ví ngay
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ── Two-column: Transaction Details + Payment Summary ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* LEFT: Transaction Details */}
            <Card
              className="overflow-hidden"
              style={{
                borderRadius: 'var(--lux-radius-xl)',
                boxShadow: 'var(--lux-shadow-card)',
                border: '1px solid var(--lux-gray-200)',
              }}
            >
              {/* Section Header */}
              <div
                className="px-6 py-5 flex items-center gap-3"
                style={{ borderBottom: '1px solid var(--lux-gray-200)' }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    borderRadius: '12px',
                    backgroundColor: 'rgba(4,120,87,0.08)',
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--lux-primary-700)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{
                      color: 'var(--lux-primary-900)',
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Chi tiết giao dịch
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                    Thông tin đơn hàng của bạn
                  </p>
                </div>
              </div>

              {/* Details List */}
              <div className="px-6 py-5 space-y-4">
                {/* Transaction Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-500)' }}>
                    Loại giao dịch
                  </span>
                  <Badge variant="primary" className="text-xs px-3 py-1 font-semibold">
                    {typeLabels[type] || type || '—'}
                  </Badge>
                </div>

                <div style={{ borderTop: '1px solid var(--lux-gray-100)' }} />

                {/* Product Name */}
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-sm font-medium flex-shrink-0"
                    style={{ color: 'var(--lux-gray-500)' }}
                  >
                    Sản phẩm
                  </span>
                  <span
                    className="text-sm font-semibold text-right truncate max-w-[60%]"
                    style={{ color: 'var(--lux-gray-800)' }}
                  >
                    {title || '—'}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--lux-gray-100)' }} />

                {/* Bicycle ID */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-500)' }}>
                    Mã sản phẩm
                  </span>
                  {bicycleId ? (
                    <span
                      className="text-xs font-mono px-3 py-1.5"
                      style={{
                        color: 'var(--lux-gray-700)',
                        backgroundColor: 'var(--lux-gray-100)',
                        borderRadius: '8px',
                      }}
                    >
                      #{bicycleId.slice(-8)}
                    </span>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--lux-gray-400)' }}>
                      —
                    </span>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--lux-gray-100)' }} />

                {/* Transaction ID */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-500)' }}>
                    Mã giao dịch
                  </span>
                  {transactionId ? (
                    <span
                      className="text-xs font-mono px-3 py-1.5"
                      style={{
                        color: 'var(--lux-gray-700)',
                        backgroundColor: 'var(--lux-gray-100)',
                        borderRadius: '8px',
                      }}
                    >
                      #{transactionId.slice(-8)}
                    </span>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--lux-gray-400)' }}>
                      —
                    </span>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--lux-gray-100)' }} />

                {/* Payment Method */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--lux-gray-500)' }}>
                    Phương thức
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 flex items-center justify-center"
                      style={{
                        borderRadius: '6px',
                        backgroundColor: 'rgba(4,120,87,0.08)',
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--lux-primary-600)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--lux-primary-800)' }}
                    >
                      Ví điện tử
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* RIGHT: Payment Amount + Balance Breakdown */}
            <Card
              className="overflow-hidden"
              style={{
                borderRadius: 'var(--lux-radius-xl)',
                boxShadow: 'var(--lux-shadow-card)',
                border: '1px solid var(--lux-gray-200)',
              }}
            >
              {/* Hero Amount */}
              <div
                className="px-6 py-8 text-center"
                style={{
                  background: 'linear-gradient(180deg, rgba(4,120,87,0.05) 0%, white 100%)',
                  borderBottom: '1px solid var(--lux-gray-200)',
                }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-4"
                  style={{ color: 'var(--lux-gray-400)', fontFamily: "'Inter', sans-serif" }}
                >
                  Tổng thanh toán
                </p>
                <p
                  className="text-4xl md:text-5xl font-extrabold tracking-tight"
                  style={{ color: 'var(--lux-primary-900)', fontFamily: "'Inter', sans-serif" }}
                >
                  {formatCurrency(amount)}
                  <span className="text-lg font-medium ml-1" style={{ color: 'var(--lux-gold)' }}>
                    ₫
                  </span>
                </p>
                <div
                  className="mt-3 mx-auto w-20 h-1 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to right, var(--lux-primary-600), var(--lux-gold))',
                  }}
                />
              </div>

              {/* Balance Breakdown — Receipt Style */}
              <div className="px-6 py-5">
                <h3
                  className="text-[11px] font-bold uppercase tracking-widest mb-4"
                  style={{ color: 'var(--lux-gray-400)', fontFamily: "'Inter', sans-serif" }}
                >
                  Bảng cân đối
                </h3>

                <div
                  className="overflow-hidden"
                  style={{
                    borderRadius: 'var(--lux-radius-md)',
                    border: '1px solid var(--lux-gray-200)',
                  }}
                >
                  {/* Current Balance */}
                  <div className="flex items-center justify-between px-5 py-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center"
                        style={{ borderRadius: '10px', backgroundColor: 'rgba(27,94,32,0.08)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: 'var(--lux-success)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--lux-gray-600)' }}
                      >
                        Số dư hiện tại
                      </span>
                    </div>
                    <span
                      className="text-base font-bold"
                      style={{
                        color: isInsufficientBalance ? 'var(--lux-danger)' : 'var(--lux-success)',
                      }}
                    >
                      {formatCurrency(walletBalance)} ₫
                    </span>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--lux-gray-200)' }} />

                  {/* Deduction */}
                  <div className="flex items-center justify-between px-5 py-4 bg-white">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center"
                        style={{ borderRadius: '10px', backgroundColor: 'rgba(146,64,14,0.08)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: 'var(--lux-warning)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--lux-gray-600)' }}
                      >
                        Số tiền trừ
                      </span>
                    </div>
                    <span className="text-base font-bold" style={{ color: 'var(--lux-warning)' }}>
                      -{formatCurrency(amount)} ₫
                    </span>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--lux-gray-200)' }} />

                  {/* Remaining */}
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ backgroundColor: 'var(--lux-gray-50)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center"
                        style={{
                          borderRadius: '10px',
                          backgroundColor: isInsufficientBalance
                            ? 'rgba(127,29,29,0.08)'
                            : 'rgba(4,120,87,0.08)',
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{
                            color: isInsufficientBalance
                              ? 'var(--lux-danger)'
                              : 'var(--lux-primary-700)',
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--lux-gray-700)' }}>
                        Sau giao dịch
                      </span>
                    </div>
                    <span
                      className="text-lg font-extrabold"
                      style={{
                        color: isInsufficientBalance
                          ? 'var(--lux-danger)'
                          : 'var(--lux-primary-800)',
                      }}
                    >
                      {formatCurrency(remainingBalance)} ₫
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Action Buttons + Trust (full width card) ── */}
          <Card
            className="overflow-hidden"
            style={{
              borderRadius: 'var(--lux-radius-xl)',
              boxShadow: 'var(--lux-shadow-card)',
              border: '1px solid var(--lux-gray-200)',
            }}
          >
            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: Trust & Security */}
                <div className="space-y-4">
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{
                      color: 'var(--lux-primary-900)',
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Xác nhận thanh toán
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--lux-gray-500)' }}>
                    Giao dịch sẽ được xử lý ngay lập tức và số dư ví sẽ được cập nhật tức thì.
                  </p>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                        style={{ borderRadius: '10px', backgroundColor: 'rgba(4,120,87,0.06)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: 'var(--lux-primary-600)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--lux-gray-800)' }}
                        >
                          Bảo mật tuyệt đối
                        </p>
                        <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                          Mã hóa SSL 256-bit end-to-end
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                        style={{ borderRadius: '10px', backgroundColor: 'rgba(198,167,94,0.08)' }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: 'var(--lux-gold)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--lux-gray-800)' }}
                        >
                          Xử lý tức thì
                        </p>
                        <p className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>
                          Giao dịch hoàn tất trong giây lát
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-col gap-3">
                  {isInsufficientBalance ? (
                    <>
                      <Button
                        variant="primary"
                        onClick={handleTopUp}
                        className="w-full py-4 text-base font-bold"
                        style={{
                          borderRadius: 'var(--lux-radius-md)',
                          boxShadow: '0 8px 24px rgba(6,78,59,0.3)',
                        }}
                      >
                        <span className="flex items-center justify-center gap-2">
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Nạp tiền vào ví
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full py-3.5 text-base font-semibold"
                        style={{ borderRadius: 'var(--lux-radius-md)' }}
                      >
                        Quay lại
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="w-full py-4 text-base font-bold transition-all duration-200"
                        style={{
                          borderRadius: 'var(--lux-radius-md)',
                          boxShadow: '0 8px 24px rgba(6,78,59,0.3)',
                        }}
                      >
                        {confirming ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Đang xử lý...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            {`Xác nhận thanh toán ${formatCurrency(amount)} ₫`}
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={confirming}
                        className="w-full py-3.5 text-base font-semibold"
                        style={{ borderRadius: 'var(--lux-radius-md)' }}
                      >
                        Hủy
                      </Button>
                    </>
                  )}

                  {/* Security micro-footer */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--lux-gray-400)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: 'var(--lux-gray-400)' }}
                    >
                      Giao dịch được bảo mật và xử lý tức thì
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletPayment;
