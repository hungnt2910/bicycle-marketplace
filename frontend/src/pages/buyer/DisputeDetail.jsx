import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import disputeApi from '../../api/disputeApi';
import { DisputeStatusLabels, DisputeReasonLabels } from '../../constants/dispute';
import { toast } from 'react-toastify';

const statusBadgeVariant = (status) => {
  if (status === 'open') return 'warning';
  if (status === 'under_review' || status === 'awaiting_evidence') return 'secondary';
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
  if (a.includes('dispute resolved')) {
    if (a.includes('buyer_favor')) return 'Giải quyết: ưu tiên người mua';
    if (a.includes('seller_favor')) return 'Giải quyết: ưu tiên người bán';
    if (a.includes('partial')) return 'Giải quyết: hoàn tiền một phần';
    return 'Tranh chấp đã được giải quyết';
  }
  if (a.includes('awaiting') || a.includes('pending')) return 'Đang chờ xử lý';

  return action;
};

const DisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
    fetchDispute();
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex justify-center py-20"
        style={{ backgroundColor: 'var(--lux-gray-50)' }}
      >
        <div
          className="w-10 h-10 border-[3px] rounded-full animate-spin"
          style={{
            borderColor: 'var(--lux-gray-200)',
            borderTopColor: 'var(--lux-primary-800)',
          }}
        ></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-20"
        style={{ backgroundColor: 'var(--lux-gray-50)' }}
      >
        <p className="text-lg font-bold" style={{ color: 'var(--lux-gray-500)' }}>
          Không tìm thấy tranh chấp
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--lux-gray-50)' }}>
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--lux-primary-900)' }}
      >
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
            <div>
              <Button
                variant="outline"
                onClick={() => navigate('/buyer/disputes')}
                className="mb-6 px-4 py-2 border-none rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'var(--lux-gold)',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')
                }
              >
                ← Quay lại danh sách
              </Button>
              <h1
                className="text-3xl lg:text-4xl font-bold mb-3 leading-tight"
                style={{ color: 'white', fontFamily: "'Playfair Display', serif" }}
              >
                Chi tiết <span style={{ color: 'var(--lux-gold)' }}>Tranh chấp</span>
              </h1>
              <div className="flex items-center gap-4">
                <Badge variant={statusBadgeVariant(dispute.status)}>
                  {DisputeStatusLabels[dispute.status] || dispute.status}
                </Badge>
                <p
                  className="text-sm font-mono flex items-center gap-2"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <svg
                    className="w-4 h-4 opacity-50"
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

      <div className="container-custom py-8 pb-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason & Description */}
          <Card
            className="p-8 rounded-[24px]"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--lux-gray-100)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}
          >
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--lux-gray-900)', fontFamily: "'Playfair Display', serif" }}
            >
              Thông tin tranh chấp
            </h2>
            <dl className="space-y-5">
              <div className="pb-5" style={{ borderBottom: '1px solid var(--lux-gray-100)' }}>
                <dt
                  className="text-xs uppercase tracking-wide font-bold mb-1"
                  style={{ color: 'var(--lux-gray-400)' }}
                >
                  Lý do
                </dt>
                <dd className="text-base font-semibold" style={{ color: 'var(--lux-gray-800)' }}>
                  {DisputeReasonLabels[dispute.reason] || dispute.reason}
                </dd>
              </div>
              <div className="pb-5" style={{ borderBottom: '1px solid var(--lux-gray-100)' }}>
                <dt
                  className="text-xs uppercase tracking-wide font-bold mb-2"
                  style={{ color: 'var(--lux-gray-400)' }}
                >
                  Mô tả
                </dt>
                <dd
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--lux-gray-700)' }}
                >
                  {dispute.description || '--'}
                </dd>
              </div>
              <div>
                <dt
                  className="text-xs uppercase tracking-wide font-bold mb-1"
                  style={{ color: 'var(--lux-gray-400)' }}
                >
                  Ngày tạo
                </dt>
                <dd className="text-sm font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                  {formatDateTime(dispute.createdAt)}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Evidence */}
          {(dispute.evidence?.photos?.length > 0 || dispute.evidence?.videos?.length > 0) && (
            <Card
              className="p-8 rounded-[24px]"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--lux-gray-100)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              }}
            >
              <h2
                className="text-xl font-bold mb-6"
                style={{ color: 'var(--lux-gray-900)', fontFamily: "'Playfair Display', serif" }}
              >
                Bằng chứng
              </h2>
              {dispute.evidence.photos?.length > 0 && (
                <div className="mb-6">
                  <h3
                    className="text-xs uppercase tracking-wide font-bold mb-3"
                    style={{ color: 'var(--lux-gray-400)' }}
                  >
                    Ảnh
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {dispute.evidence.photos.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group block overflow-hidden rounded-[16px]"
                        style={{ border: '1px solid var(--lux-gray-200)' }}
                      >
                        <img
                          src={url}
                          alt={`evidence-photo-${idx}`}
                          className="w-28 h-28 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
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
                  <h3
                    className="text-xs uppercase tracking-wide font-bold mb-3"
                    style={{ color: 'var(--lux-gray-400)' }}
                  >
                    Video
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {dispute.evidence.videos.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: 'var(--lux-gray-100)',
                          color: 'var(--lux-gray-700)',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = 'var(--lux-gray-200)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = 'var(--lux-gray-100)')
                        }
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
            </Card>
          )}

          {/* Inspector Report */}
          {dispute.inspectorReport?.comparisonNotes && (
            <Card
              className="p-8 rounded-[24px]"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--lux-gray-100)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: 'var(--lux-gray-900)', fontFamily: "'Playfair Display', serif" }}
              >
                Báo cáo kiểm định
              </h2>
              <div className="p-5 rounded-[16px]" style={{ backgroundColor: 'var(--lux-gray-50)' }}>
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--lux-gray-700)' }}
                >
                  {dispute.inspectorReport.comparisonNotes}
                </p>
              </div>
            </Card>
          )}

          {/* Resolution */}
          {dispute.resolution?.decision && (
            <Card
              className="p-8 rounded-[24px] overflow-hidden relative"
              style={{
                backgroundColor: 'white',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              }}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
              <h2
                className="text-xl font-bold mb-6 flex items-center gap-2"
                style={{ color: 'var(--lux-gray-900)', fontFamily: "'Playfair Display', serif" }}
              >
                <span className="text-green-500">✓</span> Kết quả giải quyết
              </h2>
              <dl className="space-y-4">
                <div className="pb-4" style={{ borderBottom: '1px solid var(--lux-gray-100)' }}>
                  <dt
                    className="text-xs uppercase tracking-wide font-bold mb-1"
                    style={{ color: 'var(--lux-gray-400)' }}
                  >
                    Quyết định
                  </dt>
                  <dd className="text-base font-semibold" style={{ color: 'var(--lux-gray-800)' }}>
                    {dispute.resolution.decision === 'buyer_favor' &&
                      'Có lợi cho người mua (hoàn tiền)'}
                    {dispute.resolution.decision === 'seller_favor' &&
                      'Có lợi cho người bán (giải ngân)'}
                    {dispute.resolution.decision === 'partial_refund' && 'Hoàn tiền một phần'}
                  </dd>
                </div>
                {dispute.resolution.refundAmount > 0 && (
                  <div className="pb-4" style={{ borderBottom: '1px solid var(--lux-gray-100)' }}>
                    <dt
                      className="text-xs uppercase tracking-wide font-bold mb-1"
                      style={{ color: 'var(--lux-gray-400)' }}
                    >
                      Số tiền hoàn
                    </dt>
                    <dd className="text-xl font-bold text-green-600">
                      {formatCurrency(dispute.resolution.refundAmount)} ₫
                    </dd>
                  </div>
                )}
                {dispute.resolution.notes && (
                  <div className="pb-4" style={{ borderBottom: '1px solid var(--lux-gray-100)' }}>
                    <dt
                      className="text-xs uppercase tracking-wide font-bold mb-1"
                      style={{ color: 'var(--lux-gray-400)' }}
                    >
                      Ghi chú admin
                    </dt>
                    <dd
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--lux-gray-700)' }}
                    >
                      {dispute.resolution.notes}
                    </dd>
                  </div>
                )}
                {dispute.resolution.resolvedAt && (
                  <div>
                    <dt
                      className="text-xs uppercase tracking-wide font-bold mb-1"
                      style={{ color: 'var(--lux-gray-400)' }}
                    >
                      Ngày giải quyết
                    </dt>
                    <dd className="text-sm font-medium" style={{ color: 'var(--lux-gray-700)' }}>
                      {formatDateTime(dispute.resolution.resolvedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          )}
        </div>

        {/* Sidebar — Timeline */}
        <div className="space-y-6">
          <Card
            className="p-8 rounded-[24px]"
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--lux-gray-100)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}
          >
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--lux-gray-900)', fontFamily: "'Playfair Display', serif" }}
            >
              Lịch sử xử lý
            </h2>
            {timelineEntries.length > 0 ? (
              <div
                className="relative border-l-2 ml-3"
                style={{ borderColor: 'var(--lux-gray-200)' }}
              >
                {timelineEntries.map((entry, idx) => (
                  <div key={idx} className="mb-6 ml-6 last:mb-0">
                    <span
                      className="absolute flex items-center justify-center w-3 h-3 rounded-full -left-[7px] ring-4 ring-white transition-colors"
                      style={{
                        backgroundColor:
                          idx === timelineEntries.length - 1
                            ? 'var(--lux-primary-600)'
                            : 'var(--lux-gray-300)',
                      }}
                    ></span>
                    <h3
                      className="flex items-center text-sm font-bold"
                      style={{ color: 'var(--lux-gray-800)' }}
                    >
                      {translateAction(entry.action)}
                    </h3>
                    <time
                      className="block mb-2 text-xs font-normal leading-none"
                      style={{ color: 'var(--lux-gray-400)' }}
                    >
                      {formatDateTime(entry.timestamp)}
                    </time>
                    {entry.notes && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--lux-gray-600)' }}
                      >
                        {entry.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--lux-gray-400)' }}>
                Chưa có lịch sử
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetail;
