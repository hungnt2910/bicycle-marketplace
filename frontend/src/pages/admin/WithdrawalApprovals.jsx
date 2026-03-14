import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Badge, Select, Pagination } from '../../components/ui';
import walletApi from '../../api/walletApi';
import { toast } from 'react-toastify';

const WithdrawalApprovals = () => {
  const [withdrawalId, setWithdrawalId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const statusVariant = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed' || normalized === 'accepted') return 'success';
    if (normalized === 'pending') return 'warning';
    if (['failed', 'cancelled', 'canceled', 'rejected'].includes(normalized)) return 'danger';
    return 'secondary';
  };

  const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
  const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '—');

  const fetchWithdrawals = async (pageParam = page, statusParam = statusFilter) => {
    setLoadingList(true);
    try {
      const res = await walletApi.getWithdrawals({
        page: pageParam,
        limit,
        status: statusParam || undefined,
      });

      const data = res?.data?.data || res?.data || {};
      const items = Array.isArray(data)
        ? data
        : data.items || data.withdrawals || data.results || data.transactions || [];

      setWithdrawals(Array.isArray(items) ? items : []);

      const pg = res?.data?.pagination ||
        data?.pagination || {
          total: data?.total || items.length,
          pages: data?.pages || Math.ceil((data?.total || items.length || limit) / limit),
          page: data?.page || pageParam,
        };

      setPagination({
        total: pg.total || items.length,
        pages: pg.pages || 1,
        page: pg.page || pageParam,
      });
      setPage(pg.page || pageParam);
    } catch (err) {
      console.error('Load withdrawals error:', err);
      toast.error(err?.response?.data?.message || 'Không tải được danh sách rút tiền');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(1, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async () => {
    const id = withdrawalId.trim();
    if (!id) {
      toast.error('Vui lòng nhập mã yêu cầu rút tiền');
      return;
    }

    setSubmitting(true);
    setLastResult(null);
    try {
      const res = await walletApi.acceptWithdrawal(id);
      const data = res?.data?.data || res?.data || {};
      toast.success('Đã duyệt yêu cầu rút tiền');
      setLastResult({
        id,
        status: data?.status || data?.withdrawalStatus || 'accepted',
        message: data?.message || 'Withdrawal accepted',
      });
      setWithdrawalId('');
      fetchWithdrawals(page, statusFilter);
    } catch (err) {
      console.error('Approve withdrawal error:', err);
      const message = err?.response?.data?.message || 'Duyệt thất bại';
      toast.error(message);
      setLastResult({ id, status: 'failed', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
    fetchWithdrawals(1, value);
  };

  const handlePageChange = (nextPage) => {
    if (!nextPage || nextPage < 1 || nextPage > (pagination.pages || 1)) return;
    setPage(nextPage);
    fetchWithdrawals(nextPage, statusFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Rút tiền
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Duyệt yêu cầu rút tiền</h1>
          <p className="text-sm text-slate-500 mt-1">
            Nhập mã giao dịch rút tiền (wallet transaction id) để chấp thuận và xem danh sách yêu
            cầu từ API GET /wallet/withdrawals.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchWithdrawals(page, statusFilter)}
          disabled={loadingList}
        >
          {loadingList ? 'Đang tải...' : 'Làm mới danh sách'}
        </Button>
      </div>

      <Card className="p-6 shadow-soft bg-white border border-slate-100">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Mã yêu cầu rút tiền</label>
          <Input
            value={withdrawalId}
            onChange={(e) => setWithdrawalId(e.target.value)}
            placeholder="Ví dụ: 69b44f6782614f0ebd1f35fd"
          />

          <div className="flex items-center gap-3">
            <Button onClick={handleApprove} disabled={submitting} variant="primary">
              {submitting ? 'Đang duyệt...' : 'Duyệt rút tiền'}
            </Button>
            <span className="text-xs text-slate-500">
              Yêu cầu phải ở trạng thái pending và cần token admin.
            </span>
          </div>

          {lastResult && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <Badge variant={lastResult.status === 'failed' ? 'danger' : 'success'} size="sm">
                {lastResult.status}
              </Badge>
              <div>
                <p className="text-sm font-semibold text-slate-900">ID: {lastResult.id}</p>
                <p className="text-xs text-slate-600">{lastResult.message}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 shadow-soft bg-white border border-slate-100">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Danh sách yêu cầu rút tiền</p>
            <p className="text-xs text-slate-500">API: GET /api/v1/wallet/withdrawals (admin)</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Select
              className="md:w-48"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={statusOptions}
              placeholder="Tất cả trạng thái"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-700 divide-x divide-warmgray-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm">ID</th>
                <th className="py-4 px-6 font-semibold text-sm">Người dùng</th>
                <th className="py-4 px-6 font-semibold text-sm">Số tiền</th>
                <th className="py-4 px-6 font-semibold text-sm">Ngân hàng</th>
                <th className="py-4 px-6 font-semibold text-sm">Trạng thái</th>
                <th className="py-4 px-6 font-semibold text-sm">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmgray-200">
              {loadingList && (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-warmgray-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              )}

              {!loadingList && withdrawals.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-warmgray-500">
                    Chưa có yêu cầu rút tiền nào
                  </td>
                </tr>
              )}

              {!loadingList &&
                withdrawals.map((w, idx) => {
                  const id = w._id || w.id;
                  const status = w.status || w.withdrawalStatus;
                  const user = w.user || w.userId || w.accountOwner;
                  const userName =
                    (user?.email || user?.phone || user?.username || '').trim() || '—';
                  const amount = formatMoney(w.amount || w.money || w.value || 0);
                  const bank = w.withdrawalDetails || w.bankDetails || w.bank || {};
                  const bankName = bank.bankName || w.bankName;
                  const accountNumber = bank.accountNumber || w.accountNumber;
                  const accountHolder = bank.accountHolder || w.accountHolder;

                  return (
                    <tr key={id || w.reference || idx} className="hover:bg-warmgray-50 transition-colors divide-x divide-warmgray-200">
                      <td className="py-4 px-6 align-middle">
                        <div className="font-medium text-primary-900">{id || '—'}</div>
                        {w.reference && (
                          <div className="text-xs text-warmgray-500 mt-1">Ref: {w.reference}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <div className="font-medium text-primary-900">{userName}</div>
                        {user?.profile?.fullName && (
                          <div className="text-sm text-warmgray-600 mt-1">{user.profile.fullName}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 align-middle font-semibold text-primary-700 whitespace-nowrap">
                        {amount}
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <div className="font-medium text-warmgray-800">{bankName || '—'}</div>
                        <div className="text-sm text-warmgray-600 mt-0.5">{accountHolder || '—'}</div>
                        <div className="text-sm text-warmgray-600 font-mono mt-0.5">{accountNumber || '—'}</div>
                      </td>
                      <td className="py-4 px-6 align-middle whitespace-nowrap">
                        <Badge variant={statusVariant(status)}>
                          {status || '—'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 align-middle text-sm text-warmgray-600 whitespace-nowrap">
                        {formatDateTime(w.createdAt || w.created_date || w.created_on)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4">
          <p className="text-sm text-slate-600">
            Hiển thị {withdrawals.length ? (page - 1) * limit + 1 : 0}-
            {(page - 1) * limit + withdrawals.length} / {pagination.total || withdrawals.length}
          </p>
          <Pagination
            currentPage={page}
            totalPages={pagination.pages || 1}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      <Card className="p-5 bg-slate-50 border border-slate-100">
        <p className="text-sm font-semibold text-slate-800 mb-2">Gợi ý kiểm tra</p>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
          <li>Đảm bảo đã đăng nhập bằng tài khoản admin (Bearer token hợp lệ).</li>
          <li>Mã cần nhập là _id của giao dịch rút tiền trả về từ API POST /wallet/withdraw.</li>
          <li>Sau khi duyệt, trạng thái giao dịch sẽ chuyển khỏi pending.</li>
          <li>API danh sách hỗ trợ status, page, limit: GET /api/v1/wallet/withdrawals.</li>
        </ul>
      </Card>
    </div>
  );
};

export default WithdrawalApprovals;
