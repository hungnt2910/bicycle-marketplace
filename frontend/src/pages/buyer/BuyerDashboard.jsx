import React from 'react';
import { Card, Badge, Button } from '../../components/ui';

const BuyerDashboard = () => {
  const stats = [
    { label: 'Xe yêu thích', value: '12', icon: '' },
    { label: 'Đơn hàng', value: '3', icon: '' },
    { label: 'Tin nhắn', value: '5', icon: '' },
    { label: 'Đánh giá', value: '8', icon: '' },
  ];

  const recentOrders = [
    { id: 1, bike: 'Giant Talon 3', status: 'Đang giao', price: 12500000, date: '15/01/2024' },
    { id: 2, bike: 'Trek Domane AL 2', status: 'Hoàn thành', price: 18900000, date: '10/01/2024' },
    {
      id: 3,
      bike: 'Specialized Sirrus',
      status: 'Đã đặt cọc',
      price: 16200000,
      date: '08/01/2024',
    },
  ];

  const wishlist = [
    {
      id: 1,
      name: 'Cannondale Quick 4',
      price: 11900000,
      image: '/hybrid_bike_hero_1768417761473.png',
      priceChange: -500000,
    },
    {
      id: 2,
      name: 'Giant TCR Advanced',
      price: 25000000,
      image: '/road_bike_hero_1768417748558.png',
      priceChange: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-neutral-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-themePrimary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-themePrimary/15 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-themePrimary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container-custom py-10 relative z-10">
        {/* Welcome Banner */}
        <div className="mb-12">
          <div className="relative">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-32 h-1 bg-themePrimary rounded-full"></div>

            <div className="pt-6">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute -inset-1 bg-themePrimary rounded-2xl blur opacity-25"></div>
                <div className="relative bg-themePrimary rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-3">
                        Chào mừng trở lại, Nguyễn Văn A!
                      </h2>
                      <p className="text-xl text-neutral-500">
                        Khám phá những chiếc xe đạp tuyệt vời hôm nay
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-1 bg-themePrimary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <Card className="relative bg-white rounded-2xl shadow-lg border border-neutral-200/50 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-themePrimary flex items-center justify-center shadow-lg">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {index === 0 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      )}
                      {index === 1 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      )}
                      {index === 2 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      )}
                      {index === 3 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      )}
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-themePrimary mb-1">{stat.value}</div>
                    <div className="text-sm font-semibold text-neutral-600">{stat.label}</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-themePrimary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white rounded-2xl shadow-lg border border-neutral-200/50 overflow-hidden">
              <div className="bg-themePrimary px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <h3 className="text-xl font-bold text-neutral-800">Đơn hàng gần đây</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-800 hover:bg-neutral-200/20"
                  >
                    Xem tất cả
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="group/item relative">
                    <div className="absolute -inset-2 bg-themePrimary/10 rounded-xl opacity-0 group-hover/item:opacity-100 transition duration-300"></div>
                    <div className="relative flex items-center justify-between p-4 bg-neutral-50 hover:bg-white rounded-xl border-2 border-transparent hover:border-themePrimary/20 transition-all duration-300">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-neutral-900 mb-1">{order.bike}</h4>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {order.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            order.status === 'Hoàn thành'
                              ? 'success'
                              : order.status === 'Đang giao'
                                ? 'warning'
                                : 'primary'
                          }
                          className="mb-2"
                        >
                          {order.status}
                        </Badge>
                        <p className="text-lg font-bold text-themePrimary">
                          {order.price.toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Wishlist */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-themePrimary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <Card className="relative bg-white rounded-2xl shadow-lg border border-neutral-200/50 overflow-hidden">
              <div className="bg-themePrimary px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <h3 className="text-xl font-bold text-neutral-800">Xe yêu thích</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-neutral-800 hover:bg-neutral-200/20"
                  >
                    Xem tất cả
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="group/item relative">
                    <div className="absolute -inset-2 bg-themePrimary/10 rounded-xl opacity-0 group-hover/item:opacity-100 transition duration-300"></div>
                    <div className="relative flex gap-4 p-4 bg-neutral-50 hover:bg-white rounded-xl border-2 border-transparent hover:border-themePrimary/20 transition-all duration-300">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-neutral-900 mb-2 line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-2xl font-bold text-themePrimary mb-2">
                          {item.price.toLocaleString('vi-VN')} ₫
                        </p>
                        {item.priceChange < 0 && (
                          <Badge variant="success" className="inline-flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                            Giảm {Math.abs(item.priceChange).toLocaleString('vi-VN')} ₫
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
