import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Rating, Button, ImageGallery, Avatar, Modal } from '../../components/ui';
import ChatWithSellerButton from '../../components/chat/ChatWithSellerButton';
import bicycleApi from '../../api/postNewsApi';
import authApi from '../../api/authApi';
import favouriteApi from '../../api/favouriteApi';
import userApi from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import ReviewsSection from '../../components/reviews/ReviewsSection';
import { getPublicListingStatus, isBikePubliclySellable } from '../../utils/bicycleVisibility';

const ProductDetail = ({ productId }) => {
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(50);
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarBikes, setSimilarBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const MAX_PAYMENT_AMOUNT = 1000000000; // 1 tỷ VND - giới hạn an toàn cho ZaloPay

  const typeLabelMap = {
    mountain: 'Xe đạp địa hình',
    road: 'Xe đạp đường trường',
    hybrid: 'Xe đạp Hybrid',
    electric: 'Xe đạp điện',
    folding: 'Xe đạp gấp',
    bmx: 'Xe đạp BMX',
    cruiser: 'Xe đạp dạo phố',
  };

  const conditionLabelMap = {
    new: 'Mới 100%',
    'like-new': 'Như mới',
    good: 'Tốt',
    fair: 'Khá',
    poor: 'Cần sửa chữa',
  };

  const currentUserId =
    user?._id || user?.id || user?.userId || user?.user?.id || user?.user?.userId;

  const productStatus = (product?.status || '').toLowerCase();
  const isReserved =
    product?.isReserved ||
    ['reserved', 'pending_payment', 'payment_received', 'held_in_escrow'].includes(productStatus);
  const isSold = product?.isSold || ['sold', 'inactive', 'deactivated'].includes(productStatus);
  const isUnavailable = isReserved || isSold;

  const handleBuyNow = async (isDepositParam = false) => {
    const isDeposit = isDepositParam === true;
    try {
      if (!product) return;
      if (!isAuthenticated) {
        <Button
          variant="primary"
          className="w-full py-3 font-semibold rounded-[16px]"
          onClick={() => {
            const sellerIdForNav =
              product?.seller?.id || product?.sellerId || product?.seller?.sellerId;
            if (!sellerIdForNav) return;
            navigate(`/seller/${sellerIdForNav}`);
          }}
        >
          Xem trang người bán
        </Button>;
        toast.info('Vui lòng đăng nhập để mua hàng');
        {
          (transactionId || paymentStatus || paymentUrl) && (
            <div className="p-3 rounded-[16px] bg-neutral-offwhite border border-warmgray-200 text-sm text-warmgray-700 space-y-1">
              {transactionId && (
                <div>
                  Mã giao dịch: <span className="font-semibold">{transactionId}</span>
                </div>
              )}
              {paymentStatus && (
                <div>
                  Trạng thái thanh toán: <span className="font-semibold">{paymentStatus}</span>
                </div>
              )}
              {paymentUrl && <div className="break-all text-primary-800">{paymentUrl}</div>}
            </div>
          );
        }
        toast.error('Số tiền vượt giới hạn thanh toán cho phép');
        return;
      }

      const amount = Math.round(rawAmount);

      // Chuyển sang trang xác nhận thanh toán ví
      const params = new URLSearchParams({
        type: isDeposit ? 'deposit' : 'full_payment',
        amount: String(amount),
        bicycleId: bikeId,
        title: product.name || '',
        returnUrl: `/product/${productId}`,
      });
      if (isDeposit) {
        params.set('depositRate', String(Math.min(Math.max(depositAmount / 100, 0.1), 0.9)));
      }

      if (isDeposit) setShowDepositModal(false);
      navigate(`/wallet-payment?${params.toString()}`);
      return;
    } catch (err) {
      console.error('Buy now error:', err);
      toast.error(err.response?.data?.message || err.message || 'Không thể tạo giao dịch');
    }
  };

  const handleFavouriteToggle = async () => {
    if (!productId) return;
    if (!isAuthenticated || !currentUserId) {
      toast.info('Vui lòng đăng nhập để lưu tin yêu thích');
      return;
    }

    try {
      if (isFavourite) {
        await favouriteApi.removeOneFromFavourites({ userId: currentUserId, bicycleId: productId });
        setIsFavourite(false);
        toast.success('Đã bỏ khỏi yêu thích');
      } else {
        await favouriteApi.addToFavourites({ userId: currentUserId, bicycleId: productId });
        setIsFavourite(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (err) {
      console.error('Toggle favourite error:', err);
      toast.error('Không thể cập nhật yêu thích, thử lại sau');
    }
  };

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError('');

    try {
      const response = await bicycleApi.getBicycleById(productId);
      const bike = response?.data?.data || response?.data;

      if (!bike) {
        setError('Không tìm thấy sản phẩm');
        setProduct(null);
        return;
      }

      // Debug: Log toàn bộ bike data để xem cấu trúc
      // console.log('🚲 Full Bike Data:', bike);
      // console.log('🚲 bike.sellerId:', bike?.sellerId);
      // console.log('🚲 bike.seller:', bike?.seller);
      // console.log('🚲 bike.userId:', bike?.userId);
      // console.log('🚲 bike.createdBy:', bike?.createdBy);

      const location = [bike?.location?.district, bike?.location?.city].filter(Boolean).join(', ');

      const images = bike?.media?.images?.length
        ? bike.media.images
        : bike?.media?.mainImage
          ? [bike.media.mainImage]
          : [];

      // Thu thập video từ nhiều trường có thể để tránh mất dữ liệu
      const videoCandidates = [
        ...(Array.isArray(bike?.media?.videos) ? bike.media.videos : []),
        bike?.media?.video,
        bike?.media?.videoUrl,
        bike?.videoUrl,
        bike?.video,
      ].filter(Boolean);
      const videos = Array.from(new Set(videoCandidates));

      const sellerProfile = bike?.seller?.profile || bike?.sellerProfile || bike?.profile;
      const sellerProfileName = sellerProfile
        ? `${sellerProfile.firstName || ''} ${sellerProfile.lastName || ''}`.trim()
        : '';
      const sellerFromId = bike?.sellerId;
      const sellerIdName = sellerFromId
        ? `${sellerFromId.firstName || ''} ${sellerFromId.lastName || ''}`.trim()
        : '';

      const sellerEmail =
        sellerFromId?.email || bike?.seller?.email || bike?.sellerEmail || bike?.contactEmail || '';
      const sellerPhone =
        sellerFromId?.phone ||
        sellerProfile?.phone ||
        bike?.seller?.phone ||
        bike?.seller?.phoneNumber ||
        bike?.sellerPhone ||
        bike?.contactPhone ||
        '';

      const sellerDisplayName =
        sellerIdName ||
        sellerProfileName ||
        bike?.seller?.fullName ||
        bike?.sellerName ||
        (sellerEmail ? sellerEmail.split('@')[0] : '') ||
        'Người bán';

      // Tìm sellerId từ nhiều nguồn có thể
      const extractedSellerId =
        bike?.sellerId?._id ||
        bike?.sellerId?.id ||
        bike?.sellerId ||
        bike?.seller?._id ||
        bike?.seller?.id ||
        bike?.userId?._id ||
        bike?.userId?.id ||
        bike?.userId ||
        bike?.createdBy?._id ||
        bike?.createdBy?.id ||
        bike?.createdBy;

      console.log('✅ Extracted Seller ID:', extractedSellerId);

      const statusRaw = (bike?.status || '').toLowerCase();
      const publicStatus = getPublicListingStatus(bike);
      const mappedProduct = {
        id: bike?._id || bike?.id,
        name: bike?.title || 'Không có tiêu đề',
        price: bike?.price || 0,
        oldPrice: bike?.oldPrice,
        images,
        description: bike?.description || 'Chưa có mô tả',
        verified: !!bike?.inspection?.isInspected,
        rating: bike?.rating || 0,
        reviews: bike?.reviewsCount || 0,
        condition: conditionLabelMap[bike?.condition?.overall] || 'Chưa xác định',
        location: location || '—',
        views: bike?.views || 0,
        status: publicStatus || bike?.status || 'unknown',
        isReserved: ['reserved', 'pending_payment', 'payment_received', 'held_in_escrow'].includes(
          statusRaw
        ),
        isSold:
          ['sold', 'inactive', 'deactivated'].includes(statusRaw) && !isBikePubliclySellable(bike),
        sellerId: extractedSellerId,
        seller: {
          id: extractedSellerId || '',
          name: sellerDisplayName,
          avatar: sellerFromId?.avatar || bike?.seller?.avatar || null,
          rating: bike?.seller?.rating || bike?.sellerRating || bike?.sellerStats?.rating || 0,
          responseTime: bike?.seller?.responseTime || bike?.sellerStats?.responseTime || '—',
          successRate: bike?.seller?.successRate
            ? `${bike.seller.successRate}%`
            : bike?.sellerStats?.successRate
              ? `${bike.sellerStats.successRate}%`
              : '—',
          totalSales: bike?.seller?.totalSales || bike?.sellerStats?.totalSales || 0,
          phone: sellerPhone || '—',
          email: sellerEmail || '—',
        },
        specs: {
          'Loại xe': typeLabelMap[bike?.specifications?.type] || '—',
          'Thương hiệu': bike?.specifications?.brand || '—',
          'Năm sản xuất': bike?.specifications?.year || '—',
          'Kích thước khung': bike?.specifications?.frameSize || '—',
          'Chất liệu khung': bike?.specifications?.frameMaterial || '—',
          'Hệ thống treo': bike?.specifications?.suspension || '—',
          Phanh: bike?.specifications?.brakeType || '—',
          'Bộ truyền động': bike?.specifications?.gears || '—',
          'Bánh xe': bike?.specifications?.wheelSize || '—',
          'Trọng lượng': bike?.specifications?.weight || '—',
        },
        inspectionReport: bike?.inspection?.isInspected
          ? {
            score: bike?.inspection?.score || 0,
            date: bike?.inspection?.inspectionDate
              ? new Date(bike.inspection.inspectionDate).toLocaleDateString('vi-VN')
              : '—',
            inspector: bike?.inspection?.inspectorName || '—',
            notes: bike?.inspection?.label || 'Đã kiểm định',
          }
          : null,
        rawType: bike?.specifications?.type || '',
        videos,
      };

      console.log('📦 Mapped Product with sellerId:', mappedProduct.sellerId);
      console.log('📦 Full Mapped Product:', mappedProduct);

      // Nếu thiếu thông tin seller (chỉ có id), cố gắng gọi thêm userApi để bổ sung
      if (mappedProduct.seller && mappedProduct.seller.id && (!sellerEmail || !sellerPhone)) {
        try {
          const sellerRes = await userApi.getUserById(mappedProduct.seller.id);
          const sellerData = sellerRes?.data?.data || sellerRes?.data;
          if (sellerData) {
            mappedProduct.seller.name =
              sellerData.fullName ||
              `${sellerData.firstName || ''} ${sellerData.lastName || ''}`.trim() ||
              mappedProduct.seller.name;
            mappedProduct.seller.email = sellerData.email || mappedProduct.seller.email;
            mappedProduct.seller.phone =
              sellerData.phoneNumber || sellerData.phone || mappedProduct.seller.phone;
            mappedProduct.seller.avatar = sellerData.avatar || mappedProduct.seller.avatar;
            mappedProduct.seller.rating = sellerData.rating || mappedProduct.seller.rating;
            if (sellerData.totalSales) mappedProduct.seller.totalSales = sellerData.totalSales;
          }
        } catch (sellerErr) {
          console.warn('Không lấy được thông tin seller chi tiết:', sellerErr);
        }
      }

      setProduct(mappedProduct);

      const allResponse = await bicycleApi.getAllBicycles();
      const allData = allResponse?.data?.data || allResponse?.data || [];
      const related = allData
        .filter(
          (item) =>
            isBikePubliclySellable(item) || (item?.status || '').toLowerCase() === 'reserved'
        )
        .filter((item) => (item?._id || item?.id) !== mappedProduct.id)
        .filter((item) => item?.specifications?.type === mappedProduct.rawType)
        .slice(0, 4)
        .map((item) => ({
          id: item?._id || item?.id,
          name: item?.title || 'Không có tiêu đề',
          price: item?.price || 0,
          image: item?.media?.mainImage || item?.media?.images?.[0] || '',
        }));

      setSimilarBikes(related);
      setReviews(bike?.reviews || []);
    } catch (err) {
      console.error('Error fetching product detail:', err);
      setError('Không thể tải dữ liệu sản phẩm');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    const checkFavourite = async () => {
      if (!isAuthenticated || !currentUserId || !productId) {
        setIsFavourite(false);
        return;
      }
      try {
        const res = await favouriteApi.getFavouriteBicycles(currentUserId);
        const data = res?.data?.data || res?.data || [];
        const ids = data.map((item) => item?._id || item?.id).filter(Boolean);
        setIsFavourite(ids.includes(productId));
      } catch (err) {
        console.error('Check favourite error:', err);
      }
    };

    checkFavourite();
  }, [isAuthenticated, currentUserId, productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container-custom py-10">
          <div className="text-warmgray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container-custom py-10">
          <div className="text-danger">{error || 'Không có dữ liệu sản phẩm'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-white border-b border-warmgray-200">
        <div className="container-custom py-6">
          <div className="flex items-center gap-2 text-sm text-warmgray-600 mb-4">
            <span className="hover:text-primary-800 cursor-pointer transition-colors">
              Trang chủ
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="hover:text-primary-800 cursor-pointer transition-colors">
              Marketplace
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-primary-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery - Modern Card */}
            <div className="bg-white rounded-[20px] shadow-soft border border-warmgray-200/50 overflow-hidden">
              <div className="p-6">
                {product.images?.length || product.videos?.length ? (
                  <ImageGallery
                    images={product.images}
                    videos={product.videos}
                    alt={product.name}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-warmgray-500">
                    Chưa có hình ảnh/video
                  </div>
                )}
              </div>
            </div>

            {/* Description - Clean Modern Card */}
            <div className="bg-white rounded-[20px] shadow-soft border border-warmgray-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[16px] bg-primary-800/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-900">Mô tả chi tiết</h3>
              </div>
              <div className="prose prose-neutral max-w-none">
                <p className="text-warmgray-700 leading-relaxed whitespace-pre-line text-base">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Specifications - Modern Grid */}
            <div className="bg-white rounded-[20px] shadow-soft border border-warmgray-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[16px] bg-primary-800/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-900">Thông số kỹ thuật</h3>
              </div>
              <div className="grid gap-1">
                {Object.entries(product.specs).map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between py-4 px-5 rounded-[16px] transition-colors ${index % 2 === 0 ? 'bg-neutral-offwhite' : 'bg-white'
                      } hover:bg-primary-800/5`}
                  >
                    <span className="font-semibold text-warmgray-700 text-sm">{key}</span>
                    <span className="text-primary-900 font-medium text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Report - Modern Verified Badge */}
            {product.verified && (
              <div className="bg-white rounded-[20px] shadow-soft border-2 border-emerald-200 p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-[20px] bg-emerald-500 flex items-center justify-center shadow-soft flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-emerald-900 mb-1">
                      Xe đã được kiểm định
                    </h3>
                    <p className="text-emerald-700 font-medium">
                      Ngày kiểm định: {product.inspectionReport.date}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-[16px] p-6 border border-emerald-100">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-200">
                    <span className="text-lg font-semibold text-emerald-900">Điểm tổng thể</span>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-bold text-emerald-600">
                        {product.inspectionReport.score}
                      </span>
                      <span className="text-2xl text-emerald-600">/10</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-emerald-800">
                          <span className="font-semibold">Kiểm định viên:</span>{' '}
                          {product.inspectionReport.inspector}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-emerald-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-emerald-800">
                          <span className="font-semibold">Ghi chú:</span>{' '}
                          {product.inspectionReport.notes}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 bg-white border-2 border-emerald-200 text-emerald-700 font-semibold rounded-[16px] hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200">
                    Xem báo cáo đầy đủ
                  </button>
                </div>
              </div>
            )}

            {/* ── No Inspection Warning ── */}
            {!product.verified && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-amber-50 border-2 border-amber-300 rounded-[20px] p-6 flex gap-4 shadow-soft"
              >
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 rounded-[16px] bg-amber-400 flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-amber-900 mb-1">
                    Xe chưa có nhãn mác kiểm định
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed mb-3">
                    Chiếc xe này <span className="font-semibold">chưa được kiểm định</span> bởi hệ
                    thống Bicycle Marketplace. Chất lượng và tình trạng thực tế chưa được xác minh
                    độc lập — hãy kiểm tra kỹ trước khi quyết định mua.
                  </p>
                  <ul className="space-y-1 text-xs text-amber-700 list-none">
                    {[
                      'Yêu cầu người bán cung cấp ảnh/video thực tế kỹ hơn',
                      'Kiểm tra trực tiếp xe trước khi đặt cọc hoặc thanh toán',
                      'Sử dụng tính năng Đặt cọc để bảo vệ quyền lợi của bạn',
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <span className="mt-0.5 text-amber-500 font-bold">⚠</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Reviews - Social Proof Section */}
            <div className="bg-white rounded-[20px] shadow-soft border border-warmgray-200/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-[16px] bg-primary-800/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-900">Đánh giá từ người mua</h3>
              </div>

              <ReviewsSection
                sellerId={product.sellerId}
                transactionId={transactionId || undefined}
              />
            </div>
          </div>

          {/* Right Column - Purchase Info - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* Price Card - Premium Design */}
              <div className="bg-white rounded-[20px] shadow-soft border border-warmgray-200/50 overflow-hidden">
                {/* Header with Verified Badge */}
                <div className="px-6 pt-6 pb-4">
                  <h1 className="text-2xl font-bold text-primary-900 mb-3 leading-tight">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-3 mb-4">
                    {product.verified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-[16px] border border-emerald-200">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Đã kiểm định
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-[16px] border border-emerald-200">
                      {product.condition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Rating value={product.rating} size="sm" readonly />
                    <span className="text-sm font-medium text-warmgray-700">{product.rating}</span>
                    <span className="text-sm text-warmgray-500">({product.reviews} đánh giá)</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="px-6 py-5 bg-neutral-offwhite border-y border-warmgray-200">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary-800">
                      {product.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xl font-bold text-primary-800">₫</span>
                  </div>
                  {product.oldPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-warmgray-500 line-through">
                        {product.oldPrice.toLocaleString('vi-VN')} ₫
                      </span>
                      <span className="px-2 py-1 bg-danger/10 text-danger text-xs font-bold rounded">
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}
                        %
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Items */}
                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-warmgray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-warmgray-700 font-medium">{product.location}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-warmgray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-warmgray-700 font-medium">{product.views} lượt xem</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 space-y-3">
                  {isReserved && (
                    <div className="p-3 rounded-[16px] bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
                      Xe đang được đặt cọc. Vui lòng quay lại sau hoặc chọn xe khác.
                    </div>
                  )}
                  {isSold && (
                    <div className="p-3 rounded-[16px] bg-danger/5 border border-danger/20 text-danger text-sm font-semibold">
                      Xe đã bán/không còn giao dịch.
                    </div>
                  )}
                  <button
                    onClick={() => handleBuyNow(false)}
                    disabled={paying || isUnavailable}
                    className="w-full px-6 py-4 bg-[#0B7C62] text-white font-bold rounded-[16px] hover:bg-[#09664F] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-soft shadow-emerald-700/25 hover:shadow-elevated hover:shadow-emerald-700/30 border border-[#075B44]"
                  >
                    {paying ? 'Đang xử lý...' : 'Mua ngay'}
                  </button>

                  <button
                    onClick={() => setShowDepositModal(true)}
                    disabled={isUnavailable}
                    className="w-full px-6 py-4 bg-white border-2 border-emerald-200 text-emerald-700 font-semibold rounded-[16px] hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                  >
                    Đặt cọc
                  </button>

                  <ChatWithSellerButton
                    sellerId={product.sellerId}
                    productId={product.id}
                    sellerName={product.seller.name}
                  />

                  <Button
                    variant="primary"
                    className="w-full py-3 font-semibold rounded-[16px]"
                    onClick={handleFavouriteToggle}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isFavourite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {isFavourite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                  </Button>



                  {(transactionId || paymentStatus || paymentUrl) && (
                    <div className="p-3 rounded-[16px] bg-neutral-offwhite border border-warmgray-200 text-sm text-warmgray-700 space-y-1">
                      {transactionId && (
                        <div>
                          Mã giao dịch: <span className="font-semibold">{transactionId}</span>
                        </div>
                      )}
                      {paymentStatus && (
                        <div>
                          Trạng thái thanh toán:{' '}
                          <span className="font-semibold">{paymentStatus}</span>
                        </div>
                      )}
                      {paymentUrl && <div className="break-all text-primary-800">{paymentUrl}</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Info - Modern Card */}
              <div className="bg-white rounded-[20px] shadow-soft border border-warmgray-200/50 p-6">
                <h3 className="font-bold text-lg text-primary-900 mb-4">Thông tin người bán</h3>

                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-warmgray-200">
                  <Avatar name={product.seller.name} size="lg" />
                  <div className="flex-1">
                    <div className="font-bold text-primary-900 mb-1">
                      Người bán: {product.seller.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Rating value={product.seller.rating} size="sm" readonly />
                      <span className="text-sm text-warmgray-600">
                        ({product.seller.totalSales} đã bán)
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-warmgray-700">
                      <div>Email: {product.seller.email}</div>
                      <div>Số điện thoại: {product.seller.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-warmgray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">Phản hồi</span>
                    </div>
                    <span className="font-semibold text-primary-900 text-sm">
                      {product.seller.responseTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-warmgray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">Tỷ lệ thành công</span>
                    </div>
                    <span className="font-semibold text-emerald-600 text-sm">
                      {product.seller.successRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-warmgray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span className="text-sm">Đã bán</span>
                    </div>
                    <span className="font-semibold text-primary-900 text-sm">
                      {product.seller.totalSales} xe
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full py-3 font-semibold rounded-[16px]"
                  onClick={() => {
                    const sellerIdForNav =
                      product?.seller?.id || product?.sellerId || product?.seller?.sellerId;
                    if (!sellerIdForNav) return;
                    navigate(`/seller-profile/${sellerIdForNav}`);
                  }}
                >
                  Xem trang người bán
                </Button>
              </div>

              {/* Safety Tips - Clean Design */}
              <div className="bg-white rounded-[20px] shadow-soft border-2 border-primary-600/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[16px] bg-primary-800/50 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg text-primary-900">Mua hàng an toàn</h3>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-warmgray-700 leading-relaxed">
                      Chỉ đặt cọc qua hệ thống ROUTIN
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-warmgray-700 leading-relaxed">
                      Kiểm tra xe trước khi nhận
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-warmgray-700 leading-relaxed">
                      So sánh với báo cáo kiểm định
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-warmgray-700 leading-relaxed">
                      Tiền được hoàn nếu không đúng mô tả
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Bikes - Modern Grid */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[16px] bg-primary-800/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary-900">Xe đạp tương tự</h3>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarBikes.length === 0 ? (
              <div className="text-warmgray-500">Chưa có xe tương tự</div>
            ) : (
              similarBikes.map((bike) => (
                <div
                  key={bike.id}
                  className="group bg-white rounded-[20px] shadow-soft border border-warmgray-200/50 overflow-hidden hover:shadow-elevated hover:border-primary-800/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-product bg-warmgray-100 relative overflow-hidden">
                    {bike.image ? (
                      <img
                        src={bike.image}
                        alt={bike.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warmgray-500">
                        Chưa có ảnh
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-primary-900 mb-3 line-clamp-2 group-hover:text-primary-800 transition-colors">
                      {bike.name}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary-800">
                        {bike.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-lg font-bold text-primary-800">₫</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal - Modern Design */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[16px] bg-primary-800/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">Đặt cọc xe đạp</span>
          </div>
        }
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowDepositModal(false)}
              className="flex-1 px-6 py-3 bg-warmgray-100 text-warmgray-700 font-semibold rounded-[16px] hover:bg-warmgray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => handleBuyNow(true)}
              disabled={paying}
              className="flex-1 px-6 py-3 bg-primary-800 text-white font-bold rounded-[16px] hover:bg-primary-800/90 transition-all shadow-soft shadow-primary-800/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {paying ? 'Đang xử lý...' : 'Xác nhận đặt cọc'}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-primary-900 mb-4">
              Chọn số tiền đặt cọc ({depositAmount}%)
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="10"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              className="w-full h-2 bg-warmgray-200 rounded-[16px] appearance-none cursor-pointer accent-primary-800"
            />
            <div className="flex justify-between text-sm text-warmgray-600 mt-2 font-medium">
              <span>10%</span>
              <span>50%</span>
              <span>90%</span>
            </div>
          </div>

          <div className="bg-neutral-offwhite rounded-[16px] p-6 border border-warmgray-200">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-warmgray-200">
              <span className="text-warmgray-700 font-medium">Giá xe</span>
              <span className="font-bold text-primary-900 text-lg">
                {product.price.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-900 font-bold text-lg">Số tiền cọc</span>
              <span className="text-3xl font-bold text-primary-800">
                {((product.price * depositAmount) / 100).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[16px] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-[16px] bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-emerald-900 text-base">Bảo vệ người mua</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-emerald-800">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Tiền được giữ an toàn bởi hệ thống</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-emerald-800">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Hoàn tiền nếu xe không đúng mô tả</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-emerald-800">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Hỗ trợ giải quyết tranh chấp 24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;
