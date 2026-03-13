import axiosClient from '../services/axiosClient';

const disputeApi = {
  // -- Buyer --
  create: (payload) => axiosClient.post('/api/v1/disputes', payload),

  getMyDisputes: (params = {}) => axiosClient.get('/api/v1/disputes/my-disputes', { params }),

  getById: (disputeId) => axiosClient.get(`/api/v1/disputes/${disputeId}`),

  // -- Admin --
  getAll: (params = {}) => axiosClient.get('/api/v1/disputes/admin/all', { params }),

  assign: (disputeId) => axiosClient.patch(`/api/v1/disputes/${disputeId}/assign`),

  resolve: (disputeId, payload) =>
    axiosClient.post(`/api/v1/disputes/${disputeId}/resolve`, payload),
};

export default disputeApi;
