import axiosClient from '../services/axiosClient';

const bicycleApi = {
  // Create - Tạo mới bicycle
  createBicycle: (data) => axiosClient.post('/api/v1/bicycles/create-bicycle', data),

  // Read - Lấy tất cả bicycles
  getAllBicycles: () => axiosClient.post('/api/v1/bicycles/get-all-bicycles'),

  // Read - Lấy bicycle theo ID
  getBicycleById: (id) => axiosClient.post('/api/v1/bicycles/get-bicycle-by-id', { id }),

  // Update - Cập nhật bicycle
  updateBicycle: (id, data) =>
    axiosClient.patch('/api/v1/bicycles/update-bicycle', { id, ...data }),

  // Delete - Xóa bicycle
  deleteBicycle: (id) => axiosClient.delete('/api/v1/bicycles/delete-bicycle', { data: { id } }),

  // Search - Tìm kiếm bicycles
  searchBicycles: (keyword) => axiosClient.post('/api/v1/bicycles/search-bicycles', { keyword }),

  // Filter - Lọc bicycles
  filterBicycles: (filters) => axiosClient.post('/api/v1/bicycles/filter-bicycles', filters),

  // Seller specific - Lấy bicycles của seller
  getMyBicycles: (sellerId) =>
    axiosClient.post('/api/v1/bicycles/get-all-bicycles').then((res) => {
      // Filter by sellerId on client side
      if (res.data?.data) {
        return {
          ...res.data,
          data: res.data.data.filter((bike) => bike.sellerId === sellerId),
        };
      }
      return res.data;
    }),
};

export default bicycleApi;
