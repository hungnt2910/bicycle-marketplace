import axiosClient from '../services/axiosClient';

const reviewApi = {
  createReview: (payload) => axiosClient.post('/api/v1/reviews/create-review', payload),
  getSellerReviews: (sellerId) => axiosClient.get(`/api/v1/reviews/seller-reviews/${sellerId}`),
  deleteReview: (reviewId) => axiosClient.delete(`/api/v1/reviews/delete-review/${reviewId}`),
  updateReview: (reviewId, payload) =>
    axiosClient.post(`/api/v1/reviews/update-review/${reviewId}`),
  getRatingsSummary: () => axiosClient.get('/api/v1/reviews/ratings'),
};

export default reviewApi;
