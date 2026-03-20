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
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: 'var(--lux-gold)' }}
                >
                  Tranh chấp của bạn
                </span>
              </div>
              <h1
                className="text-3xl lg:text-4xl font-bold mb-2 leading-tight"
                style={{ color: 'white', fontFamily: "'Playfair Display', serif" }}
              >
                Tranh chấp & <span style={{ color: 'var(--lux-gold)' }}>Xử lý</span>
              </h1>
              <p className="text-sm max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Theo dõi và quản lý các tranh chấp mà bạn đã gửi để giải quyết các vấn đề với đơn hàng.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDisputes}
                disabled={loading}
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 pb-32">
        {/* Filter */}
        <div 
          className="mb-8 p-6 rounded-[24px] shadow-soft"
          style={{ backgroundColor: 'white', border: '1px solid var(--lux-gray-100)' }}
        >
          <div className="flex items-center gap-6">
            <div className="flex-1 max-w-sm">
              <label 
                className="block text-sm font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--lux-gray-500)' }}
              >
                Lọc theo trạng thái
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-[16px] font-semibold transition-all cursor-pointer focus:outline-none appearance-none"
                  style={{
                    backgroundColor: 'var(--lux-gray-50)',
                    border: '2px solid var(--lux-gray-200)',
                    color: 'var(--lux-gray-800)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--lux-primary-800)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--lux-gray-200)')}
                >
                  <option value="">Tất cả tranh chấp</option>
                  {Object.entries(DisputeStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    style={{ color: 'var(--lux-gray-500)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div 
            className="w-10 h-10 border-[3px] rounded-full animate-spin"
            style={{ 
              borderColor: 'var(--lux-gray-200)', 
              borderTopColor: 'var(--lux-primary-800)' 
            }}
          ></div>
        </div>
      ) : disputes.length === 0 ? (
        <div 
          className="p-16 text-center rounded-[24px]"
          style={{ backgroundColor: 'white', border: '1px dashed var(--lux-gray-300)' }}
        >
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--lux-gray-50)' }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--lux-gray-400)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--lux-gray-800)' }}>
            Không có tranh chấp nào
          </p>
          <p className="text-sm" style={{ color: 'var(--lux-gray-500)' }}>
            Bạn chưa gửi hoặc chưa có tranh chấp nào phù hợp với bộ lọc.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Card
              key={d._id}
              className="p-6 cursor-pointer transition-all duration-300 rounded-[24px]"
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid var(--lux-gray-100)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(var(--lux-primary-800), 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--lux-gray-100)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
              }}
              onClick={() => navigate(`/buyer/disputes/${d._id}`)}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 
                      className="text-lg font-bold"
                      style={{ color: 'var(--lux-gray-800)', fontFamily: "'Playfair Display', serif" }}
                    >
                      {DisputeReasonLabels[d.reason] || d.reason}
                    </h3>
                    <Badge variant={statusBadgeVariant(d.status)}>
                      {DisputeStatusLabels[d.status] || d.status}
                    </Badge>
                  </div>
                  <p 
                    className="text-sm font-mono flex items-center gap-2" 
                    style={{ color: 'var(--lux-gray-500)' }}
                  >
                    <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    {d._id}
                  </p>
                </div>
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold self-start"
                  style={{ backgroundColor: 'var(--lux-gray-50)', color: 'var(--lux-gray-600)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(d.createdAt)}
                </div>
              </div>
              {d.description && (
                <div 
                  className="p-4 rounded-[16px]"
                  style={{ backgroundColor: 'var(--lux-gray-50)' }}
                >
                  <p 
                    className="text-sm line-clamp-2 leading-relaxed"
                    style={{ color: 'var(--lux-gray-700)' }}
                  >
                    {d.description}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default MyDisputes;
