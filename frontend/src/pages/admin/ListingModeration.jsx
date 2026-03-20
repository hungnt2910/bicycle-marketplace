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
    if (status === 'sold') return 'sold';
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
    imageUrl: bike?.media?.mainImage || bike?.media?.images?.[0] || '/placeholder.png',
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
    sold: 'Đã bán',
  };

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    sold: 'sold',
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
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Kiểm duyệt tin đăng</h1>
        <p className="text-warmgray-600">Xét duyệt và quản lý các tin đăng trên hệ thống</p>
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
          <div key={idx} className="lux-panel">
            <p className="text-warmgray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="lux-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên tin đăng, người bán..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="sold">Đã bán</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listing List */}
      <div className="lux-panel p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-warmgray-500 text-lg">Đang tải danh sách tin đăng...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-warmgray-500 text-lg">Không tìm thấy tin đăng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-700 divide-x divide-warmgray-200">
                <tr>
                  <th className="py-4 px-6 font-semibold text-sm w-32">Hình ảnh</th>
                  <th className="py-4 px-6 font-semibold text-sm">Thông tin tin đăng</th>
                  <th className="py-4 px-6 font-semibold text-sm">Trạng thái & Lịch sử</th>
                  <th className="py-4 px-6 font-semibold text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray-200">
                {filteredListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-warmgray-50 transition-colors divide-x divide-warmgray-200"
                  >
                    <td className="py-4 px-6 align-middle">
                      <img
                        src={listing.imageUrl}
                        alt={listing.name}
                        className="w-20 h-16 object-cover rounded-[8px]"
                      />
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="font-medium text-lg text-primary-900 mb-1 line-clamp-2">
                        {listing.name}
                      </div>
                      <div className="text-sm text-warmgray-600 mb-2">
                        <span className="font-medium text-warmgray-800">Người bán:</span>{' '}
                        {listing.seller}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-warmgray-600">
                        <div>
                          <span className="font-medium text-warmgray-800">Giá:</span>{' '}
                          {(listing.price / 1000000).toFixed(1)}M ₫
                        </div>
                        <div>
                          <span className="font-medium text-warmgray-800">Danh mục:</span>{' '}
                          {listing.category}
                        </div>
                        <div>
                          <span className="font-medium text-warmgray-800">Tình trạng:</span>{' '}
                          {listing.condition}
                        </div>
                        <div>
                          <span className="font-medium text-warmgray-800">Ảnh:</span>{' '}
                          {listing.images} ảnh
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle min-w-[200px]">
                      <div className="mb-2">
                        <Badge variant={statusColors[listing.status]}>
                          {statusLabels[listing.status]}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-warmgray-600">
                        <p>
                          <strong>Ngày gửi:</strong> {listing.submitDate}
                        </p>
                        {listing.status === 'approved' && listing.approvedDate && (
                          <p className="text-success-800">
                            <strong>Ngày duyệt:</strong> {listing.approvedDate}
                          </p>
                        )}
                        {listing.status === 'rejected' && (
                          <div className="bg-danger/5 p-2 rounded-[8px] mt-1">
                            <p className="text-danger-800 text-xs">
                              <strong>Ngày từ chối:</strong> {listing.rejectedDate}
                            </p>
                            <p
                              className="text-danger text-xs mt-0.5 line-clamp-2"
                              title={listing.rejectedReason}
                            >
                              {listing.rejectedReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right">
                      <div className="flex flex-col gap-2 w-[120px] ml-auto">
                        {/* <button className="btn btn-sm btn-primary w-full">
                          Xem chi tiết
                        </button> */}
                        {listing.status === 'pending' && (
                          <div className="flex flex-col gap-2 w-full">
                            <button
                              className="btn btn-sm btn-success w-full"
                              onClick={() => handleApprove(listing.id)}
                            >
                              Duyệt
                            </button>
                            <button
                              className="btn btn-sm btn-danger w-full"
                              onClick={() => handleReject(listing.id)}
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                        {listing.status === 'approved' && (
                          <button className="btn btn-sm btn-outline border-danger text-danger w-full hover:bg-red-50">
                            Gỡ tin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingModeration;
