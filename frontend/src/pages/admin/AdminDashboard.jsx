import React from 'react';
import { Card, Badge, Button } from '../../components/ui';

const AdminDashboard = () => {
    const stats = [
        { label: 'Tổng người dùng', value: '10,234', change: '+12%', icon: '', color: 'from-blue-500 to-cyan-600' },
        { label: 'Xe đang bán', value: '2,567', change: '+8%', icon: '', color: 'from-green-500 to-emerald-600' },
        { label: 'Giao dịch', value: '8,123', change: '+15%', icon: '', color: 'from-yellow-500 to-orange-600' },
        { label: 'Doanh thu', value: '1.2B ₫', change: '+20%', icon: '', color: 'from-purple-500 to-pink-600' },
    ];

    const recentActivity = [
        { type: 'user', message: 'Người dùng mới: Nguyễn Văn X đăng ký', time: '5 phút trước', icon: '' },
        { type: 'listing', message: 'Tin đăng mới: Giant Talon 3 cần kiểm duyệt', time: '10 phút trước', icon: '' },
        { type: 'dispute', message: 'Tranh chấp mới: Đơn hàng #1234', time: '15 phút trước', icon: '' },
        { type: 'transaction', message: 'Giao dịch hoàn thành: 18.9M ₫', time: '20 phút trước', icon: '' },
    ];

    const pendingTasks = [
        { task: 'Kiểm duyệt tin đăng', count: 12, color: 'warning' },
        { task: 'Giải quyết tranh chấp', count: 3, color: 'danger' },
        { task: 'Xác minh người dùng', count: 8, color: 'primary' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Dashboard Quản Trị</h2>
                <p className="text-lg opacity-90">Tổng quan hoạt động hệ thống Bicycle-Marketplace</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-3xl`}>
                                {stat.icon}
                            </div>
                            <Badge variant="success" className="text-xs">
                                {stat.change}
                            </Badge>
                        </div>
                        <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-neutral-600">{stat.label}</div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Pending Tasks */}
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-6">Công việc cần xử lý</h3>
                    <div className="space-y-4">
                        {pendingTasks.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
                                <span className="font-medium">{item.task}</span>
                                <Badge variant={item.color} className="text-lg px-3 py-1">
                                    {item.count}
                                </Badge>
                            </div>
                        ))}
                    </div>
                    <Button variant="primary" className="w-full mt-6">
                        Xem tất cả công việc
                    </Button>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-6">Hoạt động gần đây</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl flex-shrink-0">
                                    {activity.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-900">{activity.message}</p>
                                    <p className="text-sm text-neutral-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Thao tác nhanh</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="primary" className="h-20">
                        <div className="text-center">
                            <div className="text-2xl mb-1"></div>
                            <div className="text-sm">Quản lý người dùng</div>
                        </div>
                    </Button>
                    <Button variant="secondary" className="h-20">
                        <div className="text-center">
                            <div className="text-2xl mb-1"></div>
                            <div className="text-sm">Kiểm duyệt tin</div>
                        </div>
                    </Button>
                    <Button variant="accent" className="h-20">
                        <div className="text-center">
                            <div className="text-2xl mb-1"></div>
                            <div className="text-sm">Giải quyết tranh chấp</div>
                        </div>
                    </Button>
                    <Button variant="outline" className="h-20">
                        <div className="text-center">
                            <div className="text-2xl mb-1"></div>
                            <div className="text-sm">Xem báo cáo</div>
                        </div>
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
