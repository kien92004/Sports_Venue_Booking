import React, { useEffect, useState } from "react";
import { BookingRevenueBarChart, BookingStatusRadarChart } from "../../components/admin/Chart";
import { AuthContext } from "../../helper/AuthContext";
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const months = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12"
];

const OwnerReportBooking: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const ownerUsername = user?.username || "";

  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [rpDTThang, setRpDTThang] = useState<any[]>([]);
  const [rpDTNam, setRpDTNam] = useState<any[]>([]);
  const [rpSLThang, setRpSLThang] = useState<any[]>([]);
  const [rpSLNam, setRpSLNam] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch years on mount
  useEffect(() => {
    if (ownerUsername) {
      setLoading(true);
      fetch(`${URL_BACKEND}/rest/reportBooking/getYearBookingByOwner?ownerUsername=${ownerUsername}`)
        .then(res => res.json())
        .then(data => setYears(data.map((y: string[]) => y[0])))
        .catch(err => console.error("Error fetching years:", err))
        .finally(() => setLoading(false));

      // Fetch owner's bookings
      fetch(`${URL_BACKEND}/rest/bookings/getByOwner/${ownerUsername}`)
        .then(res => res.json())
        .then(data => setBookings(data))
        .catch(err => console.error("Error fetching bookings:", err));
    }
  }, [ownerUsername]);

  // Fetch report data when year/month changes
  useEffect(() => {
    if (!ownerUsername || !year) return;

    if (month) {
      fetch(`${URL_BACKEND}/rest/reportBooking/rpDoanhThuBookingTrongThangByOwner?year=${year}&month=${month}&ownerUsername=${ownerUsername}`)
        .then(res => res.json())
        .then(setRpDTThang)
        .catch(err => console.error("Error fetching DTThang:", err));

      fetch(`${URL_BACKEND}/rest/reportBooking/rpSoLuongBookingTrongThangByOwner?year=${year}&month=${month}&ownerUsername=${ownerUsername}`)
        .then(res => res.json())
        .then(setRpSLThang)
        .catch(err => console.error("Error fetching SLThang:", err));
    }

    fetch(`${URL_BACKEND}/rest/reportBooking/rpDoanhThuBookingTrongNamByOwner?year=${year}&ownerUsername=${ownerUsername}`)
      .then(res => res.json())
      .then(setRpDTNam)
      .catch(err => console.error("Error fetching DTNam:", err));

    fetch(`${URL_BACKEND}/rest/reportBooking/rpSoLuongBookingTrongNamByOwner?year=${year}&ownerUsername=${ownerUsername}`)
      .then(res => res.json())
      .then(setRpSLNam)
      .catch(err => console.error("Error fetching SLNam:", err));
  }, [year, month, ownerUsername]);

  // Download Excel handler
  const downloadExcel = (type: string) => {
    let url = "";
    if (type === "DTNam") url = `/rest/reportBooking/downloadExcelDTBookingNam?year=${year}`;
    if (type === "DTThang") url = `/rest/reportBooking/downloadExcelDTBookingThang?year=${year}&month=${month}`;
    if (type === "SLNam") url = `/rest/reportBooking/downloadExcelSLBookingNam?year=${year}`;
    if (type === "SLThang") url = `/rest/reportBooking/downloadExcelSLBookingThang?year=${year}&month=${month}`;
    window.open(`${URL_BACKEND}` + url, "_blank");
  };

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Báo cáo đặt sân</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/owner/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Báo cáo đặt sân</li>
              </ol>
            </nav>
          </div>
        </div>
        {/* /Page Header */}

        {/* Charts Section */}
        <div className="row mb-4">
          <div className="col-md-6 mb-4">
            <BookingStatusRadarChart bookings={bookings} />
          </div>
          <div className="col-md-6 mb-4">
            <BookingRevenueBarChart bookings={bookings} />
          </div>
        </div>

        {/* Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <label className="form-label">Năm</label>
            <select className="form-select" value={year} onChange={e => setYear(e.target.value)} disabled={loading}>
              <option value="">Chọn năm</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="col-sm-6 col-md-3">
            <label className="form-label">Tháng</label>
            <select className="form-select" value={month} onChange={e => setMonth(e.target.value)} disabled={!year}>
              <option value="">Chọn tháng</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </form>
        {/* /Filter */}

        {/* Doanh thu đặt sân trong tháng */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Doanh thu đặt sân trong tháng</h4>
                {month && <button className="btn btn-success btn-sm" onClick={() => downloadExcel("DTThang")}>Xuất Excel</button>}
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tháng</th>
                        <th>Doanh thu thực tế</th>
                        <th>Chi trả hủy đơn</th>
                        <th>Doanh thu đặt sân đã cọc</th>
                        <th>Doanh thu phiếu đặt sân đã hoàn thành</th>
                        <th>Doanh thu ước tính</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rpDTThang.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0]}</td>
                          <td>{row[1]?.toLocaleString("vi-VN")}</td>
                          <td>{row[2]?.toLocaleString("vi-VN")}</td>
                          <td>{row[3]?.toLocaleString("vi-VN")}</td>
                          <td>{row[4]?.toLocaleString("vi-VN")}</td>
                          <td>{row[5]?.toLocaleString("vi-VN")}</td>
                        </tr>
                      ))}
                      {rpDTThang.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-3">
                            Chọn năm và tháng để xem báo cáo
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doanh thu đặt sân trong năm */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Doanh thu đặt sân trong năm</h4>
                {year && <button className="btn btn-success btn-sm" onClick={() => downloadExcel("DTNam")}>Xuất Excel</button>}
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tháng</th>
                        <th>Doanh thu thực tế</th>
                        <th>Chi trả hủy đơn</th>
                        <th>Doanh thu đặt sân đã cọc</th>
                        <th>Doanh thu phiếu đặt sân đã hoàn thành</th>
                        <th>Doanh thu ước tính</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rpDTNam.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0]}</td>
                          <td>{row[1]?.toLocaleString("vi-VN")}</td>
                          <td>{row[2]?.toLocaleString("vi-VN")}</td>
                          <td>{row[3]?.toLocaleString("vi-VN")}</td>
                          <td>{row[4]?.toLocaleString("vi-VN")}</td>
                          <td>{row[5]?.toLocaleString("vi-VN")}</td>
                        </tr>
                      ))}
                      {rpDTNam.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-3">
                            Chọn năm để xem báo cáo
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Số lượng phiếu đặt trong tháng */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Số lượng phiếu đặt trong tháng</h4>
                {month && <button className="btn btn-success btn-sm" onClick={() => downloadExcel("SLThang")}>Xuất Excel</button>}
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Ngày</th>
                        <th>Tổng số lượng phiếu</th>
                        <th>Số lượng phiếu hủy</th>
                        <th>Số lượng phiếu cọc</th>
                        <th>Số lượng phiếu hoàn thành</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rpSLThang.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0]}</td>
                          <td>{row[1]}</td>
                          <td>{row[2]}</td>
                          <td>{row[3]}</td>
                          <td>{row[4]}</td>
                        </tr>
                      ))}
                      {rpSLThang.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-3">
                            Chọn năm và tháng để xem báo cáo
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Số lượng phiếu đặt trong năm */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Số lượng phiếu đặt trong năm</h4>
                {year && <button className="btn btn-success btn-sm" onClick={() => downloadExcel("SLNam")}>Xuất Excel</button>}
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tháng</th>
                        <th>Tổng số lượng phiếu</th>
                        <th>Số lượng phiếu hủy</th>
                        <th>Số lượng phiếu cọc</th>
                        <th>Số lượng phiếu hoàn thành</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rpSLNam.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0]}</td>
                          <td>{row[1]}</td>
                          <td>{row[2]}</td>
                          <td>{row[3]}</td>
                          <td>{row[4]}</td>
                        </tr>
                      ))}
                      {rpSLNam.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-3">
                            Chọn năm để xem báo cáo
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default OwnerReportBooking;
