import React, { useEffect, useState } from "react";
import getImageUrl from "../../../helper/getImageUrl";
// [{"shiftid":1,"nameshift":"Buổi sáng: 04H00-05H00","starttime":"04:00:00","endtime":"05:00:00"}
interface BookingOnceInfo {
  [index: number]: any;
}

interface ShiftInfo {
  shiftId: number;
  dayOfWeek: number;
}

interface Shift {
  shiftid: number;
  nameshift: string;
  starttime: string;
  endtime: string;
}

interface BookingPermanentInfo {
  fieldName: string;
  endDate: string;
  bookingType: string;
  fieldImage: string;
  shifts: ShiftInfo[];
  startDate: string;
  bookingId: number;
  fieldId: number;
}

interface ApiResponse {
  conlai: number;
  thanhtien: number;
  phuthu: number;
  giamgia: number;
  tamtinh: number;
  tiencoc: number;
  listBookingOnce: BookingOnceInfo[];
  listBookingPermanent: BookingPermanentInfo[];
}

const dayOfWeekMap: { [key: number]: string } = {
  0: "Chủ nhật",
  1: "Thứ hai",
  2: "Thứ ba",
  3: "Thứ tư",
  4: "Thứ năm",
  5: "Thứ sáu",
  6: "Thứ bảy",
};

const LichSuDatSanDetail: React.FC = () => {
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get("bookingId");
  const bookingPrice = searchParams.get("bookingPrice");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // gọi API chi tiết booking
        const res1 = await fetch(
          `${URL_BACKEND}/api/user/field/profile/historybooking/detail?bookingId=${bookingId}&bookingPrice=${bookingPrice}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await res1.json();
        setData(data);

        // gọi API shift
        const res2 = await fetch(`${URL_BACKEND}/api/sportify/shift`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const shiftData = await res2.json();
        setShifts(shiftData);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [bookingId, bookingPrice]);


  if (!data) return <div>Loading...</div>;

  // Function to get shift name by ID
  const getShiftNameById = (shiftId: number) => {
    const shift = shifts.find(s => s.shiftid === shiftId);
    return shift ? shift.nameshift : `Ca #${shiftId}`;
  };

  // Determine booking type
  const isPermanent = data.listBookingPermanent && data.listBookingPermanent.length > 0;
  const isOnce = data.listBookingOnce && data.listBookingOnce.length > 0;

  return (
    <>
      <style>
        {`
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
          <span className="null">Chi Tiết</span> Lịch Sử Đặt Sân
        </div>
      </div>

      <div className="container d-flex justify-content-center rounded mb-5">
        <div className="col-md-12 rounded row" id="profiles" style={{ marginTop: 50, backgroundColor: "rgb(247, 249, 250)" }}>

          {/* ONCE Booking */}
          {isOnce &&
            data.listBookingOnce.map((bookingInfo, idx) => {
              const statusColor =
                bookingInfo[2] === "Hoàn Thành"
                  ? "#39AEA9"
                  : bookingInfo[2] === "Đã Cọc"
                    ? "#FFA41B"
                    : bookingInfo[2] === "Hủy Đặt"
                      ? "red"
                      : "white";
              return (
                <div key={idx} className="card col-12 mb-3" style={{ borderRadius: 10, marginTop: 20 }}>
                  <h6 className="card-header">
                    Mã phiếu <span style={{ color: "black", fontWeight: "bold" }}>#{bookingInfo[0]}</span> <span>Đặt lúc</span> <span style={{ color: "black", fontWeight: "bold" }}>
                      {new Date(bookingInfo[1]).toLocaleString("vi-VN", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                    <span
                      style={{
                        fontSize: "medium",
                        color: "snow",
                        fontWeight: "bold",
                        marginLeft: "3%",
                        marginRight: "3%",
                        padding: "3px 10px 3px 10px",
                        borderRadius: "10px",
                        backgroundColor: statusColor,
                      }}
                    >
                      {bookingInfo[2]}
                    </span>
                    <span>Thành Tiền:</span>{" "}
                    <span className="font-weight-bold" style={{ color: "#279EFF", padding: 5, borderRadius: 8 }}>
                      {data.thanhtien.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </span>
                    <span>
                      <a style={{ paddingLeft: "2%" }} href="/sportify/field/profile/historybooking">
                        <button type="button" className="btn btn-outline-dark font-weight-bold">
                          VỀ TRANG DANH SÁCH ĐẶT SÂN
                        </button>
                      </a>
                    </span>
                  </h6>
                  <div className="card-body">
                    <h5 className="card-title text-success font-weight-bold">{bookingInfo[6]}</h5>
                    <div className="mb-3">
                      <img
                        style={{ width: "100%", maxWidth: 280, borderRadius: 12, objectFit: "cover" }}
                        src={getImageUrl(bookingInfo[7] as string | null)}
                        alt={bookingInfo[6] || "Sân"}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/user/images/noimage.png";
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ color: "black" }}>Ngày nhận sân:</span>{" "}
                      <span style={{ color: "#1F8A70", fontWeight: "bold" }}>
                        {new Date(bookingInfo[4]).toLocaleDateString("vi-VN", {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "black" }}>Giờ chơi:</span>{" "}
                      <span style={{ color: "#1F8A70", fontWeight: "bold" }}>{bookingInfo[8]}</span>
                    </div>
                    <div>
                      <span style={{ color: "black" }}>Giá sân gốc / 1h:</span>{" "}
                      <span style={{ color: "#1F8A70", fontWeight: "bold" }}>
                        {bookingInfo[5].toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </span>
                    </div>
                    <hr />
                    <div>
                      <p>
                        <span>Phụ Thu: </span>
                        <span className="font-weight-bold">
                          {data.phuthu.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                        <span> Tạm Tính:</span>
                        <span className="font-weight-bold">
                          {data.tamtinh.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                        <span> Giảm giá:</span>
                        <span className="font-weight-bold">
                          {data.giamgia.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                        || <span>Tiền đã cọc:</span>
                        <span className="text-success font-weight-bold">
                          {data.tiencoc.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                        || <span>Khi nhận sân thanh toán:</span>
                        <span className="text-danger font-weight-bold">
                          {data.conlai.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          }
          {/* PERMANENT Booking */}
          {isPermanent &&
            data.listBookingPermanent.map((bookingInfo, idx) => (
              <div key={idx} className="card col-12 mb-3" style={{ borderRadius: 10, marginTop: 20 }}>
                <h6 className="card-header">
                  Mã phiếu <span style={{ color: "black", fontWeight: "bold" }}>#{bookingInfo.bookingId}</span>
                  <span style={{ marginLeft: "2%" }}>Loại đặt sân: <span style={{ fontWeight: "bold", color: "#FFA41B" }}>{bookingInfo.bookingType}</span></span>
                  <span>Thành Tiền:</span>{" "}
                  <span className="font-weight-bold" style={{ color: "#279EFF", padding: 5, borderRadius: 8 }}>
                    {data.thanhtien.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </span>
                  <span>
                    <a style={{ paddingLeft: "2%" }} href="/sportify/field/profile/historybooking">
                      <button type="button" className="btn btn-outline-dark font-weight-bold">
                        VỀ TRANG DANH SÁCH ĐẶT SÂN
                      </button>
                    </a>
                  </span>
                </h6>
                <div className="card-body">
                  <h5 className="card-title text-success font-weight-bold">{bookingInfo.fieldName}</h5>
                  <div className="mb-3">
                    <img
                      style={{ width: "100%", maxWidth: 280, borderRadius: 12, objectFit: "cover" }}
                      src={getImageUrl(bookingInfo.fieldImage)}
                      alt={bookingInfo.fieldName || "Sân"}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/user/images/noimage.png";
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ color: "black" }}>Ngày bắt đầu:</span>{" "}
                    <span style={{ color: "#1F8A70", fontWeight: "bold" }}>
                      {new Date(bookingInfo.startDate).toLocaleDateString("vi-VN", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "black" }}>Ngày kết thúc:</span>{" "}
                    <span style={{ color: "#1F8A70", fontWeight: "bold" }}>
                      {new Date(bookingInfo.endDate).toLocaleDateString("vi-VN", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "black" }}>Lịch chơi cố định:</span>
                    <ul>
                      {bookingInfo.shifts.map((shift, i) => (
                        <li key={i}>
                          <span style={{ color: "#1F8A70", fontWeight: "bold" }}>
                            {dayOfWeekMap[shift.dayOfWeek]} - {getShiftNameById(shift.shiftId)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <hr />
                  <div>
                    <p>
                      <span>Phụ Thu: </span>
                      <span className="font-weight-bold">
                        {data.phuthu.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </span>
                      <span> Tạm Tính:</span>
                      <span className="font-weight-bold">
                        {data.tamtinh.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </span>
                      <span> Giảm giá:</span>
                      <span className="font-weight-bold">
                        {data.giamgia.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </span>
                      || <span>Tiền đã cọc:</span>
                      <span className="text-success font-weight-bold">
                        {data.tiencoc.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </span>
                      || <span>Khi nhận sân thanh toán:</span>
                      <span className="text-danger font-weight-bold">
                        {data.conlai.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
};

export default LichSuDatSanDetail;
