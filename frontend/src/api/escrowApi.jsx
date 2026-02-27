import axiosClient from '../services/axiosClient';

const escrowApi = {
  releaseFunds: (transactionId, reason) =>
    axiosClient.post(`/api/v1/escrow/${transactionId}/release`, { reason }),

  refundFunds: (transactionId, reason) =>
    axiosClient.post(`/api/v1/escrow/${transactionId}/refund`, { reason }),

  getHeldTransactions: () => axiosClient.get('/api/v1/escrow/held'),

  getStatistics: () => axiosClient.get('/api/v1/escrow/statistics'),
};

export default escrowApi;
