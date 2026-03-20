import axiosClient from '../services/axiosClient';

const userApi = {
  // Lấy thông tin user theo ID
  getUserById: (userId) => axiosClient.post(`/api/v1/users/${userId}`),

  // Lấy tất cả users (admin)
  getAllUsers: () => axiosClient.get('/api/v1/users'),

  // Cập nhật thông tin user
  updateUser: (userId, data) => axiosClient.post(`/api/v1/users/update/${userId}`, data),
};

export default userApi;
