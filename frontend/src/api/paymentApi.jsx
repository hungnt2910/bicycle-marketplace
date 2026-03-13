import axiosClient from '../services/axiosClient';

const paymentApi = {
  // Wallet top-up via ZaloPay (backend expects { amount })
  createZaloPayOrder: (amount) => axiosClient.post('/api/v1/payment/zalopay/create', { amount }),

  // Endpoint webhook/callback từ ZaloPay (thường chỉ dùng nội bộ)
  callback: (payload) => axiosClient.post('/api/v1/payment/zalopay/callback', payload),

  // Kiểm tra trạng thái thanh toán transaction
  getPaymentStatus: (transactionId) =>
    axiosClient.get(`/api/v1/payment/zalopay/status/${transactionId}`),
};

export default paymentApi;
