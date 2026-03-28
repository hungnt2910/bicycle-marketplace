import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';
import Chart from 'react-apexcharts';
import userApi from '../../api/userApi';
import postNewsApi from '../../api/postNewsApi';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState('');
  const [user, setUser] = useState([]);
  const [postNews, setPostNews] = useState([]);
  const [seller, setSeller] = useState(0);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userApi.getAllUsers();
        const users = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        setUser(users);
        console.log(' Sample user data:', users);
        setSeller(users.filter((u) => u.role === 'seller').length || 0);
        console.log(' Sample seller count:', users.filter((u) => u.role === 'seller').length || 0);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPostNewsData = async () => {
      try {
        const res = await postNewsApi.getAllBicycles();
        const posts = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setPostNews(posts);
        console.log(' Sample post news data:', posts);
      } catch (err) {
        console.error('Error fetching post news data:', err);
      }
    };

    fetchPostNewsData();
  }, []);

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
          type: 'bar',
          toolbar: { show: false },
          animations: { enabled: true },
          fontFamily: 'inherit',
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: '48%',
            distributed: true,
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories,
          labels: { rotate: -12, trim: true },
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
        colors: ['#166534', '#1d4ed8', '#0d9488', '#f59e0b', '#ef4444', '#7c3aed'],
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
      total: user?.length || 0,
      new: 5,
      active: Array.isArray(user) ? user.filter((u) => u.status === 'active').length : 0,
      retention: 100,
    },
    listings: {
      total: postNews?.length || 0,
      approved: (Array.isArray(postNews) ? postNews.filter((p) => p.inspection?.isInspected === true).length : 0) || 0,
      pending: (Array.isArray(postNews) ? postNews.filter((p) => p.status === 'pending_review').length : 0) || 0,
      rejected: (Array.isArray(postNews) ? postNews.filter((p) => p.inspection?.isInspected === false).length : 0) || 0,
    },
    performance: {
      responseTime: 245,
      uptime: 99.8,
      errorRate: 0.12,
      apiCalls: 125678,
    },
  };

  const topSellers = useMemo(() => {
    const usersArray = Array.isArray(user) ? user : [];
    const bikesArray = Array.isArray(postNews) ? postNews : [];

    const userMap = new Map(
      usersArray.map((u) => [
        String(u?._id || u?.id || ''),
        {
          name:
            `${u?.firstName || ''} ${u?.lastName || ''}`.trim() ||
            u?.fullName ||
            u?.username ||
            u?.email ||
            'Người bán',
          rating: Number(u?.reputation?.rating || 0),
        },
      ]),
    );

    const grouped = new Map();

    bikesArray
      .filter((bike) => String(bike?.status || '').toLowerCase() === 'sold')
      .forEach((bike) => {
        const sellerId = String(bike?.sellerId?._id || bike?.sellerId || '').trim();
        if (!sellerId) return;

        const current = grouped.get(sellerId) || { sales: 0, revenue: 0 };
        grouped.set(sellerId, {
          sales: current.sales + 1,
          revenue: current.revenue + Number(bike?.price || 0),
        });
      });

    return [...grouped.entries()]
      .map(([sellerId, data]) => {
        const userInfo = userMap.get(sellerId) || { name: 'Người bán', rating: 0 };
        return {
          id: sellerId,
          name: userInfo.name,
          sales: data.sales,
          revenue: data.revenue,
          rating: userInfo.rating,
        };
      })
      .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue)
      .slice(0, 5);
  }, [postNews, user]);

  const topProducts = useMemo(() => {
    const bikesArray = Array.isArray(postNews) ? postNews : [];
    const grouped = new Map();

    bikesArray
      .filter((bike) => String(bike?.status || '').toLowerCase() === 'sold')
      .forEach((bike) => {
        const title = (bike?.title || 'Không rõ sản phẩm').toString().trim();
        const current = grouped.get(title) || { views: 0, sales: 0 };
        grouped.set(title, {
          views: current.views + Number(bike?.views || 0),
          sales: current.sales + 1,
        });
      });

    return [...grouped.entries()]
      .map(([name, data]) => ({
        name,
        views: data.views,
        sales: data.sales,
        conversion: data.views > 0 ? data.sales / data.views : 0,
      }))
      .sort((a, b) => b.sales - a.sales || b.views - a.views)
      .slice(0, 5);
  }, [postNews]);

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
                type="bar"
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
    </div>
  );
};

export default AdminDashboard;
