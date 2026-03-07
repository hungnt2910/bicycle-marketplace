import React, { useState } from 'react';

const ImageGallery = ({ images = [], alt = 'Product image' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-product bg-warmgray-200 flex items-center justify-center rounded-[16px]">
        <span className="text-warmgray-400">Không có hình ảnh</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full aspect-product bg-warmgray-100 rounded-[16px] overflow-hidden">
        <img
          src={images[selectedIndex]}
          alt={`${alt} ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-[12px] overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-primary-600 ring-2 ring-primary-600/20'
                  : 'border-warmgray-200 hover:border-warmgray-300'
              }`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
