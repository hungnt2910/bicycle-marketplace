import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import paymentApi from '../../api/paymentApi';

const ZaloPayReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Đang xác thực giao dịch...');
  const [txId, setTxId] = useState('');

  useEffect(() => {
    const run = async () => {
      const qpTx = searchParams.get('transactionId') || searchParams.get('transaction_id');
      const qpAppTrans = searchParams.get('apptransid') || searchParams.get('app_trans_id');
      const qpStatus = searchParams.get('status');
      const storedTx = localStorage.getItem('pendingTransactionId');
      const resolvedTxId = qpTx || storedTx || qpAppTrans;
      setTxId(resolvedTxId || '');

      if (!resolvedTxId) {
        setStatus('failed');
        setMessage('Không tìm thấy mã giao dịch. Vui lòng thử lại.');
        return;
      }

      const isReturnSuccess = qpStatus === '1' || qpStatus === 'success';

      try {
        const res = await paymentApi.getPaymentStatus(resolvedTxId);
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
          setMessage('Thanh toán thành công! Giao dịch đã được xác nhận.');
          localStorage.removeItem('pendingTransactionId');
        } else if (
          ['failed', 'cancelled', 'canceled', 'payment_failed', 'refunded'].includes(normalized)
        ) {
          setStatus('failed');
          setMessage('Thanh toán thất bại hoặc đã bị hủy.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl p-8 shadow-lg border border-neutral-200/70">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="text-neutral-600 text-sm">Mã giao dịch: {txId || '--'}</p>
          </div>
          <Badge variant={badgeVariant}>{status}</Badge>
        </div>

        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-neutral-700">
          {message}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/buyer/dashboard')}>Về trang đơn hàng</Button>
          <Button variant="outline" onClick={() => navigate('/marketplace')}>
            Tiếp tục xem xe
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ZaloPayReturn;
