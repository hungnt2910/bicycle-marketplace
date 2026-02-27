import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Select } from '../../components/ui';
import bicycleApi from '../../api/postNewsApi';
import { toast } from 'react-toastify';

const ManageListings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
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
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Không thể tải danh sách tin đăng');
    } finally {
      setLoading(false);
    }
  };

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
    // Filter by status
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
        <div className="text-lg text-neutral-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Quản lý tin đăng</h2>
          <p className="text-neutral-600 mt-1">Quản lý tất cả tin đăng bán xe của bạn</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/seller/create-listing')}>
          + Đăng tin mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Tổng tin đăng</div>
          <div className="text-2xl font-bold text-neutral-900">{listings.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Đang bán</div>
          <div className="text-2xl font-bold text-success-600">
            {listings.filter((l) => l.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Đã đặt cọc</div>
          <div className="text-2xl font-bold text-info-600">
            {listings.filter((l) => l.status === 'reserved').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Chờ duyệt</div>
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
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Listings */}
      <div className="space-y-4">
        {filteredListings.map((listing) => (
          <Card key={listing._id || listing.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <img
                src={listing.media?.mainImage || listing.image || '/placeholder-bike.png'}
                alt={listing.title || listing.name}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{listing.title || listing.name}</h3>
                    <p className="text-sm text-neutral-600">
                      Đăng ngày: {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  {getStatusBadge(listing.status)}
                </div>
                <div className="flex items-center gap-6 text-sm text-neutral-600 mb-3">
                  <span>
                    Giá:{' '}
                    <strong className="text-primary-600">
                      {listing.price.toLocaleString('vi-VN')} ₫
                    </strong>
                  </span>
                  <span>{listing.views || 0} lượt xem</span>
                  <span>{listing.favoriteCount || 0} yêu thích</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEdit(listing._id || listing.id)}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(listing._id || listing.id)}
                  >
                    Xem tin
                  </Button>
                  {listing.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(listing._id || listing.id, listing.status)}
                    >
                      Ẩn tin
                    </Button>
                  )}
                  {listing.status === 'hidden' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(listing._id || listing.id, listing.status)}
                    >
                      Hiện tin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-600"
                    onClick={() => handleDelete(listing._id || listing.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-neutral-600 mb-4">Không có tin đăng nào</p>
          <Button variant="primary" onClick={() => navigate('/seller/create-listing')}>
            Đăng tin đầu tiên
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ManageListings;
