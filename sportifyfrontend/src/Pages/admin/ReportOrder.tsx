const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import { OrderRevenueBarChart, OrderStatusRadarChart } from "../../components/admin/Chart";

const months = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12"
];

const ReportOrderPage: React.FC = () => {
  const [years, setYears] = useState<string[]>([]);
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [type, setType] = useState<"doanhThu" | "soLuong">("doanhThu");
  const [mode, setMode] = useState<"year" | "month">("year");
  const [rpDTThang, setRpDTThang] = useState<any[]>([]);
  const [rpDTNam, setRpDTNam] = useState<any[]>([]);
  const [rpSLThang, setRpSLThang] = useState<any[]>([]);
  const [rpSLNam, setRpSLNam] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch years and orders on mount
  useEffect(() => {
    fetch(`${URL_BACKEND}/rest/reportOrder/getYearOrder`)
      .then(res => res.json())
      .then(data => setYears(data.map((y: string[]) => y[0])));

    // Fetch all orders
    fetch(`${URL_BACKEND}/sportify/rest/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders:", err));
  }, []);

  // Fetch report data when year/month/type/mode changes
  useEffect(() => {
    if (type === "doanhThu" && mode === "month" && year && month) {
      fetch(`${URL_BACKEND}/rest/reportOrder/rpDoanhThuOrderTrongThang?year=${year}&month=${month}`)
        .then(res => res.json())
        .then(setRpDTThang);
    }
    if (type === "doanhThu" && mode === "year" && year) {
      fetch(`${URL_BACKEND}/rest/reportOrder/rpDoanhThuOrderTrongNam?year=${year}`)
        .then(res => res.json())
        .then(setRpDTNam);
    }
    if (type === "soLuong" && mode === "month" && year && month) {
      fetch(`${URL_BACKEND}/rest/reportOrder/rpSoLuongOrderTrongThang?year=${year}&month=${month}`)
        .then(res => res.json())
        .then(setRpSLThang);
    }
    if (type === "soLuong" && mode === "year" && year) {
      fetch(`${URL_BACKEND}/rest/reportOrder/rpSoLuongOrderTrongNam?year=${year}`)
        .then(res => res.json())
        .then(setRpSLNam);
    }
  }, [type, mode, year, month]);

  // Download Excel handler
  const downloadExcel = (excelType: string) => {
    let url = "";
    if (excelType === "DTNam") url = `/rest/reportOrder/downloadExcelDTOrderNam?year=${year}`;
    if (excelType === "DTThang") url = `/rest/reportOrder/downloadExcelDTOrderThang?year=${year}&month=${month}`;
    if (excelType === "SLNam") url = `/rest/reportOrder/downloadExcelSLOrderNam?year=${year}`;
    if (excelType === "SLThang") url = `/rest/reportOrder/downloadExcelSLOrderThang?year=${year}&month=${month}`;
    window.open(URL_BACKEND + url, "_blank");
  };

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Báo cáo thống kê đặt hàng</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Báo cáo thống kê đặt hàng</li>
              </ol>
            </nav>
          </div>
        </div>
        {/* /Page Header */}

        {/* Charts Section */}
        <div className="row mb-4">
          <div className="col-md-6 mb-4">
            <OrderStatusRadarChart orders={orders} />
          </div>
          <div className="col-md-6 mb-4">
            <OrderRevenueBarChart orders={orders} />
          </div>
        </div>

        {/* Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <label className="form-label">Loại thống kê</label>
            <select className="form-select" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="doanhThu">Doanh thu</option>
              <option value="soLuong">Tổng số lượng phiếu</option>
            </select>
          </div>
          <div className="col-sm-6 col-md-3">
            <label className="form-label">Hình thức thống kê</label>
            <select className="form-select" value={mode} onChange={e => setMode(e.target.value as any)}>
              <option value="year">Năm</option>
              <option value="month">Tháng</option>
            </select>
          </div>
          {mode === "month" && (
            <>
              <div className="col-sm-6 col-md-3">
                <label className="form-label">Chọn tháng</label>
                <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
                  <option value="">-- Chọn Tháng --</option>
                  {months.map((m, idx) => <option key={m} value={m}>Tháng {idx + 1}</option>)}
                </select>
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label">Chọn năm</label>
                <select className="form-select" value={year} onChange={e => setYear(e.target.value)}>
                  <option value="">-- Chọn Năm --</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}
          {mode === "year" && (
            <div className="col-sm-6 col-md-3">
              <label className="form-label">Chọn năm</label>
              <select className="form-select" value={year} onChange={e => setYear(e.target.value)}>
                <option value="">-- Chọn Năm --</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </form>
        <div className="row g-2 mb-3">
          {type === "doanhThu" && mode === "month" && (
            <div className="col-sm-6 col-md-2">
              <button className="btn btn-success w-100" onClick={() => downloadExcel("DTThang")}>Export Excel</button>
            </div>
          )}
          {type === "doanhThu" && mode === "year" && (
            <div className="col-sm-6 col-md-2">
              <button className="btn btn-success w-100" onClick={() => downloadExcel("DTNam")}>Export Excel</button>
            </div>
          )}
          {type === "soLuong" && mode === "month" && (
            <div className="col-sm-6 col-md-2">
              <button className="btn btn-success w-100" onClick={() => downloadExcel("SLThang")}>Export Excel</button>
            </div>
          )}
          {type === "soLuong" && mode === "year" && (
            <div className="col-sm-6 col-md-2">
              <button className="btn btn-success w-100" onClick={() => downloadExcel("SLNam")}>Export Excel</button>
            </div>
          )}
        </div>
        {/* /Filter */}

        {/* Table */}
        <div className="row">
          <div className="col-md-12">
            {type === "doanhThu" && mode === "year" && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Tháng</th>
                      <th>Tiền đang đợi thanh toán</th>
                      <th>Tiền đã thanh toán</th>
                      <th>Doanh thu ước tính</th>
                      <th>Doanh thu thực tế</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rpDTNam.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row[0]}</td>
                        <td>{row[2]?.toLocaleString("vi-VN")}</td>
                        <td>{row[3]?.toLocaleString("vi-VN")}</td>
                        <td>{row[4]?.toLocaleString("vi-VN")}</td>
                        <td>{row[1]?.toLocaleString("vi-VN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {type === "doanhThu" && mode === "month" && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Ngày</th>
                      <th>Tiền đang đợi thanh toán</th>
                      <th>Tiền đã thanh toán</th>
                      <th>Doanh thu ước tính</th>
                      <th>Doanh thu thực tế</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rpDTThang.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row[0]}</td>
                        <td>{row[2]?.toLocaleString("vi-VN")}</td>
                        <td>{row[3]?.toLocaleString("vi-VN")}</td>
                        <td>{row[4]?.toLocaleString("vi-VN")}</td>
                        <td>{row[1]?.toLocaleString("vi-VN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {type === "soLuong" && mode === "year" && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Tháng</th>
                      <th>Số lượng phiếu chưa thanh toán</th>
                      <th>Số lượng phiếu đã thanh toán</th>
                      <th>Tổng số lượng phiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rpSLNam.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row[0]}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                        <td>{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {type === "soLuong" && mode === "month" && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Ngày</th>
                      <th>Số lượng phiếu chưa thanh toán</th>
                      <th>Số lượng phiếu đã thanh toán</th>
                      <th>Tổng số lượng phiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rpSLThang.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row[0]}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                        <td>{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* /Table */}

        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default ReportOrderPage;
