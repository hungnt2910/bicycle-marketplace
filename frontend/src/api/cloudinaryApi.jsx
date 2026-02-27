import axiosClient from '../services/axiosClient';

const cloudinaryApi = {
  // Upload 1 ảnh, body là FormData với field "file"
  uploadImage: (formData) =>
    axiosClient.post('/api/v1/cloudinary/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default cloudinaryApi;
