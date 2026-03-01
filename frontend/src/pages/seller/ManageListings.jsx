import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Select } from '../../components/ui';
import bicycleApi from '../../api/postNewsApi';
import transactionApi from '../../api/transactionApi';
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

  const handleRequestInspection = async (bicycleId, title) => {
    if (!window.confirm(`Bạn có chắc muốn yêu cầu kiểm định cho xe "${title}"?\n\nPhí kiểm định: 200.000₫ (Miễn phí lần đầu)`)) {
      return;
    }

    try {
      toast.info('Đang tạo giao dịch thanh toán...', { autoClose: 1500 });

      const INSPECTION_FEE = 20000; // TODO: Check if first time for free
      
      // Tạo transaction cho phí kiểm định
      const transactionPayload = {
        bicycleId: bicycleId,
        amount: INSPECTION_FEE,
        type: 'inspection_fee', // Phân biệt với 'fee' (phí đăng bài)
        paymentMethod: 'e_wallet',
      };

      const transactionRes = await transactionApi.create(transactionPayload);
      const transactionData = transactionRes?.data?.data || transactionRes?.data;
      
      // Lấy order_url và app_trans_id từ response
      const paymentUrl = transactionData?.order_url;
      const appTransId = transactionData?.app_trans_id;

      if (!paymentUrl) {
        throw new Error('Không lấy được link thanh toán từ server.');
      }

      if (!appTransId) {
        throw new Error('Không lấy được mã giao dịch từ server.');
      }

      // Gọi getMyTransactions để tìm transaction vừa tạo theo app_trans_id
      let transactionId = null;
      try {
        const myTransactionsRes = await transactionApi.getMyTransactions();
        const transactions = myTransactionsRes?.data?.data || myTransactionsRes?.data || [];
        
        // Tìm transaction có payment.transactionId khớp với app_trans_id
        const foundTransaction = transactions.find(
          tx => tx.payment?.transactionId === appTransId
        );
        
        if (foundTransaction) {
          transactionId = foundTransaction._id;
          console.log('✅ Found transaction ID:', transactionId);
        } else {
          console.warn('⚠️ Transaction not found in list, using app_trans_id');
          transactionId = appTransId; // Fallback to app_trans_id
        }
      } catch (error) {
        console.warn('⚠️ Error getting transactions, using app_trans_id:', error);
        transactionId = appTransId; // Fallback to app_trans_id
      }

      // Lưu thông tin để xử lý sau khi thanh toán
      localStorage.setItem('pendingTransactionId', transactionId);
      localStorage.setItem('pendingBicycleId', bicycleId);
      localStorage.setItem('pendingAction', 'inspection'); // Đánh dấu đây là action kiểm định

      // Chuyển hướng sang trang thanh toán ZaloPay
      toast.success('Đang chuyển đến trang thanh toán...', {
        autoClose: 1500,
      });

      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 1500);

    } catch (error) {
      console.error('Error requesting inspection:', error);
      toast.error(error?.response?.data?.message || 'Không thể tạo giao dịch thanh toán');
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
                  {listing.inspection?.isInspected && (
                    <span className="text-success-600 font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Đã kiểm định
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
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
                  {!listing.inspection?.isInspected && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-success-500 text-success-600 hover:bg-success-50"
                      onClick={() => handleRequestInspection(listing._id || listing.id, listing.title)}
                    >
                      Yêu cầu kiểm định
                    </Button>
                  )}
                  {listing.inspection?.isInspected && (
                    <Badge variant="success" className="px-3 py-1">
                      ✓ Đã kiểm định
                    </Badge>
                  )}
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
