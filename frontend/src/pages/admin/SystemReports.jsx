import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import adminApi from '../../api/adminApi';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: '12m', label: '12 tháng qua' },
];

const TYPE_LABELS = {
  full_payment: 'Thanh toán toàn phần',
  deposit: 'Đặt cọc',
  fee: 'Phí nền tảng',
  inspection_fee: 'Phí kiểm định',
  penalty: 'Phí phạt',
  commission: 'Hoa hồng',
  refund: 'Hoàn tiền',
  dispute_refund: 'Hoàn tiền tranh chấp',
};

const formatCurrency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ₫'
    : '—';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—');

const SystemReports = () => {
  const [period, setPeriod] = useState('30d');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = async (nextPeriod) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getRevenueSummary(nextPeriod);
      setSummary(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không tải được dữ liệu doanh thu');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(period);
  }, [period]);

  const categories = useMemo(() => (summary?.breakdown || []).map((item) => item.type), [summary]);

  const areaSeries = useMemo(() => {
    const breakdown = summary?.breakdown || [];
    return [
      {
        name: 'Tiền vào',
        data: categories.map((type) => {
          const found = breakdown.find((b) => b.type === type && b.direction === 'in');
          return found ? found.total : 0;
        }),
      },
      // {
      //   name: 'Tiền ra',
      //   data: categories.map((type) => {
      //     const found = breakdown.find((b) => b.type === type && b.direction === 'out');
      //     return found ? found.total : 0;
      //   }),
      // },
    ];
  }, [categories, summary]);

  const areaOptions = useMemo(
    () => ({
      chart: {
        type: 'area',
        stacked: false,
        height: 350,
        zoom: { enabled: false },
        toolbar: { show: false },
      },
      colors: ['#2563eb', '#f97316'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 0 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100],
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#8e8da4' },
          formatter: (val) => `${(val / 1_000_000).toFixed(2)}M`,
        },
      },
      xaxis: {
        categories,
        tickAmount: Math.min(categories.length, 8),
        labels: {
          rotate: -15,
          rotateAlways: true,
          style: { fontSize: '12px' },
        },
      },
      tooltip: {
        shared: true,
        y: {
          formatter: (val) => formatCurrency(val),
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetX: -10,
      },
    }),
    [categories]
  );

  const donutSeries = [summary?.totalIn || 0, summary?.totalOut || 0];
  const donutOptions = {
    labels: ['Tiền vào', 'Tiền ra'],
    colors: ['#22c55e', '#ef4444'],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      formatter: (val, opts) =>
        `${val.toFixed(1)}% • ${formatCurrency(opts.w.globals.series[opts.seriesIndex])}`,
    },
  };

  return (
    <div className="dash-content">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Báo cáo doanh thu</h1>
          <p className="text-warmgray-600">
            Tổng hợp tiền vào/ra platform theo kỳ: 7 ngày, 30 ngày, 12 tháng
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-warmgray-500">
            {summary ? `${formatDate(summary.from)} – ${formatDate(summary.to)}` : 'Đang tải...'}
          </span>
        </div>
      </div>

      <div className="lux-panel mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-primary-900">Tổng quan dòng tiền</h2>
          {loading && <span className="text-sm text-warmgray-500">Đang tải...</span>}
          {error && <span className="text-sm text-danger">{error}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 bg-success/5 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Tiền vào</p>
            <p className="text-2xl font-bold text-primary-900">
              {formatCurrency(summary?.totalIn)}
            </p>
          </div>
          {/* <div className="p-4 bg-danger/5 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Tiền ra</p>
            <p className="text-2xl font-bold text-primary-900">
              {formatCurrency(summary?.totalOut)}
            </p>
          </div> */}
          <div className="p-4 bg-primary-800/5 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Lãi ròng</p>
            <p
              className={`text-2xl font-bold ${
                (summary?.net || 0) >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {formatCurrency(summary?.net)}
            </p>
          </div>
          <div className="p-4 bg-warmgray-50 rounded-[16px]">
            <p className="text-sm text-warmgray-600 mb-1">Khoảng thời gian</p>
            <p className="text-base font-semibold text-primary-900">
              {summary ? `${formatDate(summary.from)} → ${formatDate(summary.to)}` : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-[16px] p-4 border border-warmgray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-warmgray-700">Biểu đồ in/out theo loại</h3>
              <span className="text-xs text-warmgray-500">Area chart</span>
            </div>
            {categories.length === 0 ? (
              <div className="text-center text-warmgray-500 py-8">Chưa có dữ liệu</div>
            ) : (
              <ReactApexChart options={areaOptions} series={areaSeries} type="area" height={350} />
            )}
          </div>

          <div className="bg-white rounded-[16px] p-4 border border-warmgray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-warmgray-700">Tỷ trọng in/out</h3>
              <span className="text-xs text-warmgray-500">Donut</span>
            </div>
            <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={350} />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-base font-semibold text-primary-900 mb-3">Breakdown theo loại</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-warmgray-600 border-b">
                  <th className="py-2 pr-4">Loại</th>
                  <th className="py-2 pr-4">Chiều</th>
                  <th className="py-2 pr-4">Tổng tiền</th>
                  <th className="py-2 pr-4">Số giao dịch</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.breakdown || []).map((item, idx) => (
                  <tr key={`${item.type}-${idx}`} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-semibold text-primary-900">
                      {TYPE_LABELS[item.type] || item.type}
                      <span className="ml-2 text-xs text-warmgray-500">({item.type})</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.direction === 'in'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {item.direction === 'in' ? 'Tiền vào' : 'Tiền ra'}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{formatCurrency(item.total)}</td>
                    <td className="py-2 pr-4 text-warmgray-700">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;
