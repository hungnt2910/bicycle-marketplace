import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../../components/ui';
import transactionApi from '../../api/transactionApi';
import { toast } from 'react-toastify';

const statusLabelMap = {
  pending_payment: 'Chờ thanh toán',
  payment_received: 'Đã nhận thanh toán',
  held_in_escrow: 'Giữ tiền escrow',
  awaiting_delivery: 'Chờ giao hàng',
  delivered: 'Đã giao',
  completed: 'Hoàn tất',
  refunded: 'Đã hoàn tiền',
  disputed: 'Đang tranh chấp',
  cancelled: 'Đã hủy',
};

const statusBadgeVariant = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['completed', 'delivered', 'payment_received'].includes(normalized)) return 'success';
  if (['pending_payment', 'held_in_escrow', 'awaiting_delivery'].includes(normalized))
    return 'warning';
  if (['refunded', 'disputed', 'cancelled', 'canceled'].includes(normalized)) return 'danger';
  return 'primary';
};

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await transactionApi.getById(id);
      const data = res?.data?.data || res?.data;
      setTx(data || null);
    } catch (err) {
      console.error('Fetch transaction detail error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được chi tiết giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-neutral-600">
        Đang tải chi tiết giao dịch...
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-rose-600">
        Không tìm thấy giao dịch
      </div>
    );
  }

  const statusLabel = statusLabelMap[tx.status] || tx.status;
  const amount = formatCurrency(tx.amount);
  const bikeTitle = tx?.bicycleId?.title || 'Xe đạp';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Chi tiết giao dịch</h1>
            <p className="text-sm text-neutral-500">Mã: {tx._id || tx.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant(tx.status)}>{statusLabel}</Badge>
            <Button variant="outline" onClick={() => navigate('/buyer/dashboard')}>
              Quay lại đơn hàng
            </Button>
          </div>
        </div>

        <Card className="p-6 border border-neutral-200/70 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-500">Sản phẩm</div>
              <div className="font-semibold text-neutral-900">{bikeTitle}</div>
            </div>
            <div className="text-right sm:text-left">
              <div className="text-sm text-neutral-500">Số tiền</div>
              <div className="text-xl font-bold text-themePrimary">{amount} ₫</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Hình thức</div>
              <div className="font-medium text-neutral-800">{tx.payment?.method || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Loại giao dịch</div>
              <div className="font-medium text-neutral-800">{tx.type}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Tạo lúc</div>
              <div className="font-medium text-neutral-800">{formatDateTime(tx.createdAt)}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-500">Cập nhật</div>
              <div className="font-medium text-neutral-800">{formatDateTime(tx.updatedAt)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-neutral-200/70 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Thông tin thanh toán</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-700">
            <div>
              <div className="text-neutral-500">Mã thanh toán</div>
              <div className="font-medium">{tx.payment?.transactionId || '--'}</div>
            </div>
            <div>
              <div className="text-neutral-500">Thanh toán lúc</div>
              <div className="font-medium">{formatDateTime(tx.payment?.paidAt)}</div>
            </div>
            <div>
              <div className="text-neutral-500">Escrow</div>
              <div className="font-medium">
                {tx.escrow?.heldAmount ? `${formatCurrency(tx.escrow.heldAmount)} ₫` : '--'}
              </div>
            </div>
            <div>
              <div className="text-neutral-500">Auto release</div>
              <div className="font-medium">{formatDateTime(tx.escrow?.autoReleaseDeadline)}</div>
            </div>
          </div>
        </Card>

        {tx.shipping && (
          <Card className="p-6 border border-neutral-200/70 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Vận chuyển</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-700">
              <div>
                <div className="text-neutral-500">Đơn vị</div>
                <div className="font-medium">{tx.shipping.provider || '--'}</div>
              </div>
              <div>
                <div className="text-neutral-500">Mã vận đơn</div>
                <div className="font-medium">{tx.shipping.trackingNumber || '--'}</div>
              </div>
              <div>
                <div className="text-neutral-500">Gửi lúc</div>
                <div className="font-medium">{formatDateTime(tx.shipping.shippedAt)}</div>
              </div>
              <div>
                <div className="text-neutral-500">Giao lúc</div>
                <div className="font-medium">{formatDateTime(tx.shipping.deliveredAt)}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;
