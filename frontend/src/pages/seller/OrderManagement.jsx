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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Đơn hàng & Tiền cọc</h2>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-600 uppercase">
            <tr>
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Người mua</th>
              <th className="p-4">Tiền cọc (10%)</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{order.id}</td>
                <td className="p-4">{order.bike}</td>
                <td className="p-4">{order.buyer}</td>
                <td className="p-4 font-medium text-blue-600">
                  {order.deposit.toLocaleString()} ₫
                </td>
                <td className="p-4">
                  {order.status === 'Deposited' && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                      Đã cọc (Giữ tiền)
                    </span>
                  )}
                  {order.status === 'Completed' && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                      Hoàn tất
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {order.status === 'Deposited' && (
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-indigo-700">
                      Xác nhận giao xe
                    </button>
                  )}
                  {order.status === 'Completed' && <span className="text-gray-400">Đã xong</span>}
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
