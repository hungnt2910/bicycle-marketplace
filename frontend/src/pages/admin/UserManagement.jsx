import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui';
import adminApi from '../../api/adminApi';

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

  // Mock data - thay thế bằng API call thực tế khi có
  const mockUsers = [
    {
      id: '1',
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      role: 'BUYER',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-02-20',
    },
    {
      id: '2',
      fullName: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0987654321',
      role: 'SELLER',
      status: 'active',
      joinDate: '2024-01-20',
      lastLogin: '2024-02-22',
    },
    {
      id: '3',
      fullName: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0369852147',
      role: 'INSPECTOR',
      status: 'active',
      joinDate: '2024-02-01',
      lastLogin: '2024-02-23',
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: Thay bằng API call thực tế
      // const response = await adminApi.getAllUsers();
      // setUsers(response?.data?.data || []);
      
      // Tạm thời dùng mock data
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng');
      setUsers(mockUsers); // Fallback to mock data
      setLoading(false);
    }
  };

  const roleLabels = {
    BUYER: 'Người mua',
    SELLER: 'Người bán',
    INSPECTOR: 'Kiểm định viên',
    ADMIN: 'Quản trị viên',
  };

  const roleColors = {
    BUYER: 'blue',
    SELLER: 'green',
    INSPECTOR: 'purple',
    ADMIN: 'red',
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
      await adminApi.changeUserRole(selectedUser.id, newRole);
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
      await adminApi.changeUserStatus(selectedUser.id, newStatus);
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
        <p className="text-gray-600">Quản lý vai trò và trạng thái người dùng trong hệ thống</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-gray-600 text-sm">Tổng người dùng</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-gray-600 text-sm">Hoạt động</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-gray-600 text-sm">Người bán</p>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.role === 'SELLER').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-gray-600 text-sm">Kiểm định viên</p>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.role === 'INSPECTOR').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        roleColors[user.role] === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : roleColors[user.role] === 'green'
                            ? 'bg-green-100 text-green-800'
                            : roleColors[user.role] === 'purple'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[user.status] === 'green'
                          ? 'bg-green-100 text-green-800'
                          : statusColors[user.status] === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        disabled={user.role === 'ADMIN'}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Đổi vai trò
                      </button>
                      <button
                        onClick={() => openStatusModal(user)}
                        disabled={user.role === 'ADMIN'}
                        className="px-3 py-1 text-orange-600 hover:bg-orange-50 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-center py-12 text-gray-500">Không tìm thấy người dùng nào</div>
          )}
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thay đổi vai trò</h2>
            <p className="text-gray-600 mb-4">
              Thay đổi vai trò cho: <strong>{selectedUser.fullName}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn vai trò mới
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {Object.keys(roleLabels)
                  .filter((role) => role !== 'ADMIN')
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
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
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
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thay đổi trạng thái</h2>
            <p className="text-gray-600 mb-4">
              Thay đổi trạng thái cho: <strong>{selectedUser.fullName}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn trạng thái mới
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
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
