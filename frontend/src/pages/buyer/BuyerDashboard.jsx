import React from 'react';
import { Card, Badge, Button } from '../../components/ui';

const BuyerDashboard = () => {
    const stats = [
        { label: 'Xe yêu thích', value: '12', icon: '', color: 'from-red-500 to-pink-600' },
        { label: 'Đơn hàng', value: '3', icon: '', color: 'from-blue-500 to-cyan-600' },
        { label: 'Tin nhắn', value: '5', icon: '', color: 'from-green-500 to-emerald-600' },
        { label: 'Đánh giá', value: '8', icon: '', color: 'from-yellow-500 to-orange-600' },
    ];

    const recentOrders = [
        { id: 1, bike: 'Giant Talon 3', status: 'Đang giao', price: 12500000, date: '15/01/2024' },
        { id: 2, bike: 'Trek Domane AL 2', status: 'Hoàn thành', price: 18900000, date: '10/01/2024' },
        { id: 3, bike: 'Specialized Sirrus', status: 'Đã đặt cọc', price: 16200000, date: '08/01/2024' },
    ];

    const wishlist = [
        { id: 1, name: 'Cannondale Quick 4', price: 11900000, image: '/hybrid_bike_hero_1768417761473.png', priceChange: -500000 },
        { id: 2, name: 'Giant TCR Advanced', price: 25000000, image: '/road_bike_hero_1768417748558.png', priceChange: 0 },
    ];

    return (
        <div className="section">
            <div className="container-custom">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white mb-8">
                    <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại, Nguyễn Văn A! 👋</h2>
                    <p className="text-lg opacity-90">Khám phá những chiếc xe đạp tuyệt vời hôm nay</p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl`}>
                                    {stat.icon}
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
                                    <div className="text-sm text-neutral-600">{stat.label}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Đơn hàng gần đây</h3>
                            <Button variant="ghost" size="sm">Xem tất cả</Button>
                        </div>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold mb-1">{order.bike}</h4>
                                        <p className="text-sm text-neutral-600">{order.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={order.status === 'Hoàn thành' ? 'success' : order.status === 'Đang giao' ? 'warning' : 'primary'}>
                                            {order.status}
                                        </Badge>
                                        <p className="text-sm font-semibold mt-1">{order.price.toLocaleString('vi-VN')} ₫</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Wishlist */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold">Xe yêu thích</h3>
                            <Button variant="ghost" size="sm">Xem tất cả</Button>
                        </div>
                        <div className="space-y-4">
                            {wishlist.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-neutral-50 rounded-lg">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold mb-1">{item.name}</h4>
                                        <p className="text-lg font-bold text-primary-600">{item.price.toLocaleString('vi-VN')} ₫</p>
                                        {item.priceChange < 0 && (
                                            <Badge variant="success" className="mt-1">
                                                Giảm {Math.abs(item.priceChange).toLocaleString('vi-VN')} ₫
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
