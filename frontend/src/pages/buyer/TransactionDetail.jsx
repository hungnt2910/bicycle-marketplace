import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import ReviewsSection from '../../components/reviews/ReviewsSection';
import transactionApi from '../../api/transactionApi';
import adminApi from '../../api/adminApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

/* ─── constants & helpers (unchanged logic) ─────────────── */
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
  deposit_paid: 'Đã đặt cọc',
  buyer_confirmed: 'Người mua đã xác nhận',
};

const statusBadgeVariant = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['completed', 'delivered', 'payment_received', 'buyer_confirmed'].includes(normalized))
    return 'success';
  if (['pending_payment', 'held_in_escrow', 'awaiting_delivery'].includes(normalized))
    return 'warning';
  if (['refunded', 'disputed', 'cancelled', 'canceled'].includes(normalized)) return 'danger';
  return 'primary';
};

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');
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

/* ─── sub-components ─────────────────────────────────────── */

/** Spinning loader screen */
const LoadingScreen = () => (
  <div className="min-h-screen bg-[var(--lux-gray-50)] flex flex-col items-center justify-center gap-4">
    <div className="w-8 h-8 border-[3px] border-[var(--lux-gray-200)] border-t-[var(--lux-primary-900)] rounded-full animate-spin" />
    <p className="text-[10px] font-bold text-[var(--lux-gray-400)] uppercase tracking-[0.2em]">
      Đang truy xuất chứng từ...
    </p>
  </div>
);

/** Empty / error screen */
const EmptyScreen = () => (
  <div className="min-h-screen bg-[var(--lux-gray-50)] flex items-center justify-center">
    <div className="text-center space-y-3">
      <div className="text-4xl opacity-40">📄</div>
      <p className="text-xs uppercase tracking-[0.2em] font-semibold text-danger">
        Không tìm thấy chứng từ giao dịch
      </p>
    </div>
  </div>
);

/** A single row inside a definition list */
const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)] last:border-0">
    <dt className="text-[13px] font-medium text-[var(--lux-gray-500)] shrink-0">{label}</dt>
    <dd
      className={[
        'text-[13px] font-semibold text-[var(--lux-gray-900)] text-right pl-4 max-w-[60%]',
        mono ? 'font-mono truncate text-[12px]' : '',
      ].join(' ')}
    >
      {value}
    </dd>
  </div>
);

/** Section header used in the left column */
const SectionHeading = ({ children }) => (
  <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-5 pb-3 border-b border-[var(--lux-gray-100)]">
    {children}
  </h3>
);

/** A single step in the process timeline */
const TimelineStep = ({ step, isLast }) => (
  <div className="relative flex gap-5 pb-10 last:pb-0">
    {/* Connector line */}
    {!isLast && (
      <div
        className={[
          'absolute top-5 left-[9px] w-[2px] h-[calc(100%-8px)] rounded-full',
          step.done ? 'bg-[var(--lux-primary-800)]' : 'bg-[var(--lux-gray-200)]',
        ].join(' ')}
      />
    )}

    {/* Dot */}
    <div className="relative z-10 shrink-0 mt-0.5">
      <div
        className={[
          'w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300',
          step.done
            ? 'border-[var(--lux-primary-800)] shadow-[0_0_0_4px_rgba(6,78,59,0.06)]'
            : 'border-[var(--lux-gray-200)]',
        ].join(' ')}
        aria-hidden="true"
      >
        {step.done && <div className="w-2 h-2 rounded-full bg-[var(--lux-primary-800)]" />}
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 -mt-0.5">
      <p
        className={[
          'text-[15px] font-bold tracking-tight mb-0.5 transition-colors duration-300',
          step.done ? 'text-[var(--lux-primary-900)]' : 'text-[var(--lux-gray-400)]',
        ].join(' ')}
      >
        {step.label}
      </p>
      {step.time ? (
        <time dateTime={step.time} className="text-[12.5px] font-medium text-[var(--lux-gray-500)]">
          {formatDateTime(step.time)}
        </time>
      ) : (
        <p className="text-[12.5px] font-medium text-[var(--lux-gray-400)] italic">Chưa ghi nhận</p>
      )}
    </div>
  </div>
);

/* ─── main page component ────────────────────────────────── */
const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [disputeTimeLimitDays, setDisputeTimeLimitDays] = useState(3);

  /* -- data fetching (unchanged) -- */
  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await transactionApi.getById(id);
      const data = res?.data?.data || res?.data;
      setTx(data || null);
    } catch (err) {
      console.error('Fetch transaction detail error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được chi tiết giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    const fetchSettings = async () => {
      try {
        const res = await adminApi.getSystemSettings();
        const settings = (res?.data?.data || res?.data || [])[0]?.name_value || [];
        const val = settings.find((i) => i.key === 'dispute_time_limit_days')?.value;
        if (val) setDisputeTimeLimitDays(Number(val));
      } catch (error) {
        console.error('Error fetching dispute settings:', error);
      }
    };
    fetchSettings();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!tx) return <EmptyScreen />;

  /* -- derived values (unchanged) -- */
  const statusLabel = statusLabelMap[tx.status] || tx.status;
  const amount = formatCurrency(tx.amount);
  const bikeTitle = tx?.bicycleId?.title || 'Xe đạp';
  const normalizedStatus = (tx.status || '').toLowerCase();
  const isBuyer = (role || '').toLowerCase() === 'buyer';
  const sellerIdValue =
    tx?.sellerId?._id || tx?.sellerId || tx?.seller?._id || tx?.bicycleId?.sellerId;
  const transactionKey = tx?._id || tx?.id;
  const transactionStatus = tx?.status || '';

  const paidStatuses = [
    'payment_received',
    'held_in_escrow',
    'awaiting_delivery',
    'delivered',
    'buyer_confirmed',
    'completed',
    'deposit_paid',
  ];
  const escrowStatuses = [
    'held_in_escrow',
    'awaiting_delivery',
    'delivered',
    'buyer_confirmed',
    'completed',
  ];

  /* -- buyer action guards (unchanged) -- */
  const isDeposit = (tx.type || '').toLowerCase() === 'deposit';
  const canPayBalance = isBuyer && isDeposit && ['deposit_paid'].includes(normalizedStatus);
  const canConfirmDelivery =
    isBuyer && ['awaiting_delivery', 'delivered'].includes(normalizedStatus);
  const canDispute =
    isBuyer &&
    ['delivered', 'buyer_confirmed', 'completed'].includes(normalizedStatus) &&
    !tx.dispute &&
    new Date() - new Date(tx.shipping?.deliveredAt || tx.updatedAt) <
      disputeTimeLimitDays * 24 * 60 * 60 * 1000;

  /* -- action runner (unchanged) -- */
  const runAction = async (label, fn) => {
    if (!id) return;
    setActionLoading(label);
    try {
      await fn();
      await fetchDetail();
      toast.success('Đã cập nhật giao dịch');
    } catch (err) {
      console.error(`${label} error:`, err);
      toast.error(err?.response?.data?.message || 'Không thực hiện được thao tác');
    } finally {
      setActionLoading('');
    }
  };

  const handlePayBalance = () => {
    if (!id) return;
    const remainingAmount = tx?.deposit?.remainingAmount || 0;
    const title = tx?.bicycleId?.title || 'Xe đạp';
    const params = new URLSearchParams({
      type: 'pay_balance',
      amount: String(remainingAmount),
      transactionId: id,
      title,
      returnUrl: `/buyer/transactions/${id}`,
    });
    navigate(`/wallet-payment?${params.toString()}`);
  };

  const handleConfirmDelivery = () => {
    const payload = { matchesReport: true };
    runAction('confirm', () => transactionApi.confirmDelivery(id, payload));
  };

  /* -- timeline data (unchanged) -- */
  const timelineSteps = [
    { key: 'created', label: 'Khởi tạo', time: tx.createdAt, done: true },
    {
      key: 'paid',
      label: 'Thanh toán',
      time: tx.payment?.paidAt || (paidStatuses.includes(normalizedStatus) ? tx.updatedAt : null),
      done: !!tx.payment?.paidAt || paidStatuses.includes(normalizedStatus),
    },
    {
      key: 'escrow',
      label: 'Escrow giữ tiền',
      time:
        tx.escrow?.heldAt ||
        (tx.escrow?.heldAmount ? tx.updatedAt || tx.createdAt : null) ||
        (escrowStatuses.includes(normalizedStatus) ? tx.updatedAt : null),
      done: !!tx.escrow?.heldAmount || escrowStatuses.includes(normalizedStatus),
    },
    {
      key: 'shipped',
      label: 'Đã gửi hàng',
      time: tx.shipping?.shippedAt,
      done: !!tx.shipping?.shippedAt,
    },
    {
      key: 'delivered',
      label: 'Đã giao',
      time: tx.shipping?.deliveredAt,
      done: !!tx.shipping?.deliveredAt,
    },
    {
      key: 'completed',
      label: 'Hoàn tất',
      time: tx.status === 'completed' ? tx.updatedAt : null,
      done: tx.status === 'completed',
    },
  ];

  /* ── render ────────────────────────────────────────────── */
  return (
    <main
      className="min-h-screen bg-[var(--lux-gray-50)] py-10 md:py-20 px-4 sm:px-6"
      aria-label="Chi tiết giao dịch"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <Button
            variant="outline"
            onClick={() => navigate('/buyer/dashboard')}
            aria-label="Quay lại trang quản lý"
            className="w-fit border-0 shadow-none hover:bg-[var(--lux-gray-200)]/40 text-[var(--lux-gray-500)] text-sm font-medium transition-colors pl-2 pr-4 py-2"
          >
            ← Quay lại quản lý
          </Button>

          <div className="flex flex-col sm:items-end gap-0.5">
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-[var(--lux-gray-400)] uppercase">
              Mã Lưu Trữ Kỹ Thuật Số
            </span>
            <span className="text-xs font-mono text-[var(--lux-gray-600)] tracking-tight">
              {tx._id || tx.id}
            </span>
          </div>
        </div>
        {/* ── Two-panel side-by-side grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* ── Main statement card ── */}
          <Card className="bg-white rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.06)] border border-[var(--lux-gray-200)]/60 overflow-hidden">
            {/* Hero: amount + status + actions */}
            <header className="relative px-8 md:px-16 py-14 md:py-20 text-center border-b border-[var(--lux-gray-100)]">
              {/* Top accent strip */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-[var(--lux-primary-900)]"
                aria-hidden="true"
              />

              {/* Status badge */}
              <div className="flex justify-center mb-7">
                <Badge
                  variant={statusBadgeVariant(tx.status)}
                  className="px-5 py-2 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-[0.15em] uppercase shadow-sm"
                >
                  {statusLabel}
                </Badge>
              </div>

              {/* Amount */}
              <div
                className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--lux-primary-900)] tracking-tighter flex justify-center items-start gap-1 mb-4"
                aria-label={`${amount} đồng`}
              >
                <span>{amount}</span>
                <span className="text-2xl md:text-4xl font-medium text-[var(--lux-gray-400)] mt-2 md:mt-3">
                  ₫
                </span>
              </div>

              {/* Bike & date */}
              <div className="max-w-xl mx-auto space-y-1">
                <p className="text-lg md:text-xl font-bold text-[var(--lux-gray-800)] tracking-tight">
                  {bikeTitle}
                </p>
                <p className="text-xs font-semibold tracking-widest text-[var(--lux-gray-400)] uppercase">
                  {formatDateTime(tx.createdAt)}
                </p>
              </div>

              {/* Buyer action buttons */}
              {isBuyer && (
                <div
                  className="flex flex-wrap justify-center gap-3 mt-8"
                  role="group"
                  aria-label="Hành động giao dịch"
                >
                  {canPayBalance && (
                    <Button
                      variant="primary"
                      disabled={actionLoading === 'pay-balance'}
                      onClick={handlePayBalance}
                      aria-busy={actionLoading === 'pay-balance'}
                    >
                      {actionLoading === 'pay-balance'
                        ? 'Đang thanh toán...'
                        : 'Thanh toán phần còn lại'}
                    </Button>
                  )}
                  {canConfirmDelivery && (
                    <Button
                      variant="success"
                      disabled={actionLoading === 'confirm'}
                      onClick={handleConfirmDelivery}
                      aria-busy={actionLoading === 'confirm'}
                    >
                      {actionLoading === 'confirm' ? 'Đang xác nhận...' : 'Xác nhận đã nhận hàng'}
                    </Button>
                  )}
                  {canDispute && (
                    <Button
                      variant="danger"
                      onClick={() => navigate(`/buyer/disputes/create?transactionId=${tx._id}`)}
                    >
                      Mở tranh chấp
                    </Button>
                  )}
                </div>
              )}
            </header>

            {/* Two-column detail grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[var(--lux-gray-100)]">
              {/* Left: financial & logistics details */}
              <div className="md:col-span-7 p-6 sm:p-10 space-y-12 bg-white">
                {/* Payment details */}
                <section aria-labelledby="payment-section">
                  <SectionHeading>
                    <span id="payment-section">Chi tiết thanh toán</span>
                  </SectionHeading>
                  <dl>
                    <InfoRow label="Hạng mục" value={tx.type} />
                    <InfoRow label="Phương thức" value={tx.payment?.method || 'N/A'} />
                    {/* <InfoRow label="Mã khế ước đích" value={tx.payment?.transactionId || '--'} mono />
                    <InfoRow label="Chữ ký thời gian" value={formatDateTime(tx.payment?.paidAt)} /> */}
                  </dl>
                </section>

                {/* Escrow details */}
                <section aria-labelledby="escrow-section">
                  <SectionHeading>
                    <span id="escrow-section">Bảo vệ Escrow</span>
                  </SectionHeading>
                  <dl>
                    <InfoRow
                      label="Pháp nhân giữ tiền"
                      value={
                        tx.escrow?.heldAmount ? `${formatCurrency(tx.escrow.heldAmount)} ₫` : '--'
                      }
                    />
                    <InfoRow
                      label="Mốc tự động giải ngân"
                      value={formatDateTime(tx.escrow?.autoReleaseDeadline)}
                    />
                  </dl>
                </section>

                {/* Shipping details (conditional) */}
                {tx.shipping && (
                  <section aria-labelledby="shipping-section">
                    <SectionHeading>
                      <span id="shipping-section">Thông tin vận chuyển</span>
                    </SectionHeading>
                    <dl>
                      <InfoRow label="Đối tác logistics" value={tx.shipping.provider || '--'} />
                      <InfoRow label="Mã vận đơn" value={tx.shipping.trackingNumber || '--'} mono />
                      <InfoRow
                        label="Thời điểm lấy hàng"
                        value={formatDateTime(tx.shipping.shippedAt)}
                      />
                      <InfoRow
                        label="Thời điểm phát thành công"
                        value={formatDateTime(tx.shipping.deliveredAt)}
                      />
                    </dl>
                  </section>
                )}
              </div>

              {/* Right: process timeline */}
              <div className="md:col-span-5 p-6 sm:p-10 bg-[var(--lux-gray-50)]/50">
                <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-10">
                  Trình tự hệ thống
                </h3>
                <ol className="relative pl-1" aria-label="Các bước trạng thái giao dịch">
                  {timelineSteps.map((step, i) => (
                    <li key={step.key}>
                      <TimelineStep step={step} isLast={i === timelineSteps.length - 1} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer watermark */}
            <footer className="bg-[var(--lux-primary-900)] flex items-center justify-center p-4">
              <span className="text-[9px] font-extrabold tracking-[0.3em] text-white/50 uppercase">
                Authenticated &amp; Secured by Bicycle Marketplace
              </span>
            </footer>
          </Card>

          {/* ── Reviews section (buyer only, right column) ── */}
          {isBuyer && sellerIdValue && transactionKey && (
            <section
              aria-labelledby="reviews-panel-title"
              className="bg-white rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.06)] border border-[var(--lux-gray-200)]/60 p-6 md:p-8 animate-fade-in"
            >
              {/* Panel header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-5 border-b border-[var(--lux-gray-100)]">
                <div>
                  <p className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase">
                    Đánh giá giao dịch này
                  </p>
                  <h2
                    id="reviews-panel-title"
                    className="text-xl font-bold text-[var(--lux-primary-900)] mt-1"
                  >
                    Chỉ mở khi đơn đã hoàn tất
                  </h2>
                </div>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-xs uppercase tracking-[0.15em] w-fit"
                >
                  Trạng thái: {statusLabel}
                </Badge>
              </div>

              <ReviewsSection
                sellerId={sellerIdValue}
                transactionId={transactionKey}
                transactionStatus={transactionStatus}
                requireCompleted
              />
            </section>
          )}
        </div>{' '}
        {/* end two-panel grid */}
      </div>
    </main>
  );
};

export default TransactionDetail;
