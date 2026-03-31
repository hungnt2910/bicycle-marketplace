import React, { useEffect, useMemo, useState } from 'react';
import { Card, Badge } from '../../components/ui';
import { toast } from 'react-toastify';
import transactionApi from '../../api/transactionApi';

const statusLabels = {
  pending_payment: 'Chờ thanh toán',
  completed: 'Hoàn tất',
  refunded: 'Đã hoàn tiền',
  cancelled: 'Đã hủy',
};

const statusVariants = {
  pending_payment: 'warning',
  completed: 'success',
  refunded: 'default',
  cancelled: 'danger',
};

const typeLabels = {
  listing_fee: 'Phí đăng tinn',
  inspection_fee: 'Phí kiểm định',
  service_fee: 'Phí dịch vụ',
  platform_fee: 'Phí nền tảng',
  commission: 'Hoa hồng',
  fee: 'Phí đăng tin',
};

const feeTypes = Object.keys(typeLabels);
const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN');

const SellerFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getMyTransactions({ role: 'seller' });
      const data = res?.data?.data || res?.data || [];
      const mapped = (Array.isArray(data) ? data : [])
        .filter((tx) => feeTypes.includes((tx?.type || '').toLowerCase()))
        .map((tx) => ({
          id: tx?._id || tx?.id,
          type: (tx?.type || '').toLowerCase(),
          amount: tx?.amount || 0,
          status: (tx?.status || '').toLowerCase(),
          createdAt: tx?.createdAt,
          description: tx?.description || tx?.note || tx?.reason,
          listing: tx?.bicycleId?.title,
        }));
      setFees(mapped);
    } catch (err) {
      console.error('Fetch seller fees error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được giao dịch phí');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const stats = useMemo(() => {
    const total = fees.length;
    const pending = fees.filter((f) => f.status === 'pending_payment').length;
    const completed = fees.filter((f) => f.status === 'completed').length;
    const refunded = fees.filter((f) => ['refunded', 'cancelled'].includes(f.status)).length;
    return { total, pending, completed, refunded };
  }, [fees]);

  const getStatusBadge = (status) => (
    <Badge variant={statusVariants[status] || 'default'} className="badge">
      {statusLabels[status] || status || '--'}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Phí đăng tin & kiểm định</h2>
        <p className="text-warmgray-600 mt-1">Quản lý các giao dịch phí dịch vụ của bạn</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Tổng giao dịch phí',
            value: stats.total,
          },
          {
            label: 'Chờ thanh toán',
            value: stats.pending,
          },
          {
            label: 'Hoàn tất',
            value: stats.completed,
          },
          {
            label: 'Đã hoàn / hủy',
            value: stats.refunded,
          },
        ].map((item, idx) => (
          <Card key={idx} className="p-4">
            <div className="text-sm text-warmgray-600 mb-1">{item.label}</div>
            <div className="text-2xl font-bold text-primary-900">{item.value}</div>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-warmgray-600">Đang tải giao dịch phí...</p>
        </Card>
      ) : fees.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-warmgray-600">Chưa có giao dịch phí nào</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-700 divide-x divide-warmgray-200">
                <tr>
                  <th className="py-4 px-6 font-semibold text-sm">Loại phí</th>
                  <th className="py-4 px-6 font-semibold text-sm">Số tiền</th>
                  <th className="py-4 px-6 font-semibold text-sm">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-sm">Ngày tạo</th>
                  {/* <th className="py-4 px-6 font-semibold text-sm">Mô tả</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray-200">
                {fees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="hover:bg-warmgray-50 transition-colors divide-x divide-warmgray-200"
                  >
                    <td className="py-4 px-6 align-middle whitespace-nowrap font-semibold text-primary-900">
                      {typeLabels[fee.type] || fee.type || 'Phí dịch vụ'}
                      {fee.listing && (
                        <div className="text-xs text-warmgray-500">Tin: {fee.listing}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 align-middle font-medium text-primary-700 whitespace-nowrap">
                      {formatCurrency(fee.amount)} ₫
                    </td>
                    <td className="py-4 px-6 align-middle whitespace-nowrap">
                      {getStatusBadge(fee.status)}
                    </td>
                    <td className="py-4 px-6 align-middle text-sm text-warmgray-600 whitespace-nowrap">
                      {fee.createdAt ? new Date(fee.createdAt).toLocaleString('vi-VN') : '--'}
                    </td>
                    {/* <td className="py-4 px-6 align-middle text-sm text-warmgray-700">
                      {fee.description || '—'}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SellerFees;
