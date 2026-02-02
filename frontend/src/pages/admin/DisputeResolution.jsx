import React, { useState } from 'react';
import { Badge } from '../../components/ui';

const DisputeResolution = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  const [disputes] = useState([
    {
      id: 'DSP001',
      orderId: 'ORD12345',
      bikeName: 'Giant XTC SLR 29',
      buyer: 'Nguyễn Văn A',
      seller: 'Trần Thị B',
      amount: 25000000,
      status: 'pending',
      priority: 'high',
      createdDate: '2024-12-20',
      reason: 'Sản phẩm không đúng mô tả',
      description:
        'Xe có nhiều vết xước và trầy không được mô tả trong tin đăng. Người mua yêu cầu hoàn tiền.',
      evidence: ['Ảnh xe khi nhận', 'Ảnh trong tin đăng'],
    },
    {
      id: 'DSP002',
      orderId: 'ORD12344',
      bikeName: 'Trek Domane AL 2',
      buyer: 'Lê Văn C',
      seller: 'Phạm Minh D',
      amount: 18900000,
      status: 'investigating',
      priority: 'medium',
      createdDate: '2024-12-18',
      assignedTo: 'Admin User',
      reason: 'Người bán không giao hàng đúng hạn',
      description: 'Đã quá 5 ngày so với thời gian hẹn nhưng người bán vẫn chưa giao xe.',
      evidence: ['Tin nhắn với người bán', 'Thỏa thuận giao hàng'],
    },
    {
      id: 'DSP003',
      orderId: 'ORD12343',
      bikeName: 'Specialized Sirrus X 3.0',
      buyer: 'Hoàng Thị E',
      seller: 'Vũ Văn F',
      amount: 16200000,
      status: 'resolved',
      priority: 'low',
      createdDate: '2024-12-15',
      resolvedDate: '2024-12-19',
      resolution: 'Hoàn tiền 50% cho người mua, người bán đồng ý nhận xe lại',
      reason: 'Sản phẩm bị lỗi kỹ thuật',
      description: 'Phanh xe bị hư, cần sửa chữa. Hai bên thỏa thuận chia sẻ chi phí sửa chữa.',
    },
  ]);

  const statusLabels = {
    pending: 'Chờ xử lý',
    investigating: 'Đang điều tra',
    resolved: 'Đã giải quyết',
    rejected: 'Từ chối',
  };

  const priorityLabels = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
  };

  const filteredDisputes = disputes.filter((dispute) => {
    return filterStatus === 'all' || dispute.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Giải quyết tranh chấp</h1>
        <p className="text-gray-600">Xử lý các tranh chấp giữa người mua và người bán</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng tranh chấp', value: disputes.length, color: 'blue' },
          {
            label: 'Chờ xử lý',
            value: disputes.filter((d) => d.status === 'pending').length,
            color: 'yellow',
          },
          {
            label: 'Đang xử lý',
            value: disputes.filter((d) => d.status === 'investigating').length,
            color: 'orange',
          },
          {
            label: 'Đã giải quyết',
            value: disputes.filter((d) => d.status === 'resolved').length,
            color: 'green',
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="investigating">Đang điều tra</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dispute List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">#{dispute.id}</h3>
                  <Badge
                    variant={
                      dispute.status === 'pending'
                        ? 'warning'
                        : dispute.status === 'investigating'
                          ? 'secondary'
                          : dispute.status === 'resolved'
                            ? 'success'
                            : 'danger'
                    }
                  >
                    {statusLabels[dispute.status]}
                  </Badge>
                  <Badge
                    variant={
                      dispute.priority === 'high'
                        ? 'danger'
                        : dispute.priority === 'medium'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    Ưu tiên {priorityLabels[dispute.priority]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Đơn hàng: {dispute.orderId}</p>
                <p className="text-sm text-gray-600">Sản phẩm: {dispute.bikeName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {(dispute.amount / 1000000).toFixed(1)}M ₫
                </p>
                <p className="text-xs text-gray-500">{dispute.createdDate}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Người mua</p>
                  <p className="font-medium text-gray-900">{dispute.buyer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Người bán</p>
                  <p className="font-medium text-gray-900">{dispute.seller}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-medium text-gray-900 mb-1">Lý do tranh chấp:</p>
                <p className="text-sm text-gray-700">{dispute.reason}</p>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-sm font-medium text-gray-900 mb-1">Mô tả chi tiết:</p>
                <p className="text-sm text-gray-700">{dispute.description}</p>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-sm font-medium text-gray-900 mb-2">Bằng chứng:</p>
                <div className="flex gap-2 flex-wrap">
                  {dispute.evidence.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      📎 {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {dispute.status === 'investigating' && dispute.assignedTo && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>🔍 Đang xử lý bởi:</strong> {dispute.assignedTo}
                </p>
              </div>
            )}

            {dispute.status === 'resolved' && (
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  <strong>✓ Đã giải quyết:</strong> {dispute.resolvedDate}
                </p>
                <p className="text-sm text-green-700 mt-1">Phương án: {dispute.resolution}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                Xem chi tiết
              </button>
              {dispute.status === 'pending' && (
                <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium">
                  Bắt đầu điều tra
                </button>
              )}
              {dispute.status === 'investigating' && (
                <>
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">
                    Đánh dấu đã giải quyết
                  </button>
                  <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 font-medium">
                    Liên hệ các bên
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDisputes.length === 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Không có tranh chấp nào</p>
        </div>
      )}
    </div>
  );
};

export default DisputeResolution;
