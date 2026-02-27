import axiosClient from '../services/axiosClient';

const walletApi = {
  getSummary: () => axiosClient.get('/api/v1/wallet'),

  getTransactions: (params = {}) => axiosClient.get('/api/v1/wallet/transactions', { params }),

  requestWithdrawal: (payload) => axiosClient.post('/api/v1/wallet/withdraw', payload),
};

export default walletApi;
