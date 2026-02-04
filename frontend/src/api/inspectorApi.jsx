import axiosClient from '../services/axiosClient';
//Inspector:
const inspectorApi = {
  getAllInspector: () => axiosClient.get('/api/v1/inspections/admin/all'),
};

export default inspectorApi;
