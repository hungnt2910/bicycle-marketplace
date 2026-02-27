import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui';
import { toast } from 'react-toastify';
import bicycleApi from '../../api/postNewsApi';

const ListingModeration = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeStatus = (status) => {
    if (status === 'active') return 'approved';
    if (status === 'reserved') return 'approved';
    if (status === 'rejected') return 'rejected';
    if (status === 'draft') return 'draft';
    if (status === 'pending_review') return 'pending';
    return 'pending';
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

  const getSellerName = (bike) => {
    const sellerFromId = bike?.sellerId;
    const nameFromSellerId = sellerFromId
      ? `${sellerFromId.firstName || ''} ${sellerFromId.lastName || ''}`.trim()
      : '';
    const profile = bike?.seller?.profile || bike?.sellerProfile || bike?.profile;
    const fromProfile = profile
      ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      : '';
    return (
      nameFromSellerId ||
      fromProfile ||
      bike?.seller?.fullName ||
      bike?.seller?.name ||
      bike?.sellerName ||
      'Người bán'
    );
  };

  const mapListing = (bike) => ({
    id: bike?._id || bike?.id,
    name: bike?.title || 'Không có tiêu đề',
    seller: getSellerName(bike),
    price: bike?.price || 0,
    status: normalizeStatus(bike?.status),
    rawStatus: bike?.status,
    submitDate: formatDate(bike?.createdAt || bike?.submitDate),
    approvedDate: formatDate(bike?.approvedDate),
    rejectedDate: formatDate(bike?.rejectedDate),
    rejectedReason: bike?.rejectedReason,
    category: bike?.specifications?.type || bike?.category || 'Chưa phân loại',
    condition: bike?.condition?.overall || 'Chưa rõ',
    images: bike?.media?.images?.length || 0,
    description: bike?.description || '',
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await bicycleApi.getAllBicycles();
        const apiData = response?.data?.data || response?.data || [];
        const mapped = apiData
          .filter((bike) => normalizeStatus(bike?.status) !== 'draft')
          .map(mapListing);
        setListings(mapped);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Không thể tải danh sách tin đăng');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

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

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchStatus = filterStatus === 'all' || listing.status === filterStatus;
      const matchSearch =
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.seller.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [filterStatus, listings, searchQuery]);

  const pendingCount = listings.filter((l) => l.status === 'pending').length;

  const handleApprove = async (listingId) => {
    try {
      await bicycleApi.updateBicycle(listingId, {
        status: 'active',
      });
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: 'approved',
                rawStatus: 'active',
                approvedDate: formatDate(new Date()),
                rejectedDate: '',
                rejectedReason: '',
              }
            : listing
        )
      );
      toast.success('Đã phê duyệt tin đăng');
    } catch (error) {
      console.error('Error approving listing:', error);
      toast.error('Phê duyệt thất bại. Vui lòng thử lại');
    }
  };

  const handleReject = async (listingId) => {
    const reason = window.prompt('Nhập lý do từ chối');
    if (!reason) return;
    try {
      await bicycleApi.updateBicycle(listingId, {
        status: 'rejected',
      });
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: 'rejected',
                rawStatus: 'rejected',
                rejectedDate: formatDate(new Date()),
                rejectedReason: reason,
              }
            : listing
        )
      );
      toast.success('Đã từ chối tin đăng');
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast.error('Từ chối thất bại. Vui lòng thử lại');
    }
  };

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
        {loading && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">Đang tải danh sách tin đăng...</p>
          </div>
        )}
        {!loading &&
          filteredListings.map((listing) => (
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
                    <button
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                      onClick={() => handleApprove(listing.id)}
                    >
                      Phê duyệt
                    </button>
                    <button
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
                      onClick={() => handleReject(listing.id)}
                    >
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

      {!loading && filteredListings.length === 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy tin đăng nào</p>
        </div>
      )}
    </div>
  );
};

export default ListingModeration;
