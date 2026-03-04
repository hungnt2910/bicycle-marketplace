import axiosClient from '../services/axiosClient';
//Inspector:
const inspectorApi = {
  getAllInspector: () => axiosClient.get('/api/v1/inspections/admin/all'),
  
  // Seller - Request inspection
  requestInspection: (data) => axiosClient.post('/api/v1/inspections/request', data),
  
  // Get my inspection requests (seller)
  getMyInspectionRequests: () => axiosClient.get('/api/v1/inspections/my-requests'),
};

export default inspectorApi;
