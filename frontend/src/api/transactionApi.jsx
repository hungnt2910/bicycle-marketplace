import axiosClient from '../services/axiosClient';

const transactionApi = {
  // Buyer: mua thẳng
  create: (payload) => axiosClient.post('/api/v1/transactions', payload),

  // Buyer: đặt cọc
  createDeposit: (payload) => axiosClient.post('/api/v1/transactions/deposit', payload),

  // Buyer: thanh toán phần còn lại sau cọc
  payRemainingBalance: (transactionId, payload = {}) =>
    axiosClient.post(`/api/v1/transactions/${transactionId}/pay-balance`, payload),

  getMyTransactions: (params = {}) =>
    axiosClient.get('/api/v1/transactions/my-transactions', { params }),

  getById: (transactionId) => axiosClient.get(`/api/v1/transactions/${transactionId}`),

  markAsDelivered: (transactionId) =>
    axiosClient.patch(`/api/v1/transactions/${transactionId}/delivered`),

  confirmDelivery: (transactionId, data) =>
    axiosClient.post(`/api/v1/transactions/${transactionId}/confirm`, data),

  getAdminStatistics: () => axiosClient.get('/api/v1/transactions/admin/statistics'),

  getAdminEscrow: () => axiosClient.get('/api/v1/transactions/admin/escrow'),

  getAdminEscrowStatistics: () => axiosClient.get('/api/v1/transactions/admin/escrow/statistics'),

  adminForfeitDeposit: (transactionId) =>
    axiosClient.post(`/api/v1/transactions/admin/forfeit/${transactionId}`),

  adminAutoForfeitDeposits: () => axiosClient.post('/api/v1/transactions/admin/auto-forfeit'),

  adminAutoRefundNoShipment: (transactionId) =>
    axiosClient.post(`/api/v1/transactions/admin/auto-refund/${transactionId}`),

  adminAutoConfirmDelivery: (transactionId) =>
    axiosClient.post(`/api/v1/transactions/admin/auto-confirm/${transactionId}`),
};

export default transactionApi;
