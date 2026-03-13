import axiosClient from '../services/axiosClient';

const transactionApi = {
  // Buyer: mua thẳng
  create: (payload) => axiosClient.post('/api/v1/transactions', payload),

  // Buyer: đặt cọc
  createDeposit: (payload) => axiosClient.post('/api/v1/transactions/deposit', payload),

  // Buyer: thanh toán phần còn lại sau cọc (backend không nhận body)
  payRemainingBalance: (transactionId) =>
    axiosClient.post(`/api/v1/transactions/${transactionId}/pay-balance`),

  // Seller: thanh toán phí đăng tin / kiểm định
  payFee: (payload) => axiosClient.post('/api/v1/transactions/fee', payload),

  getMyTransactions: (params = {}) =>
    axiosClient.get('/api/v1/transactions/my-transactions', { params }),

  getById: (transactionId) => axiosClient.get(`/api/v1/transactions/${transactionId}`),

  // Seller: cập nhật thông tin giao hàng (hãng + mã vận đơn)
  updateShipping: (transactionId, payload) =>
    axiosClient.patch(`/api/v1/transactions/${transactionId}/shipping`, payload),

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
