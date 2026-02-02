import React, { useState } from 'react';
import { Badge } from '../../components/ui';

const TransactionManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [transactions] = useState([
    {
      id: 'TXN001',
      orderId: 'ORD12345',
      type: 'deposit',
      bikeName: 'Giant XTC SLR 29',
      buyer: 'Nguyễn Văn A',
      seller: 'Trần Thị B',
      amount: 5000000,
      totalAmount: 25000000,
      status: 'completed',
      date: '2024-12-20 14:30',
      paymentMethod: 'bank_transfer',
      escrowUntil: '2024-12-27',
    },
    {
      id: 'TXN002',
      orderId: 'ORD12346',
      type: 'payment',
      bikeName: 'Trek Domane AL 2',
      buyer: 'Lê Văn C',
      seller: 'Phạm Minh D',
      amount: 18900000,
      status: 'pending',
      date: '2024-12-21 10:15',
      paymentMethod: 'e_wallet',
      escrowUntil: '2024-12-28',
    },
    {
      id: 'TXN003',
      orderId: 'ORD12344',
      type: 'refund',
      bikeName: 'Specialized Sirrus X 3.0',
      buyer: 'Hoàng Thị E',
      seller: 'Vũ Văn F',
      amount: 8100000,
      totalAmount: 16200000,
      status: 'completed',
      date: '2024-12-19 16:45',
      paymentMethod: 'bank_transfer',
      refundReason: 'Sản phẩm không đúng mô tả',
    },
    {
      id: 'TXN004',
      orderId: 'ORD12347',
      type: 'deposit',
      bikeName: 'Cannondale Quick 4',
      buyer: 'Trần Minh B',
      seller: 'Nguyễn Thị G',
      amount: 2380000,
      totalAmount: 11900000,
      status: 'processing',
      date: '2024-12-21 11:20',
      paymentMethod: 'bank_transfer',
      escrowUntil: '2024-12-28',
    },
    {
      id: 'TXN005',
      orderId: 'ORD12343',
      type: 'payment',
      bikeName: 'Giant TCR Advanced 2',
      buyer: 'Phạm Văn H',
      seller: 'Lê Thị I',
      amount: 25000000,
      status: 'completed',
      date: '2024-12-18 09:30',
      paymentMethod: 'e_wallet',
      releasedDate: '2024-12-20',
    },
  ]);

  const typeLabels = {
    deposit: 'Đặt cọc',
    payment: 'Thanh toán',
    refund: 'Hoàn tiền',
    release: 'Giải ngân',
  };

  const statusLabels = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    failed: 'Thất bại',
    cancelled: 'Đã hủy',
  };

  const paymentMethodLabels = {
    bank_transfer: 'Chuyển khoản',
    e_wallet: 'Ví điện tử',
    credit_card: 'Thẻ tín dụng',
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchStatus = filterStatus === 'all' || txn.status === filterStatus;
    const matchType = filterType === 'all' || txn.type === filterType;
    return matchStatus && matchType;
  });

  const totalAmount = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý giao dịch</h1>
        <p className="text-gray-600">Theo dõi và quản lý các giao dịch thanh toán</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng giao dịch', value: transactions.length, color: 'blue' },
          {
            label: 'Chờ xử lý',
            value: transactions.filter((t) => t.status === 'pending').length,
            color: 'yellow',
          },
          {
            label: 'Hoàn thành',
            value: transactions.filter((t) => t.status === 'completed').length,
            color: 'green',
          },
          {
            label: 'Tổng giá trị',
            value: `${(totalAmount / 1000000000).toFixed(2)}B ₫`,
            color: 'purple',
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="deposit">Đặt cọc</option>
              <option value="payment">Thanh toán</option>
              <option value="refund">Hoàn tiền</option>
              <option value="release">Giải ngân</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày GD
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{txn.id}</div>
                      <div className="text-xs text-gray-500">{txn.orderId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        txn.type === 'deposit'
                          ? 'warning'
                          : txn.type === 'payment'
                            ? 'success'
                            : 'secondary'
                      }
                    >
                      {typeLabels[txn.type]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{txn.bikeName}</div>
                      <div className="text-xs text-gray-600">Người mua: {txn.buyer}</div>
                      <div className="text-xs text-gray-600">Người bán: {txn.seller}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {paymentMethodLabels[txn.paymentMethod]}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {(txn.amount / 1000000).toFixed(1)}M ₫
                      </div>
                      {txn.totalAmount && (
                        <div className="text-xs text-gray-500">
                          / {(txn.totalAmount / 1000000).toFixed(1)}M ₫
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        txn.status === 'completed'
                          ? 'success'
                          : txn.status === 'pending'
                            ? 'warning'
                            : txn.status === 'failed'
                              ? 'danger'
                              : 'secondary'
                      }
                    >
                      {statusLabels[txn.status]}
                    </Badge>
                    {txn.escrowUntil && (
                      <div className="text-xs text-gray-500 mt-1">Ký quỹ đến {txn.escrowUntil}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{txn.date}</div>
                    {txn.releasedDate && (
                      <div className="text-xs text-green-600">Giải ngân: {txn.releasedDate}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Xem
                      </button>
                      {txn.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Xác nhận
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
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
