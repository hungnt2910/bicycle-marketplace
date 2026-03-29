import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Avatar, Modal, Input } from '../../components/ui';
import { toast } from 'react-toastify';
import transactionApi from '../../api/transactionApi';
import disputeApi from '../../api/disputeApi';
import bicycleApi from '../../api/postNewsApi';
import userApi from '../../api/userApi';

const statusLabels = {
  pending_payment: 'Chờ thanh toán',
  payment_received: 'Đã nhận thanh toán',
  deposit_paid: 'Đã đặt cọc',
  held_in_escrow: 'Đang giữ escrow',
  awaiting_delivery: 'Chờ giao',
  delivered: 'Đã giao',
  buyer_confirmed: 'Người mua đã xác nhận',
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
  buyer_confirmed: 'success',
  completed: 'success',
  refunded: 'default',
  disputed: 'danger',
  cancelled: 'danger',
};

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');
const feeTypes = [
  'listing_fee',
  'inspection_fee',
  'service_fee',
  'platform_fee',
  'commission',
  'fee',
];

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingForm, setShippingForm] = useState({ provider: '', trackingNumber: '' });
  const [shippingErrors, setShippingErrors] = useState({});
  const [buyerAddress, setBuyerAddress] = useState('');
  const [loadingBuyerAddress, setLoadingBuyerAddress] = useState(false);

  const relistPayload = {
    status: 'active',
    inspection: {
      isInspected: false,
      label: '',
    },
  };

  const normalizeDispute = (tx) => {
    const d = tx?.dispute;
    if (!d)
      return {
        id: tx?.disputeId || tx?.dispute_id || '',
        status: tx?.disputeStatus || tx?.dispute_status || '',
      };
    if (typeof d === 'string') return { id: d, status: '' };

    // BE returns dispute as an embedded object with disputeId but no status; capture that ID
    return {
      id: d?.disputeId || d?.dispute_id || d?._id || d?.id || '',
      status: d?.status || '',
    };
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getMyTransactions({ role: 'seller' });
      const data = res?.data?.data || res?.data || [];
      const mapped = (Array.isArray(data) ? data : [])
        .filter((tx) => !feeTypes.includes((tx?.type || '').toLowerCase()))
        .map((tx) => {
          const dispute = normalizeDispute(tx);
          return {
            id: tx?._id || tx?.id,
            buyerId: tx?.buyerId?._id || tx?.buyerId?.id || tx?.buyerId,
            bicycleId: tx?.bicycleId?._id || tx?.bicycleId?.id || tx?.bicycleId,
            bicycleStatus: (tx?.bicycleId?.status || '').toLowerCase(),
            bicycleIsInspected: tx?.bicycleId?.inspection?.isInspected === true,
            bike: tx?.bicycleId?.title || 'Xe đạp',
            buyer:
              `${tx?.buyerId?.profile?.firstName || ''} ${tx?.buyerId?.profile?.lastName || ''}`.trim() ||
              tx?.buyerId?.email ||
              'Người mua',
            price: tx?.amount || 0,
            status: (tx?.status || '').toLowerCase(),
            disputeId: dispute.id,
            disputeStatus: (dispute.status || '').toLowerCase(),
            returnTracking: tx?.dispute?.returnInfo?.trackingInfo,
            returnSentAt: tx?.dispute?.returnInfo?.sentAt,
            date: tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : '--',
            image:
              tx?.bicycleId?.media?.mainImage ||
              tx?.bicycleId?.media?.images?.[0] ||
              '/mountain_bike_hero_1768417732962.png',
          };
        });

      // Enrich disputes missing status/return info by pulling dispute detail from BE
      const withDisputeDetails = await Promise.all(
        mapped.map(async (order) => {
          if (!order.disputeId) return order;
          const hasStatus = Boolean(order.disputeStatus);

          try {
            const resDetail = await disputeApi.getById(order.disputeId);
            const detail = resDetail?.data?.data;

            return {
              ...order,
              disputeStatus: (detail?.status || order.disputeStatus || '').toLowerCase(),
              returnTracking: detail?.returnInfo?.trackingInfo || order.returnTracking,
              returnSentAt: detail?.returnInfo?.sentAt || order.returnSentAt,
            };
          } catch (err) {
            // Keep the base order if we cannot fetch dispute detail
            if (!hasStatus) console.warn('Dispute detail fetch failed', err);
            return order;
          }
        })
      );

      const relistTargets = withDisputeDetails.filter(
        (order) =>
          order?.bicycleId &&
          order?.disputeStatus === 'return_received' &&
          (order?.bicycleStatus !== 'active' || order?.bicycleIsInspected)
      );

      if (relistTargets.length > 0) {
        await Promise.allSettled(
          relistTargets.map((order) => bicycleApi.updateBicycle(order.bicycleId, relistPayload))
        );
      }

      setOrders(withDisputeDetails);
    } catch (err) {
      console.error('Fetch seller orders error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (label, fn, onSuccess) => {
    setActionLoading(label);
    try {
      await fn();
      await loadOrders();
      toast.success('Đã cập nhật đơn hàng');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(`${label} error:`, err);
      toast.error(err?.response?.data?.message || 'Không thực hiện được thao tác');
    } finally {
      setActionLoading('');
    }
  };

  const handleSellerConfirmReturn = async (order) => {
    if (!order?.disputeId) {
      toast.warn('Không tìm thấy tranh chấp để xác nhận.');
      return;
    }
    if (order.disputeStatus !== 'awaiting_seller_confirmation') {
      toast.warn('Chỉ xác nhận khi tranh chấp đang chờ seller xác nhận.');
      return;
    }
    await runAction(`confirm-${order.disputeId}`, async () => {
      await disputeApi.sellerConfirm(order.disputeId);
      if (order?.bicycleId) {
        await bicycleApi.updateBicycle(order.bicycleId, relistPayload);
      }
      toast.success('Đã xác nhận đã nhận lại xe.');
    });
  };

  const closeShippingModal = () => {
    setShippingModalOpen(false);
    setSelectedOrder(null);
    setShippingForm({ provider: '', trackingNumber: '' });
    setShippingErrors({});
    setBuyerAddress('');
    setLoadingBuyerAddress(false);
  };

  const loadBuyerAddress = async (buyerId) => {
    if (!buyerId) {
      setBuyerAddress('Không có địa chỉ');
      return;
    }

    try {
      setLoadingBuyerAddress(true);
      const res = await userApi.getUserById(buyerId);
      const payload = res?.data?.data ?? res?.data;
      const buyer = Array.isArray(payload) ? payload[0] : payload;
      const address = (buyer?.address || '').toString().trim();
      setBuyerAddress(address || 'Chưa cập nhật địa chỉ');
    } catch (err) {
      console.error('Load buyer address error:', err);
      setBuyerAddress('Không tải được địa chỉ');
    } finally {
      setLoadingBuyerAddress(false);
    }
  };

  const handleUpdateShipping = async (order) => {
    const allowed = ['held_in_escrow', 'awaiting_delivery', 'payment_received'];
    if (!allowed.includes(order.status)) {
      toast.warn('Chỉ cập nhật vận chuyển khi đơn đã được thanh toán và chờ giao.');
      return;
    }

    setSelectedOrder(order);
    setShippingForm({ provider: '', trackingNumber: '' });
    setShippingErrors({});
    setBuyerAddress('');
    setShippingModalOpen(true);
    loadBuyerAddress(order?.buyerId);
  };

  const submitShipping = async () => {
    if (!selectedOrder) {
      toast.error('Không tìm thấy đơn hàng');
      return;
    }

    const provider = shippingForm.provider.trim();
    const trackingNumber = shippingForm.trackingNumber.trim();
    const nextErrors = {};

    if (!provider) {
      nextErrors.provider = 'Vui lòng nhập đơn vị vận chuyển';
    }
    if (!trackingNumber) {
      nextErrors.trackingNumber = 'Vui lòng nhập mã vận đơn';
    }

    setShippingErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await runAction(
      'shipping',
      () => transactionApi.updateShipping(selectedOrder.id, { provider, trackingNumber }),
      closeShippingModal
    );
  };

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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-700 divide-x divide-warmgray-200">
                <tr>
                  <th className="py-4 px-6 font-semibold text-sm">Hình ảnh</th>
                  <th className="py-4 px-6 font-semibold text-sm">Sản phẩm</th>
                  <th className="py-4 px-6 font-semibold text-sm">Người mua</th>
                  <th className="py-4 px-6 font-semibold text-sm">Giá trị</th>
                  <th className="py-4 px-6 font-semibold text-sm">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray-200">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-warmgray-50 transition-colors divide-x divide-warmgray-200"
                  >
                    <td className="py-4 px-6 align-middle">
                      <img
                        src={order.image}
                        alt={order.bike}
                        className="w-20 h-16 object-cover rounded-[8px]"
                      />
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="font-medium text-lg text-primary-900 line-clamp-2">
                        {order.bike}
                      </div>
                      <div className="text-sm text-warmgray-600 mt-1 whitespace-nowrap">
                        Mã: {order.id}
                      </div>
                      <div className="text-xs text-warmgray-500 whitespace-nowrap">
                        {order.date}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-2">
                        <Avatar name={order.buyer} size="sm" />
                        <span className="font-medium whitespace-nowrap">{order.buyer}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle font-medium text-primary-700 whitespace-nowrap">
                      {formatCurrency(order.price)} ₫
                    </td>
                    <td className="py-4 px-6 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(order.status)}
                        {order.disputeStatus && (
                          <Badge
                            variant={
                              ['return_requested', 'awaiting_seller_confirmation'].includes(
                                order.disputeStatus
                              )
                                ? 'warning'
                                : order.disputeStatus === 'return_received'
                                  ? 'success'
                                  : 'secondary'
                            }
                          >
                            Tranh chấp: {order.disputeStatus}
                          </Badge>
                        )}
                        {order.returnTracking && (
                          <p className="text-xs text-warmgray-500">
                            Tracking trả: {order.returnTracking}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/buyer/transactions/${order.id}`)}
                        >
                          Xem chi tiết
                        </Button> */}
                        {order.disputeId &&
                          order.disputeStatus === 'awaiting_seller_confirmation' && (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={actionLoading === `confirm-${order.disputeId}`}
                              onClick={() => handleSellerConfirmReturn(order)}
                            >
                              {actionLoading === `confirm-${order.disputeId}`
                                ? 'Đang xác nhận...'
                                : 'Xác nhận đã nhận xe'}
                            </Button>
                          )}
                        {order.disputeId && order.disputeStatus === 'return_requested' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/buyer/disputes/${order.disputeId}`)}
                          >
                            Xem tranh chấp
                          </Button>
                        )}
                        {!order.disputeId && order.status === 'disputed' && (
                          <Badge variant="warning">Tranh chấp: chưa có mã</Badge>
                        )}
                        <Button
                          variant="success"
                          size="sm"
                          disabled={
                            actionLoading === 'shipping' ||
                            [
                              'buyer_confirmed',
                              'completed',
                              'refunded',
                              'cancelled',
                              'disputed',
                            ].includes(order.status)
                          }
                          onClick={() => handleUpdateShipping(order)}
                        >
                          {actionLoading === 'shipping'
                            ? 'Đang cập nhật...'
                            : [
                                  'buyer_confirmed',
                                  'completed',
                                  'refunded',
                                  'cancelled',
                                  'disputed',
                                ].includes(order.status)
                              ? 'Đã xong'
                              : 'Cập nhật vận chuyển'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={shippingModalOpen}
        onClose={closeShippingModal}
        title="Cập nhật vận chuyển"
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeShippingModal}
              disabled={actionLoading === 'shipping'}
            >
              Hủy
            </Button>
            <Button
              variant="success"
              onClick={submitShipping}
              disabled={actionLoading === 'shipping'}
            >
              {actionLoading === 'shipping' ? 'Đang cập nhật...' : 'Lưu cập nhật'}
            </Button>
          </>
        }
        className="max-w-lg w-full"
      >
        <div className="space-y-4">
          <div className="bg-warmgray-50 border border-warmgray-200 rounded-[14px] p-4">
            <div className="text-sm text-warmgray-600">Đơn hàng</div>
            <div className="font-semibold text-primary-900 mt-1">{selectedOrder?.bike}</div>
            <div className="text-sm text-warmgray-600 mt-1">Mã: {selectedOrder?.id}</div>
            <div className="text-sm text-warmgray-600">Người mua: {selectedOrder?.buyer}</div>
            <div className="text-sm text-warmgray-600">
              Địa chỉ nhận: {loadingBuyerAddress ? 'Đang tải...' : buyerAddress || 'Chưa cập nhật'}
            </div>
          </div>

          <Input
            label="Đơn vị vận chuyển"
            placeholder="Giao Hang Nhanh, Viettel Post..."
            value={shippingForm.provider}
            onChange={(e) => setShippingForm((prev) => ({ ...prev, provider: e.target.value }))}
            required
            error={shippingErrors.provider}
          />

          <Input
            label="Mã vận đơn"
            placeholder="Nhập tracking number"
            value={shippingForm.trackingNumber}
            onChange={(e) =>
              setShippingForm((prev) => ({ ...prev, trackingNumber: e.target.value }))
            }
            required
            error={shippingErrors.trackingNumber}
          />

          <p className="text-sm text-warmgray-600">
            Thông tin vận chuyển sẽ được gửi cho người mua để theo dõi đơn hàng.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SellerOrders;
