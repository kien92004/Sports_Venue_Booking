import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../helper/AuthContext";
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface BookingDetail {
  bookingdetailid: number;
  bookingid: number;
  fieldid: number;
  shiftid: number;
  playdate: string;
  price: number;
  field?: { namefield: string; fieldid: number };
  shifts?: { nameshift: string; shiftstart: string; shiftend: string };
}

interface Booking {
  bookingid: number;
  username: string;
  bookingdate: string;
  bookingprice: number;
  phone: string;
  note: string;
  bookingstatus: string;
  refund: boolean;
  bookingdetails?: BookingDetail[];
}

const OwnerBookingPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const ownerUsername = user?.username || "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");

  const [search, setSearch] = useState({
    keyword: "",
    datebook: "",
    status: "",
  });

  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch bookings for owner's fields
  useEffect(() => {
    if (!ownerUsername) return;

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${URL_BACKEND}/rest/bookings/getByOwner/${ownerUsername}`
        );
        const ownerBookings = res.data || [];
        setBookings(ownerBookings);
        setFilteredBookings(ownerBookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [ownerUsername]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let filtered = bookings;

    if (search.keyword) {
      filtered = filtered.filter(b =>
        b.username.toLowerCase().includes(search.keyword.toLowerCase())
      );
    }

    if (search.datebook) {
      filtered = filtered.filter(b =>
        b.bookingdate.includes(search.datebook)
      );
    }

    if (search.status) {
      filtered = filtered.filter(b => b.bookingstatus === search.status);
    }

    setFilteredBookings(filtered);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedBookings(bookings.map(b => b.bookingid));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleCheckboxChange = (bookingId: number) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedBookings.length === 0) return;

    if (!window.confirm(`Xác nhận xóa ${selectedBookings.length} phiếu đặt?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedBookings.map(id =>
          axios.delete(`${URL_BACKEND}/rest/bookings/delete/${id}`)
        )
      );
      alert("Xóa thành công!");
      setSelectedBookings([]);
      setSelectAll(false);
      handleRefresh();
    } catch (error) {
      console.error("Error deleting bookings:", error);
      alert("Có lỗi xảy ra khi xóa!");
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      await axios.put(`${URL_BACKEND}/rest/bookings/update/${bookingId}`, {
        bookingstatus: newStatus,
      });
      const updated = bookings.map(b =>
        b.bookingid === bookingId ? { ...b, bookingstatus: newStatus } : b
      );
      setBookings(updated);
      setFilteredBookings(updated);
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetail(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper py-4">
      <div className="container-fluid bg-white rounded shadow p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0 fw-bold text-dark">Phiếu Đặt Sân</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0 mt-2">
                <li className="breadcrumb-item"><a href="/owner" className="text-primary">Trang Chủ</a></li>
                <li className="breadcrumb-item active text-secondary" aria-current="page">Phiếu Đặt</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist" style={{ borderBottom: "2px solid #e9ecef" }}>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "list" ? "active border-bottom-3 text-primary" : "text-secondary"}`}
              onClick={() => setActiveTab("list")}
              style={{
                borderBottom: activeTab === "list" ? "3px solid #0d6efd" : "none",
                color: activeTab === "list" ? "#0d6efd" : "#6c757d"
              }}
            >
              <i className="fa fa-list me-2"></i> Danh Sách Phiếu
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "calendar" ? "active border-bottom-3 text-primary" : "text-secondary"}`}
              onClick={() => setActiveTab("calendar")}
              style={{
                borderBottom: activeTab === "calendar" ? "3px solid #0d6efd" : "none",
                color: activeTab === "calendar" ? "#0d6efd" : "#6c757d"
              }}
            >
              <i className="fa fa-calendar me-2"></i> Lịch Đặt Sân
            </button>
          </li>
        </ul>

        {/* List View */}
        {activeTab === "list" && (
          <>
            {/* Search Filter */}
            <form className="row g-2 mb-3" onSubmit={handleSearch}>
              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-semibold text-dark">Tên người đặt</label>
                <input
                  type="text"
                  className="form-control border-1"
                  placeholder="Nhập họ hoặc tên"
                  value={search.keyword}
                  onChange={e => setSearch(s => ({ ...s, keyword: e.target.value }))}
                />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-semibold text-dark">Ngày đặt</label>
                <input
                  type="date"
                  className="form-control border-1"
                  value={search.datebook}
                  onChange={e => setSearch(s => ({ ...s, datebook: e.target.value }))}
                />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label fw-semibold text-dark">Trạng thái</label>
                <select
                  className="form-select border-1"
                  value={search.status}
                  onChange={e => setSearch(s => ({ ...s, status: e.target.value }))}
                >
                  <option value="">Tất cả</option>
                  <option value="Đã Cọc">Đã Cọc</option>
                  <option value="Hoàn Thành">Hoàn Thành</option>
                  <option value="Hủy Đặt">Hủy Đặt</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2">
                <button type="submit" className="btn btn-success w-100 fw-semibold">
                  <i className="fa fa-search me-1"></i> Tìm kiếm
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 fw-semibold"
                  onClick={handleRefresh}
                >
                  Làm mới
                </button>
              </div>
            </form>

            {/* Action buttons */}
            <div className="row mb-3">
              <div className="col-12">
                <button
                  className="btn btn-danger fw-semibold"
                  onClick={handleDeleteSelected}
                  disabled={selectedBookings.length === 0}
                >
                  <i className="fa fa-trash me-1"></i>
                  Xóa ({selectedBookings.length}) phiếu đã chọn
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="row">
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table table-hover align-middle" style={{ borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <tr>
                        <th style={{ borderTop: "1px solid #dee2e6" }}>
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th style={{ borderTop: "1px solid #dee2e6", color: "#495057", fontWeight: "600" }}>#</th>
                        <th style={{ borderTop: "1px solid #dee2e6", color: "#495057", fontWeight: "600" }}>Người Đặt</th>
                        <th style={{ borderTop: "1px solid #dee2e6", color: "#495057", fontWeight: "600" }}>Ngày Đặt</th>
                        <th style={{ borderTop: "1px solid #dee2e6", color: "#495057", fontWeight: "600" }}>Thành Tiền</th>
                        <th style={{ borderTop: "1px solid #dee2e6", color: "#495057", fontWeight: "600" }}>Số Điện Thoại</th>
                        <th style={{ borderTop: "1px solid #dee2e6", color: "#495057", fontWeight: "600" }}>Trạng Thái</th>
                        <th style={{ borderTop: "1px solid #dee2e6", color: "#495057", fontWeight: "600", textAlign: "center" }}>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-4" style={{ borderBottom: "1px solid #dee2e6" }}>
                            Không có phiếu đặt nào
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((booking, idx) => (
                          <tr key={booking.bookingid} style={{ borderBottom: "1px solid #dee2e6" }} className="align-middle">
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedBookings.includes(booking.bookingid)}
                                onChange={() => handleCheckboxChange(booking.bookingid)}
                              />
                            </td>
                            <td>{idx + 1}</td>
                            <td>
                              <strong style={{ color: "#212529" }}>{booking.username}</strong>
                            </td>
                            <td style={{ color: "#6c757d" }}>{formatDate(booking.bookingdate)}</td>
                            <td className="fw-bold" style={{ color: "#28a745" }}>
                              {formatCurrency(booking.bookingprice)}
                            </td>
                            <td style={{ color: "#6c757d" }}>{booking.phone}</td>
                            <td>
                              <span
                                className={`badge ${booking.bookingstatus === "Hoàn Thành"
                                    ? "bg-success"
                                    : booking.bookingstatus === "Đã Cọc"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                              >
                                {booking.bookingstatus}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => handleViewDetails(booking)}
                                style={{ fontSize: "0.875rem" }}
                              >
                                <i className="fa fa-eye"></i> Xem chi tiết
                              </button>
                              <select
                                className="form-select form-select-sm d-inline-block w-auto"
                                value={booking.bookingstatus}
                                onChange={(e) =>
                                  handleStatusChange(booking.bookingid, e.target.value)
                                }
                              >
                                <option value="Đã Cọc">Đã Cọc</option>
                                <option value="Hoàn Thành">Hoàn Thành</option>
                                <option value="Hủy Đặt">Hủy Đặt</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Calendar View */}
        {activeTab === "calendar" && (
          <div className="card shadow border-0">
            <div className="card-body p-4">
              <div className="alert alert-info border-0" style={{ backgroundColor: "#e7f3ff", color: "#004085" }}>
                <i className="fa fa-info-circle me-2"></i>
                Lịch đặt sân theo ngày. Thể hiện các phiếu đặt và tình trạng của sân
              </div>
              <div className="row">
                {bookings.length === 0 ? (
                  <div className="col-12 text-center text-muted py-4">
                    Không có phiếu đặt nào để hiển thị
                  </div>
                ) : (
                  bookings.map(booking =>
                    booking.bookingdetails?.map(detail => (
                      <div key={detail.bookingdetailid} className="col-md-6 col-lg-4 mb-3">
                        <div
                          className="card shadow-sm"
                          style={{
                            borderLeft: `4px solid ${booking.bookingstatus === "Hoàn Thành"
                                ? "#28a745"
                                : booking.bookingstatus === "Đã Cọc"
                                  ? "#ffc107"
                                  : "#dc3545"
                              }`
                          }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="card-title mb-2" style={{ color: "#212529" }}>
                                  <i className="fa fa-futbol me-2" style={{ color: "#0d6efd" }}></i>
                                  {detail.field?.namefield}
                                </h6>
                                <p className="text-muted small mb-2">
                                  <i className="fa fa-calendar me-1"></i>
                                  {formatDate(detail.playdate)}
                                </p>
                                <p className="text-muted small mb-2">
                                  <i className="fa fa-clock-o me-1"></i>
                                  {detail.shifts?.nameshift}
                                </p>
                                <p className="text-muted small">
                                  <i className="fa fa-user me-1"></i>
                                  {booking.username}
                                </p>
                              </div>
                              <span
                                className={`badge ${booking.bookingstatus === "Hoàn Thành"
                                    ? "bg-success"
                                    : booking.bookingstatus === "Đã Cọc"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                              >
                                {booking.bookingstatus}
                              </span>
                            </div>
                            <div className="border-top mt-3 pt-3">
                              <p className="text-success fw-bold mb-0">
                                {formatCurrency(detail.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && selectedBooking && (
          <div
            className="modal d-block"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chi Tiết Phiếu Đặt</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetail(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Mã Phiếu:</strong>
                      <p>{selectedBooking.bookingid}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Người Đặt:</strong>
                      <p>{selectedBooking.username}</p>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Số Điện Thoại:</strong>
                      <p>{selectedBooking.phone}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Ngày Đặt:</strong>
                      <p>{formatDate(selectedBooking.bookingdate)}</p>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Trạng Thái:</strong>
                      <p>
                        <span
                          className={`badge ${selectedBooking.bookingstatus === "Hoàn Thành"
                              ? "bg-success"
                              : selectedBooking.bookingstatus === "Đã Cọc"
                                ? "bg-warning"
                                : "bg-danger"
                            }`}
                        >
                          {selectedBooking.bookingstatus}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <strong>Thành Tiền:</strong>
                      <p className="fw-bold text-success">
                        {formatCurrency(selectedBooking.bookingprice)}
                      </p>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>Ghi Chú:</strong>
                      <p>{selectedBooking.note || "Không có"}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <strong>Chi Tiết Đặt Sân:</strong>
                      <table className="table table-sm table-bordered mt-2">
                        <thead>
                          <tr>
                            <th>Sân</th>
                            <th>Ngày Chơi</th>
                            <th>Ca Chơi</th>
                            <th>Giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBooking.bookingdetails?.map(detail => (
                            <tr key={detail.bookingdetailid}>
                              <td>{detail.field?.namefield}</td>
                              <td>{formatDate(detail.playdate)}</td>
                              <td>{detail.shifts?.nameshift}</td>
                              <td>{formatCurrency(detail.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetail(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerBookingPage;
