import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui';
import inspectorApi from '../../api/inspectorApi';

const InspectorManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInspectors();
  }, []);

  const fetchInspectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inspectorApi.getAllInspector();

      // Transform API data to match UI structure
      const transformedData = response.data.data.map((inspector) => ({
        id: inspector.id || inspector.inspectorId,
        fullName: inspector.fullName || inspector.name || 'N/A',
        email: inspector.email || 'N/A',
        phone: inspector.phone || inspector.phoneNumber || 'N/A',
        role: 'inspector',
        status: inspector.status || 'active',
        joinDate: inspector.joinDate || inspector.createdAt || 'N/A',
        lastLogin: inspector.lastLogin || inspector.updatedAt || 'N/A',
        totalInspections: inspector.totalInspections || 0,
        rating: inspector.rating || 0,
      }));

      setUsers(transformedData);
    } catch (err) {
      console.error('Error fetching inspectors:', err);
      setError('Không thể tải danh sách chuyên viên kiểm định');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    buyer: 'Người mua',
    seller: 'Người bán',
    inspector: 'Kiểm định viên',
    admin: 'Quản trị viên',
  };

  const statusLabels = {
    active: 'Hoạt động',
    suspended: 'Tạm khóa',
    banned: 'Cấm vĩnh viễn',
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Quản lý chuyên viên kiểm định</h1>
        <p className="text-warmgray-600">Quản lý danh sách và hoạt động của chuyên viên kiểm định</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-danger/5 border border-red-200 rounded-[16px] p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchInspectors}
            className="mt-2 text-danger hover:text-red-800 font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Tổng chuyên viên', value: users.length, color: 'blue' },
              {
                label: 'Hoạt động',
                value: users.filter((u) => u.status === 'active').length,
                color: 'green',
              },
              {
                label: 'Tổng kiểm định',
                value: users.reduce((sum, u) => sum + (u.totalInspections || 0), 0),
                color: 'purple',
              },
              {
                label: 'Đánh giá TB',
                value:
                  users.length > 0
                    ? (users.reduce((sum, u) => sum + (u.rating || 0), 0) / users.length).toFixed(1)
                    : '0.0',
                color: 'yellow',
              },
            ].map((stat, idx) => (
              <div key={idx} className="lux-panel">
                <p className="text-warmgray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="lux-panel mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">Trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="suspended">Tạm khóa</option>
                  <option value="banned">Cấm vĩnh viễn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inspector List */}
          <div className="lux-panel">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-warmgray-50 border-b border-warmgray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                      Chuyên viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                      Số lượng kiểm định
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-warmgray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-warmgray-500">
                        Không tìm thấy chuyên viên kiểm định nào
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-warmgray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-primary-900">{user.fullName}</div>
                            <div className="text-sm text-warmgray-500">{user.email}</div>
                            <div className="text-sm text-warmgray-500">{user.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                            {statusLabels[user.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-primary-900">{user.joinDate}</div>
                          <div className="text-xs text-warmgray-500">Truy cập: {user.lastLogin}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-primary-900">
                            {user.totalInspections || 0} lần
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-primary-900">
                              {user.rating ? user.rating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-gold">⭐</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="text-primary-700 hover:text-primary-900 text-sm font-medium">
                              Xem
                            </button>
                            {user.status === 'active' ? (
                              <button className="text-danger hover:text-red-800 text-sm font-medium">
                                Khóa
                              </button>
                            ) : (
                              <button className="text-success hover:text-green-800 text-sm font-medium">
                                Mở khóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-warmgray-600">
              Hiển thị {filteredUsers.length} / {users.length} chuyên viên
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-warmgray-300 rounded-[16px] hover:bg-warmgray-50">
                Trước
              </button>
              <button className="px-4 py-2 bg-primary-700 text-white rounded-[16px]">1</button>
              <button className="px-4 py-2 border border-warmgray-300 rounded-[16px] hover:bg-warmgray-50">
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InspectorManagement;
