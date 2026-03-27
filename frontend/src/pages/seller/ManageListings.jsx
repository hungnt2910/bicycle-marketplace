import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Select } from '../../components/ui';
import bicycleApi from '../../api/postNewsApi';
import transactionApi from '../../api/transactionApi';
import disputeApi from '../../api/disputeApi';
import { toast } from 'react-toastify';

const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value?._id || value?.id || String(value);
};

const extractListingId = (listing) => normalizeId(listing?._id || listing?.id);

const getDisputeInfoFromTx = (tx) => {
  const d = tx?.dispute;
  if (!d) {
    return {
      disputeId: tx?.disputeId || tx?.dispute_id || '',
      disputeStatus: tx?.disputeStatus || tx?.dispute_status || '',
    };
  }

  if (typeof d === 'string') {
    return { disputeId: d, disputeStatus: '' };
  }

  return {
    disputeId: d?.disputeId || d?.dispute_id || d?._id || d?.id || '',
    disputeStatus: d?.status || tx?.disputeStatus || tx?.dispute_status || '',
  };
};

const clearInspectionPayload = {
  isInspected: false,
  label: '',
};

const ManageListings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const syncReturnedBicyclesToActive = useCallback(async (sellerListings) => {
    const txRes = await transactionApi.getMyTransactions({ role: 'seller' });
    const txData = txRes?.data?.data || txRes?.data || [];
    const transactions = Array.isArray(txData) ? txData : [];

    const sellerBikeIdSet = new Set(sellerListings.map(extractListingId).filter(Boolean));

    const disputeCandidates = transactions
      .map((tx) => {
        const bicycleId = normalizeId(tx?.bicycleId);
        const { disputeId, disputeStatus } = getDisputeInfoFromTx(tx);
        return {
          bicycleId,
          disputeId,
          disputeStatus: (disputeStatus || '').toLowerCase(),
        };
      })
      .filter((item) => item.bicycleId && sellerBikeIdSet.has(item.bicycleId) && item.disputeId);

    const enriched = await Promise.all(
      disputeCandidates.map(async (item) => {
        if (item.disputeStatus) return item;
        try {
          const res = await disputeApi.getById(item.disputeId);
          const detail = res?.data?.data;
          return {
            ...item,
            disputeStatus: (detail?.status || '').toLowerCase(),
          };
        } catch {
          return item;
        }
      })
    );

    const returnedBikeIds = new Set(
      enriched
        .filter((item) => item.disputeStatus === 'return_received')
        .map((item) => item.bicycleId)
    );

    if (returnedBikeIds.size === 0) {
      return sellerListings;
    }

    const toReactivate = sellerListings.filter((listing) => {
      const id = extractListingId(listing);
      if (!id || !returnedBikeIds.has(id)) return false;
      const isActive = (listing?.status || '').toLowerCase() === 'active';
      const stillInspected = listing?.inspection?.isInspected === true;
      return !isActive || stillInspected;
    });

    if (toReactivate.length > 0) {
      await Promise.allSettled(
        toReactivate.map((listing) =>
          bicycleApi.updateBicycle(extractListingId(listing), {
            status: 'active',
            inspection: clearInspectionPayload,
          })
        )
      );
    }

    return sellerListings.map((listing) => {
      const id = extractListingId(listing);
      if (!id || !returnedBikeIds.has(id)) return listing;
      return {
        ...listing,
        status: 'active',
        inspection: {
          ...(listing?.inspection || {}),
          ...clearInspectionPayload,
        },
      };
    });
  }, []);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('user') || localStorage.getItem('userInfo');
      const userInfo = JSON.parse(storedUser || '{}');
      const sellerId = userInfo._id || userInfo.id || userInfo.userId;

      if (!sellerId) {
        toast.error('Vui lòng đăng nhập để xem tin đăng');
        navigate('/login');
        return;
      }

      const response = await bicycleApi.getMyBicycles(sellerId);
      const data = response?.data?.data || response?.data || [];
      const syncedListings = await syncReturnedBicyclesToActive(Array.isArray(data) ? data : []);
      setListings(syncedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Không thể tải danh sách tin đăng');
    } finally {
      setLoading(false);
    }
  }, [navigate, syncReturnedBicyclesToActive]);

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin đăng này?')) {
      return;
    }

    try {
      await bicycleApi.deleteBicycle(id);
      toast.success('Xóa tin đăng thành công');
      fetchListings(); // Refresh list
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Không thể xóa tin đăng');
    }
  };

  const handleEdit = (id) => {
    navigate(`/seller/edit-listing/${id}`);
  };

  const handleView = (id) => {
    navigate(`/product/${id}`);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await bicycleApi.updateBicycle(id, { status: newStatus });
      toast.success(newStatus === 'active' ? 'Đã hiện tin' : 'Đã ẩn tin');
      fetchListings();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Không thể thay đổi trạng thái');
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang bán' },
    { value: 'reserved', label: 'Đã đặt cọc' },
    { value: 'pending_review', label: 'Chờ duyệt' },
    { value: 'hidden', label: 'Đã ẩn' },
    { value: 'rejected', label: 'Bị từ chối' },
    { value: 'sold', label: 'Đã bán' },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      reserved: 'info',
      pending_review: 'warning',
      hidden: 'default',
      rejected: 'danger',
      sold: 'default',
      draft: 'default',
    };
    const labels = {
      active: 'Đang bán',
      reserved: 'Đã đặt cọc',
      pending_review: 'Chờ duyệt',
      hidden: 'Đã ẩn',
      rejected: 'Bị từ chối',
      sold: 'Đã bán',
      draft: 'Nháp',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const filteredListings = listings.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;

    // Filter by search term
    if (searchTerm && !l.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-warmgray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Quản lý tin đăng</h2>
          <p className="text-warmgray-600 mt-1">Quản lý tất cả tin đăng bán xe của bạn</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/seller/create-listing')}>
          + Đăng tin mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Tổng tin đăng</div>
          <div className="text-2xl font-bold text-primary-900">{listings.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Đang bán</div>
          <div className="text-2xl font-bold text-success-600">
            {listings.filter((l) => l.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Đã đặt cọc</div>
          <div className="text-2xl font-bold text-info-600">
            {listings.filter((l) => l.status === 'reserved').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Chờ duyệt</div>
          <div className="text-2xl font-bold text-warning-600">
            {listings.filter((l) => l.status === 'pending_review').length}
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              options={statusOptions}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm tin đăng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Listings */}
      {filteredListings.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-700 divide-x divide-warmgray-200">
                  <th className="py-4 px-6 font-semibold text-sm">Hình ảnh</th>
                  <th className="py-4 px-6 font-semibold text-sm">Tiêu đề</th>
                  <th className="py-4 px-6 font-semibold text-sm">Ngày đăng</th>
                  <th className="py-4 px-6 font-semibold text-sm">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray-200">
                {filteredListings.map((listing) => {
                  const isSold = listing.status === 'sold';

                  return (
                    <tr
                      key={listing._id || listing.id}
                      className="hover:bg-warmgray-50 transition-colors divide-x divide-warmgray-200"
                    >
                      <td className="py-4 px-6 align-middle">
                        <img
                          src={listing.media?.mainImage || listing.image || '/placeholder-bike.png'}
                          alt={listing.title || listing.name}
                          className="w-20 h-16 object-cover rounded-[8px]"
                        />
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className="font-medium text-lg text-primary-900 line-clamp-2">
                          {listing.title || listing.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-middle text-warmgray-600 text-sm whitespace-nowrap">
                        {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6 align-middle whitespace-nowrap">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isSold}
                            className={isSold ? 'opacity-60 cursor-not-allowed' : ''}
                            onClick={() => handleEdit(listing._id || listing.id)}
                          >
                            Chỉnh sửa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSold}
                            className={isSold ? 'opacity-60 cursor-not-allowed' : ''}
                            onClick={() => handleView(listing._id || listing.id)}
                          >
                            Xem tin
                          </Button>
                          {listing.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSold}
                              className={isSold ? 'opacity-60 cursor-not-allowed' : ''}
                              onClick={() =>
                                handleToggleStatus(listing._id || listing.id, listing.status)
                              }
                            >
                              Ẩn tin
                            </Button>
                          )}
                          {listing.status === 'hidden' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isSold}
                              className={isSold ? 'opacity-60 cursor-not-allowed' : ''}
                              onClick={() =>
                                handleToggleStatus(listing._id || listing.id, listing.status)
                              }
                            >
                              Hiện tin
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSold}
                            className={`text-danger-600 hover:bg-danger-50 ${isSold ? 'opacity-60 cursor-not-allowed' : ''}`}
                            onClick={() => handleDelete(listing._id || listing.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-warmgray-600 mb-4">Không có tin đăng nào</p>
          <Button variant="primary" onClick={() => navigate('/seller/create-listing')}>
            Đăng tin đầu tiên
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ManageListings;
