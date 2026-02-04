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
    <div className="max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển quản trị viên</h1>
            <p className="text-gray-600">Tổng quan hoạt động hệ thống Bicycle-Marketplace</p>
          </div>
          {user && (
            <div className="text-right bg-white p-4 rounded-lg shadow border border-gray-200">
              <p className="text-sm text-gray-600">Chào mừng,</p>
              <p className="text-xl font-bold text-gray-900">
                {user.fullName || user.username || 'Admin'}
              </p>
              {user.email && <p className="text-sm text-gray-600 mt-1">{user.email}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-6">Công việc cần xử lý</h3>
          <div className="space-y-4">
            {pendingTasks.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-900">{item.task}</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-bold ${
                    item.color === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.color === 'danger'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
            Xem tất cả công việc
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 lg:col-span-2">
          <h3 className="text-xl font-bold mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6">Thao tác nhanh</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-medium h-20">
            <div className="text-center">
              <div className="text-2xl mb-1"></div>
              <div className="text-sm">Quản lý chuyên viên kiểm định</div>
            </div>
          </button>
          <button className="border border-gray-300 py-4 rounded-lg hover:bg-gray-50 font-medium h-20">
            <div className="text-center">
              <div className="text-2xl mb-1"></div>
              <div className="text-sm">Kiểm duyệt tin</div>
            </div>
          </button>
          <button className="border border-gray-300 py-4 rounded-lg hover:bg-gray-50 font-medium h-20">
            <div className="text-center">
              <div className="text-2xl mb-1"></div>
              <div className="text-sm">Giải quyết tranh chấp</div>
            </div>
          </button>
          <button className="border border-gray-300 py-4 rounded-lg hover:bg-gray-50 font-medium h-20">
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
