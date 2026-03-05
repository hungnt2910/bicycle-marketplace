import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import paymentApi from '../../api/paymentApi';
import transactionApi from '../../api/transactionApi';
import bicycleApi from '../../api/postNewsApi';
import { toast } from 'react-toastify';

const ZaloPayReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Đang xác thực giao dịch...');
  const [txId, setTxId] = useState('');
  const [transactionType, setTransactionType] = useState(''); // 'fee' hoặc 'purchase'
  const [inspectionRequested, setInspectionRequested] = useState(false); // Ngăn gọi API nhiều lần

  useEffect(() => {
    const run = async () => {
      const qpTx = searchParams.get('transactionId') || searchParams.get('transaction_id');
      const qpAppTrans = searchParams.get('apptransid') || searchParams.get('app_trans_id');
      const qpStatus = searchParams.get('status');
      const storedTx = localStorage.getItem('pendingTransactionId');
      const storedBicycleId = localStorage.getItem('pendingBicycleId');
      const pendingAction = localStorage.getItem('pendingAction'); // 'inspection' hoặc null
      const dbTxId = qpTx || storedTx; // id của transaction trong DB (Mongo)
      const zpTxId = qpAppTrans || qpTx || storedTx; // app_trans_id cho payment status
      const resolvedTxId = dbTxId || zpTxId;
      setTxId(resolvedTxId || '');

      if (!resolvedTxId) {
        setStatus('failed');
        setMessage('Không tìm thấy mã giao dịch. Vui lòng thử lại.');
        return;
      }

      const isReturnSuccess = qpStatus === '1' || qpStatus === 'success';

      try {
        // Lấy thông tin transaction để biết loại giao dịch
        let txType = 'purchase'; // mặc định
        if (dbTxId) {
          try {
            const txDetail = await transactionApi.getById(dbTxId);
            txType = txDetail?.data?.data?.type || txDetail?.data?.type || 'purchase';
            setTransactionType(txType);
          } catch (err) {
            console.warn('Không lấy được thông tin transaction, dùng mặc định purchase');
          }
        }

        const res = await paymentApi.getPaymentStatus(zpTxId || resolvedTxId);
        const rawStatus =
          res?.data?.data?.status || res?.data?.status || res?.data?.data?.paymentStatus;
        const normalized = (rawStatus || '').toLowerCase();

        if (
          ['paid', 'success', 'completed', 'payment_received', 'held_in_escrow'].includes(
            normalized
          ) ||
          isReturnSuccess
        ) {
          setStatus('success');

          // Nếu thanh toán thành công và là action inspection, tự động gửi request inspection
          // CHỈ GỌI 1 LẦN DUY NHẤT - kiểm tra cả state và localStorage
          const inspectionSentKey = `inspection_sent_${storedBicycleId}`;
          const alreadySent = localStorage.getItem(inspectionSentKey);

          if (
            pendingAction === 'inspection' &&
            storedBicycleId &&
            !inspectionRequested &&
            !alreadySent
          ) {
            setInspectionRequested(true); // Đánh dấu đã gọi trong state
            localStorage.setItem(inspectionSentKey, 'true'); // Đánh dấu trong localStorage

            try {
              await bicycleApi.requestInspection({
                bicycleId: storedBicycleId,
                inspectionType: 'onsite',
              });
              setMessage(
                'Thanh toán thành công! Yêu cầu kiểm định đã được gửi. Inspector sẽ liên hệ sớm.'
              );
              toast.success('Yêu cầu kiểm định đã được gửi thành công!');

              // Xóa flag sau 5 phút để cho phép retry nếu cần
              setTimeout(
                () => {
                  localStorage.removeItem(inspectionSentKey);
                },
                5 * 60 * 1000
              );
            } catch (inspectionError) {
              console.error('Error sending inspection request:', inspectionError);
              localStorage.removeItem(inspectionSentKey); // Xóa flag nếu lỗi để cho phép thử lại
              setMessage(
                'Thanh toán thành công nhưng không thể gửi yêu cầu kiểm định. Vui lòng liên hệ hỗ trợ.'
              );
              toast.warning(
                'Thanh toán thành công nhưng cần liên hệ hỗ trợ để gửi yêu cầu kiểm định.'
              );
            }
          } else if (txType === 'fee') {
            setMessage(
              'Thanh toán phí đăng bài thành công! Tin đăng của bạn đang chờ admin duyệt.'
            );
            toast.success('Thanh toán phí đăng bài thành công!');
          } else if (txType === 'inspection_fee') {
            setMessage('Thanh toán phí kiểm định thành công! Yêu cầu kiểm định đã được gửi.');
            toast.success('Thanh toán phí kiểm định thành công!');
          } else {
            setMessage('Thanh toán thành công! Giao dịch đã được xác nhận.');
            toast.success('Thanh toán thành công!');
          }

          localStorage.removeItem('pendingTransactionId');
          localStorage.removeItem('pendingBicycleId');
          localStorage.removeItem('pendingAction');
        } else if (
          ['failed', 'cancelled', 'canceled', 'payment_failed', 'refunded'].includes(normalized)
        ) {
          setStatus('failed');

          if (txType === 'fee') {
            setMessage(
              'Thanh toán phí đăng bài thất bại. Bạn có thể thử lại từ trang Quản lý tin đăng.'
            );
          } else if (txType === 'inspection_fee' || pendingAction === 'inspection') {
            setMessage(
              'Thanh toán phí kiểm định thất bại. Bạn có thể thử lại từ trang Quản lý tin đăng.'
            );
          } else {
            setMessage('Thanh toán thất bại hoặc đã bị hủy.');
          }
        } else {
          setStatus('pending');
          setMessage('Thanh toán đang chờ xác nhận. Vui lòng kiểm tra lại sau ít phút.');
        }
      } catch (err) {
        console.error('Check payment status error:', err);
        if (isReturnSuccess) {
          setStatus('success');
          setMessage(
            'Thanh toán thành công! Giao dịch đã được xác nhận (dựa trên tham số trả về).'
          );
          localStorage.removeItem('pendingTransactionId');
          localStorage.removeItem('pendingBicycleId');
          localStorage.removeItem('pendingAction');
        } else {
          setStatus('failed');
          setMessage(err?.response?.data?.message || 'Không xác thực được giao dịch');
        }
      }
    };

    run();
  }, [searchParams]);

  const badgeVariant =
    status === 'success' ? 'success' : status === 'failed' ? 'danger' : 'warning';

  const title =
    status === 'success'
      ? 'Thanh toán thành công'
      : status === 'failed'
        ? 'Thanh toán thất bại'
        : 'Đang xác thực';

  const handleBackButton = () => {
    if (transactionType === 'fee') {
      // Nếu là thanh toán phí đăng bài, quay về trang quản lý tin đăng
      navigate('/seller/manage-listings');
    } else if (transactionType === 'inspection_fee') {
      // Nếu là thanh toán phí kiểm định, quay về trang quản lý tin đăng
      navigate('/seller/inspection');
    } else {
      // Nếu là mua hàng, quay về trang đơn hàng
      navigate('/buyer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl p-8 shadow-soft border border-warmgray-200/70">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">{title}</h1>
            <p className="text-warmgray-600 text-sm">Mã giao dịch: {txId || '--'}</p>
            {transactionType && (
              <p className="text-warmgray-500 text-xs mt-1">
                Loại:{' '}
                {transactionType === 'fee'
                  ? 'Phí đăng bài'
                  : transactionType === 'inspection_fee'
                    ? 'Phí kiểm định'
                    : 'Mua hàng'}
              </p>
            )}
          </div>
          <Badge variant={badgeVariant}>{status}</Badge>
        </div>

        <div className="rounded-[16px] bg-neutral-offwhite border border-warmgray-200 p-4 text-warmgray-700">
          {message}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button onClick={handleBackButton}>
            {transactionType === 'fee' || transactionType === 'inspection_fee'
              ? 'Về trang quản lý tin'
              : 'Về trang đơn hàng'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/marketplace')}>
            Tiếp tục xem xe
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ZaloPayReturn;
