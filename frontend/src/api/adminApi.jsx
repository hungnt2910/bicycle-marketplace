import axiosClient from '../services/axiosClient';

const adminApi = {
  createCategoryPostNews: (data) => axiosClient.post('/api/v1/admin/create-field-category', data),
  getCategoriesPostNews: () => axiosClient.get('/api/v1/admin/field-categories'),
  deleteCategoryPostNews: (id) => axiosClient.delete(`/api/v1/admin/delete-field-category/${id}`),
  updateCategoryPostNews: (id, data) =>
    axiosClient.patch(`/api/v1/admin/update-field-category/${id}`, data),
};
export default adminApi;
