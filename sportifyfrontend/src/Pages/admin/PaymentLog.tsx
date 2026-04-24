import axios from "axios";
import React, { useEffect, useState } from "react";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface PaymentLog {
  id: number;
  transactionId: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  content: string;
  transferAmount: number;
  referenceCode: string;
  accountName: string;
  logDate: string;
}

const PaymentLogPage: React.FC = () => {
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    axios.get(`${URL_BACKEND}/rest/payment-logs`)
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch payment logs:", err);
        setLoading(false);
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      axios.delete(`${URL_BACKEND}/rest/payment-logs/${id}`)
        .then(() => {
          setLogs(prev => prev.filter(log => log.id !== id));
        })
        .catch(err => console.error("Failed to delete log:", err));
    }
  };

  const filteredLogs = logs.filter(log => 
    log.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Lịch Sử Giao Dịch VietQR (SePay)</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Lịch sử giao dịch</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button className="btn btn-outline-secondary" onClick={fetchLogs}>
              <i className="fa fa-refresh me-1"></i> Làm mới
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="fa fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm kiếm theo nội dung, tên, mã GD..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Thời gian</th>
                <th>Người chuyển</th>
                <th>Nội dung</th>
                <th>Số tiền</th>
                <th>Ngân hàng</th>
                <th>Mã tham chiếu</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div>{formatDateTime(log.transactionDate)}</div>
                      <small className="text-muted">Log: {formatDateTime(log.logDate)}</small>
                    </td>
                    <td>
                      <div className="fw-bold">{log.accountName || "N/A"}</div>
                      <small className="text-muted">{log.accountNumber}</small>
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">{log.content}</span>
                    </td>
                    <td>
                      <span className="text-success fw-bold">
                        +{log.transferAmount?.toLocaleString('vi-VN')} đ
                      </span>
                    </td>
                    <td>{log.gateway}</td>
                    <td><small className="text-break">{log.referenceCode}</small></td>
                    <td className="text-center">
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(log.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentLogPage;
