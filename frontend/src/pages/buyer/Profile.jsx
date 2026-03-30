import React, { useEffect, useState } from 'react';
import authApi from '../../api/authApi';
import userApi from '../../api/userApi';
import { Button } from '../../components/ui';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [wardOptions, setWardOptions] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
    address: '',
    city: 'Ho Chi Minh City',
    district: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const fetchHcmWards = async () => {
      setLoadingWards(true);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/79?depth=2');
        const data = await response.json();

        const wards = (Array.isArray(data?.wards) ? data.wards : [])
          .map((ward) => ward?.name || '')
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, 'vi'));

        setWardOptions(wards);
      } catch (err) {
        console.error('Error fetching HCM wards:', err);
        setWardOptions([]);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchHcmWards();
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

  const openEdit = () => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      avatar: profile.avatar || '',
      address: profile.address || '',
      city: 'Ho Chi Minh City',
      district: profile.district || '',
    });
    setSaveError('');
    setSaveSuccess('');
    setEditOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    const userId = profile._id || profile.id;
    if (!userId) {
      setSaveError('Không xác định được ID người dùng');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      // Chỉ gửi các field nằm trong UpdateUserDto
      const payload = {
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        avatar: form.avatar?.trim() || undefined,
        address: form.address?.trim() || undefined,
        city: 'Ho Chi Minh City',
        district: form.district?.trim() || undefined,
      };

      const result = await userApi.updateUser(userId, payload);
      const updated = result?.data?.data || result?.data || null;
      if (updated) {
        setProfile(updated);
        setSaveSuccess('Đã lưu thay đổi');
        setEditOpen(false);
      } else {
        setSaveError('Không nhận được dữ liệu trả về');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setSaveError(err?.response?.data?.message || 'Không thể lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--lux-gray-50)] flex flex-col items-center justify-center font-sans tracking-wide">
        <div className="w-8 h-8 border-[3px] border-[var(--lux-gray-200)] border-t-[var(--lux-primary-900)] rounded-full animate-spin mb-6"></div>
        <div className="text-[10px] font-bold text-[var(--lux-gray-400)] uppercase tracking-[0.2em]">
          Đang truy xuất hồ sơ...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--lux-gray-50)] flex flex-col items-center justify-center font-sans p-4">
        <div className="text-center space-y-4">
          <div className="text-3xl opacity-50">🔒</div>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-danger">
            {error}
          </div>
          <button
            onClick={loadProfile}
            className="mt-6 text-[11px] font-bold uppercase tracking-[0.15em] border-b border-[var(--lux-gray-800)] pb-1 hover:text-[var(--lux-primary-900)] transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--lux-gray-50)] flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="text-3xl opacity-50">📄</div>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--lux-gray-500)]">
            Không tìm thấy hồ sơ
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

  return (
    <>
      <div className="min-h-screen bg-[var(--lux-gray-50)] bg-opacity-50 py-12 md:py-24 px-4 sm:px-6 font-sans">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* ═══ EXECUTIVE TOP BAR ═══ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold tracking-[0.25em] text-[var(--lux-gray-400)] uppercase mb-1">
                Định danh điện tử
              </span>
              <span className="text-sm font-semibold text-[var(--lux-gray-800)] tracking-tight">
                Hồ sơ cá nhân
              </span>
            </div>
            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] font-extrabold tracking-[0.25em] text-[var(--lux-gray-400)] uppercase mb-1">
                Khóa định danh
              </span>
              <span className="text-xs font-mono text-[var(--lux-gray-600)] tracking-tight">
                {profile._id || profile.id || 'N/A'}
              </span>
            </div>
          </div>

          {/* ═══ LUXURY PROFILE CARD ═══ */}
          <div className="bg-white rounded-[24px] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.06)] border border-[var(--lux-gray-200)]/60 overflow-hidden">
            {/* DOCUMENT HERO */}
            <div className="relative px-8 md:px-20 py-12 lg:py-16 text-center border-b border-[var(--lux-gray-100)]">
              {/* Top Brand Trim */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--lux-primary-900)]"></div>

              <div className="flex justify-center mb-8 relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[var(--lux-gray-50)] rounded-full border-[3px] border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center text-3xl overflow-hidden relative z-10">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[var(--lux-gray-400)] font-light">
                      {fullName ? fullName.charAt(0) : 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-3 z-20 flex gap-2">
                  <span className="px-4 py-1 rounded-full text-[9px] font-extrabold tracking-[0.2em] uppercase bg-white border border-[var(--lux-gray-200)] shadow-sm text-[var(--lux-primary-900)]">
                    {profile.role || 'BUYER'}
                  </span>
                  <span
                    className={`px-4 py-1 rounded-full text-[9px] font-extrabold tracking-[0.2em] uppercase bg-white border border-[var(--lux-gray-200)] shadow-sm ${profile.status === 'active' ? 'text-[var(--lux-primary-600)]' : 'text-[var(--lux-gray-500)]'}`}
                  >
                    {profile.status === 'active' ? 'HOẠT ĐỘNG' : profile.status || 'CHƯA XÁC NHẬN'}
                  </span>
                  {profile.verifiedRoleSeller && (
                    <span className="px-4 py-1 rounded-full text-[9px] font-extrabold tracking-[0.2em] uppercase bg-white border border-[var(--lux-gray-200)] shadow-sm text-[var(--lux-primary-700)]">
                      Seller Verified
                    </span>
                  )}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--lux-primary-900)] tracking-tight mb-3 mt-6">
                {fullName || 'Người dùng hệ thống'}
              </h1>
              <p className="text-[13px] font-medium tracking-widest text-[var(--lux-gray-500)]">
                {profile.email}
              </p>
              {profile.verifiedEmail && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--lux-primary-600)]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Email đã xác thực
                </div>
              )}
            </div>

            {/* TWO-COLUMN EXECUTIVE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--lux-gray-100)]">
              {/* LEFT SHEET: PERSONAL DATA */}
              <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 space-y-14 bg-white">
                {/* CONTACT SECTION */}
                <section>
                  <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6 border-b border-[var(--lux-gray-100)] pb-4">
                    Trao đổi & Liên lạc
                  </h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Định danh Email
                      </dt>
                      <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)] max-w-[60%] text-right overflow-hidden text-ellipsis whitespace-nowrap">
                        {profile.email}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Kênh điện thoại
                      </dt>
                      <div className="text-right">
                        <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)]">
                          {profile.phone || '--'}
                        </dd>
                        {profile.verifiedPhone && (
                          <div className="text-[10px] font-bold text-[var(--lux-primary-600)] uppercase tracking-wider mt-1">
                            Đã xác thực
                          </div>
                        )}
                      </div>
                    </div>
                  </dl>
                </section>

                {/* ADDRESS SECTION */}
                <section>
                  <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6 border-b border-[var(--lux-gray-100)] pb-4">
                    Tọa độ vật lý
                  </h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Cấp Tỉnh / Thành phố
                      </dt>
                      <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)]">
                        {profile.city || '--'}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[var(--lux-gray-50)]">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)]">
                        Cấp Quận / Huyện
                      </dt>
                      <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)]">
                        {profile.district || '--'}
                      </dd>
                    </div>
                    <div className="flex justify-between items-start py-3">
                      <dt className="text-[13px] font-medium text-[var(--lux-gray-500)] mt-0.5">
                        Địa chỉ chi tiết
                      </dt>
                      <dd className="text-[14px] font-semibold text-[var(--lux-gray-900)] text-right max-w-[60%] leading-relaxed">
                        {profile.address || '--'}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              {/* RIGHT SHEET: SYSTEM METRICS & ACTIONS */}
              <div className="lg:col-span-5 p-8 sm:p-12 md:p-16 bg-[var(--lux-gray-50)]/50 flex flex-col h-full">
                <div className="flex-1 space-y-12">
                  {/* ACCOUNT METRICS */}
                  <section>
                    <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6">
                      Thông số hệ thống
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[var(--lux-gray-200)]/60 shadow-sm">
                        <span className="text-[12.5px] font-medium text-[var(--lux-gray-500)]">
                          Ngày khởi tạo
                        </span>
                        <span className="text-[13px] font-semibold text-[var(--lux-gray-900)]">
                          {profile.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* VERIFICATION & STATUS */}
                  <section>
                    <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6">
                      Xác thực & Quyền
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-[var(--lux-gray-200)]/60 shadow-sm flex items-center justify-between">
                        <span className="text-[12.5px] font-medium text-[var(--lux-gray-600)]">
                          Email
                        </span>
                        <span
                          className={`text-[11px] font-extrabold tracking-[0.15em] uppercase px-3 py-1 rounded-full ${profile.verifiedEmail ? 'bg-success/10 text-green-800' : 'bg-warmgray-200 text-warmgray-700'}`}
                        >
                          {profile.verifiedEmail ? 'ĐÃ XÁC THỰC' : 'CHƯA XÁC THỰC'}
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[var(--lux-gray-200)]/60 shadow-sm flex items-center justify-between">
                        <span className="text-[12.5px] font-medium text-[var(--lux-gray-600)]">
                          Điện thoại
                        </span>
                        <span
                          className={`text-[11px] font-extrabold tracking-[0.15em] uppercase px-3 py-1 rounded-full ${profile.verifiedPhone ? 'bg-success/10 text-green-800' : 'bg-warmgray-200 text-warmgray-700'}`}
                        >
                          {profile.verifiedPhone ? 'ĐÃ XÁC THỰC' : 'CHƯA XÁC THỰC'}
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[var(--lux-gray-200)]/60 shadow-sm flex items-center justify-between">
                        <span className="text-[12.5px] font-medium text-[var(--lux-gray-600)]">
                          Quyền seller
                        </span>
                        <span
                          className={`text-[11px] font-extrabold tracking-[0.15em] uppercase px-3 py-1 rounded-full ${profile.verifiedRoleSeller ? 'bg-primary-900/10 text-[var(--lux-primary-900)]' : 'bg-warmgray-200 text-warmgray-700'}`}
                        >
                          {profile.verifiedRoleSeller ? 'ĐÃ XÁC MINH' : 'CHƯA XÁC MINH'}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* REPUTATION METRICS */}
                  {profile.reputation && (
                    <section>
                      <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-6">
                        Chỉ số tín nhiệm
                      </h3>
                      <div className="bg-white p-5 rounded-xl border border-[var(--lux-gray-200)]/60 shadow-sm space-y-5">
                        <div className="text-center pb-5 border-b border-[var(--lux-gray-100)]">
                          <div className="text-4xl font-black text-[var(--lux-primary-900)] tracking-tighter">
                            {profile.reputation.rating?.toFixed(1) || '0'}
                          </div>
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--lux-gray-400)] mt-1">
                            Hạng tổng hợp
                          </div>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="font-medium text-[var(--lux-gray-500)]">
                            Tổng đánh giá
                          </span>
                          <span className="font-bold text-[var(--lux-gray-900)]">
                            {profile.reputation.totalReviews || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="font-medium text-[var(--lux-gray-500)]">
                            Giao dịch thành công
                          </span>
                          <span className="font-bold text-[var(--lux-gray-900)]">
                            {profile.reputation.totalSales || 0}
                          </span>
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* ACTION PANEL */}
                <section className="mt-12 lg:mt-auto pt-8 border-t border-[var(--lux-gray-200)]/50">
                  <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--lux-gray-400)] uppercase mb-5">
                    Bảo mật & Thao tác
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={openEdit}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[var(--lux-gray-200)] bg-white hover:border-[var(--lux-primary-900)] hover:shadow-sm transition-all group"
                    >
                      <span className="text-[11.5px] font-extrabold tracking-[0.15em] uppercase text-[var(--lux-gray-800)] group-hover:text-[var(--lux-primary-900)] pl-1">
                        Chỉnh sửa thông tin
                      </span>
                      <span className="text-[var(--lux-gray-400)] group-hover:text-[var(--lux-primary-900)] pr-1">
                        →
                      </span>
                    </button>
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-between p-3.5 rounded-xl shadow-none hover:shadow-md transition-all group py-[14px]"
                    >
                      <span
                        className="text-[11.5px] font-extrabold tracking-[0.15em] uppercase pl-1 bg-transparent border-0 text-inherit text-left flex-1"
                        style={{ backgroundColor: 'transparent' }}
                      >
                        Đổi mật khẩu
                      </span>
                      <span className="pr-1">→</span>
                    </Button>
                  </div>
                </section>
              </div>
            </div>

            {/* SECURITY WATERMARK FOOTER */}
            <div className="bg-[var(--lux-primary-900)] flex items-center justify-center p-4">
              <span className="text-[9px] font-extrabold tracking-[0.3em] text-[white] opacity-60 uppercase">
                Identity Verified by Bicycle Marketplace
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[20px] w-full max-w-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--lux-primary-900)]">Chỉnh sửa hồ sơ</h2>
                <p className="text-sm text-[var(--lux-gray-600)]">Cập nhật thông tin cá nhân</p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="text-[var(--lux-gray-500)] hover:text-[var(--lux-primary-900)]"
              >
                ✕
              </button>
            </div>

            {saveError && (
              <div className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="text-green-700 text-sm bg-success/10 border border-success/30 rounded-lg px-3 py-2">
                {saveSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-[var(--lux-gray-700)]">
                Họ
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--lux-primary-800)]"
                  placeholder="Nhập họ"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--lux-gray-700)]">
                Tên
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--lux-primary-800)]"
                  placeholder="Nhập tên"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--lux-gray-700)]">
                Số điện thoại
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--lux-primary-800)]"
                  placeholder="+84..."
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--lux-gray-700)]">
                Ảnh đại diện (URL)
                <input
                  name="avatar"
                  value={form.avatar}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--lux-primary-800)]"
                  placeholder="https://..."
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--lux-gray-700)]">
                Tỉnh / Thành phố
                <input
                  name="city"
                  value="Ho Chi Minh City"
                  disabled
                  className="border rounded-lg px-3 py-2 bg-[var(--lux-gray-50)] text-[var(--lux-gray-700)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--lux-gray-700)]">
                Quận / Huyện (TP.HCM)
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--lux-primary-800)]"
                >
                  <option value="">Chọn quận / huyện</option>
                  {loadingWards && <option disabled>Đang tải danh sách...</option>}
                  {!loadingWards &&
                    wardOptions.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--lux-gray-700)] sm:col-span-2">
                Địa chỉ chi tiết
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--lux-primary-800)]"
                  placeholder="123 Main Street"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-lg border border-[var(--lux-gray-200)] text-[var(--lux-gray-700)] hover:bg-[var(--lux-gray-50)]"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[var(--lux-primary-900)] text-white font-semibold hover:bg-[var(--lux-primary-800)] disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
