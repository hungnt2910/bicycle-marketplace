import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '--';

const MyDisputes = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await disputeApi.getMyDisputes(params);
      const data = res?.data?.data || [];
      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch disputes error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được danh sách tranh chấp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [filterStatus]);

  return (
    <div className="dash-content">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Tranh chấp của tôi</h1>
        <p className="text-warmgray-600">Theo dõi các tranh chấp bạn đã gửi</p>
      </div>

      {/* Filter */}
      <div className="lux-panel mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Lọc theo trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="">Tất cả</option>
              {Object.entries(DisputeStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-[3px] border-warmgray-200 border-t-primary-900 rounded-full animate-spin"></div>
        </div>
      ) : disputes.length === 0 ? (
        <div className="lux-panel p-12 text-center">
          <p className="text-warmgray-500 text-lg">Không có tranh chấp nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Card
              key={d._id}
              className="p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/buyer/disputes/${d._id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-primary-900">
                      {DisputeReasonLabels[d.reason] || d.reason}
                    </h3>
                    <Badge variant={statusBadgeVariant(d.status)}>
                      {DisputeStatusLabels[d.status] || d.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-warmgray-500 font-mono">Mã: {d._id}</p>
                </div>
                <span className="text-xs text-warmgray-400">{formatDate(d.createdAt)}</span>
              </div>
              {d.description && (
                <p className="text-sm text-warmgray-600 line-clamp-2">{d.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDisputes;
