import React, { useState } from "react";
import { Button, Input, Card, Select } from "../../components/ui";
import authApi from "../../api/authApi";
import cloudinaryApi from "../../api/cloudinaryApi";

const Register = ({ onRegisterSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    role: "buyer",
    firstName: "",
    lastName: "",
    cccdFront: "",
    cccdBack: "",
  });

  const [uploadingImages, setUploadingImages] = useState({
    cccdFront: false,
    cccdBack: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: "buyer", label: "Người mua " },
    { value: "seller", label: "Người bán - Đăng bán xe đạp" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (!file) return;

    // Cập nhật trạng thái đang upload
    setUploadingImages((prev) => ({ ...prev, [name]: true }));

    try {
      const formDataUpload = new FormData();
      // Phải chính xác là "file" (không có "s" ở cuối) vì Backend yêu cầu thế
      formDataUpload.append("file", file);

      // Gọi API tải ảnh
      const uploadResponse =
        await cloudinaryApi.uploadCCCDImage(formDataUpload);

      console.log("Response upload ảnh:", uploadResponse.data);

      // Backend NestJS trả về obj chứa { message, data: { ...Thông_tin_Cloudinary } }
      // Lấy link secure_url của Cloudinary (HTTPS)
      const imageUrl =
        uploadResponse?.data?.data?.secure_url ||
        uploadResponse?.data?.data?.url;

      if (imageUrl) {
        setFormData((prev) => ({
          ...prev,
          [name]: imageUrl, // Lưu URL HTTPS này vào biến formData
        }));
      } else {
        alert("Upload thành công nhưng không lấy được link ảnh!");
      }
    } catch (error) {
      console.error(`Upload ${name} error:`, error);
      alert(
        error?.response?.data?.message || "Tải ảnh thất bại, vui lòng thử lại",
      );
    } finally {
      // Tắt trạng thái đang upload
      setUploadingImages((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      newErrors.firstName = "Vui lòng nhập họ và tên đệm";
      newErrors.lastName = "Vui lòng nhập tên";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Vui lòng nhập tên";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      console.log("Register success:", response.data);

      // Show success message and navigate to login page
      alert("Đăng ký thành công! Vui lòng đăng nhập.");

      // Navigate to login page
      if (onNavigate) {
        onNavigate("login");
      }
    } catch (error) {
      console.error("Register failed:", error.response?.data);

      // Hiển thị lỗi từ backend (ví dụ)
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Đăng ký thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800/5 via-neutral-offwhite to-gold/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10 animate-slide-down">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-5xl">🚴</span>
            <h1 className="text-4xl font-bold gradient-text">
              Bicycle-Marketplace
            </h1>
          </div>
          <p className="text-warmgray-600">Tạo tài khoản mới</p>
        </div>

        {/* Register Form */}
        <Card className="p-10 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Bạn muốn <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, role: "buyer" }));
                  }}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  className={`p-4 rounded-[16px] border-2 transition-all text-left ${
                    formData.role === "buyer"
                      ? "border-primary-500 bg-primary-50"
                      : "border-warmgray-200 hover:border-warmgray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🛒</div>
                  <div className="text-sm font-medium">Người mua</div>
                  {formData.role === "buyer" && (
                    <div className="text-xs text-success mt-1 font-bold">
                      ✓ Đã chọn
                    </div>
                  )}
                </div>
                <div
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, role: "seller" }));
                  }}
                  style={{ cursor: "pointer", userSelect: "none" }}
                  className={`p-4 rounded-[16px] border-2 transition-all text-left ${
                    formData.role === "seller"
                      ? "border-primary-500 bg-primary-50"
                      : "border-warmgray-200 hover:border-warmgray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🏪</div>
                  <div className="text-sm font-medium">Người bán</div>
                  {formData.role === "seller" && (
                    <div className="text-xs text-success mt-1 font-bold">
                      ✓ Đã chọn
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="example@email.com"
              required
            />

            {/* Phone */}
            <Input
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="0912345678"
              required
            />

            {/* Password */}
            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <Input
              label="Họ tên"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="Nguyễn Văn "
              required
            />
            <Input
              label="Tên"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder=" A"
              required
            />

            {formData.role === "seller" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CCCD mặt trước */}
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">
                    CCCD mặt trước *
                  </label>
                  {!formData.cccdFront ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-warmgray-300 rounded-[16px] p-6 text-center hover:border-primary-800 transition-colors cursor-pointer bg-neutral-offwhite hover:bg-primary-800/5 h-32">
                      <input
                        type="file"
                        name="cccdFront"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="text-3xl mb-1">📷</div>
                      <p className="text-sm font-semibold text-primary-900 mb-1">
                        Click để upload
                      </p>
                      <p className="text-xs text-warmgray-500">Tối đa 5MB</p>
                    </label>
                  ) : (
                    <div className="relative group w-full">
                      <img
                        src={formData.cccdFront}
                        alt="CCCD mặt trước"
                        className="w-full h-32 object-cover rounded-[16px] border-2 border-warmgray-200 bg-white"
                      />
                      <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all rounded-[16px] flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              cccdFront: null,
                            }))
                          }
                          className="px-3 py-1.5 bg-danger/80 text-white text-xs font-semibold rounded hover:bg-danger shadow-lg transition-colors"
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* CCCD mặt sau */}
                <div>
                  <label className="block text-sm font-medium text-warmgray-700 mb-2">
                    CCCD mặt sau *
                  </label>
                  {!formData.cccdBack ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-warmgray-300 rounded-[16px] p-6 text-center hover:border-primary-800 transition-colors cursor-pointer bg-neutral-offwhite hover:bg-primary-800/5 h-32">
                      <input
                        type="file"
                        name="cccdBack"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="text-3xl mb-1">📷</div>
                      <p className="text-sm font-semibold text-primary-900 mb-1">
                        Click để upload
                      </p>
                      <p className="text-xs text-warmgray-500">Tối đa 5MB</p>
                    </label>
                  ) : (
                    <div className="relative group w-full">
                      <img
                        src={formData.cccdBack}
                        alt="CCCD mặt sau"
                        className="w-full h-32 object-cover rounded-[16px] border-2 border-warmgray-200 bg-white"
                      />
                      <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all rounded-[16px] flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, cccdBack: null }))
                          }
                          className="px-3 py-1.5 bg-danger/80 text-white text-xs font-semibold rounded hover:bg-danger shadow-lg transition-colors"
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Đăng ký"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-warmgray-600">
              Đã có tài khoản?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate("login");
                }}
                className="text-primary-600 hover:underline font-medium"
              >
                Đăng nhập ngay
              </a>
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warmgray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-warmgray-500">
                  Hoặc đăng ký với
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" className="w-full">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" className="w-full">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate && onNavigate("landing");
            }}
            className="text-sm text-warmgray-600 hover:text-primary-900"
          >
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
