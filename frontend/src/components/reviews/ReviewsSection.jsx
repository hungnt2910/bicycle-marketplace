import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import reviewApi from '../../api/reviewApi';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import ReviewSummary from './ReviewSummary';
import { useAuth } from '../../contexts/AuthContext';

/* ─── helpers (unchanged logic) ──────────────────────────── */
const computeDistribution = (list = []) => {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  list.forEach((r) => {
    const key = Math.round(Number(r.rating) || 0);
    if (dist[key] !== undefined) dist[key] += 1;
  });
  return dist;
};

const normalizeReview = (r) => {
  const mediaFromArray = Array.isArray(r.media)
    ? r.media
    : typeof r.media === 'string'
      ? r.media.split(',').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(r.media?.images)
        ? r.media.images
        : Array.isArray(r.mediaUrls)
          ? r.mediaUrls
          : [];

  const media = mediaFromArray
    .map((m) => {
      if (typeof m === 'string') return m;
      if (m?.secure_url) return m.secure_url;
      if (m?.url) return m.url;
      return null;
    })
    .filter(Boolean);

  return { ...r, media };
};

/* ─── ReviewsSection ──────────────────────────────────────── */
const ReviewsSection = ({
  sellerId,
  transactionId,
  transactionStatus,
  //   listingId,
  requireCompleted = true,
  readOnly = false,
}) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0, distribution: {} });
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const { user } = useAuth();
  const reviewerId = user?._id || user?.id || user?.userId;

  const loadData = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await reviewApi.getSellerReviews(sellerId);
      const payload = res?.data?.data || res?.data || {};
      const rawList = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.reviews)
          ? payload.reviews
          : Array.isArray(payload)
            ? payload
            : [];

      const list = rawList.map(normalizeReview);
      setReviews(list);

      const averageRating =
        payload.averageRating ??
        (list.length ? list.reduce((s, r) => s + (Number(r.rating) || 0), 0) / list.length : 0);
      const totalReviews = payload.totalReviews ?? list.length;
      const distribution = payload.distribution || computeDistribution(list);
      setSummary({ averageRating, totalReviews, distribution });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không tải được đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sellerId]);

  const listTitle = useMemo(
    () => `Đánh giá (${summary.totalReviews || 0})`,
    [summary.totalReviews]
  );

  const canReview = useMemo(() => {
    if (!transactionId) return false;
    if (!requireCompleted) return true;
    const st = (transactionStatus || '').toLowerCase();
    return ['completed', 'buyer_confirmed'].includes(st);
  }, [transactionId, transactionStatus, requireCompleted]);

  /**
   * Detect if the current buyer already submitted a review for THIS transaction.
   * Match on transactionId field stored inside each review object.
   */
  const existingMyReview = useMemo(() => {
    if (!reviewerId || !transactionId) return null;
    return (
      reviews.find((r) => {
        const rTxId = r.transactionId?._id || r.transactionId?.id || r.transactionId;
        const rReviewerId = r.reviewerId?._id || r.reviewerId?.id || r.reviewerId;
        return (
          String(rTxId) === String(transactionId) &&
          String(rReviewerId) === String(reviewerId)
        );
      }) || null
    );
  }, [reviews, reviewerId, transactionId]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top grid: summary + write form */}
      <div className={`grid grid-cols-1 gap-4 ${
        readOnly ? '' : 'lg:grid-cols-3'
      }`}>
        {/* Summary card */}
        <div className={readOnly ? 'max-w-sm' : 'lg:col-span-1'}>
          <ReviewSummary summary={summary} />
        </div>

        {/* Write / edit form (hidden in readOnly mode) */}
        {!readOnly && (
          <div className="lg:col-span-2">
            {existingMyReview && !editingReview ? (
              /* ── Already-reviewed notice ── */
              <div
                role="alert"
                className="card p-5 border-2 border-primary-800/20 bg-primary-800/5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Check icon */}
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-primary-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary-900">Bạn đã đánh giá giao dịch này</p>
                    <p className="text-xs text-warmgray-500 mt-0.5">
                      Mỗi giao dịch chỉ được gửi <span className="font-semibold">1 đánh giá</span>. Bạn có thể chỉnh sửa đánh giá đã gửi.
                    </p>
                  </div>
                </div>

                {/* Preview of existing review */}
                <div className="bg-white rounded-xl px-4 py-3 border border-warmgray-100 space-y-1">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-lg ${ (existingMyReview.rating || 0) >= s ? 'text-amber-400' : 'text-warmgray-200'}`}>★</span>
                    ))}
                  </div>
                  {existingMyReview.comment && (
                    <p className="text-sm text-warmgray-700 line-clamp-2 leading-relaxed">
                      {existingMyReview.comment}
                    </p>
                  )}
                </div>

                {/* Edit action */}
                <button
                  type="button"
                  onClick={() => setEditingReview(existingMyReview)}
                  className="btn btn-outline btn-sm text-xs w-full"
                >
                  ✏ Chỉnh sửa đánh giá của tôi
                </button>
              </div>
            ) : (
              /* ── Write / Edit form ── */
              <ReviewForm
                sellerId={sellerId}
                transactionId={transactionId}
                // listingId={listingId}
                reviewerId={reviewerId}
                initialReview={editingReview}
                canReview={canReview}
                onSuccess={(reason) => {
                  setEditingReview(null);
                  loadData();
                }}
              />
            )}
            {!canReview && !existingMyReview && (
              <p className="text-xs text-amber-700 mt-2 px-1">
                {!transactionId
                  ? 'Cần mã giao dịch đã hoàn tất để đánh giá.'
                  : 'Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn tất (completed / buyer_confirmed).'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Review list */}
      <section aria-labelledby="reviews-title">
        <div className="flex items-center justify-between mb-4">
          <h3 id="reviews-title" className="text-base font-semibold text-primary-900">
            {listTitle}
          </h3>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            aria-label="Làm mới danh sách đánh giá"
            className="btn btn-outline btn-sm text-xs"
          >
            {loading ? 'Đang tải...' : '↺ Làm mới'}
          </button>
        </div>

        <ReviewList
          reviews={reviews}
          loading={loading}
          onEdit={readOnly ? undefined : (rev) => setEditingReview(rev)}
          onReload={loadData}
          readOnly={readOnly}
        />
      </section>
    </div>
  );
};

export default ReviewsSection;
