import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button } from '../../components/ui';
import { toast } from 'react-toastify';
import adminApi from '../../api/adminApi';

const TransactionManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [escrowTransactions, setEscrowTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, escrowRes] = await Promise.all([
        adminApi.getEscrowStatistics(),
        adminApi.getEscrowHeld(),
      ]);

      setStats(statsRes?.data?.data || statsRes?.data || {});
      const escrowList = escrowRes?.data?.data || escrowRes?.data || [];
      setEscrowTransactions(Array.isArray(escrowList) ? escrowList : []);
    } catch (err) {
      console.error('Load admin transaction data error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được dữ liệu giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const typeLabels = {
    deposit: 'Đặt cọc',
    full_payment: 'Thanh toán đủ',
    refund: 'Hoàn tiền',
    escrow_release: 'Giải phóng escrow',
  };

  const statusLabels = {
    pending_payment: 'Chờ thanh toán',
    held_in_escrow: 'Đang giữ escrow',
    awaiting_delivery: 'Chờ giao',
    delivered: 'Đã giao',
    completed: 'Hoàn thành',
    refunded: 'Hoàn tiền',
    cancelled: 'Đã hủy',
  };

  const paymentMethodLabels = {
    bank_transfer: 'Chuyển khoản',
    e_wallet: 'Ví điện tử',
    credit_card: 'Thẻ tín dụng',
  };

  const filteredTransactions = escrowTransactions.filter((txn) => {
    const matchStatus = filterStatus === 'all' || (txn.status || '').toLowerCase() === filterStatus;
    const matchType = filterType === 'all' || (txn.type || '').toLowerCase() === filterType;
    return matchStatus && matchType;
  });

  const totalHeldAmount = useMemo(() => {
    if (stats?.totalHeldAmount || stats?.totalEscrowAmount) {
      return Number(stats.totalHeldAmount || stats.totalEscrowAmount || 0);
    }
    return escrowTransactions
      .filter((t) =>
        ['held_in_escrow', 'awaiting_delivery', 'delivered', 'disputed'].includes(
          (t.status || '').toLowerCase()
        )
      )
      .reduce((sum, t) => sum + Number(t.escrow?.heldAmount || t.amount || 0), 0);
  }, [stats, escrowTransactions]);

  const runAction = async (label, fn) => {
    setActionLoading(label);
    try {
      await fn();
      toast.success('Thao tác escrow thành công');
      await loadData();
    } catch (err) {
      console.error(`${label} error:`, err);
      toast.error(err?.response?.data?.message || 'Không thực hiện được thao tác escrow');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Quản lý giao dịch</h1>
          <p className="text-warmgray-600">Thống kê và kiểm soát escrow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Tổng giao dịch',
            value: stats?.totalTransactions ?? escrowTransactions.length,
          },
          {
            label: 'Đang escrow',
            value: stats?.heldCount ?? stats?.escrowCount ?? escrowTransactions.length,
          },
          {
            label: 'Hoàn thành',
            value:
              stats?.completedCount ??
              escrowTransactions.filter((t) => (t.status || '').toLowerCase() === 'completed')
                .length,
          },
          {
            label: 'Tổng giá trị (B ₫)',
            value: (totalHeldAmount / 1000000000).toFixed(2),
          },
        ].map((stat, idx) => (
          <div key={idx} className="lux-panel">
            <p className="text-warmgray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-primary-900">{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="lux-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Loại giao dịch
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="all">Tất cả loại</option>
              <option value="deposit">Đặt cọc</option>
              <option value="full_payment">Thanh toán đủ</option>
              <option value="refund">Hoàn tiền</option>
              <option value="escrow_release">Giải phóng escrow</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending_payment">Chờ thanh toán</option>
              <option value="held_in_escrow">Đang giữ escrow</option>
              <option value="awaiting_delivery">Chờ giao</option>
              <option value="delivered">Đã giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="refunded">Hoàn tiền</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="lux-panel">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-warmgray-50 border-b border-warmgray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Ngày GD
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-warmgray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-warmgray-600">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
              {!loading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-warmgray-600">
                    Chưa có giao dịch escrow nào
                  </td>
                </tr>
              )}
              {!loading &&
                filteredTransactions.map((txn) => {
                  const status = (txn.status || '').toLowerCase();
                  const type = (txn.type || '').toLowerCase();
                  const buyer =
                    `${txn?.buyerId?.profile?.firstName || ''} ${txn?.buyerId?.profile?.lastName || ''}`.trim() ||
                    txn?.buyerId?.email ||
                    'Người mua';
                  const seller = txn?.sellerId?.email || 'Người bán';
                  const bikeName = txn?.bicycleId?.title || 'Xe đạp';
                  const amount = Number(txn?.amount || 0);
                  return (
                    <tr key={txn._id || txn.id} className="hover:bg-warmgray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-primary-900">{txn._id || txn.id}</div>
                          <div className="text-xs text-warmgray-500">{txn?.orderId || '—'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            type === 'deposit'
                              ? 'warning'
                              : type === 'full_payment'
                                ? 'success'
                                : 'secondary'
                          }
                        >
                          {typeLabels[type] || type || 'Khác'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-primary-900">{bikeName}</div>
                          <div className="text-xs text-warmgray-600">Người mua: {buyer}</div>
                          <div className="text-xs text-warmgray-600">Người bán: {seller}</div>
                          <div className="text-xs text-warmgray-500 mt-1">
                            {paymentMethodLabels[txn.paymentMethod] || txn.paymentMethod || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-lg font-bold text-primary-900">
                            {(amount / 1000000).toFixed(2)}M ₫
                          </div>
                          {txn.escrow?.heldAmount && (
                            <div className="text-xs text-warmgray-500">
                              Escrow: {(Number(txn.escrow.heldAmount) / 1000000).toFixed(2)}M ₫
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            status === 'completed'
                              ? 'success'
                              : ['pending_payment', 'awaiting_delivery'].includes(status)
                                ? 'warning'
                                : ['refunded', 'cancelled', 'canceled'].includes(status)
                                  ? 'danger'
                                  : 'secondary'
                          }
                        >
                          {statusLabels[status] || status || '—'}
                        </Badge>
                        {txn.escrow?.autoReleaseDeadline && (
                          <div className="text-xs text-warmgray-500 mt-1">
                            Ký quỹ đến {txn.escrow.autoReleaseDeadline?.slice(0, 10)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-primary-900">
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleString('vi-VN') : '—'}
                        </div>
                        {txn.shipping?.deliveredAt && (
                          <div className="text-xs text-success">
                            Giao: {new Date(txn.shipping.deliveredAt).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            disabled={actionLoading === `release-${txn._id || txn.id}`}
                            onClick={() =>
                              runAction(`release-${txn._id || txn.id}`, () =>
                                adminApi.releaseEscrow(txn._id || txn.id)
                              )
                            }
                          >
                            {actionLoading === `release-${txn._id || txn.id}`
                              ? 'Đang giải ngân...'
                              : 'Release escrow'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={actionLoading === `refund-${txn._id || txn.id}`}
                            onClick={() => {
                              const confirmRefund = window.confirm('Hoàn escrow về buyer?');
                              if (!confirmRefund) return;
                              runAction(`refund-${txn._id || txn.id}`, () =>
                                adminApi.refundEscrow(txn._id || txn.id)
                              );
                            }}
                          >
                            {actionLoading === `refund-${txn._id || txn.id}`
                              ? 'Đang hoàn...'
                              : 'Refund escrow'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 bg-primary-800/5 border border-primary-600/20 rounded-[16px] p-4">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-primary-700 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-primary-900">
            <p className="font-semibold mb-1">Lưu ý về giao dịch</p>
            <ul className="space-y-1">
              <li>• Tiền cọc được ký quỹ an toàn trong hệ thống</li>
              <li>• Giải ngân sau khi người mua xác nhận nhận hàng</li>
              <li>• Hoàn tiền tự động nếu đơn hàng bị hủy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionManagement;
