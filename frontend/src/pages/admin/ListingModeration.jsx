import React, { useState } from 'react';
import { Badge } from '../../components/ui';

const ListingModeration = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [listings] = useState([
    {
      id: 1,
      name: 'Giant XTC SLR 29',
      seller: 'Trần Thị B',
      price: 25000000,
      status: 'pending',
      submitDate: '2024-12-20',
      category: 'Xe đạp địa hình',
      condition: 'Like New',
      images: 5,
      description:
        'Xe đạp Giant XTC SLR 29, hàng chính hãng, mới 95%, đầy đủ giấy tờ và phụ kiện...',
    },
    {
      id: 2,
      name: 'Trek Domane AL 2',
      seller: 'Nguyễn Văn A',
      price: 18900000,
      status: 'approved',
      submitDate: '2024-12-18',
      approvedDate: '2024-12-19',
      category: 'Xe đạp đường trường',
      condition: 'Excellent',
      images: 8,
      description: 'Trek Domane AL 2, xe đạp đường trường cao cấp, tình trạng tốt...',
    },
    {
      id: 3,
      name: 'Specialized Tarmac SL7',
      seller: 'Lê Văn C',
      price: 35000000,
      status: 'rejected',
      submitDate: '2024-12-19',
      rejectedDate: '2024-12-20',
      rejectedReason: 'Hình ảnh không rõ ràng, thiếu thông tin chi tiết về tình trạng xe',
      category: 'Xe đạp đường trường',
      condition: 'Good',
      images: 3,
      description: 'Specialized Tarmac SL7...',
    },
    {
      id: 4,
      name: 'Cannondale Quick 4',
      seller: 'Phạm Minh D',
      price: 11900000,
      status: 'pending',
      submitDate: '2024-12-21',
      category: 'Xe đạp Hybrid',
      condition: 'Good',
      images: 6,
      description: 'Cannondale Quick 4, xe đạp hybrid đa năng...',
    },
  ]);

  const statusLabels = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
  };

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };

  const filteredListings = listings.filter((listing) => {
    const matchStatus = filterStatus === 'all' || listing.status === filterStatus;
    const matchSearch =
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = listings.filter((l) => l.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm duyệt tin đăng</h1>
        <p className="text-gray-600">Xét duyệt và quản lý các tin đăng trên hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng tin đăng', value: listings.length, color: 'blue' },
          { label: 'Chờ duyệt', value: pendingCount, color: 'yellow' },
          {
            label: 'Đã duyệt',
            value: listings.filter((l) => l.status === 'approved').length,
            color: 'green',
          },
          {
            label: 'Từ chối',
            value: listings.filter((l) => l.status === 'rejected').length,
            color: 'red',
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên tin đăng, người bán..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listing List */}
      <div className="space-y-4">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{listing.name}</h3>
                  <Badge variant={statusColors[listing.status]}>
                    {statusLabels[listing.status]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">Người bán: {listing.seller}</p>
                <p className="text-sm text-gray-600">Ngày gửi: {listing.submitDate}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {(listing.price / 1000000).toFixed(1)}M ₫
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-600">Danh mục</p>
                <p className="font-medium text-gray-900">{listing.category}</p>
              </div>
              <div>
                <p className="text-gray-600">Tình trạng</p>
                <p className="font-medium text-gray-900">{listing.condition}</p>
              </div>
              <div>
                <p className="text-gray-600">Số hình ảnh</p>
                <p className="font-medium text-gray-900">{listing.images} ảnh</p>
              </div>
              <div>
                <p className="text-gray-600">Mô tả</p>
                <p className="font-medium text-gray-900">
                  {listing.description.length > 50
                    ? `${listing.description.substring(0, 50)}...`
                    : listing.description}
                </p>
              </div>
            </div>

            {listing.status === 'approved' && (
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  <strong>✓ Đã duyệt:</strong> {listing.approvedDate}
                </p>
              </div>
            )}

            {listing.status === 'rejected' && (
              <div className="bg-red-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-red-800">
                  <strong>✗ Từ chối:</strong> {listing.rejectedDate}
                </p>
                <p className="text-sm text-red-700 mt-1">Lý do: {listing.rejectedReason}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                Xem chi tiết
              </button>
              {listing.status === 'pending' && (
                <>
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">
                    Phê duyệt
                  </button>
                  <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium">
                    Từ chối
                  </button>
                </>
              )}
              {listing.status === 'approved' && (
                <button className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 font-medium">
                  Gỡ tin
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy tin đăng nào</p>
        </div>
      )}
    </div>
  );
};

export default ListingModeration;
