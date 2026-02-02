import React, { useState } from 'react';

const SystemReports = () => {
  const [dateRange, setDateRange] = useState('7days');

  const stats = {
    revenue: {
      total: 1250000000,
      growth: 18.5,
      transactions: 156,
      avgTransaction: 8012820,
    },
    users: {
      total: 10234,
      new: 245,
      active: 8456,
      retention: 82.6,
    },
    listings: {
      total: 2567,
      approved: 2234,
      pending: 156,
      rejected: 177,
    },
    performance: {
      responseTime: 245,
      uptime: 99.8,
      errorRate: 0.12,
      apiCalls: 125678,
    },
  };

  const revenueData = [
    { date: '14/12', value: 125000000 },
    { date: '15/12', value: 145000000 },
    { date: '16/12', value: 132000000 },
    { date: '17/12', value: 178000000 },
    { date: '18/12', value: 156000000 },
    { date: '19/12', value: 189000000 },
    { date: '20/12', value: 195000000 },
  ];

  const topSellers = [
    { name: 'Trần Thị B', sales: 12, revenue: 350000000, rating: 4.9 },
    { name: 'Nguyễn Văn A', sales: 10, revenue: 280000000, rating: 4.8 },
    { name: 'Lê Văn C', sales: 8, revenue: 220000000, rating: 4.7 },
    { name: 'Phạm Minh D', sales: 7, revenue: 195000000, rating: 4.6 },
    { name: 'Hoàng Thị E', sales: 6, revenue: 175000000, rating: 4.8 },
  ];

  const topProducts = [
    { name: 'Giant XTC SLR 29', views: 2456, sales: 15, conversion: 0.61 },
    { name: 'Trek Domane AL 2', views: 1890, sales: 12, conversion: 0.63 },
    { name: 'Specialized Tarmac SL7', views: 2134, sales: 10, conversion: 0.47 },
    { name: 'Cannondale Quick 4', views: 1567, sales: 9, conversion: 0.57 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo hệ thống</h1>
            <p className="text-gray-600">Thống kê và phân tích hoạt động hệ thống</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
              <option value="year">Năm nay</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Doanh thu</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats.revenue.total / 1000000000).toFixed(2)}B ₫
            </p>
            <p className="text-sm text-green-600 mt-1">+{stats.revenue.growth}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Số giao dịch</p>
            <p className="text-2xl font-bold text-gray-900">{stats.revenue.transactions}</p>
            <p className="text-sm text-gray-500 mt-1">giao dịch</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Trung bình/GD</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats.revenue.avgTransaction / 1000000).toFixed(1)}M ₫
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Hoa hồng (5%)</p>
            <p className="text-2xl font-bold text-gray-900">
              {((stats.revenue.total * 0.05) / 1000000).toFixed(0)}M ₫
            </p>
          </div>
        </div>

        {/* Simple Revenue Chart */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu theo ngày</h3>
          <div className="flex items-end gap-2 h-48">
            {revenueData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-100 rounded-t relative group cursor-pointer hover:bg-blue-200 transition-colors"
                  style={{ height: `${(data.value / 200000000) * 100}%` }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {(data.value / 1000000).toFixed(0)}M ₫
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{data.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users & Listings */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Users */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Người dùng</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 font-medium">+{stats.users.new} mới</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Người dùng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.active}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">{stats.users.retention}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tin đăng</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Tổng tin đăng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.listings.total}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Đã duyệt</p>
                <p className="text-lg font-bold text-green-600">{stats.listings.approved}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Chờ duyệt</p>
                <p className="text-lg font-bold text-yellow-600">{stats.listings.pending}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Từ chối</p>
                <p className="text-lg font-bold text-red-600">{stats.listings.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top Sellers */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top người bán</h2>
          <div className="space-y-3">
            {topSellers.map((seller, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{seller.name}</p>
                    <p className="text-xs text-gray-600">
                      {seller.sales} đơn hàng • ⭐ {seller.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {(seller.revenue / 1000000).toFixed(0)}M ₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm phổ biến</h2>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {product.sales} đã bán
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{product.views} lượt xem</span>
                  <span className="text-blue-600 font-medium">
                    {(product.conversion * 100).toFixed(1)}% chuyển đổi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Hiệu năng hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Thời gian phản hồi</p>
            <p className="text-2xl font-bold text-gray-900">{stats.performance.responseTime}ms</p>
            <p className="text-sm text-green-600 mt-1">Tốt</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Uptime</p>
            <p className="text-2xl font-bold text-gray-900">{stats.performance.uptime}%</p>
            <p className="text-sm text-green-600 mt-1">Xuất sắc</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tỷ lệ lỗi</p>
            <p className="text-2xl font-bold text-gray-900">{stats.performance.errorRate}%</p>
            <p className="text-sm text-green-600 mt-1">Rất thấp</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">API Calls</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats.performance.apiCalls / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-gray-600 mt-1">7 ngày</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;
