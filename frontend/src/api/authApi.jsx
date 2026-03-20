import axiosClient from '../services/axiosClient';

const authApi = {
  register: (data) => axiosClient.post('/api/v1/auth/register', data),

  signin: (data) => axiosClient.post('/api/v1/auth/signin', data),

  signout: () => axiosClient.post('/api/v1/auth/signout'),

  profile: () => axiosClient.get('/api/v1/auth/profile'),

  // Admin-only: verify and grant seller role for a given userId
  verifySeller: (userId) => axiosClient.post(`/api/v1/auth/verify-seller/${userId}`),
};

export default authApi;
