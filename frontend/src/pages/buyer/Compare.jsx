import React from 'react';
import { useCompare } from '../../contexts/CompareContext';
import { Card, Badge, Button, Rating } from '../../components/ui';

const Compare = ({ onNavigate }) => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-24 h-24 mx-auto text-warmgray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-warmgray-700 mb-2">Chưa có sản phẩm để so sánh</h2>
          <p className="text-warmgray-500 mb-6">
            Hãy chọn tối đa 2 xe đạp từ marketplace để so sánh
          </p>
          <Button onClick={() => onNavigate && onNavigate('marketplace')} variant="primary">
            Đến Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const specifications = [
    {
      key: 'type',
      label: 'Loại xe',
      format: (value) => {
        const types = {
          mountain: 'Xe đạp địa hình',
          road: 'Xe đạp đường trường',
          hybrid: 'Xe đạp Hybrid',
          bmx: 'Xe đạp BMX',
        };
        return types[value] || value;
      },
    },
    { key: 'condition', label: 'Tình trạng' },
    { key: 'frame', label: 'Kích thước khung', format: (value) => value?.toUpperCase() },
    { key: 'verified', label: 'Đã kiểm định', format: (value) => (value ? 'Có' : 'Không') },
    { key: 'seller', label: 'Người bán' },
    { key: 'location', label: 'Địa điểm' },
    { key: 'views', label: 'Lượt xem', format: (value) => value?.toLocaleString('vi-VN') },
    { key: 'reviews', label: 'Đánh giá', format: (value) => `${value} đánh giá` },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleViewProduct = (bikeId) => {
    if (onNavigate) {
      onNavigate('product-detail', bikeId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-warmgray-800">So sánh xe đạp</h1>
          <div className="flex gap-3">
            <Button onClick={() => onNavigate && onNavigate('marketplace')} variant="outline">
              Quay lại Marketplace
            </Button>
            {compareItems.length > 0 && (
              <Button onClick={clearCompare} variant="outline" className="text-danger">
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
        <p className="text-warmgray-600">Đang so sánh {compareItems.length}/2 sản phẩm</p>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-[16px] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-primary-800/10 to-gold/10">
                <th className="px-6 py-4 text-left font-semibold text-warmgray-700 w-48">
                  Thông số
                </th>
                {compareItems.map((bike) => (
                  <th key={bike.id} className="px-6 py-4 w-96">
                    <Card className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(bike.id)}
                          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-danger/50 text-white rounded-full hover:bg-danger transition-colors z-10"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <img
                          src={bike.image}
                          alt={bike.name}
                          className="w-full h-48 object-cover rounded-[16px] mb-4"
                        />
                        <h3 className="text-lg font-bold text-warmgray-800 mb-2">{bike.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Rating value={bike.rating} readonly size="sm" />
                          <span className="text-sm text-warmgray-600">({bike.reviews})</span>
                        </div>
                        <div className="text-2xl font-bold text-primary-800 mb-4">
                          {formatPrice(bike.price)}
                        </div>
                        <Button
                          onClick={() => handleViewProduct(bike.id)}
                          variant="primary"
                          className="w-full"
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </Card>
                  </th>
                ))}
                {compareItems.length === 1 && (
                  <th className="px-6 py-4 w-96">
                    <Card className="p-4 h-full flex items-center justify-center min-h-[400px]">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-warmgray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-warmgray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                        <p className="text-warmgray-500 mb-4">Thêm sản phẩm thứ 2 để so sánh</p>
                        <Button
                          onClick={() => onNavigate && onNavigate('marketplace')}
                          variant="outline"
                        >
                          Chọn sản phẩm
                        </Button>
                      </div>
                    </Card>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec, index) => (
                <tr key={spec.key} className={index % 2 === 0 ? 'bg-neutral-offwhite' : 'bg-white'}>
                  <td className="px-6 py-4 font-medium text-warmgray-700 border-r border-warmgray-200">
                    {spec.label}
                  </td>
                  {compareItems.map((bike) => {
                    const value = bike[spec.key];
                    const displayValue = spec.format ? spec.format(value) : value;

                    return (
                      <td
                        key={bike.id}
                        className="px-6 py-4 text-center border-r border-warmgray-200"
                      >
                        {spec.key === 'rating' ? (
                          <div className="flex items-center justify-center gap-2">
                            <Rating value={value} readonly size="sm" />
                            <span className="text-sm text-warmgray-600">({value})</span>
                          </div>
                        ) : spec.key === 'verified' && value ? (
                          <Badge variant="success" className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Đã kiểm định
                          </Badge>
                        ) : spec.key === 'verified' && !value ? (
                          <Badge variant="secondary">Chưa kiểm định</Badge>
                        ) : (
                          <span className="text-warmgray-700">{displayValue || '-'}</span>
                        )}
                      </td>
                    );
                  })}
                  {compareItems.length === 1 && (
                    <td className="px-6 py-4 text-center border-r border-warmgray-200 bg-neutral-offwhite">
                      <span className="text-warmgray-400">-</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-primary-800/5 border border-primary-600/20 rounded-[16px] p-6">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-primary-700 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-primary-900 mb-2">Mẹo so sánh</h3>
            <ul className="text-sm text-primary-900 space-y-1">
              <li>• So sánh các xe đạp cùng loại để đưa ra quyết định tốt nhất</li>
              <li>• Chú ý đến tình trạng và giá cả để tìm giá trị tốt nhất</li>
              <li>• Xe đã kiểm định thường đáng tin cậy hơn</li>
              <li>• Xem chi tiết sản phẩm để biết thêm thông tin đầy đủ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
