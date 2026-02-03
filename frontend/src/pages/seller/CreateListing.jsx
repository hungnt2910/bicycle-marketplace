import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bicycleApi from '../../api/postNewsApi';
import adminApi from '../../api/adminApi';
import { toast } from 'react-toastify';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';

const CreateListing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [inspectionType, setInspectionType] = useState('none');
  const [userPostCount, setUserPostCount] = useState(0);
  const [loadingPostCount, setLoadingPostCount] = useState(true);
  const [typeOptions, setTypeOptions] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // General Info
    title: '',
    description: '',
    price: '',

    // Specifications
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

    // Condition
    condition: {
      overall: '',
      usageHistory: '',
      mileage: '',
      lastServiceDate: '',
    },

    // Media
    media: {
      images: [],
      videos: [],
      mainImage: '',
    },

    // Location
    location: {
      city: '',
      district: '',
      address: '',
    },

    // Inspection
    inspection: {
      isInspected: false,
      label: '',
    },

    status: 'draft',
  });

  const POST_FEE = 15000;
  const INSPECTION_FEE_OFFLINE = 200000;
  const FREE_POST_LIMIT = 2; // Miễn phí 2 bài đầu
  const isFirstPost = userPostCount < FREE_POST_LIMIT;
  const isFirstInspection = true; // TODO: Cần kiểm tra từ API

  useEffect(() => {
    const fetchUserPostCount = async () => {
      try {
        const storedUser = localStorage.getItem('user') || localStorage.getItem('userInfo');
        const userInfo = JSON.parse(storedUser || '{}');
        const sellerId = userInfo._id || userInfo.id || userInfo.userId;

        if (sellerId) {
          const response = await bicycleApi.getMyBicycles(sellerId);
          const bicycles = response.data || [];
          setUserPostCount(bicycles.length);
        }
      } catch (error) {
        console.error('Error fetching user post count:', error);
      } finally {
        setLoadingPostCount(false);
      }
    };

    fetchUserPostCount();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingTypes(true);
      try {
        const response = await adminApi.getCategoriesPostNews();
        const data = response?.data?.data || response?.data || [];
        const titleToEnum = (title = '') => {
          const normalized = title.toLowerCase().trim();
          if (normalized.includes('mountain') || normalized.includes('dia hinh')) return 'mountain';
          if (normalized.includes('road') || normalized.includes('road')) return 'road';
          if (normalized.includes('hybrid')) return 'hybrid';
          if (normalized.includes('electric') || normalized.includes('dien')) return 'electric';
          if (normalized.includes('folding') || normalized.includes('gap')) return 'folding';
          if (normalized.includes('bmx')) return 'bmx';
          if (normalized.includes('cruiser') || normalized.includes('dao pho')) return 'cruiser';
          return '';
        };
        const options = data
          .map((item) => ({
            value: titleToEnum(item?.title || ''),
            label: item?.title || 'Danh mục',
          }))
          .filter((opt) => opt.value);
        setTypeOptions(options);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setTypeOptions([]);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchCategories();
  }, []);

  const calculateTotal = () => {
    let total = 0;
    if (!isFirstPost) total += POST_FEE;
    if (inspectionType === 'offline' && !isFirstInspection) total += INSPECTION_FEE_OFFLINE;
    return total;
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
    if (formData.media.images.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 hình ảnh');
      setActiveTab('media');
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

      // Get sellerId from localStorage (user info)
      const userInfoStr = localStorage.getItem('user') || localStorage.getItem('userInfo');
      const accessToken = localStorage.getItem('accessToken');

      console.log('🔍 Debug localStorage:', {
        hasUserInfo: !!userInfoStr,
        hasAccessToken: !!accessToken,
        userInfoStr,
      });

      if (!userInfoStr) {
        toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const sellerId = userInfo._id || userInfo.id || userInfo.userId;

      console.log('🔍 Debug userInfo:', {
        userInfo,
        sellerId,
        hasId: !!(userInfo._id || userInfo.id || userInfo.userId),
      });

      if (!sellerId) {
        toast.error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại');
        console.error('UserInfo structure:', userInfo);
        navigate('/login');
        return;
      }

      if (!accessToken) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      // Prepare data for API
      const currentDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Hết hạn sau 1 năm

      const submitData = {
        sellerId,
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
          inspectionDate: inspectionType === 'offline' ? currentDate.toISOString() : undefined,
          expiryDate: inspectionType === 'offline' ? expiryDate.toISOString() : undefined,
          label: inspectionType === 'offline' ? 'Verified' : undefined,
        },
        status: isDraft ? 'draft' : 'pending_review',
        pricing: {
          listingFee: isFirstPost ? 0 : POST_FEE,
          commissionRate: 0.05, // 5% hoa hồng
          isPaid: false,
        },
      };

      const response = await bicycleApi.createBicycle(submitData);

      if (response.data) {
        if (isDraft) {
          toast.success('Lưu nháp thành công!');
          navigate('/seller/my-listings');
        } else {
          toast.success(
            `Đăng tin thành công! Tin đăng đang chờ admin duyệt. ${isFirstPost ? '🎉 Miễn phí bài đăng thứ ' + (userPostCount + 1) + '/' + FREE_POST_LIMIT : ''}`
          );
          // Chuyển về trang chủ để xem bài đăng mới
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error creating bicycle listing:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Đăng tin bán xe đạp</h2>
        <p className="text-neutral-600 mt-1">
          Điền đầy đủ thông tin để tin đăng của bạn được duyệt nhanh chóng
        </p>
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
            <p className="text-xs text-neutral-500 -mt-4">
              Tên rõ ràng, đầy đủ giúp tăng cơ hội bán hàng
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Loại xe"
                required
                name="type"
                value={formData.specifications.type}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder={loadingTypes ? 'Đang tải danh mục...' : 'Chọn loại xe'}
                options={typeOptions}
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
              <Select
                label="Chất liệu khung"
                name="frameMaterial"
                value={formData.specifications.frameMaterial}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="Chọn chất liệu"
                options={[
                  { value: 'aluminum', label: 'Aluminum' },
                  { value: 'carbon', label: 'Carbon' },
                  { value: 'steel', label: 'Steel' },
                  { value: 'titanium', label: 'Titanium' },
                  { value: 'alloy', label: 'Alloy' },
                ]}
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
              <Select
                label="Loại phanh"
                name="brakeType"
                value={formData.specifications.brakeType}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="Chọn loại phanh"
                options={[
                  { value: 'disc', label: 'Phanh đĩa (Disc)' },
                  { value: 'rim', label: 'Phanh vành (Rim)' },
                  { value: 'hydraulic', label: 'Phanh dầu (Hydraulic)' },
                  { value: 'mechanical', label: 'Phanh cơ (Mechanical)' },
                ]}
              />

              <Select
                label="Giảm xóc"
                name="suspension"
                value={formData.specifications.suspension}
                onChange={(e) => handleInputChange(e, 'specifications')}
                placeholder="Chọn loại giảm xóc"
                options={[
                  { value: 'none', label: 'Không giảm xóc' },
                  { value: 'front', label: 'Giảm xóc trước' },
                  { value: 'full', label: 'Giảm xóc toàn phần' },
                  { value: 'rear', label: 'Giảm xóc sau' },
                ]}
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
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Hình ảnh sản phẩm <span className="text-rose-500">*</span>
              </label>

              {/* Upload Area */}
              <label className="block border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-themePrimary transition-colors cursor-pointer bg-neutral-50 hover:bg-themePrimary/5">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-5xl mb-3">📷</div>
                <p className="text-sm font-semibold text-neutral-900 mb-1">
                  Kéo thả hoặc click để upload ảnh
                </p>
                <p className="text-xs text-neutral-500">Tối đa 10 ảnh, mỗi ảnh không quá 5MB</p>
              </label>

              {/* Preview Images */}
              {formData.media.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.media.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-neutral-200"
                      />
                      {formData.media.mainImage === image && (
                        <div className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                          Ảnh chính
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setMainImage(image)}
                          className="px-3 py-1 bg-white text-xs rounded hover:bg-neutral-100"
                        >
                          Đặt ảnh chính
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Video giới thiệu (tùy chọn)
              </label>
              <input
                type="url"
                onChange={handleVideoInput}
                placeholder="Link YouTube hoặc upload video"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-themePrimary/50 focus:border-themePrimary transition-all"
              />
            </div>
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
              <h3 className="text-lg font-bold text-neutral-900">Địa chỉ</h3>
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
                    {loadingPostCount ? (
                      <span className="text-neutral-500">Đang tải...</span>
                    ) : isFirstPost ? (
                      <span className="text-accent flex items-center gap-2">
                        <span className="line-through text-neutral-400">
                          {POST_FEE.toLocaleString()}₫
                        </span>
                        <span>Miễn phí 🎉</span>
                        <span className="text-xs bg-accent/20 px-2 py-0.5 rounded">
                          Bài {userPostCount + 1}/{FREE_POST_LIMIT}
                        </span>
                      </span>
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
              <Button
                variant="ghost"
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
                {loading
                  ? 'Đang xử lý...'
                  : isFirstPost
                    ? '🎉 Đăng tin miễn phí'
                    : 'Thanh toán & Đăng tin'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreateListing;
