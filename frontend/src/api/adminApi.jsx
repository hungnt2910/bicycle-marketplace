import axiosClient from '../services/axiosClient';

const adminApi = {
  // ==================== CATEGORY MANAGEMENT ====================
  // Tạo category mới cho system setting
  createFieldCategory: (title) => 
    axiosClient.post('/api/v1/admin/create-field-category', { title }),
  
  // Lấy danh sách tất cả field categories
  getFieldCategories: () => 
    axiosClient.get('/api/v1/admin/field-categories'),
  
  // Cập nhật field category
  updateFieldCategory: (id, title) => 
    axiosClient.patch(`/api/v1/admin/update-field-category/${id}`, { id, title }),
  
  // Xóa field category
  deleteFieldCategory: (id) => 
    axiosClient.delete(`/api/v1/admin/delete-field-category/${id}`),

  // ==================== SYSTEM SETTINGS ====================
  // Tạo system setting mới
  createSystemSetting: (data) => 
    axiosClient.post('/api/v1/admin/system-setting', data),
  
  // Lấy tất cả system settings
  getSystemSettings: () => 
    axiosClient.get('/api/v1/admin/system-settings'),
  
  // Cập nhật system setting
  updateSystemSetting: (dataUpdate) => 
    axiosClient.patch('/api/v1/admin/system-setting-update', dataUpdate),
  
  // Xóa system setting
  deleteSystemSetting: (key) => 
    axiosClient.delete(`/api/v1/admin/system-setting/${key}`),

  // ==================== USER MANAGEMENT ====================
  // Thay đổi role của user (cấp quyền)
  changeUserRole: (userId, newRole) => 
    axiosClient.patch('/api/v1/admin/user/change-role', { userId, newRole }),
  
  // Thay đổi trạng thái của user
  changeUserStatus: (userId, newStatus) => 
    axiosClient.patch('/api/v1/admin/user/change-status', { userId, newStatus }),

  // ==================== LEGACY METHODS (backward compatibility) ====================
  createCategoryPostNews: (data) => 
    axiosClient.post('/api/v1/admin/create-field-category', data),
  
  getCategoriesPostNews: () => 
    axiosClient.get('/api/v1/admin/field-categories'),
  
  deleteCategoryPostNews: (id) => 
    axiosClient.delete(`/api/v1/admin/delete-field-category/${id}`),
  
  updateCategoryPostNews: (id, data) => 
    axiosClient.patch(`/api/v1/admin/update-field-category/${id}`, data),
};

export default adminApi;
