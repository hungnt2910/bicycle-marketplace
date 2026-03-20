import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';
import Chart from 'react-apexcharts';

const SystemReports = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState('');

  const periodMap = {
    '7days': '7d',
    '30days': '30d',
    '90days': '30d',
    year: '12m',
  };

  const selectedPeriod = periodMap[dateRange] || '7d';

  useEffect(() => {
    const fetchRevenueSummary = async () => {
      try {
        setRevenueLoading(true);
        setRevenueError('');
        const response = await adminApi.getRevenueSummary(selectedPeriod);
        const data = response?.data || null;
        setRevenueSummary(data);
      } catch (err) {
        console.error('Error fetching revenue summary:', err);
        setRevenueError('Không thể tải dữ liệu doanh thu');
      } finally {
        setRevenueLoading(false);
      }
    };

    fetchRevenueSummary();
  }, [selectedPeriod]);

  const formatCurrency = (value = 0) =>
    Number(value || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });

  const revenueChartData = useMemo(() => {
    const breakdown = Array.isArray(revenueSummary?.breakdown) ? revenueSummary.breakdown : [];
    return breakdown.map((item) => ({
      date: item?.type || '--',
      value: Number(item?.total || 0),
      count: Number(item?.count || 0),
      direction: item?.direction || '',
    }));
  }, [revenueSummary]);

  const typeLabelMap = {
    full_payment: 'Thanh toán đủ',
    deposit: 'Đặt cọc',
    inspection_fee: 'Phí kiểm định',
    fee: 'Phí nền tảng',
    refund: 'Hoàn tiền',
    dispute_refund: 'Hoàn tiền tranh chấp',
  };

  const breakdownRows = useMemo(() => {
    const total = Number(revenueSummary?.totalIn || 0);
    return revenueChartData.map((item) => ({
      ...item,
      label: typeLabelMap[item.date] || item.date,
      ratio: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [revenueChartData, revenueSummary?.totalIn]);

  const revenueBarChart = useMemo(() => {
    const categories = breakdownRows.map((item) => item.label);
    const seriesData = breakdownRows.map((item) => item.value);

    return {
      series: [
        {
          name: 'Doanh thu',
          data: seriesData,
        },
      ],
      options: {
        chart: {
          type: 'area',
          toolbar: { show: false },
          animations: { enabled: true },
          fontFamily: 'inherit',
        },
        stroke: {
          curve: 'smooth',
          width: 3,
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.05,
            stops: [0, 95, 100],
          },
        },
        markers: {
          size: 0,
          hover: { size: 5 },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories,
          labels: { rotate: -20, trim: true },
        },
        yaxis: {
          labels: {
            formatter: (value) =>
              Number(value || 0).toLocaleString('vi-VN', {
                maximumFractionDigits: 0,
              }),
          },
        },
        tooltip: {
          y: {
            formatter: (value) => formatCurrency(value),
          },
        },
        colors: ['#14532d'],
        grid: {
          borderColor: '#e5e7eb',
          strokeDashArray: 4,
        },
      },
    };
  }, [breakdownRows]);

  const revenueDonutChart = useMemo(() => {
    const labels = breakdownRows.map((item) => item.label);
    const series = breakdownRows.map((item) => item.value);

    return {
      series,
      options: {
        chart: {
          type: 'donut',
          fontFamily: 'inherit',
        },
        labels,
        legend: {
          position: 'bottom',
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val.toFixed(1)}%`,
        },
        tooltip: {
          y: {
            formatter: (value) => formatCurrency(value),
          },
        },
        colors: ['#14532d', '#1d4ed8', '#0d9488', '#f59e0b', '#ef4444', '#7c3aed'],
      },
    };
  }, [breakdownRows]);

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
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Báo cáo hệ thống</h1>
            <p className="text-warmgray-600">Thống kê và phân tích hoạt động hệ thống</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
              <option value="year">Năm nay</option>
            </select>
            <button className="bg-primary-700 text-white px-6 py-2 rounded-[16px] hover:bg-primary-800 font-medium">
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="lux-panel mb-6">
        <h2 className="text-xl font-bold text-primary-900 mb-6">Doanh thu</h2>

        {revenueError && (
          <div className="mb-4 rounded-[12px] border border-red-200 bg-danger/5 px-4 py-3 text-danger">
            {revenueError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-primary-800/5 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-primary-900">
              {revenueLoading ? 'Đang tải...' : formatCurrency(revenueSummary?.totalIn || 0)}
            </p>
            <p className="text-sm text-success mt-1">Kỳ: {(revenueSummary?.period || selectedPeriod).toUpperCase()}</p>
          </div>
          <div className="p-4 bg-success/5 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Số giao dịch</p>
            <p className="text-2xl font-bold text-primary-900">
              {revenueLoading
                ? '...'
                : revenueChartData.reduce((sum, item) => sum + (item.count || 0), 0)}
            </p>
            <p className="text-sm text-warmgray-500 mt-1">giao dịch</p>
          </div>
          <div className="p-4 bg-info/5 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Trung bình/GD</p>
            <p className="text-2xl font-bold text-primary-900">
              {revenueLoading
                ? '...'
                : formatCurrency(
                    (revenueSummary?.totalIn || 0) /
                      Math.max(revenueChartData.reduce((sum, item) => sum + (item.count || 0), 0), 1),
                  )}
            </p>
          </div>
          <div className="p-4 bg-gold/5 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Dòng tiền ròng</p>
            <p className="text-2xl font-bold text-primary-900">
              {revenueLoading ? '...' : formatCurrency(revenueSummary?.net || 0)}
            </p>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-warmgray-700 mb-4">Doanh thu theo loại giao dịch</h3>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-[16px] border border-warmgray-200 p-3 bg-white">
              <Chart
                type="area"
                height={320}
                series={revenueBarChart.series}
                options={revenueBarChart.options}
              />
            </div>
            <div className="rounded-[16px] border border-warmgray-200 p-3 bg-white">
              <Chart
                type="donut"
                height={320}
                series={revenueDonutChart.series}
                options={revenueDonutChart.options}
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warmgray-200 text-warmgray-600">
                  <th className="text-left py-2">Loại giao dịch</th>
                  <th className="text-right py-2">Số lượng</th>
                  <th className="text-right py-2">Tổng doanh thu</th>
                  <th className="text-right py-2">Tỷ trọng</th>
                </tr>
              </thead>
              <tbody>
                {breakdownRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-warmgray-500">
                      Chưa có dữ liệu breakdown
                    </td>
                  </tr>
                ) : (
                  breakdownRows.map((row, idx) => (
                    <tr key={`${row.date}-${idx}`} className="border-b border-warmgray-100">
                      <td className="py-2 text-primary-900">
                        {row.label}
                        {row.direction && (
                          <span className="ml-2 text-xs text-warmgray-500">({row.direction})</span>
                        )}
                      </td>
                      <td className="py-2 text-right font-medium text-primary-900">{row.count}</td>
                      <td className="py-2 text-right font-medium text-primary-900">
                        {formatCurrency(row.value)}
                      </td>
                      <td className="py-2 text-right text-warmgray-700">{row.ratio.toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Users & Listings */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Users */}
        <div className="lux-panel">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Người dùng</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-warmgray-50 rounded-[16px]">
              <div>
                <p className="text-sm text-warmgray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-primary-900">{stats.users.total}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-success font-medium">+{stats.users.new} mới</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-warmgray-50 rounded-[16px]">
              <div>
                <p className="text-sm text-warmgray-600">Người dùng hoạt động</p>
                <p className="text-2xl font-bold text-primary-900">{stats.users.active}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-700 font-medium">{stats.users.retention}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="lux-panel">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Tin đăng</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-warmgray-50 rounded-[16px]">
              <div>
                <p className="text-sm text-warmgray-600">Tổng tin đăng</p>
                <p className="text-2xl font-bold text-primary-900">{stats.listings.total}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-success/5 rounded-[16px] text-center">
                <p className="text-xs text-warmgray-600">Đã duyệt</p>
                <p className="text-lg font-bold text-success">{stats.listings.approved}</p>
              </div>
              <div className="p-3 bg-gold/5 rounded-[16px] text-center">
                <p className="text-xs text-warmgray-600">Chờ duyệt</p>
                <p className="text-lg font-bold text-gold">{stats.listings.pending}</p>
              </div>
              <div className="p-3 bg-danger/5 rounded-[16px] text-center">
                <p className="text-xs text-warmgray-600">Từ chối</p>
                <p className="text-lg font-bold text-danger">{stats.listings.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top Sellers */}
        <div className="lux-panel">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Top người bán</h2>
          <div className="space-y-3">
            {topSellers.map((seller, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-warmgray-50 rounded-[16px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-primary-900">{seller.name}</p>
                    <p className="text-xs text-warmgray-600">
                      {seller.sales} đơn hàng • ⭐ {seller.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-900">
                    {(seller.revenue / 1000000).toFixed(0)}M ₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="lux-panel">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Sản phẩm phổ biến</h2>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={idx} className="p-3 bg-warmgray-50 rounded-[16px]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-primary-900">{product.name}</p>
                  <span className="text-xs bg-success/10 text-green-800 px-2 py-1 rounded">
                    {product.sales} đã bán
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-warmgray-600">{product.views} lượt xem</span>
                  <span className="text-primary-700 font-medium">
                    {(product.conversion * 100).toFixed(1)}% chuyển đổi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="lux-panel">
        <h2 className="text-xl font-bold text-primary-900 mb-6">Hiệu năng hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-warmgray-50 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Thời gian phản hồi</p>
            <p className="text-2xl font-bold text-primary-900">{stats.performance.responseTime}ms</p>
            <p className="text-sm text-success mt-1">Tốt</p>
          </div>
          <div className="p-4 bg-warmgray-50 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Uptime</p>
            <p className="text-2xl font-bold text-primary-900">{stats.performance.uptime}%</p>
            <p className="text-sm text-success mt-1">Xuất sắc</p>
          </div>
          <div className="p-4 bg-warmgray-50 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Tỷ lệ lỗi</p>
            <p className="text-2xl font-bold text-primary-900">{stats.performance.errorRate}%</p>
            <p className="text-sm text-success mt-1">Rất thấp</p>
          </div>
          <div className="p-4 bg-warmgray-50 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">API Calls</p>
            <p className="text-2xl font-bold text-primary-900">
              {(stats.performance.apiCalls / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-warmgray-600 mt-1">7 ngày</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;
