import React from 'react';

const OrderManagement = () => {
  const orders = [
    {
      id: 'ORD-001',
      bike: 'Trek Marlin 7',
      buyer: 'Nguyễn Văn A',
      price: 15500000,
      deposit: 1550000,
      status: 'Deposited',
      date: '2025-10-20',
    },
    {
      id: 'ORD-002',
      bike: 'Giant Escape 2',
      buyer: 'Trần Thị B',
      price: 8500000,
      deposit: 850000,
      status: 'Completed',
      date: '2025-10-18',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-warmgray-800">Quản lý Đơn hàng & Tiền cọc</h2>

      <div className="lux-panel overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-700 divide-x divide-warmgray-200">
            <tr>
              <th className="py-4 px-6 font-semibold text-sm">Mã đơn</th>
              <th className="py-4 px-6 font-semibold text-sm">Sản phẩm</th>
              <th className="py-4 px-6 font-semibold text-sm">Người mua</th>
              <th className="py-4 px-6 font-semibold text-sm">Tiền cọc (10%)</th>
              <th className="py-4 px-6 font-semibold text-sm">Trạng thái</th>
              <th className="py-4 px-6 font-semibold text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warmgray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-warmgray-50 transition-colors divide-x divide-warmgray-200">
                <td className="py-4 px-6 align-middle font-bold text-lg text-primary-900">{order.id}</td>
                <td className="py-4 px-6 align-middle">{order.bike}</td>
                <td className="py-4 px-6 align-middle">{order.buyer}</td>
                <td className="py-4 px-6 align-middle font-medium text-primary-700">
                  {order.deposit.toLocaleString()} ₫
                </td>
                <td className="py-4 px-6 align-middle">
                  {order.status === 'Deposited' && (
                    <span className="bg-primary-800/10 text-primary-900 px-2 py-1 rounded text-xs font-bold">
                      Đã cọc (Giữ tiền)
                    </span>
                  )}
                  {order.status === 'Completed' && (
                    <span className="bg-success-800/10 text-success-800 px-2 py-1 rounded text-xs font-bold border border-success-200">
                      Hoàn tất
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 align-middle">
                  {order.status === 'Deposited' && (
                    <button className="bg-primary-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-primary-700 transition">
                      Xác nhận giao xe
                    </button>
                  )}
                  {order.status === 'Completed' && <span className="text-warmgray-400 font-medium">Đã xong</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
