import React, { useEffect, useState } from 'react';
import { Badge, Button, Modal, Textarea, Pagination } from '../../components/ui';
import disputeApi from '../../api/disputeApi';
import escrowApi from '../../api/escrowApi';
import {
  DisputeStatusLabels,
  DisputeReasonLabels,
  DisputeDecisionLabels,
} from '../../constants/dispute';
import { toast } from 'react-toastify';

const statusBadgeVariant = (status) => {
  if (status === 'open') return 'warning';
  if (status === 'under_review' || status === 'awaiting_evidence') return 'secondary';
  if (['resolved_buyer_favor', 'resolved_partial_refund'].includes(status)) return 'success';
  if (status === 'resolved_seller_favor') return 'primary';
  if (status === 'closed') return 'danger';
  return 'secondary';
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '--';

const formatCurrency = (v) => Number(v || 0).toLocaleString('vi-VN');

const DisputeResolution = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState('');

  // Resolve modal
  const [resolveModal, setResolveModal] = useState(false);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveForm, setResolveForm] = useState({
    decision: 'buyer_favor',
    refundAmount: 0,
    penaltyToSeller: 0,
    penaltyToBuyer: 0,
    notes: '',
    requireReturn: false,
  });

  // Detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [detailDispute, setDetailDispute] = useState(null);

  // Escrow modal
  const [escrowModal, setEscrowModal] = useState(false);
  const [escrowTarget, setEscrowTarget] = useState(null);
  const [escrowAction, setEscrowAction] = useState('release');
  const [escrowReason, setEscrowReason] = useState('');

  const limit = 20;

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filterStatus) params.status = filterStatus;
      const res = await disputeApi.getAll(params);
      const data = res?.data?.data || [];
      setDisputes(Array.isArray(data) ? data : []);
      setPagination(res?.data?.pagination || { total: data.length, pages: 1 });
    } catch (err) {
      console.error('Fetch disputes error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được danh sách tranh chấp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [filterStatus, page]);

  const handleAssign = async (disputeId) => {
    setActionLoading(disputeId);
    try {
      await disputeApi.assign(disputeId);
      toast.success('Đã nhận xử lý tranh chấp');
      await fetchDisputes();
    } catch (err) {
      console.error('Assign error:', err);
      toast.error(err?.response?.data?.message || 'Không thể nhận xử lý');
    } finally {
      setActionLoading('');
    }
  };

  const openResolveModal = (dispute) => {
    setResolveTarget(dispute);
    setResolveForm({
      decision: 'buyer_favor',
      refundAmount: 0,
      penaltyToSeller: 0,
      penaltyToBuyer: 0,
      notes: '',
      requireReturn: false,
    });
    setResolveModal(true);
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    if (!resolveForm.notes.trim()) {
      toast.error('Vui lòng nhập ghi chú giải quyết');
      return;
    }
    setActionLoading(resolveTarget._id);
    try {
      await disputeApi.resolve(resolveTarget._id, resolveForm);
      toast.success('Đã giải quyết tranh chấp');
      setResolveModal(false);
      setResolveTarget(null);
      await fetchDisputes();
    } catch (err) {
      console.error('Resolve error:', err);
      toast.error(err?.response?.data?.message || 'Không thể giải quyết tranh chấp');
    } finally {
      setActionLoading('');
    }
  };

  const openDetail = async (disputeId) => {
    try {
      const res = await disputeApi.getById(disputeId);
      setDetailDispute(res?.data?.data || null);
      setDetailModal(true);
    } catch (err) {
      toast.error('Không tải được chi tiết');
    }
  };

  const openEscrowModal = (dispute, action) => {
    setEscrowTarget(dispute);
    setEscrowAction(action);
    setEscrowReason('');
    setEscrowModal(true);
  };

  const handleEscrowAction = async () => {
    if (!escrowTarget || !escrowReason.trim()) {
      toast.error('Vui lòng nhập lý do');
      return;
    }
    const txId =
      typeof escrowTarget.transactionId === 'object'
        ? escrowTarget.transactionId._id
        : escrowTarget.transactionId;
    setActionLoading(escrowTarget._id);
    try {
      if (escrowAction === 'release') {
        await escrowApi.releaseFunds(txId, escrowReason);
        toast.success('Đã giải ngân cho seller');
      } else {
        await escrowApi.refundFunds(txId, escrowReason);
        toast.success('Đã hoàn tiền cho buyer');
      }
      setEscrowModal(false);
      await fetchDisputes();
    } catch (err) {
      console.error('Escrow action error:', err);
      toast.error(err?.response?.data?.message || 'Lỗi thao tác escrow');
    } finally {
      setActionLoading('');
    }
  };

  const stats = [
    { label: 'Tổng tranh chấp', value: pagination.total || disputes.length },
    { label: 'Chờ xử lý', value: disputes.filter((d) => d.status === 'open').length },
    { label: 'Đang xem xét', value: disputes.filter((d) => d.status === 'under_review').length },
    {
      label: 'Đã giải quyết',
      value: disputes.filter((d) =>
        ['resolved_buyer_favor', 'resolved_seller_favor', 'resolved_partial_refund'].includes(
          d.status
        )
      ).length,
    },
  ];

  return (
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Giải quyết tranh chấp</h1>
        <p className="text-warmgray-600">Xử lý các tranh chấp giữa người mua và người bán</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="lux-panel">
            <p className="text-warmgray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="lux-panel mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(DisputeStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dispute List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-[3px] border-warmgray-200 border-t-primary-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute._id} className="lux-panel">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-primary-900">
                      {DisputeReasonLabels[dispute.reason] || dispute.reason}
                    </h3>
                    <Badge variant={statusBadgeVariant(dispute.status)}>
                      {DisputeStatusLabels[dispute.status] || dispute.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-warmgray-500 font-mono">Mã: {dispute._id}</p>
                  {dispute.reporterId && (
                    <p className="text-sm text-warmgray-600 mt-1">
                      Người báo:{' '}
                      {typeof dispute.reporterId === 'object'
                        ? dispute.reporterId.name || dispute.reporterId.email
                        : dispute.reporterId}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-warmgray-500">{formatDate(dispute.createdAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-warmgray-50 rounded-[16px] p-4 mb-4">
                {dispute.description && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-primary-900 mb-1">Mô tả:</p>
                    <p className="text-sm text-warmgray-700">{dispute.description}</p>
                  </div>
                )}
                {/* Evidence */}
                {(dispute.evidence?.photos?.length > 0 || dispute.evidence?.videos?.length > 0) && (
                  <div className="border-t border-warmgray-200 pt-3">
                    <p className="text-sm font-medium text-primary-900 mb-2">Bằng chứng:</p>
                    <div className="flex gap-2 flex-wrap">
                      {dispute.evidence?.photos?.map((url, idx) => (
                        <a key={`p-${idx}`} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="" className="w-16 h-16 object-cover rounded border" />
                        </a>
                      ))}
                      {dispute.evidence?.videos?.map((url, idx) => (
                        <a
                          key={`v-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-primary-800/10 text-primary-900 rounded text-xs"
                        >
                          🎬 Video {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned admin */}
              {dispute.assignedAdminId && (
                <div className="bg-primary-800/5 p-3 rounded-[16px] mb-4">
                  <p className="text-sm text-primary-900">
                    <strong>Đang xử lý bởi:</strong>{' '}
                    {typeof dispute.assignedAdminId === 'object'
                      ? dispute.assignedAdminId.name || dispute.assignedAdminId.email
                      : dispute.assignedAdminId}
                  </p>
                </div>
              )}

              {/* Resolution */}
              {dispute.resolution?.decision && (
                <div className="bg-green-50 p-3 rounded-[16px] mb-4">
                  <p className="text-sm text-green-800">
                    <strong>Kết quả:</strong>{' '}
                    {DisputeDecisionLabels[dispute.resolution.decision] ||
                      dispute.resolution.decision}
                  </p>
                  {dispute.resolution.refundAmount > 0 && (
                    <p className="text-sm text-green-700 mt-1">
                      Hoàn tiền: {formatCurrency(dispute.resolution.refundAmount)} ₫
                    </p>
                  )}
                  {dispute.resolution.notes && (
                    <p className="text-sm text-warmgray-600 mt-1">
                      Ghi chú: {dispute.resolution.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => openDetail(dispute._id)}
                  className="flex-1 bg-primary-700 text-white py-2 rounded-[16px] hover:bg-primary-800 font-medium min-w-[120px]"
                >
                  Xem chi tiết
                </button>
                {dispute.status === 'open' && (
                  <button
                    onClick={() => handleAssign(dispute._id)}
                    disabled={actionLoading === dispute._id}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-[16px] hover:bg-yellow-600 font-medium disabled:opacity-50 min-w-[120px]"
                  >
                    {actionLoading === dispute._id ? 'Đang xử lý...' : 'Nhận xử lý'}
                  </button>
                )}
                {dispute.status === 'under_review' && (
                  <>
                    <button
                      onClick={() => openResolveModal(dispute)}
                      disabled={actionLoading === dispute._id}
                      className="flex-1 bg-green-600 text-white py-2 rounded-[16px] hover:bg-green-700 font-medium disabled:opacity-50 min-w-[120px]"
                    >
                      Giải quyết
                    </button>
                    <button
                      onClick={() => openEscrowModal(dispute, 'refund')}
                      className="flex-1 border border-warmgray-300 py-2 rounded-[16px] hover:bg-warmgray-50 font-medium min-w-[120px]"
                    >
                      Hoàn tiền (Escrow)
                    </button>
                    <button
                      onClick={() => openEscrowModal(dispute, 'release')}
                      className="flex-1 border border-warmgray-300 py-2 rounded-[16px] hover:bg-warmgray-50 font-medium min-w-[120px]"
                    >
                      Giải ngân (Escrow)
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {disputes.length === 0 && !loading && (
        <div className="lux-panel p-12 text-center">
          <p className="text-warmgray-500 text-lg">Không có tranh chấp nào</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        </div>
      )}

      {/* ── Resolve Modal ── */}
      {resolveModal && (
        <Modal
          isOpen={resolveModal}
          onClose={() => setResolveModal(false)}
          title="Giải quyết tranh chấp"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">Quyết định</label>
              <select
                value={resolveForm.decision}
                onChange={(e) => setResolveForm((prev) => ({ ...prev, decision: e.target.value }))}
                className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
              >
                {Object.entries(DisputeDecisionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {resolveForm.decision === 'partial_refund' && (
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Số tiền hoàn (₫)
                </label>
                <input
                  type="number"
                  min="0"
                  value={resolveForm.refundAmount}
                  onChange={(e) =>
                    setResolveForm((prev) => ({ ...prev, refundAmount: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Ghi chú giải quyết <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={resolveForm.notes}
                onChange={(e) => setResolveForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Nhập ghi chú giải quyết..."
                rows={4}
              />
            </div>

            {resolveForm.decision === 'buyer_favor' && (
              <label className="flex items-center gap-3 p-3 rounded-[16px] border border-warmgray-200 bg-warmgray-50">
                <input
                  type="checkbox"
                  checked={resolveForm.requireReturn}
                  onChange={(e) =>
                    setResolveForm((prev) => ({ ...prev, requireReturn: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
                <div className="text-sm">
                  <p className="font-semibold text-warmgray-900">
                    Yêu cầu buyer trả xe rồi mới hoàn tiền
                  </p>
                  <p className="text-warmgray-600 text-xs">
                    Bật để chuyển trạng thái sang return_requested và mở bước buyer báo đã gửi hàng.
                  </p>
                </div>
              </label>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setResolveModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleResolve}
                disabled={actionLoading === resolveTarget?._id}
              >
                {actionLoading === resolveTarget?._id ? 'Đang xử lý...' : 'Xác nhận giải quyết'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Detail Modal ── */}
      {detailModal && detailDispute && (
        <Modal
          isOpen={detailModal}
          onClose={() => {
            setDetailModal(false);
            setDetailDispute(null);
          }}
          title="Chi tiết tranh chấp"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-sm text-warmgray-500">Mã tranh chấp</p>
              <p className="font-mono text-sm">{detailDispute._id}</p>
            </div>
            <div>
              <p className="text-sm text-warmgray-500">Trạng thái</p>
              <Badge variant={statusBadgeVariant(detailDispute.status)}>
                {DisputeStatusLabels[detailDispute.status] || detailDispute.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-warmgray-500">Lý do</p>
              <p className="font-semibold">
                {DisputeReasonLabels[detailDispute.reason] || detailDispute.reason}
              </p>
            </div>
            {detailDispute.description && (
              <div>
                <p className="text-sm text-warmgray-500">Mô tả</p>
                <p className="text-sm whitespace-pre-wrap">{detailDispute.description}</p>
              </div>
            )}
            {/* Evidence */}
            {detailDispute.evidence?.photos?.length > 0 && (
              <div>
                <p className="text-sm text-warmgray-500 mb-2">Ảnh bằng chứng</p>
                <div className="flex flex-wrap gap-2">
                  {detailDispute.evidence.photos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Inspector report */}
            {detailDispute.inspectorReport?.comparisonNotes && (
              <div>
                <p className="text-sm text-warmgray-500">Báo cáo kiểm định</p>
                <p className="text-sm whitespace-pre-wrap">
                  {detailDispute.inspectorReport.comparisonNotes}
                </p>
              </div>
            )}
            {/* Resolution */}
            {detailDispute.resolution?.decision && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-semibold">
                  Kết quả:{' '}
                  {DisputeDecisionLabels[detailDispute.resolution.decision] ||
                    detailDispute.resolution.decision}
                </p>
                {detailDispute.resolution.notes && (
                  <p className="text-sm mt-1">{detailDispute.resolution.notes}</p>
                )}
              </div>
            )}
            {/* Timeline */}
            {detailDispute.timeline?.length > 0 && (
              <div>
                <p className="text-sm text-warmgray-500 mb-2">Lịch sử</p>
                <div className="space-y-2">
                  {detailDispute.timeline.map((t, i) => (
                    <div key={i} className="pl-4 border-l-2 border-warmgray-200 py-1">
                      <p className="text-sm font-medium">{t.action}</p>
                      {t.notes && <p className="text-xs text-warmgray-500">{t.notes}</p>}
                      <p className="text-xs text-warmgray-400">{formatDate(t.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Escrow Modal ── */}
      {escrowModal && (
        <Modal
          isOpen={escrowModal}
          onClose={() => setEscrowModal(false)}
          title={escrowAction === 'release' ? 'Giải ngân Escrow' : 'Hoàn tiền Escrow'}
        >
          <div className="space-y-4">
            <p className="text-sm text-warmgray-600">
              {escrowAction === 'release'
                ? 'Giải ngân tiền escrow cho người bán.'
                : 'Hoàn tiền escrow cho người mua.'}
            </p>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Lý do <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={escrowReason}
                onChange={(e) => setEscrowReason(e.target.value)}
                placeholder="Nhập lý do..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEscrowModal(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleEscrowAction}
                disabled={actionLoading === escrowTarget?._id}
              >
                {actionLoading === escrowTarget?._id ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DisputeResolution;
