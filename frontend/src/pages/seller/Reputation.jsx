import { useState, useEffect } from 'react';
import { Rating, Avatar } from '../../components/ui';
import reviewApi from '../../api/reviewApi';
import userApi from '../../api/userApi';

const Reputation = () => {
  const [reviews, setReviews] = useState([]);
  const [reviewerMap, setReviewerMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const storedUser = localStorage.getItem('user') || localStorage.getItem('userInfo');
        const userInfo = JSON.parse(storedUser || '{}');
        const sellerId = userInfo._id || userInfo.id || userInfo.userId;

        if (!sellerId) {
          setError('Không tìm thấy thông tin người bán');
          return;
        }

        const res = await reviewApi.getSellerReviews(sellerId);
        const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        setReviews(data);

        // Fetch reviewer info for unique IDs
        const uniqueIds = [...new Set(data.map((r) => r.reviewerId).filter(Boolean))];
        const entries = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const userRes = await userApi.getUserById(id);
              const u = userRes?.data?.data || userRes?.data || {};
              const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'Người mua';
              return [id, { name, avatar: u.avatar || null }];
            } catch {
              return [id, { name: 'Người mua', avatar: null }];
            }
          })
        );
        setReviewerMap(Object.fromEntries(entries));
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Không thể tải đánh giá');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, count, percentage };
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getReviewer = (review) => {
    const info = reviewerMap[review.reviewerId];
    return info || { name: 'Người mua', avatar: null };
  };

  const getReviewImages = (review) => {
    if (Array.isArray(review.media)) return review.media;
    if (Array.isArray(review.media?.images)) return review.media.images;
    return [];
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-emerald-600';
    if (rating >= 3) return 'text-amber-500';
    return 'text-rose-500';
  };

  const verifiedCount = reviews.filter((r) => r.isVerifiedPurchase).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Uy tín & Đánh giá</h2>
          <p className="text-warmgray-500 mt-1 text-sm">Đánh giá từ người mua hàng của bạn</p>
        </div>
        {!loading && reviews.length > 0 && (
          <div className="text-right">
            <span className="text-xs text-warmgray-400">{verifiedCount}/{reviews.length} đã xác minh</span>
          </div>
        )}
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Score card */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-primary-800 to-primary-600 p-6 text-white flex flex-col items-center justify-center gap-2 shadow-md">
          <p className="text-sm opacity-80 font-medium tracking-wide uppercase">Điểm trung bình</p>
          <div className={`text-6xl font-bold ${getRatingColor(averageRating)} drop-shadow`} style={{ color: 'white' }}>
            {loading ? '–' : averageRating.toFixed(1)}
          </div>
          <Rating value={Number(averageRating.toFixed(1))} size="lg" readonly />
          <p className="text-sm opacity-70 mt-1">
            {loading ? '...' : `Dựa trên ${reviews.length} đánh giá`}
          </p>
        </div>

        {/* Distribution */}
        <div className="lg:col-span-3 rounded-2xl border border-warmgray-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-primary-900 mb-4">Phân bố đánh giá</p>
          <div className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 w-10 shrink-0">
                  <span className="text-sm font-semibold text-warmgray-700">{item.stars}</span>
                  <span className="text-amber-400 text-sm">★</span>
                </div>
                <div className="flex-1 bg-warmgray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      background:
                        item.stars >= 4
                          ? '#10b981'
                          : item.stars === 3
                          ? '#f59e0b'
                          : '#f43f5e',
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 w-24 shrink-0 justify-end">
                  <span className="text-sm font-medium text-primary-900">{item.count}</span>
                  <span className="text-xs text-warmgray-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="rounded-2xl border border-warmgray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-warmgray-100 flex items-center justify-between">
          <h3 className="font-semibold text-primary-900">Đánh giá từ người mua</h3>
          {!loading && reviews.length > 0 && (
            <span className="text-xs bg-primary-50 text-primary-700 font-medium px-3 py-1 rounded-full">
              {reviews.length} đánh giá
            </span>
          )}
        </div>

        <div className="divide-y divide-warmgray-100">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-warmgray-500">Đang tải đánh giá...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16">
              <p className="text-rose-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-warmgray-400">
              <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm font-medium">Chưa có đánh giá nào</p>
              <p className="text-xs">Đánh giá sẽ xuất hiện sau khi người mua hoàn tất giao dịch</p>
            </div>
          )}

          {!loading && !error && reviews.map((review) => {
            const images = getReviewImages(review);
            const reviewer = getReviewer(review);
            return (
              <div key={review._id} className="px-6 py-5 hover:bg-warmgray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar name={reviewer.name} src={reviewer.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-primary-900 text-sm">{reviewer.name}</span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-warmgray-400 shrink-0">{formatDate(review.createdAt)}</span>
                    </div>

                    {/* Rating */}
                    <div className="mb-2">
                      <Rating value={review.rating} size="sm" readonly />
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-warmgray-700 leading-relaxed">{review.comment}</p>
                    )}

                    {/* Images */}
                    {images.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`review-${i}`}
                            className="w-14 h-14 object-cover rounded-xl border border-warmgray-200 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reputation;
