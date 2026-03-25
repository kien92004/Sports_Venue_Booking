import React, { useEffect, useState } from "react";
import getImageUrl from "../../../helper/getImageUrl";

type BookingInfo = {
  bookingId: number;
  bookingDate: string;
  bookingPrice: number;
  note: string;
  bookingStatus: string;
  fieldName: string;
  fieldImage: string | null;
  bookingType: string;
  startDate: string | null;
  endDate: string | null;
  dayOfWeeks: string | null;
};

const statusColor = (status: string) => {
  if (status === "Hoàn Thành") return "#39AEA9";
  if (status === "Đã Cọc") return "#FFA41B";
  if (status === "Hủy Đặt") return "red";
  return "#6C757D";
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "--";
  const hasTime = dateStr.includes("T") || dateStr.includes(":");
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return "--";
  return hasTime
    ? parsed.toLocaleString("vi-VN", { hour12: false })
    : parsed.toLocaleDateString("vi-VN");
};

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const bookingTypeLabel = (type: string) => {
  if (type === "PERMANENT") return "Đặt cố định";
  if (type === "ONCE") return "Đặt một lần";
  return type;
};

const LichSuDatSan: React.FC = () => {
  const [listbooking, setListBooking] = useState<BookingInfo[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
    fetch(`${URL_BACKEND}/api/user/field/profile/historybooking`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setListBooking(Array.isArray(data?.listbooking) ? data.listbooking : []);
      })
      .catch(() => setListBooking([]));
  }, []);

  const handleDelete = async (bookingId: number) => {
    if (processingIds.includes(bookingId) || bulkDeleting) return;
    if (!window.confirm("Bạn có chắc muốn xóa phiếu đặt sân này?")) return;

    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
    try {
      setProcessingIds((prev) => [...prev, bookingId]);
      const res = await fetch(`${URL_BACKEND}/rest/bookings/deleteMultiple`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([bookingId]),
      });

      if (!res.ok) throw new Error("delete failed");

      setListBooking((prev) => prev.filter((item) => item.bookingId !== bookingId));
    } catch (err) {
      console.error("Delete booking error", err);
      window.alert("Xóa phiếu đặt sân thất bại. Vui lòng thử lại.");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  const handleDeleteAll = async () => {
    if (listbooking.length === 0 || bulkDeleting) return;
    if (!window.confirm("Bạn có chắc muốn xóa tất cả phiếu đặt sân?")) return;

    const ids = listbooking.map((item) => item.bookingId);
    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
    try {
      setBulkDeleting(true);
      const res = await fetch(`${URL_BACKEND}/rest/bookings/deleteMultiple`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids),
      });

      if (!res.ok) throw new Error("delete failed");

      setListBooking([]);
    } catch (err) {
      console.error("Delete all bookings error", err);
      window.alert("Xóa tất cả phiếu đặt sân thất bại. Vui lòng thử lại.");
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <>
      <style>
        {`
          #nz-div-3 h3.tde span {
            background: #EA3A3C;
            padding: 10px 20px 8px 20px;
            color: white;
            position: relative;
            display: inline-block;
            margin: 0;
            border-radius: 23px 23px 0px 0px;
          }

          #nz-div-3 h3.tde {
            margin: 15px 0;
            border-bottom: 2px solid #ea3a3c;
            font-size: 16px;
            line-height: 20px;
            text-transform: uppercase;
          }

          .nz-div-7 {
            position: relative;
            margin: 20px 0;
            text-align: center;
          }

          .nz-div-7 .box-title-name {
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            color: #333;
            display: inline-block;
            vertical-align: top;
            position: relative;
            z-index: 1;
            padding-bottom: 28px;
          }

          .nz-div-7 .box-title-name:before {
            content: "";
            position: absolute;
            border-top: 10px solid #00aa46;
            border-left: 15px solid transparent;
            border-bottom: 7px solid transparent;
            border-right: 15px solid transparent;
            left: calc(50% - 40px);
            bottom: -7px;
            width: 50px;
          }

          .nz-div-7 .box-title-name:after {
            content: "";
            position: absolute;
            z-index: 2;
            bottom: 0;
            height: 9px;
            width: 200px;
            left: calc(50% - 100px);
            border-top: 2px solid #00aa46;
          }
        `}
      </style>

      <section className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: "url('/user/images/backgroundField.gif')" }}
        data-stellar-background-ratio="0.5">
        <div className="overlay"></div>
      </section>

      <div className="nz-div-7">
        <div className="box-title-name">
          <span className="null">Lịch Sử</span> Đặt Sân Của Bạn
        </div>
      </div>

      <div className="container d-flex justify-content-center rounded mb-5">
        <div className="col-md-12 rounded row" id="profiles" style={{ marginTop: 50, backgroundColor: "rgb(247 249 250)" }}>
          <div id="nz-div-3">
            <h3 className="tde">
              <span>Hiển thị 20 phiếu đặt sân gần nhất</span>
            </h3>
            <div className="mb-3">
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteAll}
                disabled={listbooking.length === 0 || bulkDeleting}
              >
                {bulkDeleting ? "Đang xóa..." : "Xóa tất cả"}
              </button>
            </div>
          </div>

          {listbooking.length === 0 && (
            <div className="col-12 py-5 text-center text-muted">
              Bạn chưa có lịch sử đặt sân hoặc dữ liệu đang được cập nhật.
            </div>
          )}

          {listbooking.map((booking, idx) => (
            <div key={idx} className="card col-12 mb-3" style={{ borderRadius: 10 }}>
              <h6 className="card-header d-flex justify-content-between align-items-center">
                <span>
                  <b>Mã phiếu:</b> #{booking.bookingId}
                  <span style={{ color: "#1F8A70", fontWeight: "bold", marginLeft: 10 }}>
                    Đặt lúc: {formatDate(booking.bookingDate)}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: "medium",
                    color: "snow",
                    fontWeight: "bold",
                    padding: "3px 10px",
                    borderRadius: 10,
                    backgroundColor: statusColor(booking.bookingStatus),
                  }}
                >
                  {booking.bookingStatus}
                </span>
              </h6>
              <div className="card-body row">
                <div className="col-md-3 d-flex align-items-center justify-content-center mb-3 mb-md-0">
                  <img
                    style={{ width: "100%", borderRadius: 12, objectFit: "cover", minHeight: 160 }}
                    src={getImageUrl(booking.fieldImage)}
                    alt={booking.fieldName || "Sân"}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/user/images/noimage.png";
                    }}
                  />
                </div>
                <div className="col-md-9">
                  <h5 className="card-title text-success font-weight-bold mb-3">{booking.fieldName}</h5>
                  <div className="row">
                    <div className="col-sm-6">
                      <p className="mb-2"><b>Loại đặt sân:</b> {bookingTypeLabel(booking.bookingType)}</p>
                      <p className="mb-2"><b>Ngày bắt đầu:</b> {formatDate(booking.startDate)}</p>
                      <p className="mb-2"><b>Ngày kết thúc:</b> {formatDate(booking.endDate)}</p>
                    </div>
                    <div className="col-sm-6">
                      {booking.dayOfWeeks && (
                        <p className="mb-2"><b>Ngày trong tuần:</b> {booking.dayOfWeeks}</p>
                      )}
                      <p className="mb-2"><b>Ghi chú:</b> {booking.note?.trim() || "Không có ghi chú"}</p>
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between">
                    <div>
                      <b>Tổng tiền:</b>{" "}
                      <span className="text-danger font-weight-bold">{formatCurrency(booking.bookingPrice)}</span>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-2 mt-3 mt-sm-0">
                      <a
                        className="btn btn-outline-info"
                        href={`/sportify/field/profile/historybooking/detail?bookingId=${booking.bookingId}&bookingPrice=${booking.bookingPrice}`}
                      >
                        Xem Chi Tiết
                      </a>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(booking.bookingId)}
                        disabled={processingIds.includes(booking.bookingId) || bulkDeleting}
                      >
                        {processingIds.includes(booking.bookingId) ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LichSuDatSan;
