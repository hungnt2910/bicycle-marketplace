import axiosClient from '../services/axiosClient';

const transactionApi = {
  create: (payload) => axiosClient.post('/api/v1/transactions', payload),

  getMyTransactions: (params = {}) =>
    axiosClient.get('/api/v1/transactions/my-transactions', { params }),

  getById: (transactionId) => axiosClient.get(`/api/v1/transactions/${transactionId}`),

  updateShipping: (transactionId, data) =>
    axiosClient.patch(`/api/v1/transactions/${transactionId}/shipping`, data),

  markAsDelivered: (transactionId) =>
    axiosClient.patch(`/api/v1/transactions/${transactionId}/delivered`),

  confirmDelivery: (transactionId, data) =>
    axiosClient.post(`/api/v1/transactions/${transactionId}/confirm`, data),

  cancel: (transactionId, reason) =>
    axiosClient.patch(`/api/v1/transactions/${transactionId}/cancel`, { reason }),

  getAdminStatistics: () => axiosClient.get('/api/v1/transactions/admin/statistics'),
};

export default transactionApi;
