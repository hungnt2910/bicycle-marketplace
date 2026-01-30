import React, { useState } from 'react';
import { Card, Badge, Button } from '../../components/ui';

const InspectionRequests = () => {
    const requests = [
        {
            id: 1,
            bike: 'Giant Talon 3 2024',
            image: '/mountain_bike_hero_1768417732962.png',
            status: 'completed',
            inspector: 'Trần Văn B',
            score: 9.2,
            requestDate: '05/01/2024',
            completedDate: '10/01/2024',
        },
        {
            id: 2,
            bike: 'Trek Domane AL 2',
            image: '/road_bike_hero_1768417748558.png',
            status: 'in-progress',
            inspector: 'Nguyễn Thị C',
            requestDate: '12/01/2024',
        },
        {
            id: 3,
            bike: 'Specialized Sirrus X 3.0',
            image: '/hybrid_bike_hero_1768417761473.png',
            status: 'pending',
            requestDate: '14/01/2024',
        },
    ];

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            'in-progress': 'info',
            completed: 'success',
            rejected: 'danger',
        };
        const labels = {
            pending: 'Chờ xử lý',
            'in-progress': 'Đang kiểm định',
            completed: 'Hoàn thành',
            rejected: 'Từ chối',
        };
        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Yêu cầu kiểm định</h2>
                    <p className="text-neutral-600 mt-1">Quản lý yêu cầu kiểm định xe đạp của bạn</p>
                </div>
                <Button variant="primary">
                    + Gửi yêu cầu mới
                </Button>
            </div>

            {/* Info Card */}
            <Card className="p-6 bg-gradient-to-br from-info-50 to-info-100 border-info-200">
                <h3 className="font-semibold text-info-900 mb-2">Tại sao cần kiểm định?</h3>
                <ul className="text-sm text-info-800 space-y-1">
                    <li>• Tăng độ tin cậy cho người mua</li>
                    <li>• Xe đã kiểm định bán nhanh hơn 3x</li>
                    <li>• Giá trị xe tăng 10-15%</li>
                    <li>• Được ưu tiên hiển thị trên marketplace</li>
                </ul>
            </Card>

            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Tổng yêu cầu</div>
                    <div className="text-2xl font-bold text-neutral-900">{requests.length}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Chờ xử lý</div>
                    <div className="text-2xl font-bold text-warning-600">
                        {requests.filter(r => r.status === 'pending').length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Đang kiểm định</div>
                    <div className="text-2xl font-bold text-info-600">
                        {requests.filter(r => r.status === 'in-progress').length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-neutral-600 mb-1">Hoàn thành</div>
                    <div className="text-2xl font-bold text-success-600">
                        {requests.filter(r => r.status === 'completed').length}
                    </div>
                </Card>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {requests.map((request) => (
                    <Card key={request.id} className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <img
                                src={request.image}
                                alt={request.bike}
                                className="w-full lg:w-48 h-36 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{request.bike}</h3>
                                        <p className="text-sm text-neutral-600">
                                            Yêu cầu ngày: {request.requestDate}
                                        </p>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>

                                {request.status === 'completed' && (
                                    <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-success-800 mb-1">
                                                    Kiểm định viên: <strong>{request.inspector}</strong>
                                                </p>
                                                <p className="text-sm text-success-800">
                                                    Hoàn thành: {request.completedDate}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-success-600">
                                                    {request.score}
                                                </div>
                                                <p className="text-xs text-success-700">Điểm</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {request.status === 'in-progress' && (
                                    <div className="bg-info-50 border border-info-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-info-800">
                                            Kiểm định viên: <strong>{request.inspector}</strong>
                                        </p>
                                        <p className="text-sm text-info-800 mt-1">
                                            Đang tiến hành kiểm định...
                                        </p>
                                    </div>
                                )}

                                {request.status === 'pending' && (
                                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-warning-800">
                                            Yêu cầu đang chờ được xử lý. Chúng tôi sẽ liên hệ với bạn sớm nhất.
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {request.status === 'completed' && (
                                        <Button variant="primary" size="sm">Xem báo cáo đầy đủ</Button>
                                    )}
                                    {request.status === 'pending' && (
                                        <Button variant="outline" size="sm">Hủy yêu cầu</Button>
                                    )}
                                    <Button variant="outline" size="sm">Chi tiết</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {requests.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-neutral-600 mb-4">Chưa có yêu cầu kiểm định nào</p>
                    <Button variant="primary">Gửi yêu cầu đầu tiên</Button>
                </Card>
            )}
        </div>
    );
};

export default InspectionRequests;
