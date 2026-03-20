import axiosClient from "../services/axiosClient";

const cloudinaryApi = {
  // Upload ảnh cho seller; formData nên chứa field file hoặc imageBase64 tùy backend
  uploadSellerImage: (sellerId, formData) =>
    axiosClient.post(`/api/v1/cloudinary/upload-image/${sellerId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Upload ảnh cho inspector với cùng payload dạng multipart/form-data
  uploadInspectorImage: (inspectorId, formData) =>
    axiosClient.post(
      `/api/v1/cloudinary/upload-image/${inspectorId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    ),

  uploadCCCDImage: (formData) =>
    axiosClient.post(`/api/v1/cloudinary/upload-image/CCCD`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default cloudinaryApi;
