import React from 'react';
import { Card, Badge, Button } from '../../components/ui';

const InspectorDashboard = () => {
    const stats = [
        { label: 'Chờ kiểm định', value: '8', icon: '', color: 'from-yellow-500 to-orange-600' },
        { label: 'Hoàn thành tháng này', value: '24', icon: '', color: 'from-green-500 to-emerald-600' },
        { label: 'Tranh chấp hỗ trợ', value: '2', icon: '', color: 'from-red-500 to-pink-600' },
        { label: 'Điểm trung bình', value: '8.5', icon: '', color: 'from-blue-500 to-cyan-600' },
    ];

    const pendingInspections = [
        { id: 1, bike: 'Giant Talon 3', seller: 'Nguyễn Văn A', type: 'Tại chỗ', date: '16/01/2024', priority: 'high' },
        { id: 2, bike: 'Trek Domane AL 2', seller: 'Trần Thị B', type: 'Online', date: '17/01/2024', priority: 'normal' },
        { id: 3, bike: 'Specialized Sirrus', seller: 'Lê Văn C', type: 'Tại chỗ', date: '18/01/2024', priority: 'normal' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-[20px] p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Dashboard Kiểm Định Viên</h2>
                <p className="text-lg opacity-90">Bạn có {stats[0].value} xe đang chờ kiểm định</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between">
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-3xl`}>
                                {stat.icon}
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-primary-900">{stat.value}</div>
                                <div className="text-sm text-warmgray-600">{stat.label}</div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Pending Inspections */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold">Hàng đợi kiểm định</h3>
                    <Button variant="primary">Xem tất cả</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-warmgray-200">
                                <th className="text-left py-3 px-4 font-semibold text-warmgray-700">Xe đạp</th>
                                <th className="text-left py-3 px-4 font-semibold text-warmgray-700">Người bán</th>
                                <th className="text-left py-3 px-4 font-semibold text-warmgray-700">Loại KĐ</th>
                                <th className="text-left py-3 px-4 font-semibold text-warmgray-700">Ngày hẹn</th>
                                <th className="text-left py-3 px-4 font-semibold text-warmgray-700">Ưu tiên</th>
                                <th className="text-right py-3 px-4 font-semibold text-warmgray-700">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingInspections.map((inspection) => (
                                <tr key={inspection.id} className="border-b border-warmgray-100 hover:bg-neutral-offwhite">
                                    <td className="py-4 px-4 font-medium">{inspection.bike}</td>
                                    <td className="py-4 px-4 text-warmgray-600">{inspection.seller}</td>
                                    <td className="py-4 px-4">
                                        <Badge variant={inspection.type === 'Tại chỗ' ? 'primary' : 'secondary'}>
                                            {inspection.type}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4 text-warmgray-600">{inspection.date}</td>
                                    <td className="py-4 px-4">
                                        <Badge variant={inspection.priority === 'high' ? 'danger' : 'neutral'}>
                                            {inspection.priority === 'high' ? 'Cao' : 'Bình thường'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Button variant="primary" size="sm">Bắt đầu KĐ</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default InspectorDashboard;
