import React, { useEffect, useState } from 'react';
import { Badge } from '../../components/ui';
import adminApi from '../../api/adminApi';

const CategoryManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    status: 'active',
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await adminApi.getFieldCategories();
        const data = response?.data?.data || response?.data || [];
        const mapped = data.map((item) => ({
          id: item?._id || item?.id,
          name: item?.title || item?.name || '—',
          slug: item?.slug || '',
          description: item?.description || '',
          icon: item?.icon || '🚲',
          listingCount: item?.listingCount || 0,
          status: item?.status || 'active',
          createdDate: item?.createdAt
            ? new Date(item.createdAt).toISOString().slice(0, 10)
            : item?.createdDate || '—',
        }));
        setCategories(mapped);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || 'Không thể tải danh mục');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      status: 'active',
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '',
      status: category.status || 'active',
    });
    setShowAddModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !editingCategory) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const payload = {
      title: formData.name.trim(),
    };

    try {
      if (editingCategory) {
        const response = await adminApi.updateFieldCategory(editingCategory.id, payload.title);
        const updated = response?.data?.data || response?.data || payload;
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id
              ? {
                  ...cat,
                  name: updated?.title || updated?.name || payload.title,
                }
              : cat
          )
        );
      } else {
        const response = await adminApi.createFieldCategory(payload.title);
        const created = response?.data?.data || response?.data || payload;
        const newCategory = {
          id: created?._id || created?.id || Date.now(),
          name: created?.title || created?.name || payload.title,
          slug: created?.slug || slugify(payload.title),
          description: created?.description || '',
          icon: created?.icon || '🚲',
          listingCount: created?.listingCount || 0,
          status: created?.status || 'active',
          createdDate: created?.createdAt
            ? new Date(created.createdAt).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        };
        setCategories((prev) => [newCategory, ...prev]);
      }

      setShowAddModal(false);
      setEditingCategory(null);
      resetForm();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Không thể lưu danh mục');
    }
  };

  const handleToggleStatus = async (category) => {
    const nextStatus = category.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.updateFieldCategory(category.id, category.name);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === category.id ? { ...cat, status: nextStatus } : cat))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (category) => {
    try {
      await adminApi.deleteFieldCategory(category.id);
      setCategories((prev) => prev.filter((cat) => cat.id !== category.id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý danh mục</h1>
            <p className="text-gray-600">Quản lý các danh mục sản phẩm trên hệ thống</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tổng danh mục', value: categories.length, color: 'blue' },
          {
            label: 'Đang hoạt động',
            value: categories.filter((c) => c.status === 'active').length,
            color: 'green',
          },
          {
            label: 'Tổng tin đăng',
            value: categories.reduce((sum, c) => sum + c.listingCount, 0),
            color: 'purple',
          },
          {
            label: 'Trung bình',
            value: Math.round(
              categories.reduce((sum, c) => sum + c.listingCount, 0) / categories.length
            ),
            color: 'orange',
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Category List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số tin đăng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                    Đang tải danh mục...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>
                    Chưa có danh mục
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-gray-900">
                        {category.listingCount}
                      </span>
                      <span className="text-sm text-gray-500"> tin</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={category.status === 'active' ? 'success' : 'secondary'}>
                        {category.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{category.createdDate}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Sửa
                        </button>
                        {category.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(category)}
                            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                          >
                            Tạm dừng
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(category)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Kích hoạt
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
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

      {/* Add/Edit Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="xe-dap-dia-hinh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Mô tả về danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon/Emoji</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="🚴"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
