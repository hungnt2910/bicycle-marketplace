import axiosClient from '../services/axiosClient';

const userApi = {
  // Lấy thông tin user theo ID
  getUserById: (userId) => axiosClient.post(`/api/v1/users/${userId}`),

  // Lấy tất cả users (admin)
  getAllUsers: () => axiosClient.get('/api/v1/users'),
};

export default userApi;
