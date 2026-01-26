import React, { useState } from 'react';

const CreateListing = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [inspectionType, setInspectionType] = useState('none');

  const POST_FEE = 15000;
  const INSPECTION_FEE_OFFLINE = 200000;
  const isFirstPost = true;
  const isFirstInspection = true;

  const calculateTotal = () => {
    let total = 0;
    if (!isFirstPost) total += POST_FEE;
    if (inspectionType === 'offline' && !isFirstInspection) total += INSPECTION_FEE_OFFLINE;
    return total;
  };

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: '📋' },
    { id: 'specs', label: 'Thông số kỹ thuật', icon: '⚙️' },
    { id: 'media', label: 'Hình ảnh & Video', icon: '📷' },
    { id: 'pricing', label: 'Giá & Xác nhận', icon: '💰' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-themePrimary to-accent rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Đăng tin bán xe đạp</h1>
        <p className="text-white/90 text-sm">
          Điền đầy đủ thông tin để tin đăng của bạn được duyệt nhanh chóng
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-themePrimary to-accent text-white shadow-lg'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 lg:p-8">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Tên sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Giant XTC SLR 29 - Xe đạp địa hình cao cấp"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Tên rõ ràng, đầy đủ giúp tăng cơ hội bán hàng
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Loại xe <span className="text-rose-500">*</span>
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all appearance-none bg-white">
                  <option>Chọn loại xe</option>
                  <option>Xe đạp địa hình (MTB)</option>
                  <option>Xe đạp đường trường (Road Bike)</option>
                  <option>Xe đạp touring</option>
                  <option>Xe đạp thành phố</option>
                  <option>Xe đạp gấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Thương hiệu <span className="text-rose-500">*</span>
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all appearance-none bg-white">
                  <option>Chọn thương hiệu</option>
                  <option>Giant</option>
                  <option>Trek</option>
                  <option>Specialized</option>
                  <option>Cannondale</option>
                  <option>Merida</option>
                  <option>Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Mô tả chi tiết <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Mô tả về tình trạng, lịch sử sử dụng..."
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Năm sản xuất
                </label>
                <input
                  type="number"
                  placeholder="2023"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Kích cỡ khung
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all appearance-none bg-white">
                  <option>Chọn size</option>
                  <option>XS (dưới 1m55)</option>
                  <option>S (1m55 - 1m65)</option>
                  <option>M (1m65 - 1m75)</option>
                  <option>L (1m75 - 1m85)</option>
                  <option>XL (trên 1m85)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Chất liệu khung
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all appearance-none bg-white">
                  <option>Carbon</option>
                  <option>Aluminum (Nhôm)</option>
                  <option>Thép</option>
                  <option>Titanium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">
                  Kích thước bánh
                </label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all appearance-none bg-white">
                  <option>27.5"</option>
                  <option>29"</option>
                  <option>26"</option>
                  <option>700C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Số líp</label>
                <select className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all appearance-none bg-white">
                  <option>1x11</option>
                  <option>1x12</option>
                  <option>2x10</option>
                  <option>2x11</option>
                  <option>3x9</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Hình ảnh sản phẩm <span className="text-rose-500">*</span>
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-themePrimary transition-colors cursor-pointer bg-neutral-50 hover:bg-themePrimary/5">
                <div className="text-5xl mb-3">📷</div>
                <p className="text-sm font-semibold text-neutral-900 mb-1">
                  Kéo thả hoặc click để upload ảnh
                </p>
                <p className="text-xs text-neutral-500">Tối đa 10 ảnh, mỗi ảnh không quá 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Video giới thiệu (tùy chọn)
              </label>
              <input
                type="url"
                placeholder="Link YouTube hoặc upload video"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all"
              />
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Giá bán <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="15000000"
                  className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                  ₫
                </span>
              </div>
            </div>

            {/* Inspection Options */}
            <div className="bg-gradient-to-br from-accent/5 to-themePrimary/5 rounded-xl p-6 border border-accent/20">
              <h3 className="text-lg font-bold text-neutral-900 mb-1 flex items-center gap-2">
                <span>✅</span>
                Yêu cầu kiểm định (Tăng uy tín)
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Xe được kiểm định sẽ có tỷ lệ bán cao hơn 73%
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-neutral-200 bg-white rounded-xl cursor-pointer hover:border-themePrimary hover:shadow-md transition-all">
                  <input
                    type="radio"
                    name="inspection"
                    value="none"
                    checked={inspectionType === 'none'}
                    onChange={() => setInspectionType('none')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-neutral-900">Không kiểm định</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Người mua có thể e ngại về chất lượng xe
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-accent/30 bg-white rounded-xl cursor-pointer hover:border-accent hover:shadow-md transition-all">
                  <input
                    type="radio"
                    name="inspection"
                    value="offline"
                    checked={inspectionType === 'offline'}
                    onChange={() => setInspectionType('offline')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-neutral-900 flex items-center gap-2 flex-wrap">
                      <span>Kiểm định tận nơi (Offline)</span>
                      {isFirstInspection && (
                        <span className="bg-accent/20 text-accent text-xs px-2.5 py-0.5 rounded-full font-bold">
                          MIỄN PHÍ LẦN ĐẦU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">
                      Kiểm định viên đến nhà kiểm tra chi tiết. Phí thường: 200,000₫
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-accent font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Được ưu tiên hiển thị</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-6 border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Tổng kết chi phí</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <span className="text-sm text-neutral-600">Phí đăng bài</span>
                  <span className="font-semibold">
                    {isFirstPost ? (
                      <span className="text-accent">Miễn phí (2 lần đầu)</span>
                    ) : (
                      <span className="text-neutral-900">{POST_FEE.toLocaleString()}₫</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <span className="text-sm text-neutral-600">Phí kiểm định</span>
                  <span className="font-semibold">
                    {inspectionType === 'offline' && isFirstInspection ? (
                      <span className="text-accent">Miễn phí</span>
                    ) : inspectionType === 'offline' ? (
                      <span className="text-neutral-900">
                        {INSPECTION_FEE_OFFLINE.toLocaleString()}₫
                      </span>
                    ) : (
                      <span className="text-neutral-600">0₫</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold text-neutral-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-themePrimary">
                    {calculateTotal().toLocaleString()} ₫
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold rounded-xl transition-all"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-themePrimary to-accent hover:shadow-xl text-white font-bold rounded-xl transition-all shadow-lg shadow-themePrimary/25"
              >
                Thanh toán & Đăng tin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
