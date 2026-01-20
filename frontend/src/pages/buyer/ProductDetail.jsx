import React, { useState } from 'react';
import { Card, Badge, Rating, Button, ImageGallery, Avatar, Modal } from '../../components/ui';

const ProductDetail = ({ productId }) => {
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState(50);

    // Database of all bikes (same as Marketplace)
    const allBikes = [
        {
            id: 1,
            name: 'Giant Talon 3 2024',
            price: 12500000,
            oldPrice: 15000000,
            image: '/mountain_bike_hero_1768417732962.png',
            condition: 'Like New',
            verified: true,
            rating: 4.8,
            reviews: 24,
            seller: 'Nguyễn Văn A',
            location: 'Hà Nội',
            views: 245,
            type: 'mountain',
            brand: 'Giant',
            year: '2024',
            frameSize: 'M (17.5")',
            description: 'Xe đạp địa hình Giant Talon 3 2024 trong tình trạng như mới, chỉ sử dụng 3 tháng. Xe được bảo dưỡng định kỳ, tất cả linh kiện hoạt động tốt. Phù hợp cho người mới bắt đầu hoặc đi phượt địa hình nhẹ.',
        },
        {
            id: 2,
            name: 'Trek Domane AL 2',
            price: 18900000,
            image: '/road_bike_hero_1768417748558.png',
            condition: 'Excellent',
            verified: true,
            rating: 4.9,
            reviews: 18,
            seller: 'Trần Thị B',
            location: 'TP.HCM',
            views: 189,
            type: 'road',
            brand: 'Trek',
            year: '2023',
            frameSize: 'L (19")',
            description: 'Xe đạp đường trường Trek Domane AL 2 tình trạng xuất sắc. Phù hợp cho việc đạp đường dài và tập luyện thể thao.',
        },
        {
            id: 3,
            name: 'Specialized Sirrus X 3.0',
            price: 16200000,
            image: '/hybrid_bike_hero_1768417761473.png',
            condition: 'Good',
            verified: false,
            rating: 4.6,
            reviews: 12,
            seller: 'Lê Văn C',
            location: 'Đà Nẵng',
            views: 156,
            type: 'hybrid',
            brand: 'Specialized',
            year: '2023',
            frameSize: 'M (17")',
            description: 'Xe đạp Hybrid Specialized Sirrus X 3.0 đa năng, phù hợp cả đường phố và địa hình nhẹ.',
        },
        {
            id: 4,
            name: 'Giant TCR Advanced 2',
            price: 25000000,
            image: '/road_bike_hero_1768417748558.png',
            condition: 'Like New',
            verified: true,
            rating: 4.9,
            reviews: 31,
            seller: 'Phạm Văn D',
            location: 'Hà Nội',
            views: 312,
            type: 'road',
            brand: 'Giant',
            year: '2024',
            frameSize: 'M (18")',
            description: 'Xe đạp đua cao cấp Giant TCR Advanced 2 với khung carbon, cực kỳ nhẹ và nhanh.',
        },
        {
            id: 5,
            name: 'Trek Marlin 7',
            price: 14500000,
            image: '/mountain_bike_hero_1768417732962.png',
            condition: 'Excellent',
            verified: true,
            rating: 4.7,
            reviews: 22,
            seller: 'Hoàng Thị E',
            location: 'Cần Thơ',
            views: 198,
            type: 'mountain',
            brand: 'Trek',
            year: '2023',
            frameSize: 'L (19.5")',
            description: 'Trek Marlin 7 là lựa chọn tuyệt vời cho người yêu thích đạp xe địa hình.',
        },
        {
            id: 6,
            name: 'Cannondale Quick 4',
            price: 11900000,
            image: '/hybrid_bike_hero_1768417761473.png',
            condition: 'Good',
            verified: false,
            rating: 4.5,
            reviews: 15,
            seller: 'Vũ Văn F',
            location: 'Hải Phòng',
            views: 134,
            type: 'hybrid',
            brand: 'Cannondale',
            year: '2022',
            frameSize: 'M (17")',
            description: 'Cannondale Quick 4 - xe đạp thành phố linh hoạt, phù hợp đi làm và tập luyện.',
        },
    ];

    // Find the bike by ID, default to first bike if not found
    const bike = allBikes.find(b => b.id === productId) || allBikes[0];

    // Build product object from bike data
    const product = {
        ...bike,
        images: [bike.image, bike.image, bike.image], // Use same image 3 times for gallery
        seller: {
            name: bike.seller,
            avatar: null,
            rating: bike.rating,
            responseTime: '< 1 giờ',
            successRate: '98%',
            totalSales: Math.floor(Math.random() * 50) + 10,
        },
        specs: {
            'Loại xe': bike.type === 'mountain' ? 'Xe đạp địa hình' : bike.type === 'road' ? 'Xe đạp đường trường' : 'Xe đạp Hybrid',
            'Thương hiệu': bike.brand,
            'Năm sản xuất': bike.year,
            'Kích thước khung': bike.frameSize,
            'Chất liệu khung': 'Nhôm ALUXX-Grade',
            'Hệ thống treo': bike.type === 'mountain' ? 'SR Suntour XCM 100mm' : 'N/A',
            'Phanh': 'Phanh đĩa thủy lực Shimano',
            'Bộ truyền động': 'Shimano Deore 1x12',
            'Bánh xe': bike.type === 'road' ? '700c' : '27.5"',
            'Trọng lượng': '13.5 kg',
        },
        inspectionReport: bike.verified ? {
            score: 9.2,
            date: '10/01/2024',
            inspector: 'Trần Văn B',
            notes: 'Xe trong tình trạng xuất sắc. Tất cả linh kiện hoạt động tốt.',
        } : null,
    };

    const reviews = [
        { id: 1, user: 'Lê Thị C', rating: 5, comment: 'Người bán rất nhiệt tình, xe đúng như mô tả!', date: '12/01/2024' },
        { id: 2, user: 'Phạm Văn D', rating: 4.5, comment: 'Xe tốt, giao hàng nhanh.', date: '08/01/2024' },
    ];

    const similarBikes = [
        { id: 2, name: 'Trek Marlin 7', price: 14500000, image: '/mountain_bike_hero_1768417732962.png' },
        { id: 3, name: 'Specialized Rockhopper', price: 13200000, image: '/mountain_bike_hero_1768417732962.png' },
    ];

    return (
        <div className="section">
            <div className="container-custom">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Images & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images */}
                        <Card className="p-6">
                            <ImageGallery images={product.images} alt={product.name} />
                        </Card>

                        {/* Description */}
                        <Card className="p-6">
                            <h3 className="text-2xl font-semibold mb-4">Mô tả chi tiết</h3>
                            <p className="text-neutral-700 whitespace-pre-line leading-relaxed">
                                {product.description}
                            </p>
                        </Card>

                        {/* Specifications */}
                        <Card className="p-6">
                            <h3 className="text-2xl font-semibold mb-4">Thông số kỹ thuật</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {Object.entries(product.specs).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-2 border-b border-neutral-100">
                                        <span className="font-medium text-neutral-700">{key}:</span>
                                        <span className="text-neutral-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Inspection Report */}
                        {product.verified && (
                            <Card className="p-6 bg-gradient-to-r from-success-50 to-emerald-50 border-2 border-success-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-success-500 text-white flex items-center justify-center text-2xl">
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-success-900">Xe đã được kiểm định</h3>
                                        <p className="text-sm text-success-700">Ngày kiểm định: {product.inspectionReport.date}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Điểm tổng thể:</span>
                                        <span className="text-2xl font-bold text-success-600">{product.inspectionReport.score}/10</span>
                                    </div>
                                    <p className="text-sm text-neutral-700 mb-2">
                                        <strong>Kiểm định viên:</strong> {product.inspectionReport.inspector}
                                    </p>
                                    <p className="text-sm text-neutral-700">
                                        <strong>Ghi chú:</strong> {product.inspectionReport.notes}
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full mt-4">
                                        Xem báo cáo đầy đủ
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Reviews */}
                        <Card className="p-6">
                            <h3 className="text-2xl font-semibold mb-4">Đánh giá từ người mua</h3>
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar name={review.user} size="sm" />
                                            <div>
                                                <div className="font-medium">{review.user}</div>
                                                <div className="flex items-center gap-2">
                                                    <Rating value={review.rating} size="sm" readonly />
                                                    <span className="text-xs text-neutral-500">{review.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-neutral-700 ml-11">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Purchase Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* Price Card */}
                            <Card className="p-6">
                                <div className="mb-4">
                                    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                                    {product.verified && (
                                        <Badge variant="verified" className="mb-3">
                                            ✓ Đã kiểm định
                                        </Badge>
                                    )}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Rating value={product.rating} size="sm" readonly />
                                        <span className="text-sm text-neutral-600">({product.reviews} đánh giá)</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="text-4xl font-bold text-primary-600">
                                            {product.price.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>
                                    {product.oldPrice && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg text-neutral-400 line-through">
                                                {product.oldPrice.toLocaleString('vi-VN')} ₫
                                            </span>
                                            <Badge variant="danger">
                                                Giảm {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <span>Location: {product.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <span>{product.views} views</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="success">{product.condition}</Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button variant="primary" className="w-full" onClick={() => setShowDepositModal(true)}>
                                        Đặt cọc ngay
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        Chat với người bán
                                    </Button>
                                    <Button variant="ghost" className="w-full">
                                        Thêm vào yêu thích
                                    </Button>
                                </div>
                            </Card>

                            {/* Seller Info */}
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">Thông tin người bán</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar name={product.seller.name} size="lg" />
                                    <div>
                                        <div className="font-semibold">{product.seller.name}</div>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Rating value={product.seller.rating} size="sm" readonly />
                                            <span className="text-neutral-600">({product.seller.totalSales})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Thời gian phản hồi:</span>
                                        <span className="font-medium">{product.seller.responseTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Tỷ lệ thành công:</span>
                                        <span className="font-medium text-success-600">{product.seller.successRate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Đã bán:</span>
                                        <span className="font-medium">{product.seller.totalSales} xe</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full mt-4">
                                    Xem trang người bán
                                </Button>
                            </Card>

                            {/* Safety Tips */}
                            <Card className="p-6 bg-primary-50 border-2 border-primary-200">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <span className="text-xl">🔒</span>
                                    Mua hàng an toàn
                                </h3>
                                <ul className="space-y-2 text-sm text-neutral-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-success-600 mt-0.5">✓</span>
                                        <span>Chỉ đặt cọc qua hệ thống ROUTIN</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-success-600 mt-0.5">✓</span>
                                        <span>Kiểm tra xe trước khi nhận</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-success-600 mt-0.5">✓</span>
                                        <span>So sánh với báo cáo kiểm định</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-success-600 mt-0.5">✓</span>
                                        <span>Tiền được hoàn nếu không đúng mô tả</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Similar Bikes */}
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-6">Xe đạp tương tự</h3>
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {similarBikes.map((bike) => (
                            <Card key={bike.id} variant="product" className="overflow-hidden">
                                <div className="aspect-product bg-neutral-100">
                                    <img src={bike.image} alt={bike.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4">
                                    <h4 className="font-semibold mb-2 line-clamp-2">{bike.name}</h4>
                                    <p className="text-xl font-bold text-primary-600">
                                        {bike.price.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            <Modal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                title="Đặt cọc xe đạp"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowDepositModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary">
                            Xác nhận đặt cọc
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Số tiền đặt cọc ({depositAmount}%)
                        </label>
                        <input
                            type="range"
                            min="20"
                            max="100"
                            step="10"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-neutral-600 mt-1">
                            <span>20%</span>
                            <span>100%</span>
                        </div>
                    </div>
                    <div className="bg-neutral-100 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                            <span>Giá xe:</span>
                            <span className="font-semibold">{product.price.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-primary-600">
                            <span>Số tiền cọc:</span>
                            <span>{((product.price * depositAmount) / 100).toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>
                    <div className="bg-success-50 border border-success-200 rounded-lg p-4 text-sm">
                        <p className="font-medium text-success-900 mb-2">🔒 Bảo vệ người mua</p>
                        <ul className="space-y-1 text-success-800">
                            <li>• Tiền được giữ an toàn bởi hệ thống</li>
                            <li>• Hoàn tiền nếu xe không đúng mô tả</li>
                            <li>• Hỗ trợ giải quyết tranh chấp 24/7</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductDetail;
