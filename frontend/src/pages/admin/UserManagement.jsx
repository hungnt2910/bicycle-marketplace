import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import adminApi from "../../api/adminApi";
import userApi from "../../api/userApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [sellerActionLoading, setSellerActionLoading] = useState({});
  const [kycModalUser, setKycModalUser] = useState(null);
  const [rejectModalUser, setRejectModalUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // ─── Labels & Colors ────────────────────────────────────────────────────────

  const roleLabels = {
    buyer: "Người mua",
    seller: "Người bán",
    inspector: "Kiểm định viên",
    admin: "Quản trị viên",
  };

  const roleColors = {
    buyer: "blue",
    seller: "green",
    inspector: "purple",
    admin: "red",
  };

  const statusLabels = {
    active: "Hoạt động",
    suspended: "Tạm khóa",
    banned: "Cấm vĩnh viễn",
  };

  const statusColors = {
    active: "green",
    suspended: "yellow",
    banned: "red",
  };

  const sellerStatusLabels = {
    pending: "Chờ duyệt seller",
    approved: "Đã là seller",
    rejected: "Từ chối seller",
    none: "Chưa yêu cầu",
  };

  const sellerStatusColors = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    none: "muted",
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const mapSellerStatus = (user) => {
    const role = (user?.role || "").toLowerCase();
    const hasKycArray = Array.isArray(user?.CCCD) && user.CCCD.length > 0;
    const hasKycFlat = Boolean(
      user?.cccdFront || user?.cccdBack || user?.cccd_front || user?.cccd_back,
    );
    const hasKyc =
      hasKycArray || hasKycFlat || Boolean(user?.kycImages?.length);

    if (user?.verifiedRoleSeller || role === "seller") return "approved";
    if (user?.sellerRequest === true || hasKyc) return "pending";
    return "none";
  };

  const withSellerLoading = (userId, value) => {
    setSellerActionLoading((prev) => ({ ...prev, [userId]: value }));
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userApi.getAllUsers();
      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || [];

      const mappedUsers = data.map((item) => {
        const role = String(item?.role || "buyer").toLowerCase();

        // Parse CCCD images
        const cccdArray = [];
        if (Array.isArray(item?.CCCD)) {
          item.CCCD.forEach((entry) => {
            if (entry && typeof entry === "object") {
              const frontImage =
                entry.frontImage || entry.front || entry.front_image;
              const backImage =
                entry.backImage || entry.back || entry.back_image;
              if (frontImage || backImage)
                cccdArray.push({ frontImage, backImage });
            } else if (typeof entry === "string") {
              const parts = entry
                .split(",")
                .map((p) => p.replace(/^"|"$/g, "").trim())
                .filter(Boolean);
              if (parts.length) {
                cccdArray.push({
                  frontImage: parts[0],
                  backImage: parts[1] || "",
                });
              }
            }
          });
        }
        const flatFront = item?.cccdFront || item?.cccd_front;
        const flatBack = item?.cccdBack || item?.cccd_back;
        if (flatFront || flatBack)
          cccdArray.push({ frontImage: flatFront, backImage: flatBack });

        return {
          id: item?._id || item?.id,
          fullName:
            `${item?.firstName || ""} ${item?.lastName || ""}`.trim() ||
            item?.profile?.fullName ||
            item?.fullName ||
            "N/A",
          email: item?.email || "N/A",
          phone: item?.phone || item?.profile?.phone || "N/A",
          role,
          status: String(item?.status || "active").toLowerCase(),
          joinDate: item?.createdAt
            ? new Date(item.createdAt).toLocaleDateString("vi-VN")
            : "--",
          lastLogin: item?.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString("vi-VN")
            : "--",
          sellerStatus: mapSellerStatus(item),
          verifiedRoleSeller: item?.verifiedRoleSeller,
          cccd: cccdArray,
        };
      });

      setUsers(mappedUsers.reverse());
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Modals ───────────────────────────────────────────────────────────────────

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setStatusModalOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await adminApi.updateUserRole(selectedUser.id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u,
        ),
      );
      toast.success("Đã cập nhật vai trò thành công");
      setRoleModalOpen(false);
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error(err?.response?.data?.message || "Không thể cập nhật vai trò");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !newStatus) return;
    try {
      await userApi.updateUser(selectedUser.id, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: newStatus } : u,
        ),
      );
      toast.success("Đã cập nhật trạng thái thành công");
      setStatusModalOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(
        err?.response?.data?.message || "Không thể cập nhật trạng thái",
      );
    }
  };

  // ─── Seller Actions ───────────────────────────────────────────────────────────

  const handleApproveSeller = async (user) => {
    if (!user?.id) return;
    withSellerLoading(user.id, true);
    try {
      await adminApi.verifySeller(user.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                role: "seller",
                sellerStatus: "approved",
                verifiedRoleSeller: true,
              }
            : u,
        ),
      );
      toast.success("Đã xác minh seller thành công");
    } catch (err) {
      console.error("Error verifying seller:", err);
      toast.error(err?.response?.data?.message || "Không thể xác minh seller");
    } finally {
      withSellerLoading(user.id, false);
    }
  };

  const handleRejectSeller = async (user) => {
    if (!user?.id) return;
    const reason = window.prompt("Nhập lý do từ chối hồ sơ seller");
    if (reason === null) return;
    withSellerLoading(user.id, true);
    try {
      // FIX: dùng đúng user từ tham số, không dùng selectedUser
      await adminApi.rejectSeller(user.id, { reason });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, sellerStatus: "rejected", sellerRejectReason: reason }
            : u,
        ),
      );
      toast.info("Đã từ chối hồ sơ seller");
    } catch (err) {
      console.error("Error rejecting seller:", err);
      toast.error(err?.response?.data?.message || "Không thể từ chối hồ sơ");
    } finally {
      withSellerLoading(user.id, false);
    }
  };

  // ─── Filter ───────────────────────────────────────────────────────────────────

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone || "").toString().includes(searchQuery);
    const matchRole = filterRole === "all" || user.role === filterRole;
    const matchStatus = filterStatus === "all" || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  // FIX: đếm đúng — chỉ tính pending
  const sellerPendingCount = users.filter(
    (u) => u.sellerStatus === "pending",
  ).length;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      {/* Error */}
      {error && (
        <div className="mb-6 bg-danger/5 border border-red-200 text-danger px-4 py-3 rounded-[16px]">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Tổng người dùng</p>
          <p className="text-2xl font-bold text-primary-900">{users.length}</p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Hoạt động</p>
          <p className="text-2xl font-bold text-success">
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Chờ duyệt seller</p>
          <p className="text-2xl font-bold text-gold">{sellerPendingCount}</p>
        </div>
        <div className="lux-panel">
          <p className="text-warmgray-600 text-sm">Kiểm định viên</p>
          <p className="text-2xl font-bold text-primary-900">
            {users.filter((u) => u.role === "inspector").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="lux-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Vai trò
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="all">Tất cả vai trò</option>
              {Object.keys(roleLabels).map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-warmgray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.keys(statusLabels).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="lux-panel overflow-hidden">
          <table className="w-full">
            <thead className="bg-warmgray-50 border-b border-warmgray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Seller KYC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-warmgray-50">
                  {/* User info */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-primary-900">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-warmgray-600">{user.email}</p>
                      <p className="text-sm text-warmgray-500">{user.phone}</p>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span
                      className={`whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium ${
                        roleColors[user.role] === "blue"
                          ? "bg-primary-800/10 text-primary-900"
                          : roleColors[user.role] === "green"
                            ? "bg-success/10 text-green-800"
                            : roleColors[user.role] === "purple"
                              ? "bg-info/10 text-purple-800"
                              : "bg-danger/10 text-red-800"
                      }`}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[user.status] === "green"
                          ? "bg-success/10 text-green-800"
                          : statusColors[user.status] === "yellow"
                            ? "bg-gold/10 text-yellow-800"
                            : "bg-danger/10 text-red-800"
                      }`}
                    >
                      {statusLabels[user.status] || user.status}
                    </span>
                  </td>

                  {/* Seller KYC */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span
                        className={`whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium inline-flex w-fit ${
                          sellerStatusColors[user.sellerStatus] === "success"
                            ? "bg-success/10 text-green-800"
                            : sellerStatusColors[user.sellerStatus] ===
                                "warning"
                              ? "bg-gold/10 text-yellow-800"
                              : sellerStatusColors[user.sellerStatus] ===
                                  "danger"
                                ? "bg-danger/10 text-red-800"
                                : "bg-warmgray-200 text-warmgray-700"
                        }`}
                      >
                        {sellerStatusLabels[user.sellerStatus] ||
                          sellerStatusLabels.none}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {user.cccd?.length > 0 && (
                          <button
                            onClick={() => setKycModalUser(user)}
                            className="px-3 py-1 bg-warmgray-200 text-warmgray-800 rounded font-medium text-sm hover:bg-warmgray-300"
                          >
                            Xem CCCD
                          </button>
                        )}
                        {user.sellerStatus !== "approved" && (
                          <>
                            <button
                              onClick={() => handleApproveSeller(user)}
                              disabled={sellerActionLoading[user.id]}
                              className="px-3 py-1 bg-primary-700 text-white rounded font-medium text-sm hover:bg-primary-800 disabled:opacity-60"
                            >
                              {sellerActionLoading[user.id]
                                ? "Đang duyệt..."
                                : "Duyệt seller"}
                            </button>
                            <button
                              onClick={() => handleRejectSeller(user)}
                              disabled={sellerActionLoading[user.id]}
                              className="px-3 py-1 bg-danger text-white rounded font-medium text-sm hover:bg-red-700 disabled:opacity-60"
                            >
                              {sellerActionLoading[user.id]
                                ? "Đang xử lý..."
                                : "Từ chối"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Join date */}
                  <td className="px-6 py-4 text-sm text-warmgray-600">
                    {user.joinDate}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openStatusModal(user)}
                        disabled={user.role === "admin"}
                        className="whitespace-nowrap px-3 py-1 text-gold hover:bg-gold/5 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Đổi trạng thái
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-warmgray-500">
              Không tìm thấy người dùng nào
            </div>
          )}
        </div>
      )}

      {/* Role Modal */}
      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-primary-900">Đổi vai trò</h2>
            <p className="text-warmgray-600 text-sm">{selectedUser.fullName}</p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              {Object.keys(roleLabels)
                .filter((r) => r !== "admin")
                .map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 text-warmgray-600 hover:bg-warmgray-100 rounded-[12px] text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-4 py-2 bg-primary-700 text-white rounded-[12px] text-sm hover:bg-primary-800"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-primary-900">
              Đổi trạng thái
            </h2>
            <p className="text-warmgray-600 text-sm">{selectedUser.fullName}</p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-primary-600"
            >
              {Object.keys(statusLabels).map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-warmgray-600 hover:bg-warmgray-100 rounded-[12px] text-sm"
              >
                Hủy
              </button>

              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-primary-700 text-white rounded-[12px] text-sm hover:bg-primary-800"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reject Seller Modal */}
      {rejectModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-danger">
              Từ chối hồ sơ seller
            </h2>
            <p className="text-warmgray-600 text-sm">
              Người dùng: <strong>{rejectModalUser.fullName}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Lý do từ chối: <span className="text-danger">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:border-danger"
                rows="3"
                placeholder="Nhập lý do chi tiết để người dùng chỉnh sửa..."
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setRejectModalUser(null)}
                className="px-4 py-2 text-warmgray-600 hover:bg-warmgray-100 rounded-[12px] text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={submitRejectSeller}
                className="px-4 py-2 bg-danger text-white rounded-[12px] text-sm font-medium hover:bg-red-700"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {kycModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] max-w-3xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-900">
                  CCCD/CMND của seller
                </h2>
                <p className="text-warmgray-600 text-sm">
                  {kycModalUser.fullName}
                </p>
              </div>
              <button
                onClick={() => setKycModalUser(null)}
                className="text-warmgray-500 hover:text-primary-800"
              >
                Đóng
              </button>
            </div>

            {kycModalUser.cccd?.length === 0 && (
              <p className="text-warmgray-500">Không có hình ảnh CCCD</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kycModalUser.cccd?.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  {item.frontImage && (
                    <div>
                      <p className="text-sm text-warmgray-600 mb-1">
                        Mặt trước
                      </p>
                      <img
                        src={item.frontImage}
                        alt="CCCD front"
                        className="w-full rounded-[12px] border"
                      />
                    </div>
                  )}
                  {item.backImage && (
                    <div>
                      <p className="text-sm text-warmgray-600 mb-1">Mặt sau</p>
                      <img
                        src={item.backImage}
                        alt="CCCD back"
                        className="w-full rounded-[12px] border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
