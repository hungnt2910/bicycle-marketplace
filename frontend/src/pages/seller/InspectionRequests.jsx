import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import bicycleApi from '../../api/postNewsApi';
import transactionApi from '../../api/transactionApi';
import inspectorApi from '../../api/inspectorApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const InspectionRequests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'request'
  const [myBicycles, setMyBicycles] = useState([]);
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [selectedBicycle, setSelectedBicycle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isFirstInspection, setIsFirstInspection] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const userInfoStr = localStorage.getItem('user') || localStorage.getItem('userInfo');
      if (!userInfoStr) {
        toast.error('Vui lòng đăng nhập');
        navigate('/login');
        return;
      }
      const userInfo = JSON.parse(userInfoStr);
      const sellerId = userInfo._id || userInfo.id || userInfo.userId;

      const response = await bicycleApi.getMyBicycles(sellerId);
      const bicycles = response?.data?.data || response?.data || [];

      console.log('📦 All bicycles:', bicycles);
      console.log(
        '📦 Bicycles status:',
        bicycles.map((b) => ({
          title: b.title,
          status: b.status,
          hasInspection: !!b.inspection,
          inspectionLabel: b.inspection?.label,
          isInspected: b.inspection?.isInspected,
        }))
      );

      // Lọc xe đã được duyệt (active) và chưa có inspection
      const approvedBicycles = bicycles.filter(
        (bike) =>
          bike.status === 'active' && !bike.inspection?.isInspected && !bike.inspection?.label
      );

      console.log('✅ Approved bicycles for inspection:', approvedBicycles);

      // Lấy danh sách xe đã/đang yêu cầu kiểm định (bao gồm pending_review và xe đã kiểm định)
      const requestedInspections = bicycles.filter(
        (bike) =>
          bike.status === 'pending_review' || bike.inspection?.isInspected || bike.inspection?.label
      );

      console.log('🔍 Requested inspections:', requestedInspections);

      setMyBicycles(approvedBicycles);
      setInspectionRequests(requestedInspections);

      // Kiểm tra xem người dùng đã có giao dịch inspection_fee nào chưa
      try {
        const myTransactionsRes = await transactionApi.getMyTransactions();
        const transactions = myTransactionsRes?.data?.data || myTransactionsRes?.data || [];
        const hasInspectionFee = transactions.some((tx) => tx.type === 'inspection_fee');
        setIsFirstInspection(!hasInspectionFee);
        console.log('🆓 First inspection free:', !hasInspectionFee);
      } catch (error) {
        console.error('Error checking transactions:', error);
        setIsFirstInspection(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusBadge = (bike) => {
    if (
      bike.inspection?.isInspected &&
      (bike.inspection?.label === 'Verified' || bike.inspection?.label === 'Xe đã kiểm định')
    ) {
      return <Badge variant="success">Đã kiểm định ✓</Badge>;
    }
    if (bike.status === 'pending_review') {
      return <Badge variant="warning">Đang kiểm định</Badge>;
    }
    if (bike.inspection?.label) {
      return <Badge variant="info">Đang xử lý</Badge>;
    }
    return <Badge variant="warning">Chờ xử lý</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleRequestInspection = async (bicycleId, title) => {
    const INSPECTION_FEE = isFirstInspection ? 0 : 200000;
    const feeText = isFirstInspection ? 'MIỄN PHÍ (Lần đầu tiên)' : '200.000₫';

    if (
      !window.confirm(
        `Bạn có chắc muốn yêu cầu kiểm định cho xe "${title}"?\n\nPhí kiểm định: ${feeText}`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // Nếu miễn phí, không cần thanh toán
      // if (isFirstInspection) {
      //   toast.info('Đang gửi yêu cầu kiểm định miễn phí...', { autoClose: 1500 });

      //   // Gọi API yêu cầu kiểm định trực tiếp

      //   toast.success('🎉 Yêu cầu kiểm định miễn phí đã được gửi thành công!', { autoClose: 3000 });
      //   await fetchData(); // Refresh data
      //   setActiveTab('list'); // Chuyển về tab danh sách
      //   return;
      // }

      const requestData = {
        bicycleId: bicycleId,
        inspectionType: 'online',
      };
      await inspectorApi.requestInspection(requestData);

      // Chuyển sang trang xác nhận thanh toán ví
      const params = new URLSearchParams({
        type: 'inspection_fee',
        amount: String(INSPECTION_FEE),
        bicycleId: bicycleId,
        title: title || 'Phí kiểm định',
        returnUrl: '/seller/inspection',
      });

      localStorage.setItem('pendingBicycleId', bicycleId);
      localStorage.setItem('pendingAction', 'inspection');

      navigate(`/wallet-payment?${params.toString()}`);
    } catch (error) {
      console.error('Error requesting inspection:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu kiểm định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Yêu cầu kiểm định</h2>
          <p className="text-warmgray-600 mt-1">Quản lý và gửi yêu cầu kiểm định xe đạp của bạn</p>
        </div>
        <Button variant="primary" onClick={() => setActiveTab('request')} disabled={loadingData}>
          + Gửi yêu cầu mới
        </Button>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setActiveTab('list')}
            variant={activeTab === 'list' ? 'primary' : 'ghost'}
            className="w-full"
          >
            📋 Danh sách yêu cầu ({inspectionRequests.length})
          </Button>
          <Button
            onClick={() => setActiveTab('request')}
            variant={activeTab === 'request' ? 'primary' : 'ghost'}
            className="w-full"
          >
            ➕ Gửi yêu cầu mới
          </Button>
        </div>
      </Card>

      {/* Content */}
      {activeTab === 'list' ? (
        // Danh sách yêu cầu kiểm định
        <>
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-warmgray-600 mb-1">Tổng yêu cầu</div>
              <div className="text-2xl font-bold text-primary-900">{inspectionRequests.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-warmgray-600 mb-1">Đang kiểm định</div>
              <div className="text-2xl font-bold text-warning-600">
                {
                  inspectionRequests.filter(
                    (r) => r.status === 'pending_review' && !r.inspection?.isInspected
                  ).length
                }
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-warmgray-600 mb-1">Hoàn thành</div>
              <div className="text-2xl font-bold text-success-600">
                {inspectionRequests.filter((r) => r.inspection?.isInspected).length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-warmgray-600 mb-1">Có thể yêu cầu</div>
              <div className="text-2xl font-bold text-gold-600">{myBicycles.length}</div>
            </Card>
          </div>

          {/* Inspection Requests List */}
          {loadingData ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
              <p className="text-warmgray-600">Đang tải dữ liệu...</p>
            </Card>
          ) : inspectionRequests.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-700 divide-x divide-warmgray-200">
                    <tr>
                      <th className="py-4 px-6 font-semibold text-sm">Hình ảnh</th>
                      <th className="py-4 px-6 font-semibold text-sm">Thông tin xe</th>
                      <th className="py-4 px-6 font-semibold text-sm">Thông tin kiểm định</th>
                      <th className="py-4 px-6 font-semibold text-sm">Trạng thái</th>
                      <th className="py-4 px-6 font-semibold text-sm">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warmgray-200">
                    {inspectionRequests.map((bike) => (
                      <tr key={bike._id || bike.id} className="hover:bg-warmgray-50 transition-colors divide-x divide-warmgray-200">
                        <td className="py-4 px-6 align-middle">
                          <img
                            src={bike.media?.mainImage || bike.media?.images?.[0] || '/placeholder.png'}
                            alt={bike.title}
                            className="w-20 h-16 object-cover rounded-[8px]"
                          />
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <div className="font-medium text-lg text-primary-900 line-clamp-2">
                            {bike.title}
                          </div>
                          <div className="text-sm text-warmgray-600 mt-1 whitespace-nowrap">
                            Giá: {bike.price?.toLocaleString()}₫
                          </div>
                        </td>
                        <td className="py-4 px-6 align-middle min-w-[250px]">
                          {bike.inspection?.isInspected && (
                            <div className="flex flex-col">
                              <span className="text-sm text-success-800 font-semibold mb-1">
                                ✓ Đã kiểm định thành công
                              </span>
                              <span className="text-xs text-success-700">
                                Ngày: {formatDate(bike.inspection?.inspectionDate)}
                              </span>
                              {bike.inspection?.expiryDate && (
                                <span className="text-xs text-success-700 mt-0.5">
                                  Hết hạn: {formatDate(bike.inspection?.expiryDate)}
                                </span>
                              )}
                            </div>
                          )}

                          {bike.status === 'pending_review' && !bike.inspection?.isInspected && (
                            <div className="flex flex-col">
                              <span className="text-sm text-warning-800 font-semibold mb-1">
                                🔍 Đang kiểm định...
                              </span>
                              <span className="text-xs text-warning-700 whitespace-nowrap">
                                Kiểm định viên đang xử lý
                              </span>
                            </div>
                          )}

                          {bike.inspection?.label &&
                            !bike.inspection?.isInspected &&
                            bike.status !== 'pending_review' && (
                              <div className="flex flex-col">
                                <span className="text-sm text-info-800 font-semibold mb-1">
                                  Đang xử lý...
                                </span>
                                <span className="text-xs text-info-700 whitespace-nowrap">
                                  Yêu cầu của bạn đang xử lý
                                </span>
                              </div>
                            )}
                        </td>
                        <td className="py-4 px-6 align-middle whitespace-nowrap">
                          {getStatusBadge(bike)}
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/product/${bike._id || bike.id}`)}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">
                Chưa có yêu cầu kiểm định nào
              </h3>
              <p className="text-warmgray-600 mb-6">
                Bắt đầu gửi yêu cầu kiểm định để tăng độ tin cậy cho xe của bạn
              </p>
              <Button variant="primary" onClick={() => setActiveTab('request')}>
                Gửi yêu cầu đầu tiên
              </Button>
            </Card>
          )}
        </>
      ) : (
        // Form gửi yêu cầu mới
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Info Card */}
          <Card className="p-6 bg-gradient-to-br from-gold/5 to-primary-800/5 border-gold/20">
            <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Lợi ích khi kiểm định xe
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <h4 className="font-semibold text-primary-900">Tăng độ tin cậy</h4>
                  <p className="text-sm text-warmgray-600">
                    Người mua yên tâm hơn với xe đã kiểm định
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-semibold text-primary-900">Bán nhanh hơn 3x</h4>
                  <p className="text-sm text-warmgray-600">
                    Xe được ưu tiên hiển thị trên marketplace
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-semibold text-primary-900">Tăng giá trị 10-15%</h4>
                  <p className="text-sm text-warmgray-600">Xe kiểm định có giá cao hơn xe thường</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h4 className="font-semibold text-primary-900">Bảo vệ quyền lợi</h4>
                  <p className="text-sm text-warmgray-600">Giảm thiểu tranh chấp sau bán</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Fee Info */}
          <Card
            className={`p-6 ${isFirstInspection ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-neutral-offwhite to-warmgray-100 border-warmgray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-primary-900 text-lg mb-1">Phí kiểm định</h3>
                <p className="text-sm text-warmgray-600">
                  Kiểm định viên sẽ đến tận nơi kiểm tra xe trong vòng 24h
                </p>
                {isFirstInspection && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-semibold">
                    <span>🎉</span>
                    <span>Chúc mừng! Bạn được MIỄN PHÍ lần kiểm định đầu tiên</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                {isFirstInspection ? (
                  <>
                    <div className="text-3xl font-bold text-success">MIỄN PHÍ</div>
                    <p className="text-xs text-warmgray-500 mt-1 line-through">200.000₫</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-primary-800">200.000₫</div>
                    <p className="text-xs text-warmgray-500 mt-1">Có giá trị 1 năm</p>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Select Bicycle */}
          {loadingData ? (
            <Card className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
              <p className="text-warmgray-600">Đang tải danh sách xe...</p>
            </Card>
          ) : myBicycles.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🚲</div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">
                Chưa có xe nào đủ điều kiện kiểm định
              </h3>
              <p className="text-warmgray-600 mb-6">
                Xe cần được admin duyệt và chưa được kiểm định trước đó.
              </p>
              <Button variant="primary" onClick={() => navigate('/marketplace')}>
                Xem tin đăng của tôi
              </Button>
            </Card>
          ) : (
            <>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-primary-900 mb-4">
                  Chọn xe cần kiểm định ({myBicycles.length} xe có sẵn)
                </h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {myBicycles.map((bike) => (
                    <div
                      key={bike._id || bike.id}
                      onClick={() => setSelectedBicycle(bike)}
                      className={`p-4 border-2 rounded-[16px] cursor-pointer transition-all ${
                        selectedBicycle?._id === bike._id
                          ? 'border-primary-800 bg-primary-800/5 shadow-soft'
                          : 'border-warmgray-200 hover:border-primary-800/50 hover:shadow-soft'
                      }`}
                    >
                      <div className="flex gap-4">
                        <img
                          src={
                            bike.media?.mainImage || bike.media?.images?.[0] || '/placeholder.png'
                          }
                          alt={bike.title}
                          className="w-28 h-28 object-cover rounded-[16px] flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-primary-900 mb-2 truncate">
                            {bike.title}
                          </h4>
                          <div className="space-y-1">
                            <p className="text-sm text-warmgray-600">
                              <span className="font-medium">Giá:</span>{' '}
                              {bike.price?.toLocaleString()}₫
                            </p>
                            <p className="text-sm text-warmgray-600">
                              <span className="font-medium">Loại:</span>{' '}
                              {bike.specifications?.type || 'N/A'}
                            </p>
                            <p className="text-sm text-warmgray-600">
                              <span className="font-medium">Thương hiệu:</span>{' '}
                              {bike.specifications?.brand || 'N/A'}
                            </p>
                          </div>
                          <div className="mt-2">
                            <Badge variant="success">✓ Đã được duyệt</Badge>
                          </div>
                        </div>
                        {selectedBicycle?._id === bike._id && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <Card className="p-6 bg-gradient-to-br from-primary-800/5 to-gold/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-primary-900 text-lg">
                      {selectedBicycle ? `Đã chọn: ${selectedBicycle.title}` : 'Chưa chọn xe'}
                    </h3>
                    {selectedBicycle && (
                      <p className="text-sm text-warmgray-600 mt-1">
                        Sau khi thanh toán, chúng tôi sẽ liên hệ trong vòng 24h
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-800">200.000₫</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setActiveTab('list')} className="flex-1">
                    Quay lại
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleRequestInspection(selectedBicycle._id, selectedBicycle.title)
                    }
                    disabled={loading || !selectedBicycle}
                    className="flex-1"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </span>
                    ) : (
                      'Thanh toán & Gửi yêu cầu'
                    )}
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionRequests;
