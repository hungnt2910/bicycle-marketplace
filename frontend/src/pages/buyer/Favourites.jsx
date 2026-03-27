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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
            {items.map((item) => (
              <article
                key={item.id}
                className="group cursor-pointer"
                onClick={() => handleOpen(item.id)}
                aria-label={item.title}
              >
                {/* ── Image — tall portrait ── */}
                <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4] mb-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/mountain_bike_hero_1768417732962.png'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--lux-gray-100)' }}
                    >
                      <svg className="w-10 h-10" style={{ color: 'var(--lux-gray-300)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs" style={{ color: 'var(--lux-gray-400)' }}>Không có ảnh</span>
                    </div>
                  )}

                  {/* Verified badge — top-right */}
                  {item.verified && (
                    <span
                      className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 tracking-wider z-10"
                      style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--lux-primary-900)' }}
                    >
                      ✓ KIỂM ĐỊNH
                    </span>
                  )}

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-end pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }}
                  >
                    {/* Remove from favourites */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                      aria-label="Bỏ yêu thích"
                      className="w-full mx-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-sm transition-colors"
                      style={{ background: 'rgba(220,38,38,0.82)', color: 'white', maxWidth: 'calc(100% - 24px)' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Bỏ yêu thích
                    </button>
                  </div>
                </div>

                {/* ── Text block — minimal editorial ── */}
                <div className="space-y-1">
                  <h4
                    className="text-sm font-medium leading-snug line-clamp-2 transition-colors group-hover:text-[var(--lux-primary-800)]"
                    style={{ color: 'var(--lux-gray-900)' }}
                  >
                    {item.title}
                  </h4>

                  <p className="text-sm font-semibold" style={{ color: 'var(--lux-gray-800)' }}>
                    {item.price.toLocaleString('vi-VN')} ₫
                  </p>

                  {/* Dot indicator — condition */}
                  {item.condition && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: ({
                            'new': '#22c55e',
                            'like-new': '#86efac',
                            'good': '#f59e0b',
                            'fair': '#fb923c',
                            'poor': '#ef4444',
                          })[item.condition] || '#94a3b8',
                        }}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] capitalize" style={{ color: 'var(--lux-gray-500)' }}>
                        {item.condition}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {item.location && (
                    <p className="text-[11px] flex items-center gap-1 pt-0.5" style={{ color: 'var(--lux-gray-400)' }}>
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{item.location}</span>
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
