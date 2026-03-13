import React, { useEffect, useState } from 'react';
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

const DisputeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="dash-content flex justify-center py-20">
        <div className="w-8 h-8 border-[3px] border-warmgray-200 border-t-primary-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="dash-content text-center py-20">
        <p className="text-warmgray-500 text-lg">Không tìm thấy tranh chấp</p>
      </div>
    );
  }

  return (
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/buyer/disputes')} className="mb-4">
          ← Quay lại
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-primary-900">Chi tiết tranh chấp</h1>
          <Badge variant={statusBadgeVariant(dispute.status)}>
            {DisputeStatusLabels[dispute.status] || dispute.status}
          </Badge>
        </div>
        <p className="text-sm text-warmgray-500 font-mono">Mã: {dispute._id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason & Description */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary-900 mb-4">Thông tin tranh chấp</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-warmgray-500">Lý do</dt>
                <dd className="text-base font-semibold text-primary-900">
                  {DisputeReasonLabels[dispute.reason] || dispute.reason}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warmgray-500">Mô tả</dt>
                <dd className="text-sm text-warmgray-700 whitespace-pre-wrap">
                  {dispute.description || '--'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-warmgray-500">Ngày tạo</dt>
                <dd className="text-sm text-warmgray-700">{formatDateTime(dispute.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          {/* Evidence */}
          {(dispute.evidence?.photos?.length > 0 || dispute.evidence?.videos?.length > 0) && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-primary-900 mb-4">Bằng chứng</h2>
              {dispute.evidence.photos?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-warmgray-500 mb-2">Ảnh</h3>
                  <div className="flex flex-wrap gap-3">
                    {dispute.evidence.photos.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`evidence-photo-${idx}`}
                          className="w-24 h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {dispute.evidence.videos?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-warmgray-500 mb-2">Video</h3>
                  <div className="flex flex-wrap gap-2">
                    {dispute.evidence.videos.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-warmgray-100 rounded-full text-xs hover:bg-warmgray-200"
                      >
                        🎬 Video {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Inspector Report */}
          {dispute.inspectorReport?.comparisonNotes && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-primary-900 mb-4">Báo cáo kiểm định</h2>
              <p className="text-sm text-warmgray-700 whitespace-pre-wrap">
                {dispute.inspectorReport.comparisonNotes}
              </p>
            </Card>
          )}

          {/* Resolution */}
          {dispute.resolution?.decision && (
            <Card className="p-6 border-l-4 border-green-500">
              <h2 className="text-lg font-bold text-primary-900 mb-4">Kết quả giải quyết</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-warmgray-500">Quyết định</dt>
                  <dd className="text-base font-semibold text-primary-900">
                    {dispute.resolution.decision === 'buyer_favor' &&
                      'Có lợi cho người mua (hoàn tiền)'}
                    {dispute.resolution.decision === 'seller_favor' &&
                      'Có lợi cho người bán (giải ngân)'}
                    {dispute.resolution.decision === 'partial_refund' && 'Hoàn tiền một phần'}
                  </dd>
                </div>
                {dispute.resolution.refundAmount > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-warmgray-500">Số tiền hoàn</dt>
                    <dd className="text-base font-bold text-green-600">
                      {formatCurrency(dispute.resolution.refundAmount)} ₫
                    </dd>
                  </div>
                )}
                {dispute.resolution.notes && (
                  <div>
                    <dt className="text-sm font-medium text-warmgray-500">Ghi chú admin</dt>
                    <dd className="text-sm text-warmgray-700">{dispute.resolution.notes}</dd>
                  </div>
                )}
                {dispute.resolution.resolvedAt && (
                  <div>
                    <dt className="text-sm font-medium text-warmgray-500">Ngày giải quyết</dt>
                    <dd className="text-sm text-warmgray-700">
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
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary-900 mb-4">Lịch sử xử lý</h2>
            {dispute.timeline?.length > 0 ? (
              <div className="space-y-4">
                {dispute.timeline.map((entry, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 border-l-2 border-warmgray-200 pb-4 last:pb-0"
                  >
                    <div className="absolute left-[-5px] top-1 w-2 h-2 bg-primary-600 rounded-full"></div>
                    <p className="text-sm font-semibold text-primary-900">{entry.action}</p>
                    {entry.notes && <p className="text-xs text-warmgray-500 mt-1">{entry.notes}</p>}
                    <p className="text-xs text-warmgray-400 mt-1">
                      {formatDateTime(entry.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-warmgray-400">Chưa có lịch sử</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetail;
