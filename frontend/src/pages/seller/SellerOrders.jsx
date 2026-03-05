import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Avatar } from '../../components/ui';
import { toast } from 'react-toastify';
import transactionApi from '../../api/transactionApi';

const statusLabels = {
  pending_payment: 'Chờ thanh toán',
  payment_received: 'Đã nhận thanh toán',
  deposit_paid: 'Đã đặt cọc',
  held_in_escrow: 'Đang giữ escrow',
  awaiting_delivery: 'Chờ giao',
  delivered: 'Đã giao',
  completed: 'Hoàn tất',
  refunded: 'Đã hoàn tiền',
  disputed: 'Tranh chấp',
  cancelled: 'Đã hủy',
};

const statusVariants = {
  pending_payment: 'warning',
  payment_received: 'info',
  held_in_escrow: 'info',
  awaiting_delivery: 'warning',
  delivered: 'primary',
  completed: 'success',
  refunded: 'default',
  disputed: 'danger',
  cancelled: 'danger',
};

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getMyTransactions({ role: 'seller' });
      const data = res?.data?.data || res?.data || [];
      const mapped = data.map((tx) => ({
        id: tx?._id || tx?.id,
        bike: tx?.bicycleId?.title || 'Xe đạp',
        buyer:
          `${tx?.buyerId?.profile?.firstName || ''} ${tx?.buyerId?.profile?.lastName || ''}`.trim() ||
          tx?.buyerId?.email ||
          'Người mua',
        price: tx?.amount || 0,
        status: (tx?.status || '').toLowerCase(),
        date: tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : '--',
        image:
          tx?.bicycleId?.media?.mainImage ||
          tx?.bicycleId?.media?.images?.[0] ||
          '/mountain_bike_hero_1768417732962.png',
      }));
      setOrders(mapped);
    } catch (err) {
      console.error('Fetch seller orders error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (label, fn) => {
    setActionLoading(label);
    try {
      await fn();
      await loadOrders();
      toast.success('Đã cập nhật đơn hàng');
    } catch (err) {
      console.error(`${label} error:`, err);
      toast.error(err?.response?.data?.message || 'Không thực hiện được thao tác');
    } finally {
      setActionLoading('');
    }
  };

  const handleUpdateShipping = (id) => {
    const provider = window.prompt('Đối tác vận chuyển');
    const trackingNumber = window.prompt('Mã vận đơn');
    if (!provider && !trackingNumber) return;
    runAction('shipping', () => transactionApi.updateShipping(id, { provider, trackingNumber }));
  };

  const handleMarkDelivered = (id) =>
    runAction('delivered', () => transactionApi.markAsDelivered(id));

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const pendingPay = orders.filter((o) => o.status === 'pending_payment').length;
    const holding = orders.filter((o) =>
      ['payment_received', 'held_in_escrow'].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    const cancelled = orders.filter((o) => ['refunded', 'cancelled'].includes(o.status)).length;
    return { total: orders.length, pendingPay, holding, completed, cancelled };
  }, [orders]);

  const getStatusBadge = (status) => (
    <Badge variant={statusVariants[status] || 'default'}>
      {statusLabels[status] || status || '--'}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Quản lý đơn hàng</h2>
        <p className="text-warmgray-600 mt-1">Theo dõi và quản lý các đơn hàng của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Tổng đơn hàng</div>
          <div className="text-2xl font-bold text-primary-900">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Chờ thanh toán</div>
          <div className="text-2xl font-bold text-warning-600">{stats.pendingPay}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Đang giữ cọc</div>
          <div className="text-2xl font-bold text-info-600">{stats.holding}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Hoàn tất</div>
          <div className="text-2xl font-bold text-success-600">{stats.completed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-warmgray-600 mb-1">Đã hủy/hoàn</div>
          <div className="text-2xl font-bold text-warmgray-600">{stats.cancelled}</div>
        </Card>
      </div>

      {/* Orders List */}
      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-warmgray-600">Đang tải đơn hàng...</p>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-warmgray-600">Chưa có đơn hàng nào</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <img
                  src={order.image}
                  alt={order.bike}
                  className="w-full lg:w-48 h-36 object-cover rounded-[16px]"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{order.bike}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-warmgray-600">
                        Mã đơn: {order.id} • {order.date}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-warmgray-600 mb-1">Người mua</p>
                      <div className="flex items-center gap-2">
                        <Avatar name={order.buyer} size="sm" />
                        <span className="font-medium">{order.buyer}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-warmgray-600 mb-1">Giá trị giao dịch</p>
                      <p className="font-semibold text-lg text-primary-600">
                        {formatCurrency(order.price)} ₫
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-warmgray-600 mb-1">Trạng thái</p>
                      <p className="font-medium text-warmgray-800">
                        {statusLabels[order.status] || order.status || '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-warmgray-600 mb-1">Ghi chú</p>
                      <p className="font-medium text-warmgray-500">—</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/buyer/transactions/${order.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionLoading === 'shipping' || order.status !== 'held_in_escrow'}
                      onClick={() => {
                        if (order.status !== 'held_in_escrow') {
                          toast.warn('Chỉ cập nhật vận chuyển khi giao dịch đang giữ escrow');
                          return;
                        }
                        handleUpdateShipping(order.id);
                      }}
                    >
                      {actionLoading === 'shipping' ? 'Đang cập nhật...' : 'Cập nhật vận chuyển'}
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      disabled={
                        actionLoading === 'delivered' || order.status !== 'awaiting_delivery'
                      }
                      onClick={() => {
                        if (order.status !== 'awaiting_delivery') {
                          toast.warn('Chỉ đánh dấu đã giao khi trạng thái là Chờ giao');
                          return;
                        }
                        handleMarkDelivered(order.id);
                      }}
                    >
                      {actionLoading === 'delivered' ? 'Đang lưu...' : 'Đánh dấu đã giao'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
