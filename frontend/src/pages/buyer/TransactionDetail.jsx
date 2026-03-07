import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import transactionApi from '../../api/transactionApi';
import paymentApi from '../../api/paymentApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

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
};

const statusBadgeVariant = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['completed', 'delivered', 'payment_received'].includes(normalized)) return 'success';
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
      if (['paid', 'success', 'completed', 'payment_received', 'held_in_escrow'].includes(status))
        return 'paid';
      if (['failed', 'cancelled', 'canceled', 'payment_failed'].includes(status)) return 'failed';
    } catch (err) {
      console.error('Poll payment status error:', err);
    }
  }
  return 'pending';
};

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [autoConfirming, setAutoConfirming] = useState(false);
  const [autoConfirmAttempted, setAutoConfirmAttempted] = useState(false);

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
  }, [id]);

  useEffect(() => {
    // Reset auto-confirm flag khi đổi giao dịch
    setAutoConfirmAttempted(false);
  }, [id]);

  // Nếu giao dịch đã nhận thanh toán nhưng chưa giữ escrow, tự gọi confirm-payment một lần
  useEffect(() => {
    const shouldAutoConfirm =
      !autoConfirming &&
      !autoConfirmAttempted &&
      tx?.status === 'pending_payment' &&
      (!tx?.escrow?.heldAmount || !tx?.escrow?.heldAt);

    if (!id || !shouldAutoConfirm) return;

    const runAutoConfirm = async () => {
      setAutoConfirming(true);
      setAutoConfirmAttempted(true);
      try {
        await transactionApi.confirmPayment(id, { transactionId: tx?.payment?.transactionId });
        await fetchDetail();
      } catch (err) {
        console.error('auto-confirm-payment error:', err);
      } finally {
        setAutoConfirming(false);
      }
    };

    runAutoConfirm();
  }, [id, tx, autoConfirming, autoConfirmAttempted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--lux-gray-50)] flex flex-col items-center justify-center font-sans tracking-wide">
        <div className="w-8 h-8 border-[3px] border-[var(--lux-gray-200)] border-t-[var(--lux-primary-900)] rounded-full animate-spin mb-6"></div>
        <div className="text-[10px] font-bold text-[var(--lux-gray-400)] uppercase tracking-[0.2em]">
          Đang truy xuất chứng từ...
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-[var(--lux-gray-50)] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="text-3xl opacity-50">📄</div>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-danger">
            Không tìm thấy chứng từ giao dịch
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = statusLabelMap[tx.status] || tx.status;
  const amount = formatCurrency(tx.amount);
  const bikeTitle = tx?.bicycleId?.title || 'Xe đạp';
  const normalizedStatus = (tx.status || '').toLowerCase();
  const isBuyer = (role || '').toLowerCase() === 'buyer';

  const paidStatuses = [
    'payment_received',
    'held_in_escrow',
    'awaiting_delivery',
    'delivered',
    'completed',
    'deposit_paid',
  ];
  const escrowStatuses = ['held_in_escrow', 'awaiting_delivery', 'delivered', 'completed'];

  /* ── buyer actions ── */
  const isDeposit = (tx.type || '').toLowerCase() === 'deposit';

  const canPayBalance = isBuyer && isDeposit && ['deposit_paid'].includes(normalizedStatus);
  const canConfirmDelivery =
    isBuyer && ['awaiting_delivery', 'delivered'].includes(normalizedStatus);
  const canCancel =
    isBuyer &&
    [
      'pending_payment',
      'payment_received',
      'deposit_paid',
      'held_in_escrow',
      'awaiting_delivery',
    ].includes(normalizedStatus);

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

  const handlePayBalance = async () => {
    if (!id) return;
    setActionLoading('pay-balance');
    try {
      const payRes = await transactionApi.payRemainingBalance(id);
      const txId =
        payRes?.data?.data?.transactionId ||
        payRes?.data?.data?._id ||
        payRes?.data?.data?.id ||
        payRes?.data?.transactionId ||
        id;

      // Ưu tiên URL trả về ngay từ pay-balance; fallback gọi createZaloPayOrder
      let payUrl =
        payRes?.data?.data?.order_url ||
        payRes?.data?.data?.orderUrl ||
        payRes?.data?.data?.payUrl ||
        payRes?.data?.data?.paymentUrl ||
        payRes?.data?.data?.deeplink ||
        payRes?.data?.data?.deep_link;

      if (!payUrl && txId) {
        const zaloRes = await paymentApi.createZaloPayOrder(txId);
        payUrl =
          zaloRes?.data?.data?.orderUrl ||
          zaloRes?.data?.data?.payUrl ||
          zaloRes?.data?.data?.paymentUrl ||
          zaloRes?.data?.data?.deeplink ||
          zaloRes?.data?.data?.deep_link ||
          zaloRes?.data?.orderUrl ||
          zaloRes?.data?.payUrl ||
          zaloRes?.data?.paymentUrl ||
          zaloRes?.data?.deeplink;
      }

      if (payUrl) {
        window.open(payUrl, '_blank', 'noopener');
        toast.success('Đã mở trang thanh toán phần còn lại');
      } else {
        const rawMessage =
          zaloRes?.data?.message ||
          zaloRes?.data?.msg ||
          zaloRes?.data?.error ||
          'Không nhận được link thanh toán từ ZaloPay';
        toast.error(rawMessage);
      }

      if (txId) {
        const status = await pollPaymentStatus(txId);
        if (status === 'paid') {
          toast.success('Thanh toán phần còn lại thành công, chờ hệ thống cập nhật trạng thái');
        } else if (status === 'failed') {
          toast.error('Thanh toán thất bại hoặc bị hủy');
        } else {
          toast.info('Thanh toán đang chờ xác nhận');
        }
      }

      await fetchDetail();
    } catch (err) {
      console.error('pay-balance error:', err);
      toast.error(err?.response?.data?.message || 'Không tạo được thanh toán phần còn lại');
    } finally {
      setActionLoading('');
    }
  };

  const handleConfirmDelivery = () => {
    // Backend yêu cầu matchesReport là boolean; mặc định true khi buyer xác nhận đã nhận hàng
    const payload = { matchesReport: true };
    runAction('confirm', () => transactionApi.confirmDelivery(id, payload));
  };

  const handleCancel = () => {
    const reason = window.prompt('Lý do hủy (tùy chọn)');
    runAction('cancel', () => transactionApi.cancel(id, reason));
  };

  /* ── timeline steps derived from transaction state ── */
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

  return (
    <div className="min-h-screen bg-[var(--lux-gray-50)] bg-opacity-50 py-12 md:py-24 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ═══ EXECUTIVE TOP BAR ═══ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <Button
            variant="outline"
            onClick={() => navigate('/buyer/dashboard')}
            className="w-fit border-0 shadow-none hover:bg-[var(--lux-gray-200)]/40 text-[var(--lux-gray-500)] text-sm font-medium transition-colors pl-2 pr-4 py-2"
          >
            ← Quay lại quản lý
          </Button>
          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-[var(--lux-gray-400)] uppercase mb-1">
              Mã Lưu Trữ Kỹ Thuật Số
            </span>
            <span className="text-xs font-mono text-[var(--lux-gray-600)] tracking-tight">
              {tx._id || tx.id}
            </span>
          </div>
        </div>

        {/* ═══ LUXURY STATEMENT CARD ═══ */}
        <Card className="bg-white rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.06)] border border-[var(--lux-gray-200)]/60 overflow-hidden">
          {/* STATEMENT HERO */}
          <div className="relative px-8 md:px-20 py-16 lg:py-20 text-center border-b border-[var(--lux-gray-100)]">
            {/* Top Brand Trim */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--lux-primary-900)]"></div>

            <div className="flex justify-center mb-8">
              <Badge
                variant={statusBadgeVariant(tx.status)}
                className="px-5 py-2 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-[0.15em] uppercase border border-[var(--lux-gray-200)]/50 shadow-sm"
              >
                {statusLabel}
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--lux-primary-900)] tracking-tighter mb-4 flex justify-center items-start gap-1">
              <span>{amount}</span>
              <span className="text-2xl md:text-4xl font-medium text-[var(--lux-gray-400)] tracking-normal mt-2 md:mt-3">
                ₫
              </span>
            </h1>

            <div className="max-w-2xl mx-auto mt-6 space-y-1">
              <p className="text-lg md:text-xl font-bold text-[var(--lux-gray-800)] tracking-tight">
                {bikeTitle}
              </p>
              <p className="text-xs font-semibold tracking-widest text-[var(--lux-gray-400)] uppercase">
                {formatDateTime(tx.createdAt)}
              </p>
            </div>

            {isBuyer && (
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {canPayBalance && (
                  <Button
                    variant="primary"
                    disabled={actionLoading === 'pay-balance'}
                    onClick={handlePayBalance}
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
                  >
                    {actionLoading === 'confirm' ? 'Đang xác nhận...' : 'Xác nhận đã nhận hàng'}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    disabled={actionLoading === 'cancel'}
                    onClick={handleCancel}
                  >
                    {actionLoading === 'cancel' ? 'Đang hủy...' : 'Hủy giao dịch'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* TWO-COLUMN EXECUTIVE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--lux-gray-100)]">
            {/* LEFT SHEET: FINANCIAL & LOGISTICS */}
            <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 space-y-14 bg-white">
              {/* PAYMENT SECTION */}
              <section>
                <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6 border-b border-[var(--lux-gray-100)] pb-4">
                  Chi tiết thanh toán
                </h3>
                <dl className="space-y-1">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                    <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">Hạng mục</dt>
                    <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)] capitalize">
                      {tx.type}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                    <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                      Phương thức
                    </dt>
                    <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)]">
                      {tx.payment?.method || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                    <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                      Mã khế ước đích
                    </dt>
                    <dd className="text-[12.5px] font-mono text-[var(--lux-gray-800)] truncate pl-4 max-w-[60%] text-right">
                      {tx.payment?.transactionId || '--'}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                      Chữ ký thời gian
                    </dt>
                    <dd className="text-[13px] font-semibold text-[var(--lux-gray-900)]">
                      {formatDateTime(tx.payment?.paidAt)}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* ESCROW SECTION */}
              <section>
                <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6 border-b border-[var(--lux-gray-100)] pb-4">
                  Bảo vệ Escrow
                </h3>
                <dl className="space-y-1">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                    <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                      Pháp nhân giữ tiền
                    </dt>
                    <dd className="text-[14px] font-bold text-[var(--lux-primary-800)]">
                      {tx.escrow?.heldAmount ? `${formatCurrency(tx.escrow.heldAmount)} ₫` : '--'}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                      Mốc tự động giải ngân
                    </dt>
                    <dd className="text-[13px] font-semibold text-[var(--lux-gray-900)]">
                      {formatDateTime(tx.escrow?.autoReleaseDeadline)}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* SHIPPING SECTION */}
              {tx.shipping && (
                <section>
                  <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6 border-b border-[var(--lux-gray-100)] pb-4">
                    Thông tin vận chuyển
                  </h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Đối tác logistics
                      </dt>
                      <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)]">
                        {tx.shipping.provider || '--'}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Mã vận đơn
                      </dt>
                      <dd className="text-[13.5px] font-bold text-[var(--lux-primary-900)]">
                        {tx.shipping.trackingNumber || '--'}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Thời điểm lấy hàng
                      </dt>
                      <dd className="text-[13px] font-semibold text-[var(--lux-gray-900)]">
                        {formatDateTime(tx.shipping.shippedAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Thời điểm phát thành công
                      </dt>
                      <dd className="text-[13px] font-semibold text-[var(--lux-gray-900)]">
                        {formatDateTime(tx.shipping.deliveredAt)}
                      </dd>
                    </div>
                  </dl>
                </section>
              )}
            </div>

            {/* RIGHT SHEET: SYSTEM TIMELINE */}
            <div className="lg:col-span-5 p-8 sm:p-12 md:p-16 bg-[var(--lux-gray-50)]/50">
              <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-12">
                Trình tự hệ thống
              </h3>

              <div className="relative pl-2">
                {timelineSteps.map((step, i) => {
                  const isLast = i === timelineSteps.length - 1;
                  return (
                    <div key={step.key} className="relative flex gap-6 pb-12 last:pb-0">
                      {/* Vertical line connector */}
                      {!isLast && (
                        <div
                          className={`absolute top-6 left-[9px] w-[2px] h-[calc(100%-8px)] rounded-full ${
                            step.done
                              ? 'bg-[var(--lux-primary-800)]'
                              : 'bg-[var(--lux-gray-200)]/70'
                          }`}
                        />
                      )}

                      {/* Status Dot */}
                      <div className="relative z-10 shrink-0 mt-1">
                        <div
                          className={`w-[20px] h-[20px] rounded-full flex items-center justify-center border-[2px] transition-colors duration-300 bg-white ${
                            step.done
                              ? 'border-[var(--lux-primary-800)] shadow-[0_0_0_4px_rgba(6,78,59,0.05)]'
                              : 'border-[var(--lux-gray-200)]'
                          }`}
                        >
                          {step.done && (
                            <div className="w-[8px] h-[8px] rounded-full bg-[var(--lux-primary-800)]" />
                          )}
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="flex-1 -mt-0.5">
                        <p
                          className={`text-[15px] font-bold tracking-tight mb-1 transition-colors duration-300 ${
                            step.done
                              ? 'text-[var(--lux-primary-900)]'
                              : 'text-[var(--lux-gray-400)]'
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.time ? (
                          <p className="text-[12.5px] font-medium text-[var(--lux-gray-500)]">
                            {formatDateTime(step.time)}
                          </p>
                        ) : (
                          <p className="text-[12.5px] font-medium text-[var(--lux-gray-400)] italic">
                            Chưa ghi nhận
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECURITY WATERMARK FOOTER */}
          <div className="bg-[var(--lux-primary-900)] flex items-center justify-center p-4">
            <span className="text-[9px] font-extrabold tracking-[0.3em] text-white/50 uppercase">
              Authenticated & Secured by Bicycle Marketplace
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetail;
