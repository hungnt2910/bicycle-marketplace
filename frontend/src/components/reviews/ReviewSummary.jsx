import React from 'react';
import ReviewStars from './ReviewStars';

/**
 * ReviewSummary – displays the aggregate rating score, total count,
 * and a bar chart breakdown of the 1-5 star distribution.
 */
const ReviewSummary = ({ summary }) => {
  const average = summary?.averageRating ?? 0;
  const total = summary?.totalReviews ?? 0;
  const distribution = summary?.distribution || {};
  const bars = [5, 4, 3, 2, 1];
  const maxCount = Math.max(...bars.map((k) => distribution[k] || 0), 1);

  return (
    <div className="card p-5 space-y-4 animate-fade-in">
      {/* Aggregate score */}
      <div className="flex items-end gap-4 pb-4 border-b border-warmgray-100">
        <div className="text-5xl font text-primary-900 leading-none tabular-nums">
          {average.toFixed(1)}
        </div>
        <div className="pb-1">
          <ReviewStars rating={Math.round(average)} size="sm" />
          <p className="text-xs text-warmgray-500 mt-1">
            <span className="font-semibold text-primary-800">{total}</span> đánh giá
          </p>
        </div>
      </div>

      {/* Distribution bars */}
      <div className="space-y-2" aria-label="Phân phối theo số sao">
        {bars.map((star) => {
          const count = distribution[star] || 0;
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-6 text-xs font-semibold text-warmgray-600 text-right shrink-0">
                {star}★
              </span>
              <div
                className="flex-1 h-1.5 bg-warmgray-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${star} sao: ${count} đánh giá`}
              >
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-7 text-xs text-warmgray-500 text-right shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSummary;
