import React, { useState } from 'react';

const CreateListing = () => {
  const [inspectionType, setInspectionType] = useState('none'); // none, online, offline

  // Logic tính phí
  const POST_FEE = 15000;
  const INSPECTION_FEE_OFFLINE = 200000;
  const isFirstPost = true; // Giả lập user mới
  const isFirstInspection = true;

  const calculateTotal = () => {
    let total = 0;
    if (!isFirstPost) total += POST_FEE;
    if (inspectionType === 'offline' && !isFirstInspection) total += INSPECTION_FEE_OFFLINE;
    return total;
  };

  return (
    <div className="bg-white p-6 rounded-xl border max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Đăng bán xe mới</h2>
      <form className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Tên xe</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="VD: Giant Escape 2"
          />
        </div>

        {/* Chọn gói kiểm định */}
        <div className="border p-4 rounded-lg bg-gray-50">
          <label className="block font-bold mb-3">Yêu cầu kiểm định (Để tăng uy tín)</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border bg-white rounded cursor-pointer hover:border-blue-500">
              <input
                type="radio"
                name="ins"
                value="none"
                onChange={() => setInspectionType('none')}
              />
              <div>
                <div className="font-bold">Không kiểm định</div>
                <div className="text-xs text-gray-500">Người mua có thể e ngại.</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border bg-white rounded cursor-pointer hover:border-blue-500">
              <input
                type="radio"
                name="ins"
                value="offline"
                onChange={() => setInspectionType('offline')}
              />
              <div>
                <div className="font-bold flex items-center gap-2">
                  Kiểm định tận nơi (Offline)
                  {isFirstInspection && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                      Miễn phí lần đầu
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Thợ sẽ đến nhà bạn kiểm tra. Phí thường: 200k.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Tổng kết phí */}
        <div className="flex justify-between items-center border-t pt-4">
          <div>
            <div className="text-gray-500 text-sm">
              Phí đăng bài:{' '}
              {isFirstPost ? (
                <span className="text-green-600 font-bold">Miễn phí (2 lần đầu)</span>
              ) : (
                `${POST_FEE}đ`
              )}
            </div>
            <div className="text-gray-500 text-sm">
              Phí kiểm định:{' '}
              {inspectionType === 'offline' && isFirstInspection ? (
                <span className="text-green-600 font-bold">Miễn phí</span>
              ) : inspectionType === 'offline' ? (
                `${INSPECTION_FEE_OFFLINE}đ`
              ) : (
                '0đ'
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">
              Tổng: {calculateTotal().toLocaleString()} ₫
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold mt-2"
            >
              Thanh toán & Đăng
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default CreateListing;
