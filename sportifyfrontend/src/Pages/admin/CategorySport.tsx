const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import BootstrapModal from '../../components/admin/BootstrapModal';

interface SportType {
  sporttypeid: string;
  categoryname: string;
}

interface ErrorField {
  field?: string;
  message: string;
}

const CategorySportPage: React.FC = () => {
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [form, setForm] = useState<Partial<SportType>>({});
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [searchName, setSearchName] = useState("");

  // Fetch all sport types
  useEffect(() => {
    fetch(`${URL_BACKEND}/rest/sportTypes/getAll`)
      .then(res => res.json())
      .then(data => setSportTypes(data));
  }, []);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchName) params.append("categoryname", searchName);
    fetch(`${URL_BACKEND}/rest/sportTypes/search?${params}`)
      .then(res => res.json())
      .then(data => setSportTypes(data));
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearchName("");
    fetch(`${URL_BACKEND}/rest/sportTypes/getAll`)
      .then(res => res.json())
      .then(data => setSportTypes(data));
  };

  // Add sport type handler
  const handleAddSportType = () => {
    // Validate mã môn thể thao
    const codeRegex = /^[A-Z][0-9]{2}$/;
    const nameRegex = /^[A-Za-zÀ-ỹà-ỹ\s]{4,}$/; // hỗ trợ tiếng Việt, ít nhất 4 ký tự, chỉ chữ và khoảng trắng
    const newErrors: ErrorField[] = [];
    if (!form.sporttypeid || !codeRegex.test(form.sporttypeid)) {
      newErrors.push({
        field: "sporttypeid",
        message: "Mã phải gồm 3 ký tự: 1 chữ in hoa, 2 số (VD: A01, B22)"
      });
    }
    if (!form.categoryname || !nameRegex.test(form.categoryname.trim())) {
      newErrors.push({
        field: "categoryname",
        message: "Tên phải là chữ cái, ít nhất 4 ký tự"
      });
    }
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    fetch(`${URL_BACKEND}/rest/sportTypes/create`, {
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
        if (data) {
          setSportTypes(prev => [...prev, data]);
          setShowAdd(false);
          setForm({});
          setErrors([]);
        }
      });
  };

  // Edit sport type handler
  const handleEditSportType = () => {
    if (!form.sporttypeid) return;
    fetch(`${URL_BACKEND}/rest/sportTypes/update/${form.sporttypeid}`, {
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
          setSportTypes(prev => prev.map(c => c.sporttypeid === data.sporttypeid ? data : c));
          setShowEdit(false);
          setForm({});
          setErrors([]);
        }
      });
  };

  // Delete sport type handler
  const handleDeleteSportType = (sporttypeid: string) => {
    fetch(`${URL_BACKEND}/rest/sportTypes/delete/${sporttypeid}`, {
      method: "DELETE",
    })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 409) {
            alert("Không thể xóa vì có sân đang sử dụng.");
            return;
          }
        }
        return res.json();
      })
      .then(data => {
        // Nếu xóa thành công (không lỗi 409), cập nhật UI
        if (data) {
          setSportTypes(prev => prev.filter(c => c.sporttypeid !== sporttypeid));
        }
      });
  };

  // Open edit modal
  const openEditModal = (sportType: SportType) => {
    setForm(sportType);
    setShowEdit(true);
    setErrors([]);
  };

  // Handle form change
  const handleFormChange = (field: keyof SportType, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Loại môn thể thao</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Loại môn thể thao</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({}); setErrors([]); }}>
              <i className="fa fa-plus"></i> Thêm môn thể thao mới
            </button>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <input type="text" className="form-control"
              placeholder="Tên môn thể thao"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <button type="button" className="btn btn-success w-100" onClick={handleSearch}>Tìm kiếm</button>
          </div>
          <div className="col-sm-6 col-md-3">
            <button type="button" className="btn btn-secondary w-100" onClick={handleRefresh}>Làm mới</button>
          </div>
        </form>
        {/* /Search Filter */}

        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Mã môn thể thao</th>
                    <th>Tên môn thể thao</th>
                    <th className="text-center col-md-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sportTypes.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{item.sporttypeid}</td>
                      <td>{item.categoryname}</td>
                      <td className="text-center">
                        <button className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => openEditModal(item)}>
                          <i className="fa fa-pencil me-1"></i> Xem chi tiết
                        </button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteSportType(item.sporttypeid)}>
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
        <BootstrapModal
          show={showAdd}
          onHide={() => { setShowAdd(false); setForm({}); setErrors([]); }}
          title="Thêm môn thể thao mới"
          size="lg"
          contentMaxHeight="95vh"
          bodyMaxHeight="85vh"
          topOffset="5vh"
          bodyClassName="p-4"
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowAdd(false); setForm({}); setErrors([]); }}>Đóng</button>
              <button type="button" className="btn btn-primary" onClick={handleAddSportType}>Thêm</button>
            </>
          }
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Mã môn thể thao <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.sporttypeid || ""}
                    onChange={e => handleFormChange("sporttypeid", e.target.value)}
                  />
                  {errors.filter(e => e.field === "sporttypeid").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Tên môn thể thao <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.categoryname || ""}
                    onChange={e => handleFormChange("categoryname", e.target.value)}
                  />
                  {errors.filter(e => e.field === "categoryname").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </BootstrapModal>

        {/* Edit Modal */}
        <BootstrapModal
          show={showEdit}
          onHide={() => { setShowEdit(false); setForm({}); setErrors([]); }}
          title="Chỉnh sửa môn thể thao"
          size="lg"
          contentMaxHeight="95vh"
          bodyMaxHeight="85vh"
          topOffset="5vh"
          bodyClassName="p-4"
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowEdit(false); setForm({}); setErrors([]); }}>Đóng</button>
              <button type="button" className="btn btn-primary" onClick={handleEditSportType}>Cập nhật</button>
            </>
          }
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Mã môn thể thao <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.sporttypeid || ""}
                    onChange={e => handleFormChange("sporttypeid", e.target.value)}
                    readOnly
                  />
                  {errors.filter(e => e.field === "sporttypeid").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Tên môn thể thao <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.categoryname || ""}
                    onChange={e => handleFormChange("categoryname", e.target.value)}
                  />
                  {errors.filter(e => e.field === "categoryname").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </BootstrapModal>

        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default CategorySportPage;

