import React, { useState } from 'react';
import { Card, Badge, Button, Select } from '../../components/ui';

const ManageListings = () => {
  const [filter, setFilter] = useState('all');

  const listings = [
    {
      id: 1,
      name: 'Giant Talon 3 2024',
      price: 12500000,
      image: '/mountain_bike_hero_1768417732962.png',
      status: 'active',
      views: 245,
      likes: 12,
      createdAt: '15/12/2024',
    },
    {
      id: 2,
      name: 'Trek Domane AL 2',
      price: 18900000,
      image: '/road_bike_hero_1768417748558.png',
      status: 'pending',
      views: 89,
      likes: 5,
      createdAt: '10/01/2024',
    },
    {
      id: 3,
      name: 'Specialized Sirrus X 3.0',
      price: 16200000,
      image: '/hybrid_bike_hero_1768417761473.png',
      status: 'sold',
      views: 156,
      likes: 8,
      createdAt: '05/01/2024',
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang bán' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'sold', label: 'Đã bán' },
    { value: 'expired', label: 'Hết hạn' },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      pending: 'warning',
      sold: 'default',
      expired: 'danger',
    };
    const labels = {
      active: 'Đang bán',
      pending: 'Chờ duyệt',
      sold: 'Đã bán',
      expired: 'Hết hạn',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filteredListings =
    filter === 'all' ? listings : listings.filter((l) => l.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Quản lý tin đăng</h2>
          <p className="text-neutral-600 mt-1">Quản lý tất cả tin đăng bán xe của bạn</p>
        </div>
        <Button variant="primary">+ Đăng tin mới</Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Tổng tin đăng</div>
          <div className="text-2xl font-bold text-neutral-900">{listings.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Đang bán</div>
          <div className="text-2xl font-bold text-success-600">
            {listings.filter((l) => l.status === 'active').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Chờ duyệt</div>
          <div className="text-2xl font-bold text-warning-600">
            {listings.filter((l) => l.status === 'pending').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 mb-1">Đã bán</div>
          <div className="text-2xl font-bold text-neutral-600">
            {listings.filter((l) => l.status === 'sold').length}
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              options={statusOptions}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm tin đăng..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Listings */}
      <div className="space-y-4">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <img
                src={listing.image}
                alt={listing.name}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{listing.name}</h3>
                    <p className="text-sm text-neutral-600">Đăng ngày: {listing.createdAt}</p>
                  </div>
                  {getStatusBadge(listing.status)}
                </div>
                <div className="flex items-center gap-6 text-sm text-neutral-600 mb-3">
                  <span>
                    Giá:{' '}
                    <strong className="text-primary-600">
                      {listing.price.toLocaleString('vi-VN')} ₫
                    </strong>
                  </span>
                  <span>{listing.views} lượt xem</span>
                  <span>{listing.likes} yêu thích</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">
                    Chỉnh sửa
                  </Button>
                  <Button variant="outline" size="sm">
                    Xem tin
                  </Button>
                  {listing.status === 'active' && (
                    <Button variant="outline" size="sm">
                      Ẩn tin
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-danger-600">
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-neutral-600 mb-4">Không có tin đăng nào</p>
          <Button variant="primary">Đăng tin đầu tiên</Button>
        </Card>
      )}
    </div>
  );
};

export default ManageListings;
