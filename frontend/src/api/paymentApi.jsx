import axiosClient from '../services/axiosClient';

const paymentApi = {
  // Khởi tạo order thanh toán ZaloPay cho transaction
  createZaloPayOrder: (transactionId) =>
    axiosClient.post(`/api/v1/payment/zalopay/create/${transactionId}`),

  // Endpoint webhook/callback từ ZaloPay (thường chỉ dùng nội bộ)
  callback: (payload) => axiosClient.post('/api/v1/payment/zalopay/callback', payload),

  // Kiểm tra trạng thái thanh toán transaction
  getPaymentStatus: (transactionId) =>
    axiosClient.get(`/api/v1/payment/zalopay/status/${transactionId}`),
};

export default paymentApi;
