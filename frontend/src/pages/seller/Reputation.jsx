import React from 'react';
import { Card, Badge, Rating, Avatar } from '../../components/ui';

const Reputation = () => {
    const stats = {
        averageRating: 4.8,
        totalReviews: 45,
        totalSales: 52,
        responseRate: '98%',
        responseTime: '< 1 giờ',
        successRate: '96%',
    };

    const reviews = [
        {
            id: 1,
            buyer: 'Nguyễn Văn A',
            rating: 5,
            comment: 'Người bán rất nhiệt tình, xe đúng như mô tả. Giao dịch nhanh chóng!',
            bike: 'Giant Talon 3 2024',
            date: '14/01/2024',
        },
        {
            id: 2,
            buyer: 'Trần Thị B',
            rating: 4.5,
            comment: 'Xe tốt, giá hợp lý. Người bán tư vấn nhiệt tình.',
            bike: 'Trek Domane AL 2',
            date: '10/01/2024',
        },
        {
            id: 3,
            buyer: 'Lê Văn C',
            rating: 5,
            comment: 'Rất hài lòng với giao dịch. Sẽ ủng hộ lần sau!',
            bike: 'Specialized Sirrus X 3.0',
            date: '05/01/2024',
        },
    ];

    const ratingDistribution = [
        { stars: 5, count: 32, percentage: 71 },
        { stars: 4, count: 10, percentage: 22 },
        { stars: 3, count: 2, percentage: 4 },
        { stars: 2, count: 1, percentage: 2 },
        { stars: 1, count: 0, percentage: 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-primary-900">Uy tín & Đánh giá</h2>
                <p className="text-warmgray-600 mt-1">Xem đánh giá và uy tín của bạn từ người mua</p>
            </div>

            {/* Overview Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">
                            {stats.averageRating}
                        </div>
                        <Rating value={stats.averageRating} size="lg" readonly />
                        <p className="text-sm text-warmgray-600 mt-2">{stats.totalReviews} đánh giá</p>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-warmgray-600 mb-1">Tổng giao dịch</div>
                    <div className="text-3xl font-bold text-primary-900 mb-2">{stats.totalSales}</div>
                    <Badge variant="success">Tỷ lệ thành công: {stats.successRate}</Badge>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-warmgray-600 mb-1">Thời gian phản hồi</div>
                    <div className="text-3xl font-bold text-primary-900 mb-2">{stats.responseTime}</div>
                    <Badge variant="info">Tỷ lệ phản hồi: {stats.responseRate}</Badge>
                </Card>
            </div>

            {/* Rating Distribution */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Phân bố đánh giá</h3>
                <div className="space-y-3">
                    {ratingDistribution.map((item) => (
                        <div key={item.stars} className="flex items-center gap-4">
                            <div className="flex items-center gap-1 w-20">
                                <span className="text-sm font-medium">{item.stars}</span>
                                <span className="text-warning-500">★</span>
                            </div>
                            <div className="flex-1 bg-warmgray-200 rounded-full h-2">
                                <div
                                    className="bg-warning-500 h-2 rounded-full"
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-warmgray-600 w-16 text-right">
                                {item.count} ({item.percentage}%)
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Đánh giá gần đây</h3>
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-warmgray-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start gap-4">
                                <Avatar name={review.buyer} size="md" />
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium">{review.buyer}</h4>
                                            <p className="text-sm text-warmgray-600">
                                                Đã mua: {review.bike}
                                            </p>
                                        </div>
                                        <span className="text-sm text-warmgray-500">{review.date}</span>
                                    </div>
                                    <Rating value={review.rating} size="sm" readonly className="mb-2" />
                                    <p className="text-warmgray-700">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {reviews.length === 0 && (
                <Card className="p-12 text-center">
                    <p className="text-warmgray-600">Chưa có đánh giá nào</p>
                </Card>
            )}
        </div>
    );
};

export default Reputation;
