import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import favouriteApi from '../../api/favouriteApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Favourites = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const userId = user?._id || user?.id || user?.userId || user?.user?.id || user?.user?.userId;

  const loadFavourites = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await favouriteApi.getFavouriteBicycles(userId);
      const data = res?.data?.data || res?.data || [];
      const mapped = data.map((bike) => ({
        id: bike?._id || bike?.id,
        title: bike?.title || 'Không có tiêu đề',
        price: bike?.price || 0,
        image: bike?.media?.mainImage || bike?.media?.images?.[0] || '',
        condition: bike?.condition?.overall || '',
        location: [bike?.location?.district, bike?.location?.city].filter(Boolean).join(', '),
        verified: !!bike?.inspection?.isInspected,
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Load favourites error:', err);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để xem tin yêu thích');
      navigate('/login');
      return;
    }
    loadFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userId]);

  const handleRemove = async (id) => {
    try {
      await favouriteApi.removeOneFromFavourites({ userId, bicycleId: id });
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Đã xóa khỏi yêu thích');
    } catch (err) {
      console.error('Remove favourite error:', err);
      toast.error('Không thể xóa, thử lại sau');
    }
  };

  const handleClearAll = async () => {
    if (!items.length) return;
    try {
      await favouriteApi.removeAllFavourites(userId);
      setItems([]);
      toast.success('Đã xóa toàn bộ danh sách yêu thích');
    } catch (err) {
      console.error('Clear favourites error:', err);
      toast.error('Không thể xóa danh sách, thử lại sau');
    }
  };

  const handleOpen = (id) => navigate(`/product/${id}`);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--lux-offwhite)' }}>
      {/* Premium header */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--lux-primary-900)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: 'var(--lux-gold)' }}
          ></div>
          <div
            className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: 'var(--lux-primary-500)' }}
          ></div>
        </div>
        <div className="container-custom py-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
                style={{ color: 'var(--lux-gold)' }}
              >
                Bộ sưu tập của bạn
              </p>
              <h2
                className="text-4xl font-bold mb-2"
                style={{ color: 'white', fontFamily: "'Playfair Display', serif" }}
              >
                Tin yêu thích
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Lưu lại những tin bạn quan tâm để xem nhanh.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <span
                  className="text-sm px-4 py-2 rounded-full"
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  {items.length} sản phẩm
                </span>
              )}
              <Button
                variant="ghost"
                disabled={!items.length}
                onClick={handleClearAll}
                className="text-sm px-5 py-2 rounded-full transition-all"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36">
            <div
              className="w-12 h-12 rounded-full border-4 animate-spin mb-5"
              style={{
                borderColor: 'var(--lux-gray-200)',
                borderTopColor: 'var(--lux-primary-800)',
              }}
            ></div>
            <p style={{ color: 'var(--lux-gray-500)' }}>Đang tải...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-36">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--lux-gray-100)' }}
            >
              <svg
                className="w-11 h-11"
                style={{ color: 'var(--lux-gray-300)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--lux-primary-900)', fontFamily: "'Playfair Display', serif" }}
            >
              Chưa có tin yêu thích.
            </h3>
            <p className="text-sm mb-8" style={{ color: 'var(--lux-gray-500)' }}>
              Khám phá và lưu lại những chiếc xe bạn yêu thích
            </p>
            <button
              onClick={() => navigate('/market')}
              className="px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--lux-primary-800)', color: 'white' }}
            >
              Khám phá xe ngay →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-[24px] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
                style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = '0 24px 56px rgba(0,0,0,0.13)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)')
                }
                onClick={() => handleOpen(item.id)}
              >
                {/* ── Image ── */}
                <div className="relative h-60 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--lux-gray-100)' }}
                    >
                      <svg
                        className="w-12 h-12"
                        style={{ color: 'var(--lux-gray-300)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--lux-gray-400)' }}>
                        Không có ảnh
                      </span>
                    </div>
                  )}

                  {/* Dark gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Verified badge – top left */}
                  {item.verified && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge variant="verified" className="shadow-lg">
                        ✓ Kiểm định
                      </Badge>
                    </div>
                  )}

                  {/* Remove (heart) button – top right, slides in on hover */}
                  <button
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                    style={{ backgroundColor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                    title="Bỏ yêu thích"
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: '#e11d48' }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Condition badge – bottom right on image */}
                  {item.condition && (
                    <div className="absolute bottom-3 right-3 z-10">
                      <Badge variant="success">{item.condition}</Badge>
                    </div>
                  )}

                  {/* CTA overlay button – slides up on hover */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <button
                      className="w-full py-2.5 rounded-[12px] text-sm font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: 'white', color: 'var(--lux-primary-800)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen(item.id);
                      }}
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>

                {/* ── Info ── */}
                <div className="p-5">
                  {/* Location */}
                  {item.location && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: 'var(--lux-gray-400)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-xs truncate" style={{ color: 'var(--lux-gray-400)' }}>
                        {item.location}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h4
                    className="font-bold text-base line-clamp-2 mb-3 leading-snug"
                    style={{ color: 'var(--lux-primary-900)' }}
                  >
                    {item.title}
                  </h4>

                  {/* Gold accent divider */}
                  <div
                    className="w-8 h-0.5 mb-3 rounded-full"
                    style={{ backgroundColor: 'var(--lux-gold)' }}
                  ></div>

                  {/* Price row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                        style={{ color: 'var(--lux-gray-400)' }}
                      >
                        Giá bán
                      </p>
                      <div
                        className="text-xl font-bold"
                        style={{ color: 'var(--lux-primary-800)' }}
                      >
                        {item.price.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>

                    {/* Arrow CTA button */}
                    <button
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        backgroundColor: 'var(--lux-gray-100)',
                        border: '1.5px solid var(--lux-gray-200)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--lux-primary-800)';
                        e.currentTarget.style.borderColor = 'var(--lux-primary-800)';
                        e.currentTarget.querySelector('svg').style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--lux-gray-100)';
                        e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
                        e.currentTarget.querySelector('svg').style.color = 'var(--lux-primary-800)';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen(item.id);
                      }}
                      title="Xem chi tiết"
                    >
                      <svg
                        className="w-4 h-4 transition-colors"
                        style={{ color: 'var(--lux-primary-800)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
