import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Textarea } from '../../components/ui';
import disputeApi from '../../api/disputeApi';
import transactionApi from '../../api/transactionApi';
import cloudinaryApi from '../../api/cloudinaryApi';
import { DisputeReasonLabels } from '../../constants/dispute';
import { toast } from 'react-toastify';

const CreateDispute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transactionId') || '';
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    if (!transactionId) return;
    transactionApi.getById(transactionId)
      .then((res) => {
        const tx = res?.data?.data || res?.data;
        if (tx) {
          setTransactionDetails({
            buyerId: tx.buyerId?._id || tx.buyerId?.id || tx.buyerId,
            sellerId: tx.sellerId?._id || tx.sellerId?.id || tx.sellerId,
            bicycleId: tx.bicycleId?._id || tx.bicycleId?.id || tx.bicycleId,
          });
        }
      })
      .catch((err) => console.error('Fetch transaction error:', err));
  }, [transactionId]);

  const [form, setForm] = useState({
    reason: '',
    description: '',
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleUploadFiles = async (files, type) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} quá lớn (tối đa 5MB)`);
          return null;
        }
        const formData = new FormData();
        formData.append('file', file);
        const res = await cloudinaryApi.uploadSellerImage('disputes', formData);
        const data = res?.data?.data || res?.data;
        return data?.secure_url || data?.url || data?.imageUrl || null;
      });

      const uploaded = (await Promise.all(uploadPromises)).filter(Boolean);
      if (uploaded.length > 0) {
        if (type === 'photos') {
          setPhotos((prev) => [...prev, ...uploaded]);
        } else {
          setVideos((prev) => [...prev, ...uploaded]);
        }
        toast.success(`Tải lên ${uploaded.length} file thành công`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Lỗi khi tải file lên');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (type, index) => {
    if (type === 'photos') {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setVideos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!transactionId) {
      toast.error('Thiếu mã giao dịch');
      return;
    }
    if (!form.reason) {
      toast.error('Vui lòng chọn lý do tranh chấp');
      return;
    }
    if (!form.description || form.description.length < 10) {
      toast.error('Mô tả phải có ít nhất 10 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        transactionId,
        ...(transactionDetails && { transactionDetails }),
        reason: form.reason,
        description: form.description,
      };

      if (photos.length > 0 || videos.length > 0) {
        payload.evidence = {};
        if (photos.length > 0) payload.evidence.photos = photos;
        if (videos.length > 0) payload.evidence.videos = videos;
      }

      const res = await disputeApi.create(payload);
      const dispute = res?.data?.data;
      toast.success('Tạo tranh chấp thành công! Admin sẽ xem xét.');
      navigate(`/buyer/disputes/${dispute?._id || ''}`);
    } catch (err) {
      console.error('Create dispute error:', err);
      toast.error(err?.response?.data?.message || 'Không thể tạo tranh chấp');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dash-content">
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          ← Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Mở tranh chấp</h1>
        <p className="text-warmgray-600">
          Gửi yêu cầu tranh chấp cho giao dịch. Admin sẽ xem xét và giải quyết.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">Mã giao dịch</label>
            <input
              type="text"
              value={transactionId}
              readOnly
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] bg-warmgray-50 text-warmgray-600 font-mono text-sm"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Lý do tranh chấp <span className="text-red-500">*</span>
            </label>
            <select
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
              required
            >
              <option value="">-- Chọn lý do --</option>
              {Object.entries(DisputeReasonLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải (ít nhất 10 ký tự)..."
              rows={5}
              required
            />
          </div>

          {/* Evidence Photos */}
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Ảnh bằng chứng (không bắt buộc)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUploadFiles(e.target.files, 'photos')}
              disabled={uploading}
              className="w-full text-sm text-warmgray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`evidence-${idx}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile('photos', idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Videos */}
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Video bằng chứng (không bắt buộc)
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleUploadFiles(e.target.files, 'videos')}
              disabled={uploading}
              className="w-full text-sm text-warmgray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {videos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {videos.map((url, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-warmgray-100 rounded-full text-xs"
                  >
                    🎬 Video {idx + 1}
                    <button
                      type="button"
                      onClick={() => removeFile('videos', idx)}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {uploading && <p className="text-sm text-warmgray-500">Đang tải file lên...</p>}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || uploading}>
              {submitting ? 'Đang gửi...' : 'Gửi tranh chấp'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateDispute;
