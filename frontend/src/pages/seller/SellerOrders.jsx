import React, { useState } from 'react';
import { Card, Badge, Button, Avatar } from '../../components/ui';

const SellerOrders = () => {
    const orders = [
        {
            id: '#ORD-001',
            bike: 'Giant Talon 3 2024',
            buyer: 'Nguyễn Văn A',
            price: 12500000,
            deposit: 6250000,
            status: 'pending',
            date: '14/01/2024',
            image: '/mountain_bike_hero_1768417732962.png',
        },
        {
            id: '#ORD-002',
            bike: 'Trek Domane AL 2',
            buyer: 'Trần Thị B',
            price: 18900000,
            deposit: 9450000,
            status: 'confirmed',
            date: '12/01/2024',
            image: '/road_bike_hero_1768417748558.png',
        },
        {
            id: '#ORD-003',
            bike: 'Specialized Sirrus X 3.0',
            buyer: 'Lê Văn C',
            price: 16200000,
            deposit: 8100000,
            status: 'completed',
            date: '08/01/2024',
            image: '/hybrid_bike_hero_1768417761473.png',
        },
    ];

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'info',
            completed: 'success',
            cancelled: 'danger',
        };
        const labels = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900">Quản lý đơn hàng</h2>
                <p className="text-neutral-600 mt-1">Theo dõi và quản lý các đơn hàng của bạn</p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Tổng đơn hàng</div>
                    <div className="text-2xl font-bold text-neutral-900">{orders.length}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Chờ xác nhận</div>
                    <div className="text-2xl font-bold text-warning-600">
                        {orders.filter(o => o.status === 'pending').length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Đã xác nhận</div>
                    <div className="text-2xl font-bold text-info-600">
                        {orders.filter(o => o.status === 'confirmed').length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Hoàn thành</div>
                    <div className="text-2xl font-bold text-success-600">
                        {orders.filter(o => o.status === 'completed').length}
                    </div>
                </Card>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.id} className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <img
                                src={order.image}
                                alt={order.bike}
                                className="w-full lg:w-48 h-36 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">{order.bike}</h3>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-neutral-600">Mã đơn: {order.id} • {order.date}</p>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Người mua</p>
                                        <div className="flex items-center gap-2">
                                            <Avatar name={order.buyer} size="sm" />
                                            <span className="font-medium">{order.buyer}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Giá trị đơn hàng</p>
                                        <p className="font-semibold text-lg text-primary-600">
                                            {order.price.toLocaleString('vi-VN')} ₫
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Đã đặt cọc</p>
                                        <p className="font-medium text-success-600">
                                            {order.deposit.toLocaleString('vi-VN')} ₫
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">Còn lại</p>
                                        <p className="font-medium">
                                            {(order.price - order.deposit).toLocaleString('vi-VN')} ₫
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {order.status === 'pending' && (
                                        <>
                                            <Button variant="primary" size="sm">Xác nhận đơn</Button>
                                            <Button variant="outline" size="sm">Từ chối</Button>
                                        </>
                                    )}
                                    {order.status === 'confirmed' && (
                                        <Button variant="success" size="sm">Hoàn thành giao dịch</Button>
                                    )}
                                    <Button variant="outline" size="sm">Chat với người mua</Button>
                                    <Button variant="outline" size="sm">Xem chi tiết</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {orders.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-neutral-600">Chưa có đơn hàng nào</p>
                </Card>
            )}
        </div>
    );
};

export default SellerOrders;
