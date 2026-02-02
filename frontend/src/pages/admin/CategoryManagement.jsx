import React, { useState } from 'react';
import { Badge } from '../../components/ui';

const CategoryManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categories] = useState([
    {
      id: 1,
      name: 'Xe đạp địa hình',
      slug: 'xe-dap-dia-hinh',
      description: 'Xe đạp chuyên dụng cho địa hình gồ ghề, đường núi',
      icon: '🚵',
      listingCount: 456,
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Xe đạp đường trường',
      slug: 'xe-dap-duong-truong',
      description: 'Xe đạp chuyên dụng cho đường trường, đua xe',
      icon: '🚴',
      listingCount: 328,
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: 3,
      name: 'Xe đạp Hybrid',
      slug: 'xe-dap-hybrid',
      description: 'Xe đạp đa năng, kết hợp giữa địa hình và đường trường',
      icon: '🚲',
      listingCount: 234,
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: 4,
      name: 'Xe đạp BMX',
      slug: 'xe-dap-bmx',
      description: 'Xe đạp biểu diễn, freestyle',
      icon: '🛴',
      listingCount: 89,
      status: 'active',
      createdDate: '2024-02-10',
    },
    {
      id: 5,
      name: 'Xe đạp thể thao',
      slug: 'xe-dap-the-thao',
      description: 'Xe đạp thể thao chuyên nghiệp',
      icon: '🏁',
      listingCount: 145,
      status: 'inactive',
      createdDate: '2024-03-05',
    },
  ]);

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
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

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
              {categories.map((category) => (
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
                    <span className="text-lg font-bold text-gray-900">{category.listingCount}</span>
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
                        onClick={() => setEditingCategory(category)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Sửa
                      </button>
                      {category.status === 'active' ? (
                        <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                          Tạm dừng
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Kích hoạt
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  defaultValue={editingCategory?.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  defaultValue={editingCategory?.slug}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="xe-dap-dia-hinh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  defaultValue={editingCategory?.description}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Mô tả về danh mục"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon/Emoji</label>
                <input
                  type="text"
                  defaultValue={editingCategory?.icon}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="🚴"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  defaultValue={editingCategory?.status || 'active'}
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
