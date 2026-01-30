import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // console.log(' API Request:', {
  //   url: config.url,
  //   method: config.method,
  //   data: config.data,
  // });
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    // console.log(' API Response:', {
    //   url: response.config.url,
    //   status: response.status,
    //   data: response.data,
    // });
    return response;
  },
  (error) => {
    // console.error(' API Error:', {
    //   url: error.config?.url,
    //   status: error.response?.status,
    //   data: error.response?.data,
    //   message: error.message,
    // });
    return Promise.reject(error);
  }
);

export default axiosClient;
