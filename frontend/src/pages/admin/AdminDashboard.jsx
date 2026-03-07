import React from 'react';
import { Card, Badge, Button } from '../../components/ui';

const AdminDashboard = ({ user }) => {
  const stats = [
    {
      label: 'Tổng người dùng',
      value: '10,234',
      change: '+12%',
      icon: '',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Xe đang bán',
      value: '2,567',
      change: '+8%',
      icon: '',
      color: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Giao dịch',
      value: '8,123',
      change: '+15%',
      icon: '',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      label: 'Doanh thu',
      value: '1.2B ₫',
      change: '+20%',
      icon: '',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const recentActivity = [
    {
      type: 'user',
      message: 'Người dùng mới: Nguyễn Văn X đăng ký',
      time: '5 phút trước',
      icon: '',
    },
    {
      type: 'listing',
      message: 'Tin đăng mới: Giant Talon 3 cần kiểm duyệt',
      time: '10 phút trước',
      icon: '',
    },
    { type: 'dispute', message: 'Tranh chấp mới: Đơn hàng #1234', time: '15 phút trước', icon: '' },
    {
      type: 'transaction',
      message: 'Giao dịch hoàn thành: 18.9M ₫',
      time: '20 phút trước',
      icon: '',
    },
  ];

  const pendingTasks = [
    { task: 'Kiểm duyệt tin đăng', count: 12, color: 'warning' },
    { task: 'Giải quyết tranh chấp', count: 3, color: 'danger' },
    { task: 'Xác minh người dùng', count: 8, color: 'primary' },
  ];

  return (
    <div className="dash-content">
      {/* Welcome */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Bảng điều khiển quản trị viên</h1>
            <p>Tổng quan hoạt động hệ thống Bicycle-Marketplace</p>
          </div>
          {user && (
            <div className="text-right lux-panel">
              <p className="text-sm text-warmgray-600">Chào mừng,</p>
              <p className="text-xl font-bold text-primary-900">
                {user.fullName || user.username || 'Admin'}
              </p>
              {user.email && <p className="text-sm text-warmgray-600 mt-1">{user.email}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="lux-panel">
            <div className="text-2xl mb-3">{stat.icon}</div>
            <p className="text-warmgray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-primary-900 mt-1">{stat.value}</p>
            <p className="text-xs text-success font-medium mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Tasks */}
        <div className="lux-panel">
          <h3 className="text-xl font-bold mb-6">Công việc cần xử lý</h3>
          <div className="space-y-4">
            {pendingTasks.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 bg-warmgray-50 rounded-[20px] hover:bg-warmgray-100 transition-colors cursor-pointer"
              >
                <span className="font-medium text-primary-900">{item.task}</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-bold ${
                    item.color === 'warning'
                      ? 'bg-gold/10 text-yellow-800'
                      : item.color === 'danger'
                        ? 'bg-danger/10 text-red-800'
                        : 'bg-primary-800/10 text-primary-900'
                  }`}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 bg-primary-700 text-white py-3 rounded-[16px] hover:bg-primary-800 font-medium">
            Xem tất cả công việc
          </button>
        </div>

        {/* Recent Activity */}
        <div className="lux-panel lg:col-span-2">
          <h3 className="text-xl font-bold mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-5 bg-warmgray-50 rounded-[20px]">
                <div className="w-10 h-10 rounded-full bg-primary-800/10 flex items-center justify-center text-xl flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary-900">{activity.message}</p>
                  <p className="text-sm text-warmgray-600 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="lux-panel">
        <h3 className="text-xl font-bold mb-6">Thao tác nhanh</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button className="bg-primary-700 text-white py-5 rounded-[20px] hover:bg-primary-800 font-medium h-24">
            <div className="text-center">
              <div className="text-2xl mb-1"></div>
              <div className="text-sm">Quản lý chuyên viên kiểm định</div>
            </div>
          </button>
          <button className="border border-warmgray-300 py-5 rounded-[20px] hover:bg-warmgray-50 font-medium h-24">
            <div className="text-center">
              <div className="text-2xl mb-1"></div>
              <div className="text-sm">Kiểm duyệt tin</div>
            </div>
          </button>
          <button className="border border-warmgray-300 py-5 rounded-[20px] hover:bg-warmgray-50 font-medium h-24">
            <div className="text-center">
              <div className="text-2xl mb-1"></div>
              <div className="text-sm">Giải quyết tranh chấp</div>
            </div>
          </button>
          <button className="border border-warmgray-300 py-5 rounded-[20px] hover:bg-warmgray-50 font-medium h-24">
            <div className="text-center">
              <div className="text-2xl mb-1"></div>
              <div className="text-sm">Xem báo cáo</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
