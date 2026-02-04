import React, { useEffect, useState } from 'react';
import authApi from '../../api/authApi';
import { Button } from '../../components/ui';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await authApi.profile();
      console.log('Profile API response:', result);

      if (result.status === 200 && result.data.data) {
        setProfile(result.data.data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-red-900 font-bold mb-2">Lỗi</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-neutral-600">Không có thông tin profile</p>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-black rounded-lg p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                ''
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{fullName || 'User'}</h1>
              <p className="text-primary-100 text-lg">{profile.email}</p>
              <div className="mt-2 flex gap-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  {profile.role?.toUpperCase() || 'BUYER'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.status === 'active'
                      ? 'bg-green-500/30 text-green-100'
                      : 'bg-yellow-500/30 text-yellow-100'
                  }`}
                >
                  {profile.status === 'active' ? '✓ Hoạt động' : 'Chưa xác nhận'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Email</label>
                  <p className="text-neutral-900">{profile.email}</p>
                  {profile.verifiedEmail && (
                    <span className="text-sm text-green-600 font-medium">✓ Đã xác nhận</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">
                    Số điện thoại
                  </label>
                  <p className="text-neutral-900">{profile.phone || 'Chưa cập nhật'}</p>
                  {profile.verifiedPhone && (
                    <span className="text-sm text-green-600 font-medium">✓ Đã xác nhận</span>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Địa chỉ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">
                    Thành phố
                  </label>
                  <p className="text-neutral-900">{profile.city || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">
                    Quận/Huyện
                  </label>
                  <p className="text-neutral-900">{profile.district || 'Chưa cập nhật'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">
                    Địa chỉ đầy đủ
                  </label>
                  <p className="text-neutral-900">{profile.address || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Details */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Trạng thái tài khoản</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span className="text-neutral-600">Trạng thái</span>
                  <span
                    className={`font-semibold ${
                      profile.status === 'active'
                        ? 'text-green-600'
                        : profile.status === 'suspended'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {profile.status === 'active' && '✓ Hoạt động'}
                    {profile.status === 'suspended' && '⚠ Tạm khóa'}
                    {profile.status === 'banned' && '✕ Bị khóa'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span className="text-neutral-600">Vai trò</span>
                  <span className="font-semibold text-primary-600">
                    {profile.role?.toUpperCase()}
                  </span>
                </div>
                {/* <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Email xác nhận</span>
                  <span
                    className={`font-semibold ${profile.verifiedEmail ? 'text-green-600' : 'text-neutral-600'}`}
                  >
                    {profile.verifiedEmail ? '✓ Có' : '✕ Không'}
                  </span>
                </div> */}
              </div>
            </div>

            {/* Reputation (if seller) */}
            {profile.reputation && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Uy tín & Đánh giá</h3>
                <div className="space-y-3">
                  <div className="text-center pb-3 border-b border-neutral-200">
                    <div className="text-3xl font-bold text-primary-600">
                      {profile.reputation.rating?.toFixed(1) || '0'}
                    </div>
                    <div className="text-sm text-neutral-600">Xếp hạng</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tổng đánh giá</span>
                    <span className="font-semibold">{profile.reputation.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tổng giao dịch</span>
                    <span className="font-semibold">{profile.reputation.totalSales || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Created */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Thông tin tài khoản</h3>
              <div className="text-sm">
                <label className="text-neutral-600 block mb-1">Ngày tạo</label>
                <p className="font-semibold text-neutral-900">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-8 flex gap-4 justify-center">
          <button className="bg-neutral-300 hover:bg-neutral-400 text-neutral-900 font-semibold py-3 px-8 rounded-lg transition">
            Chỉnh sửa thông tin
          </button>
          <Button
            variant="primary"
            className="font-semibold py-3 px-8 rounded-lg transition rounded-xl"
          >
            Đổi mật khẩu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
