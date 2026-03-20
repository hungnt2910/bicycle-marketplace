import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import disputeApi from '../../api/disputeApi';
import { DisputeStatusLabels, DisputeReasonLabels } from '../../constants/dispute';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const statusBadgeVariant = (status) => {
  if (status === 'open') return 'warning';
  if (status === 'under_review' || status === 'awaiting_evidence') return 'secondary';
  if (status === 'return_requested') return 'warning';
  if (status === 'awaiting_seller_confirmation') return 'secondary';
  if (status === 'return_received') return 'success';
  if (status === 'resolved_buyer_favor' || status === 'resolved_partial_refund') return 'success';
  if (status === 'resolved_seller_favor') return 'primary';
  if (status === 'closed') return 'danger';
  return 'secondary';
};

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

const formatCurrency = (v) => Number(v || 0).toLocaleString('vi-VN');

const translateAction = (action) => {
  if (!action) return '';
  const a = String(action).toLowerCase();

  if (a.includes('dispute opened')) return 'Tranh chấp được mở';
  if (a.includes('inspector evidence added')) return 'Chuyên viên kiểm định đã thêm bằng chứng';
  if (a.includes('assigned to admin')) return 'Đã chuyển cho admin xử lý';
  if (a.includes('return requested by admin')) return 'Admin yêu cầu trả hàng trước khi hoàn tiền';
  if (a.includes('buyer marked return sent')) return 'Người mua đã báo đã gửi hàng trả';
  if (a.includes('seller confirmed return received')) return 'Người bán xác nhận đã nhận hàng trả';
  if (a.includes('dispute resolved')) {
    if (a.includes('buyer_favor')) return 'Giải quyết: ưu tiên người mua';
    if (a.includes('seller_favor')) return 'Giải quyết: ưu tiên người bán';
    if (a.includes('partial')) return 'Giải quyết: hoàn tiền một phần';
    return 'Tranh chấp đã được giải quyết';
  }
  if (a.includes('awaiting') || a.includes('pending')) return 'Đang chờ xử lý';

  return action;
};

const splitListInput = (value) =>
  String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

/* ── Shared input class ── */
const inputCls =
  'w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-white outline-none transition-all duration-200 border border-[var(--lux-gray-200)] text-[var(--lux-gray-900)] focus:border-[var(--lux-primary-600)] focus:ring-2 focus:ring-[var(--lux-primary-600)]/10 placeholder:text-[var(--lux-gray-400)]';

const labelCls =
  'block text-xs font-semibold uppercase tracking-wide text-[var(--lux-gray-500)] mb-1.5';

/* ── Unified card wrapper ── */
const SectionCard = ({ children, className = '', accent = false }) => (
  <div
    className={`bg-white rounded-2xl border border-[var(--lux-gray-100)] shadow-sm overflow-hidden ${accent ? 'border-l-4 border-l-[var(--lux-primary-500)]' : ''} ${className}`}
  >
    {children}
  </div>
);

/* ── Section heading ── */
const SectionTitle = ({ children, icon }) => (
  <h2 className="text-lg font-semibold text-[var(--lux-gray-900)] flex items-center gap-2 mb-5">
    {icon && <span className="text-[var(--lux-primary-600)]">{icon}</span>}
    {children}
  </h2>
);

/* ── Info row (dt/dd) ── */
const InfoRow = ({ label, children, last = false }) => (
  <div className={`py-4 ${!last ? 'border-b border-[var(--lux-gray-100)]' : ''}`}>
    <dt className={labelCls}>{label}</dt>
    <dd className="text-sm font-medium text-[var(--lux-gray-800)] mt-0.5">{children}</dd>
  </div>
);

const DisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [markForm, setMarkForm] = useState({
    trackingNumber: '',
    courierName: '',
    shippedAt: '',
    note: '',
    evidenceImages: '',
  });
  const [confirmForm, setConfirmForm] = useState({
    conditionOk: true,
    sellerNote: '',
    images: '',
  });

  const timelineEntries = useMemo(() => {
    const raw =
      dispute?.timeline ||
      dispute?.history ||
      dispute?.logs ||
      dispute?.events ||
      dispute?.activity ||
      [];

    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') return { action: item };

        const action =
          item.action || item.title || item.status || item.event || item.message || item.label;
        const timestamp = item.timestamp || item.createdAt || item.date || item.time;
        const notes = item.notes || item.description || item.detail || item.reason || item.comment;

        if (!action) return null;
        return { action, timestamp, notes };
      })
      .filter(Boolean);
  }, [dispute]);

  const fetchDispute = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await disputeApi.getById(id);
      setDispute(res?.data?.data || null);
    } catch (err) {
      console.error('Fetch dispute error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được chi tiết tranh chấp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispute();
  }, [id]);

  const roleLower = (role || '').toLowerCase();
  const returnShipping =
    dispute?.returnShipping || dispute?.returnShipment || dispute?.returnInfo || null;
  const returnImages = returnShipping?.evidenceImages || returnShipping?.images || [];
  const canMarkReturnSent =
    roleLower === 'buyer' &&
    !returnShipping?.trackingInfo &&
    ['return_requested'].includes(dispute?.status);
  const canSellerConfirm =
    roleLower === 'seller' && ['awaiting_seller_confirmation'].includes(dispute?.status);
  const showReturnSection =
    ['return_requested', 'awaiting_seller_confirmation', 'return_received'].includes(
      dispute?.status
    ) || dispute?.resolution?.requireReturn;

  const sellerReturnNote = () => {
    if (canSellerConfirm) return 'Buyer đã báo gửi xe, vui lòng xác nhận đã nhận được để hoàn tất.';
    if (roleLower === 'seller' && dispute?.status === 'return_requested')
      return 'Đang chờ buyer báo đã gửi xe về cho bạn.';
    if (roleLower === 'seller' && dispute?.status === 'return_received')
      return 'Bạn đã xác nhận nhận hàng hoặc hệ thống đã hoàn tất.';
    return '';
  };

  const handleMarkReturnSent = async (e) => {
    e?.preventDefault?.();
    if (!id) return;
    setActionLoading('mark');
    const parts = [];
    if (markForm.trackingNumber) parts.push(`Tracking: ${markForm.trackingNumber}`);
    if (markForm.courierName) parts.push(`Courier: ${markForm.courierName}`);
    if (markForm.shippedAt) parts.push(`Shipped at: ${markForm.shippedAt}`);
    if (markForm.note) parts.push(`Note: ${markForm.note}`);

    const payload = {
      trackingInfo: parts.join(' | ') || undefined,
    };

    try {
      await disputeApi.markReturnSent(id, payload);
      toast.success('Đã ghi nhận bạn đã gửi xe về cho seller');
      await fetchDispute();
    } catch (err) {
      console.error('Mark return sent error:', err);
      toast.error(err?.response?.data?.message || 'Không thể báo đã gửi hàng');
    } finally {
      setActionLoading('');
    }
  };

  const handleSellerConfirm = async (e) => {
    e?.preventDefault?.();
    if (!id) return;
    setActionLoading('seller-confirm');

    try {
      await disputeApi.sellerConfirm(id);
      toast.success('Đã xác nhận đã nhận lại xe');
      await fetchDispute();
    } catch (err) {
      console.error('Seller confirm error:', err);
      toast.error(err?.response?.data?.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setActionLoading('');
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--lux-gray-50)]">
        <div className="w-11 h-11 rounded-full border-[3px] border-[var(--lux-gray-200)] border-t-[var(--lux-primary-600)] animate-spin" />
        <p className="text-sm text-[var(--lux-gray-400)] font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  /* ── Empty state ── */
  if (!dispute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--lux-gray-50)] px-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--lux-gray-100)] flex items-center justify-center">
          <svg
            className="w-7 h-7 text-[var(--lux-gray-400)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-[var(--lux-gray-600)]">
          Không tìm thấy tranh chấp
        </p>
        <button
          onClick={() => navigate('/buyer/disputes')}
          className="mt-1 text-sm font-semibold text-[var(--lux-primary-600)] hover:text-[var(--lux-primary-800)] transition-colors"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--lux-gray-50)]">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-[var(--lux-primary-900)]">
        {/* Decorative glows */}
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--lux-gold) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-36 opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, var(--lux-primary-500) 0%, transparent 70%)',
          }}
        />

        <div className="container-custom py-8 lg:py-10 relative z-10">
          {/* Back button */}
          <button
            onClick={() => navigate('/buyer/disputes')}
            className="mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--lux-gold)] bg-white/10 hover:bg-white/15 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại danh sách
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <h1
                className="text-2xl lg:text-3xl font-bold text-white leading-tight mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Chi tiết <span style={{ color: 'var(--lux-gold)' }}>Tranh chấp</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={statusBadgeVariant(dispute.status)}>
                  {DisputeStatusLabels[dispute.status] || dispute.status}
                </Badge>
                <p className="text-xs font-mono text-white/40 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  {dispute._id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="container-custom py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* ── Left: Main Content (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Info */}
            <SectionCard>
              <div className="p-6 lg:p-8">
                <SectionTitle
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  }
                >
                  Thông tin tranh chấp
                </SectionTitle>
                <dl>
                  <InfoRow label="Lý do">
                    <span className="font-semibold text-[var(--lux-gray-900)]">
                      {DisputeReasonLabels[dispute.reason] || dispute.reason}
                    </span>
                  </InfoRow>
                  <InfoRow label="Mô tả">
                    <span className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--lux-gray-700)]">
                      {dispute.description || '--'}
                    </span>
                  </InfoRow>
                  <InfoRow label="Ngày tạo" last>
                    {formatDateTime(dispute.createdAt)}
                  </InfoRow>
                </dl>
              </div>
            </SectionCard>

            {/* Evidence */}
            {(dispute.evidence?.photos?.length > 0 || dispute.evidence?.videos?.length > 0) && (
              <SectionCard>
                <div className="p-6 lg:p-8">
                  <SectionTitle
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  >
                    Bằng chứng
                  </SectionTitle>

                  {dispute.evidence.photos?.length > 0 && (
                    <div className="mb-6">
                      <p className={labelCls}>Ảnh ({dispute.evidence.photos.length})</p>
                      <div className="flex flex-wrap gap-3">
                        {dispute.evidence.photos.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group block overflow-hidden rounded-xl border border-[var(--lux-gray-200)] hover:border-[var(--lux-primary-500)] transition-colors"
                          >
                            <img
                              src={url}
                              alt={`evidence-photo-${idx}`}
                              className="w-24 h-24 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                />
                              </svg>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {dispute.evidence.videos?.length > 0 && (
                    <div>
                      <p className={labelCls}>Video ({dispute.evidence.videos.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {dispute.evidence.videos.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-semibold bg-[var(--lux-gray-100)] text-[var(--lux-gray-700)] hover:bg-[var(--lux-gray-200)] transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Video {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Inspector Report */}
            {dispute.inspectorReport?.comparisonNotes && (
              <SectionCard>
                <div className="p-6 lg:p-8">
                  <SectionTitle
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    }
                  >
                    Báo cáo kiểm định
                  </SectionTitle>
                  <div className="p-4 rounded-xl bg-[var(--lux-gray-50)] border border-[var(--lux-gray-100)]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--lux-gray-700)]">
                      {dispute.inspectorReport.comparisonNotes}
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Return Shipping Section */}
            {(showReturnSection || returnShipping || canMarkReturnSent || canSellerConfirm) && (
              <SectionCard>
                <div className="p-6 lg:p-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] font-bold text-[var(--lux-gray-400)] mb-1">
                        Luồng trả xe về seller
                      </p>
                      <h2
                        className="text-xl font-bold text-[var(--lux-gray-900)]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Vận chuyển hàng trả
                      </h2>
                      <p className="text-sm text-[var(--lux-gray-500)] mt-1">
                        Buyer đánh dấu đã gửi xe; Seller xác nhận đã nhận lại xe để hệ thống hoàn
                        tiền/giải ngân.
                      </p>
                    </div>

                    {/* Steps Summary */}
                    <div className="flex flex-col gap-2 text-sm text-[var(--lux-gray-600)] shrink-0">
                      {[
                        { label: 'Buyer báo đã gửi xe', active: true },
                        { label: 'Seller xác nhận đã nhận xe', active: true },
                        { label: 'Hoàn tất — Đã nhận lại xe', active: false },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              background: step.active
                                ? 'var(--lux-primary-600)'
                                : 'var(--lux-gray-300)',
                            }}
                          />
                          <span className="text-xs">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seller note */}
                  {sellerReturnNote() && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--lux-gray-50)] border border-[var(--lux-gray-200)] text-xs text-[var(--lux-gray-600)]">
                      {sellerReturnNote()}
                    </div>
                  )}

                  {/* Return received alert */}
                  {dispute.status === 'return_received' && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 flex items-start gap-2">
                      <svg
                        className="w-4 h-4 mt-0.5 shrink-0 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Seller đã xác nhận đã nhận lại xe. Quy trình hoàn tiền/giải ngân đã hoàn tất.
                    </div>
                  )}

                  {/* Return shipping info */}
                  {returnShipping && (
                    <div className="mb-6 rounded-2xl border border-[var(--lux-gray-200)] overflow-hidden">
                      {/* Header strip */}
                      <div className="px-5 py-3 bg-[var(--lux-gray-50)] border-b border-[var(--lux-gray-100)] flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--lux-primary-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--lux-gray-500)]">
                          Thông tin vận chuyển hàng trả
                        </span>
                      </div>

                      {/* Info row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--lux-gray-100)] bg-white">

                        {/* Đơn vị vận chuyển */}
                        <div className="flex items-start gap-3 px-5 py-4">
                          <div className="w-8 h-8 rounded-lg bg-[var(--lux-primary-600)]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-[var(--lux-primary-700)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className={labelCls}>Đơn vị vận chuyển</p>
                            <p className="text-sm font-semibold text-[var(--lux-primary-800)] break-words">
                              {returnShipping.trackingNumber || returnShipping.trackingInfo || '--'}
                            </p>
                          </div>
                        </div>

                        {/* Ngày gửi */}
                        <div className="flex items-start gap-3 px-5 py-4">
                          <div className="w-8 h-8 rounded-lg bg-[var(--lux-gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-[var(--lux-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className={labelCls}>Ngày gửi</p>
                            <p className="text-sm font-semibold text-[var(--lux-gray-800)]">
                              {formatDateTime(returnShipping.shippedAt || returnShipping.sentAt)}
                            </p>
                          </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="flex items-start gap-3 px-5 py-4">
                          <div className="w-8 h-8 rounded-lg bg-[var(--lux-gray-200)] flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-[var(--lux-gray-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className={labelCls}>Ghi chú</p>
                            <p className="text-sm font-medium text-[var(--lux-gray-700)] break-words">
                              {returnShipping.note ||
                                returnShipping.returnReasonDetail ||
                                returnShipping.trackingInfo ||
                                '--'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Photo gallery strip */}
                      {returnImages.length > 0 && (
                        <div className="px-5 py-4 bg-[var(--lux-gray-50)] border-t border-[var(--lux-gray-100)]">
                          <p className={`${labelCls} mb-3`}>
                            Ảnh bằng chứng
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-[var(--lux-gray-200)] text-[var(--lux-gray-600)] text-[10px] normal-case tracking-normal font-semibold">
                              {returnImages.length}
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {returnImages.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group block overflow-hidden rounded-xl border-2 border-transparent hover:border-[var(--lux-primary-500)] transition-all duration-200 shadow-sm"
                              >
                                <img
                                  src={url}
                                  alt={`return-evidence-${idx}`}
                                  className="w-20 h-20 object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                  {idx + 1}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Forms */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Buyer: mark return sent */}
                    {canMarkReturnSent && (
                      <form
                        onSubmit={handleMarkReturnSent}
                        className="p-5 rounded-xl border border-[var(--lux-gray-200)] bg-[var(--lux-gray-50)] space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-[var(--lux-gray-800)]">
                            Buyer: Báo đã gửi xe
                          </p>
                          <Badge variant="secondary">Bước 1</Badge>
                        </div>

                        <div>
                          <label className={labelCls}>Mã vận đơn *</label>
                          <input
                            required
                            value={markForm.trackingNumber}
                            onChange={(e) =>
                              setMarkForm((v) => ({ ...v, trackingNumber: e.target.value }))
                            }
                            className={inputCls}
                            placeholder="VD: GHN123456789"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Đơn vị vận chuyển</label>
                            <input
                              value={markForm.courierName}
                              onChange={(e) =>
                                setMarkForm((v) => ({ ...v, courierName: e.target.value }))
                              }
                              className={inputCls}
                              placeholder="GHN / GHTK"
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Thời điểm gửi</label>
                            <input
                              type="datetime-local"
                              value={markForm.shippedAt}
                              onChange={(e) =>
                                setMarkForm((v) => ({ ...v, shippedAt: e.target.value }))
                              }
                              className={inputCls}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>Ghi chú / Mô tả đóng gói</label>
                          <textarea
                            rows={3}
                            value={markForm.note}
                            onChange={(e) => setMarkForm((v) => ({ ...v, note: e.target.value }))}
                            className={inputCls}
                            placeholder="Đã chụp hình, đã tháo phụ kiện..."
                          />
                        </div>

                        <div>
                          <label className={labelCls}>
                            Ảnh bằng chứng (URL, phân cách bằng dấu phẩy)
                          </label>
                          <textarea
                            rows={2}
                            value={markForm.evidenceImages}
                            onChange={(e) =>
                              setMarkForm((v) => ({ ...v, evidenceImages: e.target.value }))
                            }
                            className={inputCls}
                            placeholder="https://.../pack-1.jpg, https://.../receipt.jpg"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          disabled={actionLoading === 'mark'}
                          className="w-full rounded-xl px-4 py-2.5 font-semibold"
                        >
                          {actionLoading === 'mark' ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Đang gửi thông tin...
                            </span>
                          ) : (
                            'Báo đã gửi xe về seller'
                          )}
                        </Button>
                      </form>
                    )}

                    {/* Seller: confirm received */}
                    {canSellerConfirm && (
                      <form
                        onSubmit={handleSellerConfirm}
                        className="p-5 rounded-xl border border-[var(--lux-gray-200)] bg-[var(--lux-gray-50)] space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-[var(--lux-gray-800)]">
                            Seller: Xác nhận đã nhận lại xe
                          </p>
                          <Badge variant="primary">Bước 2</Badge>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!confirmForm.conditionOk}
                            onChange={(e) =>
                              setConfirmForm((v) => ({ ...v, conditionOk: e.target.checked }))
                            }
                            className="w-4 h-4 rounded accent-[var(--lux-primary-600)]"
                          />
                          <span className="text-sm font-semibold text-[var(--lux-gray-800)]">
                            Tình trạng xe đúng như cam kết
                          </span>
                        </label>

                        <div>
                          <label className={labelCls}>Ghi chú (nếu có khác biệt)</label>
                          <textarea
                            rows={3}
                            value={confirmForm.sellerNote}
                            onChange={(e) =>
                              setConfirmForm((v) => ({ ...v, sellerNote: e.target.value }))
                            }
                            className={inputCls}
                            placeholder="Có vết xước mới, thiếu phụ kiện..."
                          />
                        </div>

                        <div>
                          <label className={labelCls}>
                            Ảnh khi nhận lại (URL, phân cách bằng dấu phẩy)
                          </label>
                          <textarea
                            rows={2}
                            value={confirmForm.images}
                            onChange={(e) =>
                              setConfirmForm((v) => ({ ...v, images: e.target.value }))
                            }
                            className={inputCls}
                            placeholder="https://.../receive-1.jpg"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="success"
                          disabled={actionLoading === 'seller-confirm'}
                          className="w-full rounded-xl px-4 py-2.5 font-semibold"
                        >
                          {actionLoading === 'seller-confirm' ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Đang xác nhận...
                            </span>
                          ) : (
                            'Xác nhận đã nhận lại xe'
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Resolution */}
            {dispute.resolution?.decision && (
              <SectionCard className="border-l-4 border-l-[var(--lux-primary-500)]">
                <div className="p-6 lg:p-8">
                  <SectionTitle
                    icon={<span className="text-[var(--lux-primary-500)] text-base">✓</span>}
                  >
                    Kết quả giải quyết
                  </SectionTitle>
                  <dl>
                    <InfoRow label="Quyết định">
                      <span className="font-semibold text-[var(--lux-gray-900)]">
                        {dispute.resolution.decision === 'buyer_favor' &&
                          'Có lợi cho người mua (hoàn tiền)'}
                        {dispute.resolution.decision === 'seller_favor' &&
                          'Có lợi cho người bán (giải ngân)'}
                        {dispute.resolution.decision === 'partial_refund' && 'Hoàn tiền một phần'}
                      </span>
                    </InfoRow>

                    {dispute.resolution.refundAmount > 0 && (
                      <InfoRow label="Số tiền hoàn">
                        <span className="text-xl font-bold text-[var(--lux-primary-700)]">
                          {formatCurrency(dispute.resolution.refundAmount)} ₫
                        </span>
                      </InfoRow>
                    )}

                    {dispute.resolution.notes && (
                      <InfoRow label="Ghi chú admin">
                        <span className="leading-relaxed text-[var(--lux-gray-700)]">
                          {dispute.resolution.notes}
                        </span>
                      </InfoRow>
                    )}

                    {dispute.resolution.resolvedAt && (
                      <InfoRow label="Ngày giải quyết" last>
                        {formatDateTime(dispute.resolution.resolvedAt)}
                      </InfoRow>
                    )}
                  </dl>
                </div>
              </SectionCard>
            )}
          </div>

          {/* ── Right: Sidebar (1/3) ── */}
          <div className="space-y-6 lg:sticky lg:top-6">
            <SectionCard>
              <div className="p-6">
                <SectionTitle
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                >
                  Lịch sử xử lý
                </SectionTitle>

                {timelineEntries.length > 0 ? (
                  <ol className="relative border-l-2 border-[var(--lux-gray-100)] ml-3 space-y-0">
                    {timelineEntries.map((entry, idx) => {
                      const isLatest = idx === timelineEntries.length - 1;
                      return (
                        <li key={idx} className="mb-7 ml-5 last:mb-0">
                          {/* Dot */}
                          <span
                            className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-white transition-all ${
                              isLatest
                                ? 'bg-[var(--lux-primary-600)] ring-[var(--lux-primary-100)]'
                                : 'bg-[var(--lux-gray-300)]'
                            }`}
                          >
                            {isLatest && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </span>

                          {/* Content */}
                          <div
                            className={`rounded-xl px-3 py-2.5 ${isLatest ? 'bg-[var(--lux-primary-900)]/5 border border-[var(--lux-primary-600)]/10' : ''}`}
                          >
                            <p
                              className={`text-sm font-semibold leading-snug ${isLatest ? 'text-[var(--lux-primary-800)]' : 'text-[var(--lux-gray-800)]'}`}
                            >
                              {translateAction(entry.action)}
                            </p>
                            {entry.timestamp && (
                              <time className="block text-xs text-[var(--lux-gray-400)] mt-0.5 mb-1">
                                {formatDateTime(entry.timestamp)}
                              </time>
                            )}
                            {entry.notes && (
                              <p className="text-xs leading-relaxed text-[var(--lux-gray-600)]">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--lux-gray-100)] flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[var(--lux-gray-400)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-[var(--lux-gray-400)] text-center">
                      Chưa có lịch sử
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetail;
