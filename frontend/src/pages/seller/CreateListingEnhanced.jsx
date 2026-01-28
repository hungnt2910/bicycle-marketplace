import React, { useState } from 'react';
import { Button } from '../../components/ui';

const CreateListingEnhanced = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    category: '',
    brand: '',
    bikeType: '',
    // Technical Specs
    frameType: '',
    suspensionType: '',
    gearSystem: '',
    wheelSize: '',
    tyreType: '',
    brakingSystem: '',
    weight: '',
    frameSize: '',
    // Condition
    condition: '',
    usageHours: '',
    usageHistory: '',
    // Pricing
    price: '',
    originalPrice: '',
    // Images & Videos
    images: [],
    videos: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    images: [],
    videos: [],
  });

  const bikeTypes = ['Mountain Bike', 'Road Bike', 'Hybrid Bike', 'BMX', 'Cruiser', 'Gravel Bike'];
  const brands = ['Giant', 'Trek', 'Specialized', 'Cube', 'Scott', 'Cannondale'];
  const frameTypes = ['Aluminum', 'Carbon', 'Steel', 'Titanium'];
  const conditions = ['Like New', 'Excellent', 'Good', 'Fair', 'Parts Only'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fileType) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => ({
      ...prev,
      [fileType]: [...prev[fileType], ...files],
    }));
  };

  const handleSubmit = () => {
    alert('Tin đăng của bạn đã được gửi để xin kiểm định!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng tin bán xe đạp</h1>
        <p className="text-gray-600">
          Điền đầy đủ thông tin để tin đăng của bạn được duyệt nhanh chóng
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {s === 1 && '📋 Thông tin chung'}
            {s === 2 && '⚙️ Thông số kỹ thuật'}
            {s === 3 && '📸 Hình ảnh & Video'}
            {s === 4 && '💰 Giá & Xác nhận'}
          </button>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Thông tin cơ bản về xe</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="VD: Giant XTC SLR 29 - Xe đạp địa hình cao cấp"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại xe *</label>
              <select
                name="bikeType"
                value={formData.bikeType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Chọn loại xe</option>
                {bikeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu *</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết về tình trạng, lịch sử sử dụng..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong> Gợi ý:</strong> Mô tả càng chi tiết, xe sẽ được tin cậy và bán nhanh hơn. Hãy
              kể về tình trạng, lịch sử bảo dưỡng, và bất kỳ sửa chữa nào.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setStep(2)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Technical Specifications */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật chi tiết</h2>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Loại khung',
                name: 'frameType',
                options: frameTypes,
              },
              {
                label: 'Kích thước khung',
                name: 'frameSize',
                type: 'text',
                placeholder: 'VD: 22 inch hoặc 56 cm',
              },
              {
                label: 'Hệ thống treo',
                name: 'suspensionType',
                type: 'text',
                placeholder: 'VD: Full Suspension (140mm)',
              },
              {
                label: 'Kích thước bánh',
                name: 'wheelSize',
                type: 'text',
                placeholder: 'VD: 29 inch',
              },
              {
                label: 'Hệ thống bánh đạp',
                name: 'gearSystem',
                type: 'text',
                placeholder: 'VD: Shimano Deore XT 1x12',
              },
              {
                label: 'Hệ thống phanh',
                name: 'brakingSystem',
                type: 'text',
                placeholder: 'VD: Hydraulic Disc Brakes',
              },
              {
                label: 'Loại vỏ xe',
                name: 'tyreType',
                type: 'text',
                placeholder: 'VD: Maxxis Assegai 2.4',
              },
              {
                label: 'Trọng lượng',
                name: 'weight',
                type: 'text',
                placeholder: 'VD: 11.2 kg',
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                {field.options ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Chọn...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tình trạng *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">Chọn tình trạng</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ sử dụng ước tính
              </label>
              <input
                type="number"
                name="usageHours"
                value={formData.usageHours}
                onChange={handleInputChange}
                placeholder="VD: 120"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lịch sử bảo dưỡng
              </label>
              <input
                type="text"
                name="usageHistory"
                value={formData.usageHistory}
                onChange={handleInputChange}
                placeholder="VD: Bảo dưỡng định kỳ, thay vỏ"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <button
              onClick={() => setStep(1)}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Images & Videos */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Hình ảnh & Video</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tải lên ảnh chất lượng cao *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'images')}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <p className="text-4xl mb-2">📸</p>
                <p className="text-gray-700">Kéo thả ảnh hoặc nhấp để chọn</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tối thiểu 3 ảnh, định dạng JPG/PNG, tối đa 10MB
                </p>
              </label>
            </div>

            {uploadedFiles.images.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-700 mb-2">
                  Đã tải lên ({uploadedFiles.images.length} ảnh)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedFiles.images.map((file, idx) => (
                    <div key={idx} className="relative">
                      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-3xl">🖼️</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tải lên video (Tùy chọn)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'videos')}
                className="hidden"
                id="videoUpload"
              />
              <label htmlFor="videoUpload" className="cursor-pointer">
                <p className="text-4xl mb-2">🎥</p>
                <p className="text-gray-700">Kéo thả video hoặc nhấp để chọn</p>
                <p className="text-xs text-gray-500 mt-1">Định dạng MP4/MOV, tối đa 100MB</p>
              </label>
            </div>

            {uploadedFiles.videos.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-700 mb-2">
                  Đã tải lên ({uploadedFiles.videos.length} video)
                </p>
              </div>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-900">
              <strong> Mẹo:</strong> Ảnh sắc nét, rõ ràng sẽ giúp xe bán nhanh hơn. Hãy chụp từ
              nhiều góc độ, cả toàn cảnh lẫn chi tiết.
            </p>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <button
              onClick={() => setStep(2)}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => setStep(4)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pricing & Confirmation */}
      {step === 4 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Giá bán & Xác nhận</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá gốc (Tùy chọn)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                placeholder="VD: 28000000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán hiện tại *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="VD: 25000000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h3 className="font-bold text-blue-900"> Tóm tắt tin đăng</h3>
            <p className="text-sm text-blue-900">
              <strong>Sản phẩm:</strong> {formData.name || 'Chưa nhập'}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Giá:</strong>{' '}
              {formData.price ? `${formData.price.toLocaleString()} VNĐ` : 'Chưa nhập'}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Ảnh:</strong> {uploadedFiles.images.length} hình
            </p>
            <p className="text-sm text-blue-900">
              <strong>Video:</strong> {uploadedFiles.videos.length} video
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-900 mb-2">
              <strong> Lưu ý quan trọng:</strong>
            </p>
            <ul className="text-xs text-yellow-900 space-y-1 ml-4 list-disc">
              <li>Tin đăng sẽ được gửi cho người kiểm định để xác thực chất lượng</li>
              <li>Phí kiểm định: Miễn phí 2 lần đầu, sau đó 15.000 VNĐ/lần</li>
              <li>Xe chỉ có thể nhận cọc sau khi được kiểm định thành công</li>
              <li>Hạn hữu hiệu của nhãn kiểm định: 1 tháng (nếu thay đổi xe phải kiểm định lại)</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-900">
              <strong> Lợi ích của kiểm định:</strong> Tin đăng được xác thực sẽ được tin cậy hơn,
              giúp bán nhanh và với giá tốt hơn!
            </p>
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <input type="checkbox" id="confirm" className="w-4 h-4" />
            <label htmlFor="confirm" className="text-sm text-gray-700">
              Tôi xác nhận toàn bộ thông tin là chính xác và đúng sự thật
            </label>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <button
              onClick={() => setStep(3)}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium"
            >
              ← Quay lại
            </button>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold"
            >
              Đăng tin
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListingEnhanced;
