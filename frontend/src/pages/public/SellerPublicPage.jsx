import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Card, Badge, Button, Rating } from '../../components/ui';
import userApi from '../../api/userApi';
import bicycleApi from '../../api/postNewsApi';
import reviewApi from '../../api/reviewApi';
import ReviewsSection from '../../components/reviews/ReviewsSection';
import { toast } from 'react-toastify';
import { getPublicListingStatus, isBikePubliclySellable } from '../../utils/bicycleVisibility';

const SellerPublicPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });

  const loadSeller = async () => {
    if (!sellerId) return;
    setLoadingSeller(true);
    try {
      const res = await userApi.getUserById(sellerId);
      const data = res?.data?.data || res?.data || {};
      setSeller({
        id: data._id || data.id || sellerId,
        name:
          data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Người bán',
        email: data.email || '—',
        phone: data.phoneNumber || data.phone || '—',
        avatar: data.avatar,
        rating: data.rating || 0,
        totalSales: data.totalSales || 0,
        responseTime: data.responseTime || '—',
        successRate: data.successRate ? `${data.successRate}%` : '—',
      });
    } catch (err) {
      console.error('Load seller error', err);
      toast.error('Không tải được thông tin người bán');
      setSeller({
        id: sellerId,
        name: 'Người bán',
        email: '—',
        phone: '—',
        rating: 0,
        totalSales: 0,
      });
    } finally {
      setLoadingSeller(false);
    }
  };

  const loadListings = async () => {
    if (!sellerId) return;
    setLoadingListings(true);
    try {
      const res = await bicycleApi.getMyBicycles(sellerId);
      const data = res?.data?.data || res?.data || [];
      const mapped = (Array.isArray(data) ? data : [])
        .filter(
          (bike) =>
            isBikePubliclySellable(bike) || (bike?.status || '').toLowerCase() === 'reserved'
        )
        .map((bike) => ({
          id: bike._id || bike.id,
          title: bike.title || 'Xe đạp',
          price: bike.price || 0,
          status:
            (bike?.status || '').toLowerCase() === 'reserved'
              ? 'reserved'
              : getPublicListingStatus(bike),
          image:
            bike.media?.mainImage ||
            bike.media?.images?.[0] ||
            '/mountain_bike_hero_1768417732962.png',
          condition: bike.condition?.overall,
          createdAt: bike.createdAt,
        }));
      setListings(mapped);
    } catch (err) {
      console.error('Load listings error', err);
      toast.error('Không tải được danh sách xe');
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  const loadReviewSummary = async () => {
    if (!sellerId) return;
    try {
      const res = await reviewApi.getSellerReviews(sellerId);
      const payload = res?.data?.data || res?.data || {};
      const list = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.reviews)
          ? payload.reviews
          : Array.isArray(payload)
            ? payload
            : [];
      const averageRating =
        payload.averageRating ??
        (list.length ? list.reduce((s, r) => s + (Number(r.rating) || 0), 0) / list.length : 0);
      const totalReviews = payload.totalReviews ?? list.length;
      setReviewSummary({ averageRating, totalReviews });
    } catch (err) {
      console.warn('Load review summary error', err);
    }
  };

  useEffect(() => {
    loadSeller();
    loadListings();
    loadReviewSummary();
  }, [sellerId]);

  const activeListings = useMemo(
    () => listings.filter((b) => ['active', 'reserved'].includes(b.status)).length,
    [listings]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-warmgray-200">
        <div className="container-custom py-8 flex flex-col gap-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary-700 hover:underline w-fit"
          >
            ← Quay lại
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={seller?.name || 'Người bán'} size="xl" src={seller?.avatar} />
              <div>
                <h1 className="text-3xl font-bold text-primary-900">
                  {loadingSeller ? 'Đang tải...' : seller?.name || 'Người bán'}
                </h1>

                <div className="text-sm text-warmgray-700 mt-1 space-y-0.5">
                  <div>Email: {seller?.email || '—'}</div>
                  <div>Số điện thoại: {seller?.phone || '—'}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* Listings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary-900">Sản phẩm đang bán</h2>
            <Button variant="outline" size="sm" onClick={loadListings} disabled={loadingListings}>
              {loadingListings ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
          {loadingListings ? (
            <Card className="p-8 text-center text-warmgray-600">Đang tải danh sách...</Card>
          ) : listings.length === 0 ? (
            <Card className="p-8 text-center text-warmgray-600">Chưa có sản phẩm nào</Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((bike) => (
                <Card key={bike.id} className="p-4 flex flex-col gap-3 hover:shadow-soft">
                  <img
                    src={bike.image}
                    alt={bike.title}
                    className="w-full h-40 object-cover rounded-[12px]"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-900 line-clamp-2">{bike.title}</h3>
                    <p className="text-lg font-bold text-primary-800 mt-1">
                      {Number(bike.price || 0).toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-sm text-warmgray-600 capitalize">{bike.condition || '—'}</p>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate(`/product/${bike.id}`)}
                  >
                    Xem sản phẩm
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section>
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Đánh giá shop</h2>
          <ReviewsSection sellerId={sellerId} readOnly />
        </section>
      </div>
    </div>
  );
};

export default SellerPublicPage;
