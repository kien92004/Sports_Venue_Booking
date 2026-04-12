import axios from "axios";
import React, { useEffect, useState } from "react";
import BootstrapModal from '../../components/admin/BootstrapModal';
import ListCardBank from "../../components/user/ListCardBank";
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface User {
  username: string;
  passwords: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  address: string;
  image: string | null;
  gender: boolean;
  status: boolean;
}

interface Permanent {
  bookingId: number;
  username: string;
  phone: string;
  note: string;
  bookingStatus: string;
  bookingType: string;
  fieldName: string;
  fieldImage: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  price: number;
  playDate: string | null;
  startDate: string;
  endDate: string;
  dayOfWeek: number;
}
interface Booking {
  bookingid: number;
  username: string;
  bookingdate: string;
  bookingprice: number;
  phone: string;
  note: string;
  bookingstatus: string;
  refund: boolean; // Add this new property
  users?: User;
  // ...other fields
}

interface BookingDetail {
  bookingdetailid: number;
  bookingid: number;
  shiftid: number;
  playdate: string;
  fieldid: number;
  price: number;
  field?: { namefield: string };
  shifts?: { nameshift: string };
  // ...other fields
}

const BookingPage: React.FC = () => {
  const username = localStorage.getItem("username") || "";
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingPermanent, setBookingPermanent] = useState<Permanent[]>([]);
  const [form, setForm] = useState<Partial<Booking>>({});
  const [bookingDetail, setBookingDetail] = useState<BookingDetail[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState({
    keyword: "",
    datebook: "",
    status: "",
  });
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [showCardSelection, setShowCardSelection] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [showCardConfirm, setShowCardConfirm] = useState(false);
  const [selectedCardData, setSelectedCardData] = useState<{ cardId: string, amount: number } | null>(null);

  // Fetch all bookings
  useEffect(() => {
    axios.get(`${URL_BACKEND}/rest/bookings/getAll`).then(res => {
      setBookings(res.data);
    });
  }, []);


  // Search handler
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.get(`${URL_BACKEND}/rest/bookings/search`, {
      params: {
        keyword: search.keyword,
        datebook: search.datebook,
        status: search.status,
      },
    }).then(res => setBookings(res.data));
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearch({ keyword: "", datebook: "", status: "" });
    axios.get(`${URL_BACKEND}/rest/bookings/getAll`).then(res => setBookings(res.data));
  };

  // Open edit modal
  const openEditModal = (booking: Booking) => {
    setForm(booking);
    setShowEdit(true);
    axios.get(`${URL_BACKEND}/rest/bookingdetails/${booking.bookingid}`)
      .then((res) => {
        setBookingDetail(res.data.bookingDetail);
        setBookingPermanent(res.data.bookingPermanent);
      });
  };


  // Handle form change
  const handleFormChange = (field: keyof Booking, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Update booking handler
  const handleUpdateBooking = () => {
    if (!form.bookingid) return;
    axios.put(`${URL_BACKEND}/rest/bookings/update/${form.bookingid}`, form)
      .then(res => {
        setBookings(prev => prev.map(b => b.bookingid === res.data.bookingid ? res.data : b));
        setShowEdit(false);
      });
  };

  // Format currency
  const formatCurrency = (value: number) => value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN");
  };



  // DELETE MULTIPLE BOOKINGS
  // Handle checkbox selection
  const handleSelect = (bookingId: number) => {
    if (selectedBookings.includes(bookingId)) {
      setSelectedBookings(prev => prev.filter(id => id !== bookingId));
    } else {
      setSelectedBookings(prev => [...prev, bookingId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(booking => booking.bookingid));
    }
    setSelectAll(!selectAll);
  };

  // Delete selected bookings
  const handleDeleteSelected = () => {
    if (selectedBookings.length === 0) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedBookings.length} phiếu đặt sân đã chọn?`)) {
      axios.post(`${URL_BACKEND}/rest/bookings/deleteMultiple`, selectedBookings)
        .then(() => {
          // Remove deleted bookings from the list
          setBookings(prev => prev.filter(booking => !selectedBookings.includes(booking.bookingid)));
          setSelectedBookings([]);
          setSelectAll(false);

          // Show success message (you can implement a toast notification here)
          alert(`Đã xóa ${selectedBookings.length} phiếu đặt sân thành công`);
        })
        .catch(error => {
          console.error("Error deleting bookings:", error);
          alert("Có lỗi xảy ra khi xóa phiếu đặt sân");
        });
    }
  };

  const handleRefundClick = () => {
    if (form.bookingstatus === "Hủy Đặt") {
      alert("Không thể hoàn tiền cho đơn đã hủy!");
      return;
    }
    setShowRefundConfirm(true);
  };

  const getRefundAmount = () => {
    if (!form.bookingprice) return 0;

    switch (form.bookingstatus) {
      case "Đã Cọc":
        return form.bookingprice * 0.3; // 30% deposit amount
      case "Hoàn Thành":
        return form.bookingprice; // Full amount
      default:
        return 0;
    }
  };

  const handleRefundConfirm = () => {
    setShowRefundConfirm(false);
    setShowCardSelection(true);
  };

  const handleCardSelect = async (cardId: string) => {
    setSelectedCard(cardId);
    setSelectedCardData({
      cardId: cardId,
      amount: getRefundAmount()
    });
    setShowCardSelection(false);
    setShowCardConfirm(true);
  };

  const handleFinalConfirm = async () => {
    if (!selectedCardData) return;

    try {
      const res = await axios.post(
        `${URL_BACKEND}/api/user/payment/refund`,
        {
          amount: selectedCardData.amount,
          cardId: selectedCardData.cardId,
          bookingId: form.bookingid
        },
        {
          withCredentials: true
        }
      );

      if (!res.data) {
        throw new Error(`API trả về lỗi ${res.status}`);
      }
      const data = res.data;
      if (data && data.url) {
        window.location.href = data.url;
        setShowCardConfirm(false);
        setShowEdit(false);
        // Refresh booking list
        await axios.get(`${URL_BACKEND}/rest/bookings/getAll`).then(res => setBookings(res.data));
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi hoàn tiền!");
    }
  };

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Phiếu đặt sân</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Phiếu đặt sân</li>
              </ol>
            </nav>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <form className="row g-2 mb-3" onSubmit={handleSearch}>
          <div className="col-sm-6 col-md-3">
            <label className="form-label">Họ tên người đặt</label>
            <input type="text" className="form-control"
              placeholder="Nhập họ hoặc tên"
              value={search.keyword}
              onChange={e => setSearch(s => ({ ...s, keyword: e.target.value }))}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <label className="form-label">Ngày đặt</label>
            <input type="date" className="form-control"
              value={search.datebook}
              onChange={e => setSearch(s => ({ ...s, datebook: e.target.value }))}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <label className="form-label">Trạng thái</label>
            <select className="form-select"
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
            <button type="submit" className="btn btn-success w-100">Tìm kiếm</button>
            <button type="button" className="btn btn-secondary w-100" onClick={handleRefresh}>Làm mới</button>
          </div>
        </form>
        {/* /Search Filter */}

        {/* Action buttons */}
        <div className="row mb-3">
          <div className="col-12">
            <button
              className="btn btn-danger"
              onClick={handleDeleteSelected}
              disabled={selectedBookings.length === 0}
            >
              <i className="fa fa-trash me-1"></i>
              Xóa ({selectedBookings.length}) phiếu đã chọn
            </button>
          </div>
        </div>
        {/* SELECT DELETE */}
        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>

                    <th> <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />#</th>
                    <th>Người đặt</th>
                    <th>Ngày đặt</th>
                    <th>Thành tiền</th>
                    <th>Số điện thoại</th>
                    <th>Trạng thái</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((item, idx) => (
                    <tr key={item.bookingid}>

                      <td><input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedBookings.includes(item.bookingid)}
                        onChange={() => handleSelect(item.bookingid)}
                      /> {idx + 1} </td>
                      <td>
                        {item.users
                          ? `${item.users.firstname} ${item.users.lastname}`
                          : item.username}
                      </td>
                      <td>
                        {formatDate(item.bookingdate)}
                      </td>
                      <td>{formatCurrency(item.bookingprice)}</td>
                      <td>{item.phone}</td>
                      <td>{item.bookingstatus}</td>
                      <td className="text-center">
                        <button className="btn btn-outline-primary btn-sm"
                          onClick={() => openEditModal(item)}>
                          <i className="fa fa-pencil me-1"></i> Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <BootstrapModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          title="Chi tiết phiếu đặt sân"
          size="xl"
          contentMaxHeight="100vh"
          bodyMaxHeight="90vh"
          topOffset="5vh"
          bodyClassName="p-4"
          footer={
            <div className="mt-4 text-end">
              <button
                type="button"
                className={`btn ${form.refund === true ? 'btn-secondary' : 'btn-warning'} me-2`}
                onClick={handleRefundClick}
                disabled={form.refund === true}
              >
                {form.refund === true ? 'Đã hoàn tiền' : 'Hoàn tiền'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateBooking}
              >
                Chỉnh sửa phiếu đặt sân
              </button>
            </div>
          }
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Mã phiếu <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" value={form.bookingid || ""} readOnly />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Người đặt <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" value={form.username || ""} readOnly />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày đặt <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" value={formatDate(form.bookingdate || "")} readOnly />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Số điện thoại <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" value={form.phone || ""} readOnly />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Trạng thái <span className="text-danger">*</span></label>
                  <select className="form-select"
                    value={form.bookingstatus || ""}
                    onChange={e => handleFormChange("bookingstatus", e.target.value)}
                  >
                    <option value="Đã Cọc">Đã Cọc</option>
                    <option value="Hoàn Thành">Hoàn Thành</option>
                    <option value="Hủy Đặt">Hủy Đặt</option>
                  </select>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Thành tiền <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" value={formatCurrency(form.bookingprice || 0)} readOnly />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày booking <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" value={formatDate(form.bookingdate || "")} readOnly />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea className="form-control" value={form.note || ""} readOnly />
                </div>
              </div>
            </div>
            <div className="col-md-12 d-flex mt-4">
              <div className="card card-table flex-fill">
                <div className="card-body">
                  <div className="table-responsive" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    <table className="table table-nowrap custom-table mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tên sân</th>
                          <th>Ngày chơi</th>
                          <th>Ca</th>
                          <th>Số tiền đã cọc</th>
                          <th>Số tiền còn lại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(bookingDetail.length === 0 && bookingPermanent.length > 0) ?
                          bookingPermanent.map((p, idx) => (
                            <tr key={p.bookingId}>
                              <td>{idx + 1}</td>
                              <td>{p.fieldName}</td>
                              <td>{p.startDate} - {p.endDate} (Thứ {p.dayOfWeek})</td>
                              <td>{p.shiftName}</td>
                              <td>{formatCurrency(p.price * 0.3)}</td>
                              <td>{formatCurrency(p.price - (p.price * 0.3))}</td>
                            </tr>
                          ))
                          : bookingDetail.map((b, idx) => (
                            <tr key={b.bookingdetailid}>
                              <td>{idx + 1}</td>
                              <td>{b.field?.namefield || ""}</td>
                              <td>{b.playdate}</td>
                              <td>{b.shifts?.nameshift || ""}</td>
                              <td>{formatCurrency((form.bookingprice || 0) * 0.3)}</td>
                              <td>{formatCurrency((form.bookingprice || 0) - ((form.bookingprice || 0) * 0.3))}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </BootstrapModal>

        {/* Refund Confirmation Modal */}
        <BootstrapModal
          show={showRefundConfirm}
          onHide={() => setShowRefundConfirm(false)}
          title="Xác nhận hoàn tiền"
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setShowRefundConfirm(false)}>Không</button>
              <button type="button" className="btn btn-primary" onClick={handleRefundConfirm}>Có</button>
            </>
          }
        >
          <p>Bạn muốn hoàn {formatCurrency(getRefundAmount())} cho đơn {form.bookingid}?</p>
          <small className="text-muted">
            {form.bookingstatus === "Đã Cọc"
              ? "(Hoàn lại tiền cọc 30%)"
              : "(Hoàn lại toàn bộ số tiền)"}
          </small>
        </BootstrapModal>

        {/* Card Selection Modal */}
        <BootstrapModal
          show={showCardSelection}
          onHide={() => setShowCardSelection(false)}
          title="Chọn thẻ hoàn tiền"
        >
          <ListCardBank
            username={username}
            selectedCardId={selectedCard}
            onCardSelect={handleCardSelect}
            showDeleteButton={false}
            showDefaultButton={false}
          />
        </BootstrapModal>

        {/* New Confirmation Modal for Final Refund Confirmation */}
        <BootstrapModal
          show={showCardConfirm}
          onHide={() => setShowCardConfirm(false)}
          title="Xác nhận cuối cùng"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCardConfirm(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinalConfirm}
              >
                Xác nhận hoàn tiền
              </button>
            </>
          }
        >
          <p>Xác nhận hoàn tiền với thông tin:</p>
          <ul className="list-unstyled">
            <li>Số tiền: {formatCurrency(selectedCardData?.amount || 0)}</li>
            <li>Mã đơn: {form.bookingid}</li>
            <li>Mã thẻ: {selectedCardData?.cardId}</li>
          </ul>
        </BootstrapModal>

        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default BookingPage;
