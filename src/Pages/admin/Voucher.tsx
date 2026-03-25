const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";

interface Voucher {
  voucherid: string;
  discountpercent: number;
  startdate: string;
  enddate: string;
}

interface ErrorField {
  field?: string;
  message: string;
}

const VoucherPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState<Partial<Voucher>>({});
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [filter, setFilter] = useState("");

  // Fetch vouchers
  useEffect(() => {
    fetch(`${URL_BACKEND}/rest/vouchers/getAll`)
      .then(res => res.json())
      .then(data => setVouchers(data));
  }, []);

  // Filter handler
  const handleFilter = () => {
    let url = `${URL_BACKEND}/rest/vouchers/getAll`;
    if (filter === "1") url = `${URL_BACKEND}/rest/vouchers/fillActive`;
    if (filter === "0") url = `${URL_BACKEND}/rest/vouchers/fillInActive`;
    if (filter === "2") url = `${URL_BACKEND}/rest/vouchers/fillWillActive`;
    fetch(url)
      .then(res => res.json())
      .then(data => setVouchers(data));
  };

  // Refresh handler
  const handleRefresh = () => {
    setFilter("");
    fetch(`${URL_BACKEND}/rest/vouchers/getAll`)
      .then(res => res.json())
      .then(data => setVouchers(data));
  };

  // Add voucher handler
  const handleAddVoucher = () => {
    fetch(`${URL_BACKEND}/rest/vouchers/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          setErrors((err.errors || []).map((msg: string) => ({ message: msg })));
          return;
        }
        return res.json();
      })
      .then(data => {
        alert("Thêm mã giảm giá thành công!");
        if (data) {
          setVouchers(prev => [...prev, data]);
          setShowAdd(false);
          setForm({});
          setErrors([]);
        }
      });
  };

  // Edit voucher handler
  const handleEditVoucher = () => {
    if (!form.voucherid) return;
    fetch(`${URL_BACKEND}/rest/vouchers/update/${form.voucherid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          setErrors((err.errors || []).map((msg: string) => ({ message: msg })));
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          alert("Cập nhật mã giảm giá thành công!");
          setVouchers(prev => prev.map(v => v.voucherid === data.voucherid ? data : v));
          setShowEdit(false);
          setForm({});
          setErrors([]);
        }
      });
  };

  // Delete voucher handler
  const handleDeleteVoucher = (voucherid: string) => {
    fetch(`${URL_BACKEND}/rest/vouchers/delete/${voucherid}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(() => {
        alert("Xóa mã giảm giá thành công!");
        setVouchers(prev => prev.filter(v => v.voucherid !== voucherid));
        setShowEdit(false);
      });
  };

  // Open edit modal
  const openEditModal = (voucher: Voucher) => {
    setForm(voucher);
    setShowEdit(true);
    setErrors([]);
  };

  // Handle form change
  const handleFormChange = (field: keyof Voucher, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Mã giảm giá</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Mã giảm giá</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({}); setErrors([]); }}>
              <i className="fa fa-plus"></i> Thêm mã giảm giá
            </button>
          </div>
        </div>
        {/* /Page Header */}

        {/* Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <select className="form-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="1">Còn hạn</option>
              <option value="0">Hết hạn</option>
              <option value="2">Chưa áp dụng</option>
            </select>
          </div>
          <div className="col-sm-6 col-md-3">
            <button type="button" className="btn btn-success w-100" onClick={handleFilter}>Tìm kiếm</button>
          </div>
          <div className="col-sm-6 col-md-3">
            <button type="button" className="btn btn-secondary w-100" onClick={handleRefresh}>Làm mới</button>
          </div>
        </form>
        {/* /Filter */}

        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Mã giảm giá</th>
                    <th>Chiết khấu</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((item, idx) => (
                    <tr key={item.voucherid}>
                      <td>{idx + 1}</td>
                      <td>{item.voucherid}</td>
                      <td>{item.discountpercent}</td>
                      <td>{formatDate(item.startdate)}</td>
                      <td>{formatDate(item.enddate)}</td>
                      <td className="text-center">
                        <button className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => openEditModal(item)}>
                          <i className="fa fa-pencil me-1"></i> Chỉnh sửa
                        </button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteVoucher(item.voucherid)}>
                          <i className="fa fa-trash me-1"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Modal */}
        {showAdd && (
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Thêm mã giảm giá</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Mã giảm giá <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.voucherid || ""}
                            onChange={e => handleFormChange("voucherid", e.target.value)}
                          />
                          {errors.filter(e => e.field === "voucherid").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Chiết khấu <span className="text-danger">*</span></label>
                          <input className="form-control" type="number"
                            value={form.discountpercent || ""}
                            onChange={e => handleFormChange("discountpercent", Number(e.target.value))}
                          />
                          {errors.filter(e => e.field === "discountpercent").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ngày bắt đầu <span className="text-danger">*</span></label>
                          <input className="form-control" type="date"
                            value={form.startdate || ""}
                            onChange={e => handleFormChange("startdate", e.target.value)}
                          />
                          {errors.filter(e => e.field === "startdate").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ngày kết thúc <span className="text-danger">*</span></label>
                          <input className="form-control" type="date"
                            value={form.enddate || ""}
                            onChange={e => handleFormChange("enddate", e.target.value)}
                          />
                          {errors.filter(e => e.field === "enddate").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <button type="button" className="btn btn-primary" onClick={handleAddVoucher}>
                        Thêm mã giảm giá
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && (
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa mã giảm giá</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEdit(false)}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Mã giảm giá <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.voucherid || ""}
                            onChange={e => handleFormChange("voucherid", e.target.value)}
                          />
                          {errors.filter(e => e.field === "voucherid").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Chiết khấu <span className="text-danger">*</span></label>
                          <input className="form-control" type="number"
                            value={form.discountpercent || ""}
                            onChange={e => handleFormChange("discountpercent", Number(e.target.value))}
                          />
                          {errors.filter(e => e.field === "discountpercent").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ngày bắt đầu <span className="text-danger">*</span></label>
                          <input className="form-control" type="date"
                            value={form.startdate || ""}
                            onChange={e => handleFormChange("startdate", e.target.value)}
                          />
                          {errors.filter(e => e.field === "startdate").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ngày kết thúc <span className="text-danger">*</span></label>
                          <input className="form-control" type="date"
                            value={form.enddate || ""}
                            onChange={e => handleFormChange("enddate", e.target.value)}
                          />
                          {errors.filter(e => e.field === "enddate").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <button type="button" className="btn btn-primary" onClick={handleEditVoucher}>
                        Chỉnh sửa mã giảm giá
                      </button>
                      <button type="button" className="btn btn-danger ms-2" onClick={() => handleDeleteVoucher(form.voucherid as string)}>
                        Xóa mã giảm giá
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default VoucherPage;
