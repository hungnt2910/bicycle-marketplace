import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import reviewApi from '../../api/reviewApi';
import cloudinaryApi from '../../api/cloudinaryApi';
import ReviewStars from './ReviewStars';

/* ─── helpers ─────────────────────────────────────────────── */
const normalizeMediaArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.images)) return value.images;
  if (typeof value === 'string')
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

/* ─── sub-components ──────────────────────────────────────── */
const MediaTag = ({ url, onRemove }) => (
  <div className="flex items-center gap-2 bg-warmgray-100 text-warmgray-700 rounded-xl px-3 py-1.5 text-xs max-w-[220px]">
    <img
      src={url}
      alt="preview"
      className="w-6 h-6 rounded-md object-cover shrink-0"
      loading="lazy"
      onError={(e) => (e.currentTarget.src = '')}
    />
    <span className="truncate flex-1" title={url}>
      {url.replace(/^https?:\/\//, '')}
    </span>
    <button
      type="button"
      onClick={() => onRemove(url)}
      aria-label="Xoá ảnh"
      className="text-danger hover:text-danger/80 shrink-0 font-bold leading-none"
    >
      ✕
    </button>
  </div>
);

/* ─── main component ──────────────────────────────────────── */
const ReviewForm = ({
  sellerId,
  transactionId,
  listingId,
  reviewerId,
  initialReview,
  onSuccess,
  canReview = true,
}) => {
  const [rating, setRating] = useState(initialReview?.rating || 5);
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(normalizeMediaArray(initialReview?.media));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setRating(initialReview?.rating || 5);
    setComment(initialReview?.comment || '');
    setMedia(normalizeMediaArray(initialReview?.media));
  }, [initialReview]);

  /* -- handlers (unchanged logic) -- */
  const handleUpload = async (files) => {
    if (!files?.length) return;
    if (!canReview || !transactionId) {
      toast.warn('Chỉ được thêm ảnh khi đơn đã hoàn tất');
      return;
    }
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        const res = await cloudinaryApi.uploadCCCDImage(formDataUpload);
        const url = res?.data?.data?.secure_url || res?.data?.data?.url;
        if (url) uploaded.push(url);
      }
      if (uploaded.length) {
        setMedia((prev) => [...prev, ...uploaded]);
        toast.success('Đã tải ảnh');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (url) => {
    setMedia((prev) => prev.filter((item) => item !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Vui lòng chọn số sao'); return; }
    if (!transactionId) { toast.error('Thiếu mã giao dịch hoàn tất để đánh giá'); return; }
    if (!reviewerId) { toast.error('Thiếu mã người đánh giá (reviewerId)'); return; }
    if (!canReview) { toast.warn('Chỉ được đánh giá sau khi đơn đã hoàn tất'); return; }

    setLoading(true);
    try {
      const payloadMedia = media?.length ? { images: media } : undefined;
      if (initialReview?._id || initialReview?.id) {
        await reviewApi.updateReview(initialReview._id || initialReview.id, {
          rating,
          comment,
          media: payloadMedia,
        });
        toast.success('Đã cập nhật đánh giá');
      } else {
        const payload = { sellerId, transactionId, rating, comment, reviewerId, media: payloadMedia };
        if (listingId) payload.listingId = listingId;
        await reviewApi.createReview(payload);
        toast.success('Đã gửi đánh giá');
      }
      onSuccess?.();
      if (!initialReview) {
        setRating(5);
        setComment('');
        setMedia([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không gửi được đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !canReview || !transactionId;

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4 animate-fade-in">
      {/* Header + Stars */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-primary-900">
          {initialReview ? 'Cập nhật đánh giá' : 'Viết đánh giá'}
        </h3>
        <ReviewStars rating={rating} onChange={isDisabled ? undefined : setRating} size="md" />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label htmlFor="review-file-upload" className="text-xs font-medium text-warmgray-600">
          Ảnh minh họa <span className="font-normal text-warmgray-400">(tùy chọn)</span>
        </label>
        <input
          id="review-file-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(Array.from(e.target.files || []))}
          disabled={uploading || isDisabled}
          aria-label="Chọn ảnh đính kèm"
          className="block w-full text-sm text-warmgray-600
            file:mr-3 file:py-1.5 file:px-3
            file:rounded-lg file:border-0 file:text-xs file:font-semibold
            file:bg-primary-800/10 file:text-primary-800
            hover:file:bg-primary-800/20 file:transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploading && (
          <p className="text-xs text-primary-600 flex items-center gap-1">
            <span className="inline-block w-3 h-3 border-2 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
            Đang tải ảnh...
          </p>
        )}
        {!!media.length && (
          <div className="flex flex-wrap gap-2 pt-1">
            {media.map((url) => (
              <MediaTag key={url} url={url} onRemove={handleRemoveMedia} />
            ))}
          </div>
        )}
      </div>

      {/* Comment textarea */}
      <div>
        <label htmlFor="review-comment" className="sr-only">Nội dung đánh giá</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về xe và người bán..."
          rows={4}
          disabled={isDisabled}
          aria-label="Viết nhận xét"
          className="textarea"
        />
      </div>

      {/* Locked notice */}
      {isDisabled && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Chỉ đánh giá được sau khi đơn hàng đã hoàn tất. Hệ thống cần mã giao dịch hoàn tất.
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        {initialReview && (
          <button
            type="button"
            onClick={() => onSuccess?.('cancelEdit')}
            className="btn btn-outline btn-sm"
          >
            Huỷ
          </button>
        )}
        <button
          type="submit"
          disabled={loading || isDisabled}
          className="btn btn-primary btn-sm"
          aria-busy={loading}
        >
          {loading ? 'Đang gửi...' : initialReview ? 'Lưu thay đổi' : 'Gửi đánh giá'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
