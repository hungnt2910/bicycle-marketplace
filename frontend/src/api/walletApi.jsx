import axiosClient from '../services/axiosClient';

const walletApi = {
  // Detailed wallet document for current user
  getWallet: () => axiosClient.get('/api/v1/wallet'),

  // Summary + 30-day stats + recent transactions (paginated)
  getSummary: (params = {}) => axiosClient.get('/api/v1/wallet/summary', { params }),

  // Wallet + escrow totals (requires role param: buyer or seller)
  getTotals: (params = {}) => axiosClient.get('/api/v1/wallet/totals', { params }),

  // Paginated transaction history
  // getTransactions: (params = {}) => axiosClient.get('/api/v1/wallet/transactions', { params }),

  // Withdraw to bank
  requestWithdrawal: (payload) => axiosClient.post('/api/v1/wallet/withdraw', payload),

  // Admin: list withdrawal requests
  getWithdrawals: (params = {}) => axiosClient.get('/api/v1/wallet/withdrawals', { params }),

  // Admin: accept a pending withdrawal request
  acceptWithdrawal: (id) => axiosClient.post(`/api/v1/wallet/withdrawals/${id}/accept`),
};

export default walletApi;
