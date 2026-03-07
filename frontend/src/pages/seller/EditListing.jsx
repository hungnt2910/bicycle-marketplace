import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import bicycleApi from '../../api/postNewsApi';
import { toast } from 'react-toastify';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [inspectionType, setInspectionType] = useState('none');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    specifications: {
      type: '',
      brand: '',
      model: '',
      frameSize: '',
      frameMaterial: '',
      year: '',
      color: '',
      weight: '',
      wheelSize: '',
      gears: '',
      brakeType: '',
      suspension: '',
    },
    condition: {
      overall: '',
      usageHistory: '',
      mileage: '',
      lastServiceDate: '',
    },
    media: {
      images: [],
      videos: [],
      mainImage: '',
    },
    location: {
      city: '',
      district: '',
      address: '',
    },
    inspection: {
      isInspected: false,
      label: '',
    },
    status: 'draft',
  });

  const POST_FEE = 15000;
  const INSPECTION_FEE_OFFLINE = 200000;

  useEffect(() => {
    fetchBicycleData();
  }, [id]);

  const fetchBicycleData = async () => {
    try {
      setFetchingData(true);
      const response = await bicycleApi.getBicycleById(id);

      if (response.data?.data) {
        const bicycle = response.data.data;
        setFormData({
          title: bicycle.title || '',
          description: bicycle.description || '',
          price: bicycle.price || '',
          specifications: {
            type: bicycle.specifications?.type || '',
            brand: bicycle.specifications?.brand || '',
            model: bicycle.specifications?.model || '',
            frameSize: bicycle.specifications?.frameSize || '',
            frameMaterial: bicycle.specifications?.frameMaterial || '',
            year: bicycle.specifications?.year || '',
            color: bicycle.specifications?.color || '',
            weight: bicycle.specifications?.weight || '',
            wheelSize: bicycle.specifications?.wheelSize || '',
            gears: bicycle.specifications?.gears || '',
            brakeType: bicycle.specifications?.brakeType || '',
            suspension: bicycle.specifications?.suspension || '',
          },
          condition: {
            overall: bicycle.condition?.overall || '',
            usageHistory: bicycle.condition?.usageHistory || '',
            mileage: bicycle.condition?.mileage || '',
            lastServiceDate: bicycle.condition?.lastServiceDate || '',
          },
          media: {
            images: bicycle.media?.images || [],
            videos: bicycle.media?.videos || [],
            mainImage: bicycle.media?.mainImage || '',
          },
          location: {
            city: bicycle.location?.city || '',
            district: bicycle.location?.district || '',
            address: bicycle.location?.address || '',
          },
          inspection: {
            isInspected: bicycle.inspection?.isInspected || false,
            label: bicycle.inspection?.label || '',
          },
          status: bicycle.status || 'draft',
        });

        if (bicycle.inspection?.isInspected) {
          setInspectionType('offline');
        }
      }
    } catch (error) {
      console.error('Error fetching bicycle:', error);
      toast.error('Không thể tải thông tin tin đăng');
      navigate('/seller/manage-listings');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (e, section = null) => {
    const { name, value } = e.target;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      setActiveTab('general');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ');
      setActiveTab('pricing');
      return false;
    }
    if (!formData.specifications.type) {
      toast.error('Vui lòng chọn loại xe');
      setActiveTab('general');
      return false;
    }
    if (!formData.specifications.brand) {
      toast.error('Vui lòng chọn thương hiệu');
      setActiveTab('general');
      return false;
    }
    return true;
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      if (!isDraft && !validateForm()) {
        return;
      }

      setLoading(true);

      const submitData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        specifications: {
          type: formData.specifications.type || undefined,
          brand: formData.specifications.brand || undefined,
          model: formData.specifications.model || undefined,
          frameSize: formData.specifications.frameSize || undefined,
          frameMaterial: formData.specifications.frameMaterial || undefined,
          year: formData.specifications.year ? Number(formData.specifications.year) : undefined,
          color: formData.specifications.color || undefined,
          weight: formData.specifications.weight
            ? Number(formData.specifications.weight)
            : undefined,
          wheelSize: formData.specifications.wheelSize || undefined,
          gears: formData.specifications.gears ? Number(formData.specifications.gears) : undefined,
          brakeType: formData.specifications.brakeType || undefined,
          suspension: formData.specifications.suspension || undefined,
        },
        condition: {
          overall: formData.condition.overall || undefined,
          usageHistory: formData.condition.usageHistory || undefined,
          mileage: formData.condition.mileage ? Number(formData.condition.mileage) : undefined,
          lastServiceDate: formData.condition.lastServiceDate || undefined,
        },
        media: {
          images: formData.media.images,
          videos: formData.media.videos,
          mainImage: formData.media.mainImage || formData.media.images[0],
        },
        location: {
          city: formData.location.city || undefined,
          district: formData.location.district || undefined,
          address: formData.location.address || undefined,
        },
        inspection: {
          isInspected: inspectionType === 'offline',
          label: inspectionType === 'offline' ? 'Đã kiểm định' : undefined,
        },
        status: isDraft ? 'draft' : 'pending_review',
      };

      const response = await bicycleApi.updateBicycle(id, submitData);

      if (response.data) {
        toast.success('Cập nhật tin đăng thành công!');
        navigate('/seller/manage-listings');
      }
    } catch (error) {
      console.error('Error updating bicycle:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.media.images.length > 10) {
      toast.error('Tối đa 10 hình ảnh');
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn (tối đa 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          media: {
            ...prev.media,
            images: [...prev.media.images, reader.result],
            mainImage: prev.media.mainImage || reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.media.images.filter((_, i) => i !== index);
      return {
        ...prev,
        media: {
          ...prev.media,
          images: newImages,
          mainImage:
            prev.media.mainImage === prev.media.images[index]
              ? newImages[0] || ''
              : prev.media.mainImage,
        },
      };
    });
  };

  const setMainImage = (image) => {
    setFormData((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        mainImage: image,
      },
    }));
  };

  const handleVideoInput = (e) => {
    const videoUrl = e.target.value;
    if (videoUrl) {
      setFormData((prev) => ({
        ...prev,
        media: {
          ...prev.media,
          videos: [videoUrl],
        },
      }));
    }
  };

  const tabs = [
    { id: 'general', label: 'Thông tin chung' },
    { id: 'specs', label: 'Thông số kỹ thuật' },
    { id: 'media', label: 'Hình ảnh & Video' },
    { id: 'pricing', label: 'Giá & Xác nhận' },
  ];

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-warmgray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Chỉnh sửa tin đăng</h2>
        <p className="text-warmgray-600 mt-1">Cập nhật thông tin tin đăng của bạn</p>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              className="w-full"
            >
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Form Content */}
      <Card className="p-6 lg:p-8">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Input
              label="Tên sản phẩm"
              required
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: Giant XTC SLR 29 - Xe đạp địa hình cao cấp"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Loại xe"
                required
                name="type"
                value={formData.specifications.type}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: Xe đạp địa hình, Xe đạp đường trường..."
              />

              <Input
                label="Thương hiệu"
                required
                name="brand"
                value={formData.specifications.brand}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: Giant, Trek, Specialized..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Model"
                name="model"
                value={formData.specifications.model}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: XTC SLR 29"
              />

              <Select
                label="Tình trạng"
                required
                name="overall"
                value={formData.condition.overall}
                onChange={(e) => handleInputChange(e, 'condition')}
                placeholder="Chọn tình trạng"
                options={[
                  { value: 'new', label: 'Mới 100%' },
                  { value: 'like-new', label: 'Như mới (99%)' },
                  { value: 'good', label: 'Tốt (80-95%)' },
                  { value: 'fair', label: 'Khá (60-80%)' },
                  { value: 'poor', label: 'Cần sửa chữa' },
                ]}
              />
            </div>

            <Textarea
              label="Mô tả chi tiết"
              required
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              placeholder="Mô tả về tình trạng, lịch sử sử dụng, lý do bán..."
            />
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Năm sản xuất"
                type="number"
                name="year"
                value={formData.specifications.year}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="2023"
              />

              <Input
                label="Kích cỡ khung"
                name="frameSize"
                value={formData.specifications.frameSize}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: M, L, 17 inch..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Chất liệu khung"
                name="frameMaterial"
                value={formData.specifications.frameMaterial}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: Carbon, Aluminum, Thép..."
              />

              <Input
                label="Kích thước bánh"
                name="wheelSize"
                value={formData.specifications.wheelSize}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: 27.5, 29, 700C..."
              />

              <Input
                label="Số líp"
                type="number"
                name="gears"
                value={formData.specifications.gears}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: 11, 12, 21..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Loại phanh"
                name="brakeType"
                value={formData.specifications.brakeType}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: Phanh đĩa, Phanh dầu, Phanh cơ..."
              />

              <Input
                label="Giảm xóc"
                name="suspension"
                value={formData.specifications.suspension}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: Giảm xóc trước, Giảm xóc toàn phần..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Màu sắc"
                name="color"
                value={formData.specifications.color}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: Đỏ, Xanh, Đen..."
              />

              <Input
                label="Trọng lượng (kg)"
                type="number"
                step="0.1"
                name="weight"
                value={formData.specifications.weight}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="VD: 12.5"
              />

              <Input
                label="Quãng đường đã đi (km)"
                type="number"
                name="mileage"
                value={formData.condition.mileage}
                onChange={(e) => handleInputChange(e, 'condition')}
                placeholder="VD: 500"
              />
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Hình ảnh sản phẩm <span className="text-danger">*</span>
              </label>

              {/* Upload Area */}
              <label className="block border-2 border-dashed border-warmgray-300 rounded-[16px] p-8 text-center hover:border-primary-500 transition-colors cursor-pointer bg-neutral-offwhite">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-5xl mb-3">📷</div>
                <p className="text-sm font-semibold text-primary-900 mb-1">
                  Kéo thả hoặc click để upload ảnh
                </p>
                <p className="text-xs text-warmgray-500">Tối đa 10 ảnh, mỗi ảnh không quá 5MB</p>
              </label>

              {/* Preview Images */}
              {formData.media.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.media.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-[16px] border-2 border-warmgray-200"
                      />
                      {formData.media.mainImage === image && (
                        <div className="absolute top-2 left-2 bg-success-600 text-white text-xs px-2 py-1 rounded">
                          Ảnh chính
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary-900/45 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px] flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMainImage(image)}
                          className="px-3 py-1 bg-white text-xs rounded hover:bg-warmgray-100"
                        >
                          Đặt ảnh chính
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="px-3 py-1 bg-danger/50 text-white text-xs rounded hover:bg-danger"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Input
              label="Video giới thiệu (tùy chọn)"
              type="url"
              onChange={handleVideoInput}
              placeholder="Link YouTube hoặc upload video"
            />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <Input
              label="Giá bán"
              required
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="15000000"
            />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary-900">Địa chỉ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tỉnh/Thành phố"
                  name="city"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange(e, 'location')}
                  placeholder="VD: TP. Hồ Chí Minh"
                />
                <Input
                  label="Quận/Huyện"
                  name="district"
                  value={formData.location.district}
                  onChange={(e) => handleInputChange(e, 'location')}
                  placeholder="VD: Quận 1"
                />
              </div>
              <Input
                label="Địa chỉ cụ thể"
                name="address"
                value={formData.location.address}
                onChange={(e) => handleInputChange(e, 'location')}
                placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/seller/manage-listings')}
                disabled={loading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Đang xử lý...' : 'Lưu nháp'}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật tin đăng'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EditListing;
