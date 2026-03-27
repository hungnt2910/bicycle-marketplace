import React from 'react';
import { toast } from 'react-toastify';
import reviewApi from '../../api/reviewApi';
import ReviewStars from './ReviewStars';

/* ─── media URL normaliser (unchanged logic) ──────────────── */
const resolveMediaUrls = (item) => {
  const rawMedia = Array.isArray(item.media)
    ? item.media
    : typeof item.media === 'string'
      ? item.media.split(',').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(item.media?.images)
        ? item.media.images
        : Array.isArray(item.mediaUrls)
          ? item.mediaUrls
          : typeof item.mediaUrls === 'string'
            ? item.mediaUrls.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

  return rawMedia
    .map((m) => {
      if (typeof m === 'string') return m;
      if (m?.secure_url) return m.secure_url;
      if (m?.url) return m.url;
      if (m?.path) return m.path;
      return null;
    })
    .filter(Boolean);
};

/* ─── ReviewCard ──────────────────────────────────────────── */
const ReviewCard = ({ item, onEdit, onDelete, readOnly = false }) => {
  const mediaUrls = resolveMediaUrls(item);

  return (
    <article
      className="card p-4 space-y-3 animate-fade-in"
      aria-label={`Đánh giá ${item.rating} sao`}
    >
      {/* Top row: stars + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <ReviewStars rating={item.rating} size="sm" />
          <p className="text-sm text-warmgray-800 leading-relaxed whitespace-pre-wrap">
            {item.comment || <em className="text-warmgray-400">Không có nội dung</em>}
          </p>
          {item.createdAt && (
            <time
              dateTime={item.createdAt}
              className="text-xs text-warmgray-400"
            >
              {new Date(item.createdAt).toLocaleString('vi-VN')}
            </time>
          )}
        </div>

        {/* Action buttons: only shown when NOT readOnly */}
        {!readOnly && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              aria-label="Sửa đánh giá"
              className="btn btn-outline btn-sm text-xs px-3 py-1"
            >
              Sửa
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(item)}
              aria-label="Xoá đánh giá"
              className="btn btn-sm text-xs px-3 py-1 border border-red-200 text-danger hover:bg-red-50 rounded-xl"
            >
              Xoá
            </button>
          </div>
        )}
      </div>

      {/* Media grid */}
      {!!mediaUrls.length && (
        <div className="flex flex-wrap gap-2 pt-1">
          {mediaUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label="Xem ảnh đánh giá"
              className="block w-20 h-20 rounded-xl overflow-hidden border border-warmgray-200 bg-warmgray-50 hover:opacity-90 transition-opacity"
            >
              <img
                src={url}
                alt="Ảnh đánh giá"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

/* ─── ReviewList ──────────────────────────────────────────── */
const ReviewList = ({ reviews = [], loading, onEdit, onReload, readOnly = false }) => {
  const handleDelete = async (review) => {
    const ok = window.confirm('Xoá đánh giá này?');
    if (!ok) return;
    try {
      await reviewApi.deleteReview(review._id || review.id);
      toast.success('Đã xoá đánh giá');
      onReload?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không xoá được đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="py-10 flex flex-col items-center gap-3 text-warmgray-400" role="status" aria-live="polite">
        <span className="w-6 h-6 border-2 border-warmgray-200 border-t-primary-700 rounded-full animate-spin" />
        <span className="text-sm">Đang tải đánh giá...</span>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="py-10 text-center text-warmgray-400" role="status">
        <div className="text-3xl mb-2 opacity-40">💬</div>
        <p className="text-sm">Chưa có đánh giá nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Danh sách đánh giá">
      {reviews.map((item) => (
        <div key={item._id || item.id} role="listitem">
          <ReviewCard item={item} onEdit={onEdit} onDelete={handleDelete} readOnly={readOnly} />
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
