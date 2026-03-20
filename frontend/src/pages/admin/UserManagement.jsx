import React, { useState, useEffect } from 'react';
import userApi from '../../api/userApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userApi.getAllUsers();
      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || [];

      const mappedUsers = data.map((item) => ({
        id: item?._id || item?.id,
        fullName:
          `${item?.firstName || ''} ${item?.lastName || ''}`.trim() ||
          item?.profile?.fullName ||
          item?.fullName ||
          'N/A',
        email: item?.email || 'N/A',
        phone: item?.phone || item?.profile?.phone || 'N/A',
        role: String(item?.role || '').toLowerCase(),
        status: String(item?.status || 'active').toLowerCase(),
        joinDate: item?.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '--',
        lastLogin: item?.updatedAt ? new Date(item.updatedAt).toLocaleDateString('vi-VN') : '--',
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng');
      setUsers([]);
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

  const roleColors = {
    buyer: 'blue',
    seller: 'green',
    inspector: 'purple',
    admin: 'red',
  };

  const statusLabels = {
    active: 'Hoạt động',
    suspended: 'Tạm khóa',
    banned: 'Cấm vĩnh viễn',
  };

  const statusColors = {
    active: 'green',
    suspended: 'yellow',
    banned: 'red',
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setShowStatusModal(true);
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await userApi.updateUser(selectedUser.id, { role: newRole });
      setUsers((prev) =>
        prev.map((user) => (user.id === selectedUser.id ? { ...user, role: newRole } : user))
      );
      setShowRoleModal(false);
      setSelectedUser(null);
      setError('');
    } catch (err) {
      console.error('Error changing role:', err);
      setError(err.response?.data?.message || 'Không thể thay đổi vai trò');
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedUser || !newStatus) return;

    try {
      await userApi.updateUser(selectedUser.id, { status: newStatus });
      setUsers((prev) =>
        prev.map((user) => (user.id === selectedUser.id ? { ...user, status: newStatus } : user))
      );
      setShowStatusModal(false);
      setSelectedUser(null);
      setError('');
    } catch (err) {
      console.error('Error changing status:', err);
      setError(err.response?.data?.message || 'Không thể thay đổi trạng thái');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="dash-content">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Quản lý người dùng</h1>
        <p className="text-warmgray-600">Quản lý vai trò và trạng thái người dùng trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-6 bg-danger/5 border border-red-200 text-danger px-4 py-3 rounded-[16px]">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Tổng người dùng</p>
          <p className="text-2xl font-bold text-primary-900">{users.length}</p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Hoạt động</p>
          <p className="text-2xl font-bold text-success">
            {users.filter((u) => u.status === 'active').length}
          </p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Người bán</p>
          <p className="text-2xl font-bold text-primary-900">
            {users.filter((u) => u.role === 'seller').length}
          </p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Kiểm định viên</p>
          <p className="text-2xl font-bold text-primary-900">
            {users.filter((u) => u.role === 'inspector').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="lux-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Vai trò</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="all">Tất cả vai trò</option>
              {Object.keys(roleLabels).map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.keys(statusLabels).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="lux-panel overflow-hidden">
          <table className="w-full">
            <thead className="bg-warmgray-50 border-b border-warmgray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-warmgray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-primary-900">{user.fullName}</p>
                      <p className="text-sm text-warmgray-600">{user.email}</p>
                      <p className="text-sm text-warmgray-500">{user.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        roleColors[user.role] === 'blue'
                          ? 'bg-primary-800/10 text-primary-900'
                          : roleColors[user.role] === 'green'
                            ? 'bg-success/10 text-green-800'
                            : roleColors[user.role] === 'purple'
                              ? 'bg-info/10 text-purple-800'
                              : 'bg-danger/10 text-red-800'
                      }`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[user.status] === 'green'
                          ? 'bg-success/10 text-green-800'
                          : statusColors[user.status] === 'yellow'
                            ? 'bg-gold/10 text-yellow-800'
                            : 'bg-danger/10 text-red-800'
                      }`}
                    >
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-warmgray-600">{user.joinDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        disabled={user.role === 'admin'}
                        className="px-3 py-1 text-primary-700 hover:bg-primary-800/5 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Đổi vai trò
                      </button>
                      <button
                        onClick={() => openStatusModal(user)}
                        disabled={user.role === 'admin'}
                        className="px-3 py-1 text-gold hover:bg-gold/5 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Đổi trạng thái
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-warmgray-500">Không tìm thấy người dùng nào</div>
          )}
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-primary-900 mb-4">Thay đổi vai trò</h2>
            <p className="text-warmgray-600 mb-4">
              Thay đổi vai trò cho: <strong>{selectedUser.fullName}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Chọn vai trò mới
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
              >
                {Object.keys(roleLabels)
                  .filter((role) => role !== 'admin')
                  .map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleChangeRole}
                className="flex-1 bg-primary-700 text-white py-2 rounded-[16px] hover:bg-primary-800 font-medium"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-warmgray-200 text-warmgray-700 py-2 rounded-[16px] hover:bg-warmgray-300 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-primary-900 mb-4">Thay đổi trạng thái</h2>
            <p className="text-warmgray-600 mb-4">
              Thay đổi trạng thái cho: <strong>{selectedUser.fullName}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Chọn trạng thái mới
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
              >
                {Object.keys(statusLabels).map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleChangeStatus}
                className="flex-1 bg-gold text-white py-2 rounded-[16px] hover:bg-gold font-medium"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-warmgray-200 text-warmgray-700 py-2 rounded-[16px] hover:bg-warmgray-300 font-medium"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
