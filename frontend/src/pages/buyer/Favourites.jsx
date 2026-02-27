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
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Tin yêu thích</h2>
          <p className="text-neutral-600 text-sm">Lưu lại những tin bạn quan tâm để xem nhanh.</p>
        </div>
        <Button variant="ghost" disabled={!items.length} onClick={handleClearAll}>
          Xóa tất cả
        </Button>
      </div>

      {loading ? (
        <div className="text-neutral-600">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-neutral-200 p-8 text-center text-neutral-500">
          Chưa có tin yêu thích.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleOpen(item.id)}
            >
              <div className="relative h-48 bg-neutral-100">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500">
                    Không có ảnh
                  </div>
                )}
                {item.verified && (
                  <Badge variant="verified" className="absolute top-3 right-3">
                    ✓ Kiểm định
                  </Badge>
                )}
              </div>
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-lg line-clamp-2 text-neutral-900">
                  {item.title}
                </h4>
                <div className="text-themePrimary font-bold text-xl">
                  {item.price.toLocaleString('vi-VN')} ₫
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <span>{item.location || '—'}</span>
                  {item.condition && <Badge variant="success">{item.condition}</Badge>}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(item.id);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                  >
                    Bỏ yêu thích
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
