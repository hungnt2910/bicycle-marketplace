import axiosClient from '../services/axiosClient';

const adminApi = {
  // ==================== CATEGORY MANAGEMENT ====================
  // Tạo category mới cho system setting
  createFieldCategory: (title) =>
    axiosClient.post('/api/v1/admin/create-field-category', { title }),

  // Lấy danh sách tất cả field categories
  getFieldCategories: () => axiosClient.get('/api/v1/admin/field-categories'),

  // Cập nhật field category
  updateFieldCategory: (id, title) =>
    axiosClient.patch(`/api/v1/admin/update-field-category/${id}`, { id, title }),

  // Xóa field category
  deleteFieldCategory: (id) => axiosClient.delete(`/api/v1/admin/delete-field-category/${id}`),

  // ==================== SYSTEM SETTINGS ====================
  // Tạo system setting mới
  createSystemSetting: (data) => axiosClient.post('/api/v1/admin/system-setting', data),

  // Lấy tất cả system settings
  getSystemSettings: () => axiosClient.get('/api/v1/admin/system-settings'),

  // Cập nhật system setting
  updateSystemSetting: (dataUpdate) =>
    axiosClient.patch('/api/v1/admin/system-setting-update', dataUpdate),

  // Xóa system setting
  deleteSystemSetting: (key) => axiosClient.delete(`/api/v1/admin/system-setting/${key}`),

  // ==================== USER MANAGEMENT ====================
  // Xác minh và cấp quyền seller cho user cụ thể (admin duyệt hồ sơ)
  verifySeller: (userId) => axiosClient.post(`/api/v1/auth/verify-seller/${userId}`),

  // ==================== ESCROW CONTROL (ADMIN) ====================
  // Ép giải ngân escrow cho seller
  releaseEscrow: (transactionId) => axiosClient.post(`/api/v1/escrow/${transactionId}/release`),

  // Ép hoàn escrow về buyer
  refundEscrow: (transactionId) => axiosClient.post(`/api/v1/escrow/${transactionId}/refund`),

  // Danh sách các giao dịch đang bị giữ escrow
  getEscrowHeld: () =>
    axiosClient.get('/api/v1/escrow/held', {
      params: { _t: Date.now() },
      headers: {
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache',
      },
    }),

  // Thống kê tổng quan escrow
  getEscrowStatistics: () =>
    axiosClient.get('/api/v1/escrow/statistics', {
      params: { _t: Date.now() },
      headers: {
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache',
      },
    }),

  // ==================== REPORTING ====================
  // Tổng hợp dòng tiền vào/ra theo kỳ
  getRevenueSummary: (period = '7d') =>
    axiosClient.get('/api/v1/admin/revenue/summary', {
      params: { period },
    }),

  // ==================== LEGACY METHODS (backward compatibility) ====================
  createCategoryPostNews: (data) => axiosClient.post('/api/v1/admin/create-field-category', data),

  getCategoriesPostNews: () => axiosClient.get('/api/v1/admin/field-categories'),

  deleteCategoryPostNews: (id) => axiosClient.delete(`/api/v1/admin/delete-field-category/${id}`),

  updateCategoryPostNews: (id, data) =>
    axiosClient.patch(`/api/v1/admin/update-field-category/${id}`, data),
};

export default adminApi;
