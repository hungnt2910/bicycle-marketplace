import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import walletApi from '../../api/walletApi';
import { Badge, Button, Card, Input, Pagination, Select } from '../../components/ui';

const MIN_WITHDRAW = 50000;
const DEFAULT_ESCROW_ROLE = 'seller';

const numberOrZero = (value) => Number(value || 0);

const Wallet = () => {
  const [summary, setSummary] = useState(null);
  const [walletSummary, setWalletSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
  });

  const availableBalance = useMemo(
    () =>
      numberOrZero(
        totals?.availableBalance ??
          summary?.availableBalance ??
          walletSummary?.wallet?.availableBalance ??
          (summary?.balance ?? summary?.currentBalance ?? 0) - (summary?.pendingBalance ?? 0)
      ),
    [summary, totals, walletSummary]
  );

  const escrowHold = useMemo(
    () =>
      numberOrZero(
        totals?.escrowHeld ??
          totals?.pendingBalance ??
          summary?.pendingBalance ??
          summary?.escrowHold
      ),
    [summary, totals]
  );

  const totalWithdrawn = useMemo(
    () =>
      numberOrZero(
        summary?.totalWithdrawn ||
          walletSummary?.wallet?.totalWithdrawn ||
          summary?.withdrawn ||
          summary?.totalPayout
      ),
    [summary, walletSummary]
  );

  const currency = summary?.currency || walletSummary?.wallet?.currency || 'VND';

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const [walletRes, summaryRes, totalsRes] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getSummary(),
        walletApi.getTotals({ role: DEFAULT_ESCROW_ROLE }),
      ]);

      const walletData = walletRes?.data?.data || walletRes?.data || {};
      const summaryData = summaryRes?.data?.data || summaryRes?.data || {};
      const totalsData = totalsRes?.data?.data || totalsRes?.data || {};

      setSummary(walletData);
      setWalletSummary(summaryData);
      setTotals(totalsData);
    } catch (err) {
      console.error('Load wallet summary error:', err);
      toast.error(err?.response?.data?.message || 'Không lấy được số dư ví');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchTransactions = async (pageParam = page, typeParam = filters.type) => {
    setLoadingTx(true);
    try {
      const res = await walletApi.getTransactions({
        type: typeParam || undefined,
        page: pageParam,
        limit,
      });
      const data = res?.data?.data || res?.data || {};
      const items = Array.isArray(data) ? data : data?.items || data?.transactions || [];
      setTransactions(items);
      const pg = res?.data?.pagination ||
        data?.pagination || {
          total: data?.total,
          pages: data?.pages,
          page: data?.page,
        };
      setPagination({
        total: pg.total || items.length,
        pages: pg.pages || Math.ceil((pg.total || items.length || limit) / limit),
      });
      setPage(pg.page || pageParam);
    } catch (err) {
      console.error('Load wallet transactions error:', err);
      toast.error(err?.response?.data?.message || 'Không lấy được lịch sử ví');
    } finally {
      setLoadingTx(false);
    }
  };

  const refreshAll = () => {
    fetchSummary();
    fetchTransactions(1);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const statusMatch = filters.status
        ? (tx?.status || '').toLowerCase() === filters.status
        : true;
      return statusMatch;
    });
  }, [transactions, filters]);

  const handleTypeChange = (value) => {
    setFilters((prev) => ({ ...prev, type: value }));
    setPage(1);
    fetchTransactions(1, value);
  };

  const handleStatusChange = (value) => setFilters((prev) => ({ ...prev, status: value }));

  const handleWithdraw = async () => {
    const amountNumber = Number(withdrawForm.amount || 0);
    if (!amountNumber || amountNumber <= 0) {
      toast.error('Số tiền rút không hợp lệ');
      return;
    }
    if (amountNumber < MIN_WITHDRAW) {
      toast.error(`Số tiền tối thiểu là ${MIN_WITHDRAW.toLocaleString('vi-VN')} ${currency}`);
      return;
    }
    if (amountNumber > availableBalance) {
      toast.error('Số dư không đủ để rút');
      return;
    }
    if (!withdrawForm.bankName || !withdrawForm.bankAccount) {
      toast.error('Vui lòng nhập đủ thông tin ngân hàng');
      return;
    }

    setWithdrawing(true);
    try {
      const payload = {
        amount: amountNumber,
        bankDetails: {
          bankName: withdrawForm.bankName,
          accountNumber: withdrawForm.bankAccount,
          accountHolder: withdrawForm.accountHolder,
        },
      };
      await walletApi.requestWithdrawal(payload);
      toast.success('Yêu cầu rút tiền đã được tạo');
      setWithdrawForm({ amount: '', bankName: '', bankAccount: '', accountHolder: '' });
      refreshAll();
    } catch (err) {
      console.error('Withdraw request error:', err);
      toast.error(err?.response?.data?.message || 'Không gửi được yêu cầu rút tiền');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatMoney = (value) => `${numberOrZero(value).toLocaleString('vi-VN')} ${currency}`;
  const formatDateTime = (value) =>
    value
      ? new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--';

  const statusVariant = (status) => {
    const normalized = (status || '').toLowerCase();
    if (['completed', 'success', 'succeeded'].includes(normalized)) return 'success';
    if (['pending', 'processing'].includes(normalized)) return 'warning';
    if (['failed', 'rejected', 'canceled', 'cancelled'].includes(normalized)) return 'danger';
    return 'primary';
  };

  const typeVariant = (type) => {
    const normalized = (type || '').toLowerCase();
    if (
      ['deposit', 'refund', 'sale_payment', 'dispute_refund', 'escrow_release'].includes(normalized)
    )
      return 'success';
    if (
      [
        'withdrawal',
        'purchase',
        'commission',
        'penalty',
        'escrow_hold',
        'listing_fee',
        'service_fee',
      ].includes(normalized)
    )
      return 'danger';
    return 'gray';
  };

  const typeLabel = (type) => {
    const normalized = (type || '').toLowerCase();
    const labels = {
      deposit: 'Nạp tiền',
      refund: 'Hoàn tiền',
      sale_payment: 'Tiền bán xe',
      dispute_refund: 'Hoàn tranh chấp',
      purchase: 'Thanh toán mua',
      withdrawal: 'Rút tiền',
      commission: 'Phí nền tảng',
      penalty: 'Phí phạt',
      escrow_hold: 'Giữ escrow',
      escrow_release: 'Giải phóng escrow',
      listing_fee: 'Phí đăng tin',
      service_fee: 'Phí dịch vụ',
    };
    return labels[normalized] || 'Khác';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="relative bg-gradient-to-br from-sky-50 via-indigo-50 to-white border-b border-indigo-100 rounded-b-[28px] shadow-soft">
        <div className="container-custom px-4 py-10 relative z-10">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Ví của bạn
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              Kiểm soát dòng tiền và rút nhanh về ngân hàng
            </h1>
            <p className="text-slate-600 text-base md:text-lg max-w-3xl">
              Xem số dư khả dụng, tiền đang giữ trong escrow và lịch sử giao dịch. Khi cần rút tiền,
              hãy tạo yêu cầu và hệ thống sẽ cập nhật trạng thái ngay khi xử lý.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={refreshAll}
              disabled={loadingSummary || loadingTx}
            >
              {loadingSummary || loadingTx ? 'Đang cập nhật...' : 'Làm mới số dư'}
            </Button>
            <span className="text-sm text-slate-500">
              Số liệu được đồng bộ sau các sự kiện giao dịch/escrow.
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
      </div>

      <div className="container-custom px-4 mt-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Số dư khả dụng',
              value: formatMoney(availableBalance),
              sub: 'Có thể rút hoặc thanh toán ngay',
              accent: 'from-emerald-500 to-teal-500',
            },
            {
              title: 'Đang giữ trong escrow',
              value: formatMoney(escrowHold),
              sub: 'Sẽ được giải phóng khi giao dịch hoàn tất',
              accent: 'from-amber-500 to-orange-500',
            },
            {
              title: 'Tổng đã rút',
              value: formatMoney(totalWithdrawn),
              sub: 'Tích lũy các yêu cầu rút thành công',
              accent: 'from-indigo-500 to-blue-500',
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="p-6 shadow-soft bg-white border border-slate-100 relative overflow-hidden"
            >
              <div
                className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${item.accent} opacity-10 rounded-full`}
              />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-600 mb-1">{item.title}</p>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  {loadingSummary ? '...' : item.value}
                </p>
                <p className="text-sm text-slate-500">{item.sub}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 shadow-soft bg-white border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Lịch sử ví</h2>
                  <p className="text-sm text-slate-500">
                    Các giao dịch credit/debit, release escrow, rút tiền.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  <Select
                    value={filters.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    options={[
                      { label: 'Tất cả', value: '' },
                      { label: 'Thanh toán mua', value: 'purchase' },
                      { label: 'Tiền bán xe', value: 'sale_payment' },
                      { label: 'Đặt cọc / Nạp', value: 'deposit' },
                      { label: 'Giải phóng escrow', value: 'escrow_release' },
                      { label: 'Rút tiền', value: 'withdrawal' },
                      { label: 'Hoàn tiền', value: 'refund' },
                    ]}
                    placeholder="Loại giao dịch"
                    className="min-w-[160px]"
                  />
                  <Select
                    value={filters.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    options={[
                      { label: 'Tất cả', value: '' },
                      { label: 'Đang xử lý', value: 'pending' },
                      { label: 'Thành công', value: 'completed' },
                      { label: 'Thất bại / huỷ', value: 'failed' },
                    ]}
                    placeholder="Trạng thái"
                    className="min-w-[150px]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase text-slate-500 border-b border-slate-100">
                      <th className="py-3 pr-3">Ngày</th>
                      <th className="py-3 pr-3">Mô tả</th>
                      <th className="py-3 pr-3">Loại</th>
                      <th className="py-3 pr-3">Số tiền</th>
                      <th className="py-3 pr-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTx ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          Đang tải lịch sử ví...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          Chưa có giao dịch nào.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const amount = numberOrZero(tx?.amount);
                        const isCredit = typeVariant(tx?.type) === 'success';
                        return (
                          <tr
                            key={tx?._id || tx?.id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-3 pr-3 text-sm text-slate-600 whitespace-nowrap">
                              {formatDateTime(tx?.createdAt || tx?.date)}
                            </td>
                            <td className="py-3 pr-3 text-sm text-slate-700 max-w-xs">
                              <p className="font-semibold text-slate-900 line-clamp-1">
                                {tx?.description || tx?.title || 'Giao dịch ví'}
                              </p>
                              <p className="text-xs text-slate-500 line-clamp-2">
                                {tx?.referenceId
                                  ? `Mã tham chiếu: ${tx.referenceId}`
                                  : tx?.note || ''}
                              </p>
                            </td>
                            <td className="py-3 pr-3 text-sm text-slate-700">
                              <Badge variant={typeVariant(tx?.type)} size="sm">
                                {typeLabel(tx?.type)}
                              </Badge>
                            </td>
                            <td
                              className={`py-3 pr-3 text-sm font-semibold ${isCredit ? 'text-emerald-600' : 'text-danger'}`}
                            >
                              {`${isCredit ? '+' : '-'}${formatMoney(Math.abs(amount))}`}
                            </td>
                            <td className="py-3 pr-3 text-sm text-slate-700">
                              <Badge variant={statusVariant(tx?.status)} size="sm">
                                {tx?.status || 'N/A'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      Trang {page}/{pagination.pages || 1}
                      {pagination.total ? ` • Tổng ${pagination.total} giao dịch` : ''}
                    </p>
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.pages || 1}
                      onPageChange={(newPage) => fetchTransactions(newPage)}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6 shadow-soft bg-white border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Rút tiền về ngân hàng</h3>
              <p className="text-sm text-slate-500 mb-4">
                Vui lòng kiểm tra số dư khả dụng trước khi rút. Yêu cầu sẽ được xử lý theo cấu hình
                hệ thống (tự động hoặc chờ admin duyệt).
              </p>

              <div className="space-y-3">
                <Input
                  label="Số tiền muốn rút"
                  type="number"
                  min="0"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder={`${MIN_WITHDRAW.toLocaleString('vi-VN')} ${currency}`}
                />
                <Input
                  label="Ngân hàng"
                  value={withdrawForm.bankName}
                  onChange={(e) =>
                    setWithdrawForm((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  placeholder="Tên ngân hàng"
                />
                <Input
                  label="Số tài khoản"
                  value={withdrawForm.bankAccount}
                  onChange={(e) =>
                    setWithdrawForm((prev) => ({ ...prev, bankAccount: e.target.value }))
                  }
                  placeholder="Nhập số tài khoản nhận"
                />
                <Input
                  label="Chủ tài khoản"
                  value={withdrawForm.accountHolder}
                  onChange={(e) =>
                    setWithdrawForm((prev) => ({ ...prev, accountHolder: e.target.value }))
                  }
                  placeholder="Tên chủ tài khoản"
                />
                <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-[16px] px-3 py-2">
                  <span>Số dư khả dụng</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(availableBalance)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleWithdraw}
                    disabled={withdrawing || loadingSummary}
                  >
                    {withdrawing ? 'Đang gửi...' : 'Tạo yêu cầu rút'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={refreshAll}
                    disabled={withdrawing}
                  >
                    Làm mới
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Lưu ý: Số dư trong escrow sẽ được chuyển sang ví khi buyer xác nhận giao hàng hoặc
                  admin release. Sau đó mới có thể rút.
                </p>
              </div>
            </Card>

            <Card className="p-5 shadow-soft bg-white border border-slate-100">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Mẹo kiểm soát ví</h4>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  Refetch ví sau khi giao dịch hoàn tất, admin release/refund, hoặc rút tiền thành
                  công.
                </li>
                <li>
                  Theo dõi các dòng credit từ escrow release để đảm bảo đơn hàng được ghi nhận.
                </li>
                <li>Giữ lại mã tham chiếu giao dịch khi cần đối soát với bộ phận hỗ trợ.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
