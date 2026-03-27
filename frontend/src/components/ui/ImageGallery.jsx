import React, { useMemo, useState } from 'react';

const isYouTubeUrl = (url) => typeof url === 'string' && /youtu(?:\.be|be\.com)\//i.test(url);

const extractYouTubeId = (url) => {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace('/', '');
    }
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/');
    return parts.pop() || '';
  } catch (e) {
    // Nếu URL không hợp lệ thì trả về chuỗi rỗng
    return '';
  }
};

const toMediaItem = (src) => {
  if (!src) return null;
  if (isYouTubeUrl(src)) {
    const id = extractYouTubeId(src);
    if (!id) return null;
    return {
      type: 'video',
      kind: 'youtube',
      src: `https://www.youtube.com/embed/${id}`,
      thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }
  return { type: 'video', kind: 'html5', src };
};

// Hỗ trợ hiển thị cả ảnh lẫn video (YouTube + file mp4, webm) trong gallery
const ImageGallery = ({ images = [], videos = [], alt = 'Product media' }) => {
  const mediaItems = useMemo(() => {
    const imageItems = (images || []).filter(Boolean).map((src) => ({ type: 'image', src }));
    const videoItems = (videos || []).filter(Boolean).map(toMediaItem).filter(Boolean);
    return [...imageItems, ...videoItems];
  }, [images, videos]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="w-full aspect-product bg-warmgray-200 flex items-center justify-center rounded-[16px]">
        <span className="text-warmgray-400">Không có hình ảnh/video</span>
      </div>
    );
  }

  const selected = mediaItems[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main media */}
      <div className="relative w-full aspect-product bg-warmgray-100 rounded-[16px] overflow-hidden">
        {selected.type === 'video' ? (
          selected.kind === 'youtube' ? (
            <iframe
              key={selected.src}
              src={selected.src}
              className="w-full h-full"
              title={`YouTube video ${selectedIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              key={selected.src}
              src={selected.src}
              controls
              playsInline
              className="w-full h-full object-cover bg-black"
            />
          )
        ) : (
          <img
            src={selected.src}
            alt={`${alt} ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {mediaItems.map((item, index) => (
            <button
              key={`${item.type}-${index}-${item.src}`}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-[12px] overflow-hidden border-2 transition-all relative ${
                index === selectedIndex
                  ? 'border-primary-600 ring-2 ring-primary-600/20'
                  : 'border-warmgray-200 hover:border-warmgray-300'
              }`}
            >
              {item.type === 'video' ? (
                item.kind === 'youtube' && item.thumb ? (
                  <img
                    src={item.thumb}
                    alt={`${alt} video thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M6.5 5.5l7 4.5-7 4.5v-9z" />
                      </svg>
                    </div>
                  </div>
                )
              ) : (
                <img
                  src={item.src}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
