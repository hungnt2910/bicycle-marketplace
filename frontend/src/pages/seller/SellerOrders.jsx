import React, { useEffect, useMemo, useState, useRef } from 'react';
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

  // Refs for scroll functionality
  const scrollContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

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

    return {
      id: d?.disputeId || d?.dispute_id || d?._id || d?.id || '',
      status: d?.status || '',
    };
  };

  // Check scroll position to show/hide scroll buttons
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
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

      // Check scroll position after data loads
      setTimeout(checkScrollPosition, 100);
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

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition();
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [orders]);

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
    <Badge
      variant={statusVariants[status] || 'default'}
      size="sm"
      className="rounded-full px-3 py-1 whitespace-nowrap"
      style={{ borderRadius: '9999px' }}
    >
      {statusLabels[status] || status || '--'}
    </Badge>
  );

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="space-y-6" style={{ padding: '0 16px' }}>
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Quản lý đơn hàng</h2>
          <p className="text-warmgray-600 mt-1">Theo dõi và quản lý các đơn hàng của bạn</p>
        </div>

        {/* Stats - Responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-warmgray-600 mb-1">Tổng đơn hàng</div>
            <div className="text-xl sm:text-2xl font-bold text-primary-900">{stats.total}</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-warmgray-600 mb-1">Chờ thanh toán</div>
            <div className="text-xl sm:text-2xl font-bold text-warning-600">{stats.pendingPay}</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-warmgray-600 mb-1">Đang giữ cọc</div>
            <div className="text-xl sm:text-2xl font-bold text-info-600">{stats.holding}</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-warmgray-600 mb-1">Hoàn tất</div>
            <div className="text-xl sm:text-2xl font-bold text-success-600">{stats.completed}</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-warmgray-600 mb-1">Đã hủy/hoàn</div>
            <div className="text-xl sm:text-2xl font-bold text-warmgray-600">{stats.cancelled}</div>
          </Card>
        </div>

        {/* Orders List with Scrollbar */}
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-warmgray-600">Đang tải đơn hàng...</p>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-warmgray-600">Chưa có đơn hàng nào</p>
          </Card>
        ) : (
          <div style={{ width: '100%', position: 'relative' }}>
            {/* Scroll Buttons */}
            {showLeftScroll && (
              <button
                onClick={scrollLeft}
                style={{
                  position: 'absolute',
                  left: '-12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#4b5563' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {showRightScroll && (
              <button
                onClick={scrollRight}
                style={{
                  position: 'absolute',
                  right: '-12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#4b5563' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Table Container with Scroll */}
            <div
              ref={scrollContainerRef}
              style={{
                overflowX: 'auto',
                overflowY: 'visible',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                width: '100%',
              }}
            >
              <table
                style={{
                  minWidth: '1000px',
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Hình ảnh</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Sản phẩm</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Người mua</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Giá trị</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <img
                          src={order.image}
                          alt={order.bike}
                          style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{order.bike}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{order.date}</div>
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar name={order.buyer} size="sm" />
                          <span style={{ fontSize: '14px', color: '#374151' }}>{order.buyer}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right', fontWeight: '500', color: '#1f2937' }}>
                        {formatCurrency(order.price)} ₫
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          {getStatusBadge(order.status)}
                          {order.disputeStatus && (
                            <Badge
                              size="sm"
                              variant={
                                ['return_requested', 'awaiting_seller_confirmation'].includes(order.disputeStatus)
                                  ? 'warning'
                                  : order.disputeStatus === 'return_received'
                                    ? 'success'
                                    : 'secondary'
                              }
                              style={{ borderRadius: '9999px', padding: '4px 12px', fontSize: '11px' }}
                            >
                              Tranh chấp: {order.disputeStatus}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {order.disputeId && order.disputeStatus === 'awaiting_seller_confirmation' && (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={actionLoading === `confirm-${order.disputeId}`}
                              onClick={() => handleSellerConfirmReturn(order)}
                              style={{ borderRadius: '8px', fontSize: '12px', padding: '4px 12px' }}
                            >
                              {actionLoading === `confirm-${order.disputeId}` ? 'Đang xác nhận...' : 'Xác nhận đã nhận xe'}
                            </Button>
                          )}
                          {order.disputeId && order.disputeStatus === 'return_requested' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/buyer/disputes/${order.disputeId}`)}
                              style={{ borderRadius: '8px', fontSize: '12px', padding: '4px 12px' }}
                            >
                              Xem tranh chấp
                            </Button>
                          )}
                          <Button
                            variant="success"
                            size="sm"
                            disabled={
                              actionLoading === 'shipping' ||
                              ['buyer_confirmed', 'completed', 'refunded', 'cancelled', 'disputed'].includes(order.status)
                            }
                            onClick={() => handleUpdateShipping(order)}
                            style={{ borderRadius: '8px', fontSize: '12px', padding: '4px 12px' }}
                          >
                            {actionLoading === 'shipping'
                              ? 'Đang cập nhật...'
                              : ['buyer_confirmed', 'completed', 'refunded', 'cancelled', 'disputed'].includes(order.status)
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

            {/* Scroll Indicator */}
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#9ca3af',
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Kéo ngang để xem thêm nội dung
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={shippingModalOpen}
          onClose={closeShippingModal}
          title="Cập nhật vận chuyển"
          footer={
            <>
              <Button variant="outline" onClick={closeShippingModal} disabled={actionLoading === 'shipping'} style={{ borderRadius: '8px' }}>
                Hủy
              </Button>
              <Button variant="success" onClick={submitShipping} disabled={actionLoading === 'shipping'} style={{ borderRadius: '8px' }}>
                {actionLoading === 'shipping' ? 'Đang cập nhật...' : 'Lưu cập nhật'}
              </Button>
            </>
          }
          className="max-w-lg w-full mx-4"
        >
          <div className="space-y-4">
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Đơn hàng</div>
              <div style={{ fontWeight: '600', marginTop: '4px', color: '#1f2937' }}>{selectedOrder?.bike}</div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>Mã: {selectedOrder?.id}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Người mua: {selectedOrder?.buyer}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
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
              onChange={(e) => setShippingForm((prev) => ({ ...prev, trackingNumber: e.target.value }))}
              required
              error={shippingErrors.trackingNumber}
            />

            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Thông tin vận chuyển sẽ được gửi cho người mua để theo dõi đơn hàng.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SellerOrders;