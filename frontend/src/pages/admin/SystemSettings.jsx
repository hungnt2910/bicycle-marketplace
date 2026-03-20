import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    category: '',
  });

  // Load settings and categories on mount
  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const normalizeSettings = (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.flatMap((item) => {
      const nested = Array.isArray(item?.name_value)
        ? item.name_value.map((nestedItem) => ({
            key: nestedItem?.key || '',
            value: nestedItem?.value ?? '',
            description: nestedItem?.description || '',
            category: nestedItem?.category || null,
            _groupId: item?._id,
          }))
        : [];

      const flat = item?.key
        ? [
            {
              key: item?.key || '',
              value: item?.value ?? '',
              description: item?.description || '',
              category: item?.category || null,
              _id: item?._id,
            },
          ]
        : [];

      return [...nested, ...flat];
    });
  };

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getSystemSettings();
      const data = response?.data?.data || response?.data || [];
      setSettings(normalizeSettings(data));
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Không thể tải cài đặt hệ thống');
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminApi.getFieldCategories();
      const data = response?.data?.data || response?.data || [];
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      category: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingSetting(null);
    setShowModal(true);
  };

  const openEditModal = (setting) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key || '',
      value: setting.value !== undefined && setting.value !== null ? String(setting.value) : '',
      description: setting.description || '',
      category: setting.category?._id || setting.category || '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const keyValue = String(formData.key || '').trim();
    const settingValue = String(formData.value || '').trim();

    if (!keyValue || !settingValue) {
      setError('Key và Value là bắt buộc');
      return;
    }

    const payload = {
      key: keyValue,
      originalKey: editingSetting?.key || keyValue,
      _id: editingSetting?._id || null,
      groupId: editingSetting?._groupId || null,
      value: settingValue,
      description: String(formData.description || '').trim(),
      category: formData.category || null,
    };

    const isNotFoundMessage = (response) =>
      response?.data?.message === 'System setting not found';

    const saveByUpdateWithRetry = async () => {
      const baseUpdateData = {
        key: keyValue,
        originalKey: editingSetting?.key || keyValue,
        value: settingValue,
        description: String(formData.description || '').trim(),
        category: formData.category || null,
      };

      const attempts = [
        {
          ...baseUpdateData,
          _id: editingSetting?._id || null,
          groupId: editingSetting?._groupId || null,
        },
        {
          ...baseUpdateData,
          _id: null,
          groupId: null,
        },
        {
          ...baseUpdateData,
          key: editingSetting?.key || keyValue,
          originalKey: editingSetting?.key || keyValue,
          _id: null,
          groupId: null,
        },
      ];

      for (const attempt of attempts) {
        const response = await adminApi.updateSystemSetting(attempt);
        if (!isNotFoundMessage(response)) {
          return response;
        }
      }

      // FE-only fallback for legacy grouped settings:
      // if update API cannot resolve target, recreate the setting with new values.
      const fallbackKey = editingSetting?.key || keyValue;
      if (fallbackKey) {
        const deleteCandidates = [fallbackKey, String(fallbackKey).trim(), editingSetting?.key]
          .map((item) => (item === undefined || item === null ? '' : String(item)))
          .filter(Boolean)
          .filter((item, index, arr) => arr.indexOf(item) === index);

        let removed = false;

        for (const deleteKey of deleteCandidates) {
          await adminApi.deleteSystemSetting(deleteKey);

          const verifyResponse = await adminApi.getSystemSettings();
          const verifyData = verifyResponse?.data?.data || verifyResponse?.data || [];
          const verifySettings = normalizeSettings(verifyData);

          const stillExists = verifySettings.some(
            (item) => String(item?.key || '').trim() === String(fallbackKey).trim(),
          );

          if (!stillExists) {
            removed = true;
            break;
          }
        }

        if (!removed) {
          throw new Error('Không thể cập nhật cài đặt lúc này, vui lòng thử lại');
        }

        const recreated = await adminApi.createSystemSetting({
          key: fallbackKey,
          value: settingValue,
          description: String(formData.description || '').trim(),
          category: formData.category || null,
        });

        if (recreated?.data?.message === 'Key already exists') {
          throw new Error('Key đã tồn tại');
        }

        return recreated;
      }

      throw new Error('Không tìm thấy cài đặt để cập nhật');
    };

    try {
      if (editingSetting) {
        await saveByUpdateWithRetry();
      } else {
        const response = await adminApi.createSystemSetting(payload);
        if (response?.data?.message === 'Key already exists') {
          throw new Error('Key đã tồn tại');
        }
      }

      await fetchSettings();

      setShowModal(false);
      setEditingSetting(null);
      resetForm();
      setError('');
    } catch (err) {
      console.error('Error saving setting:', err);
      setError(err.response?.data?.message || err.message || 'Không thể lưu cài đặt');
    }
  };

  const handleDelete = async (key) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cài đặt này?')) return;

    try {
      await adminApi.deleteSystemSetting(key);
      await fetchSettings();
    } catch (err) {
      console.error('Error deleting setting:', err);
      setError(err.response?.data?.message || 'Không thể xóa cài đặt');
    }
  };

  const uncategorizedCount = settings.filter((item) => !item?.category?.title).length;

  const formatValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value.toLocaleString('vi-VN');
    return String(value);
  };

  const sortedSettings = [...settings].sort((a, b) => (a.key || '').localeCompare(b.key || ''));

  return (
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Cài đặt hệ thống</h1>
            <p className="text-warmgray-600">Quản lý các thông số cấu hình hệ thống</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-primary-700 text-white px-6 py-3 rounded-[16px] hover:bg-primary-800 font-medium"
          >
            + Thêm cài đặt
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-danger/5 border border-red-200 text-danger px-4 py-3 rounded-[16px]">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Tổng cài đặt</p>
          <p className="text-2xl font-bold text-primary-900">{settings.length}</p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Cài đặt đã gán danh mục</p>
          <p className="text-2xl font-bold text-primary-900">{settings.length - uncategorizedCount}</p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Chưa gán danh mục</p>
          <p className="text-2xl font-bold text-primary-900">{uncategorizedCount}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Settings Table */}
      {!loading && (
        <div className="lux-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-warmgray-50 border-b border-warmgray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-700 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-700 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-700 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-700 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-warmgray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray-200 bg-white">
                {sortedSettings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-warmgray-500">
                      Chưa có cài đặt nào
                    </td>
                  </tr>
                ) : (
                  sortedSettings.map((setting, index) => (
                    <tr key={`${setting.key}-${index}`} className="hover:bg-warmgray-50/60">
                      <td className="px-4 py-4 align-top">
                        <code className="px-2 py-1 bg-primary-800/5 text-primary-800 rounded text-sm font-mono">
                          {setting.key}
                        </code>
                      </td>
                      <td className="px-4 py-4 align-top text-primary-900 font-semibold whitespace-nowrap">
                        {formatValue(setting.value)}
                      </td>
                      <td className="px-4 py-4 align-top text-warmgray-700 max-w-[420px]">
                        <p className="line-clamp-2" title={setting.description || ''}>
                          {setting.description || '--'}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-warmgray-700 whitespace-nowrap">
                        {setting.category?.title || 'Không có danh mục'}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(setting)}
                            className="px-3 py-2 text-primary-700 hover:bg-primary-800/5 rounded-[12px] font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(setting.key)}
                            className="px-3 py-2 text-danger hover:bg-danger/5 rounded-[12px] font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-warmgray-200">
              <h2 className="text-2xl font-bold text-primary-900">
                {editingSetting ? 'Chỉnh sửa cài đặt' : 'Thêm cài đặt mới'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Key <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="key"
                  value={formData.key}
                  onChange={handleFormChange}
                  disabled={editingSetting}
                  className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600 disabled:bg-warmgray-100 font-mono"
                  placeholder="SETTING_KEY"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">
                  Value <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
                  placeholder="Giá trị cài đặt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
                  placeholder="Mô tả về cài đặt này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">Danh mục</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-[12px] hover:bg-emerald-700 font-semibold"
                >
                  {editingSetting ? 'OK - Lưu thay đổi' : 'OK - Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSetting(null);
                    resetForm();
                    setError('');
                  }}
                  className="flex-1 bg-warmgray-200 text-warmgray-700 py-2.5 rounded-[12px] hover:bg-warmgray-300 font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
