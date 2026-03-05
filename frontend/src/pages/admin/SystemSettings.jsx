import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui';
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

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getSystemSettings();
      const data = response?.data?.data || response?.data || [];
      setSettings(data);
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
      value: setting.value || '',
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

    if (!formData.key.trim() || !formData.value.trim()) {
      setError('Key và Value là bắt buộc');
      return;
    }

    const payload = {
      key: formData.key.trim(),
      value: formData.value.trim(),
      description: formData.description.trim(),
      category: formData.category || null,
    };

    try {
      if (editingSetting) {
        const response = await adminApi.updateSystemSetting(payload);
        const updated = response?.data?.data || response?.data || payload;
        setSettings((prev) =>
          prev.map((setting) =>
            setting.key === editingSetting.key ? { ...setting, ...updated } : setting
          )
        );
      } else {
        const response = await adminApi.createSystemSetting(payload);
        const created = response?.data?.data || response?.data || payload;
        setSettings((prev) => [created, ...prev]);
      }

      setShowModal(false);
      setEditingSetting(null);
      resetForm();
      setError('');
    } catch (err) {
      console.error('Error saving setting:', err);
      setError(err.response?.data?.message || 'Không thể lưu cài đặt');
    }
  };

  const handleDelete = async (key) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cài đặt này?')) return;

    try {
      await adminApi.deleteSystemSetting(key);
      setSettings((prev) => prev.filter((setting) => setting.key !== key));
    } catch (err) {
      console.error('Error deleting setting:', err);
      setError(err.response?.data?.message || 'Không thể xóa cài đặt');
    }
  };

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    const categoryName = setting.category?.title || 'Không có danh mục';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(setting);
    return acc;
  }, {});

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
          <p className="text-warmgray-600 text-sm">Danh mục</p>
          <p className="text-2xl font-bold text-primary-900">{Object.keys(groupedSettings).length}</p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Cài đặt danh mục</p>
          <p className="text-2xl font-bold text-primary-900">{categories.length}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Settings List by Category */}
      {!loading && (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([categoryName, categorySettings]) => (
            <div key={categoryName} className="lux-panel">
              <div className="p-4 bg-warmgray-50 border-b border-warmgray-200">
                <h3 className="text-lg font-bold text-primary-900">{categoryName}</h3>
                <p className="text-sm text-warmgray-600">{categorySettings.length} cài đặt</p>
              </div>
              <div className="divide-y divide-gray-200">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="p-4 hover:bg-warmgray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="px-2 py-1 bg-primary-800/5 text-primary-800 rounded text-sm font-mono">
                            {setting.key}
                          </code>
                        </div>
                        <p className="text-primary-900 font-medium mb-1">{setting.value}</p>
                        {setting.description && (
                          <p className="text-sm text-warmgray-600">{setting.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditModal(setting)}
                          className="px-4 py-2 text-primary-700 hover:bg-primary-800/5 rounded-[16px] font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(setting.key)}
                          className="px-4 py-2 text-danger hover:bg-danger/5 rounded-[16px] font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
                  className="flex-1 bg-primary-700 text-white py-2 rounded-[16px] hover:bg-primary-800 font-medium"
                >
                  {editingSetting ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSetting(null);
                    resetForm();
                    setError('');
                  }}
                  className="flex-1 bg-warmgray-200 text-warmgray-700 py-2 rounded-[16px] hover:bg-warmgray-300 font-medium"
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
