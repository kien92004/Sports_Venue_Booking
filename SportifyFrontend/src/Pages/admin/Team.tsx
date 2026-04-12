const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";

interface SportType {
  sporttypeid: string;
  categoryname: string;
}

interface User {
  username: string;
  fullname: string;
}

interface Team {
  teamid: number;
  sporttypeid: string;
  nameteam: string;
  quantity: number;
  avatar: string;
  contact: string;
  descriptions: string;
  username: string;
  createdate: string;
  sporttype?: SportType;
  users?: User;
}

interface ErrorField {
  field?: string;
  message: string;
}

const TeamPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [form, setForm] = useState<Partial<Team>>({});
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState({
    searchName: "",
    searchSport: "",
  });

  // Fetch all teams and sport types
  useEffect(() => {
    fetch(`${URL_BACKEND}/rest/teams/getAll`)
      .then(res => res.json())
      .then(data => setTeams(data));
    fetch(`${URL_BACKEND}/rest/sportTypes/getAll`)
      .then(res => res.json())
      .then(data => setSportTypes(data));
  }, []);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.searchName) params.append("nameteam", search.searchName);
    if (search.searchSport) params.append("sporttypeid", search.searchSport);
    fetch(`${URL_BACKEND}/rest/teams/search?${params}`)
      .then(res => res.json())
      .then(data => setTeams(data));
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearch({ searchName: "", searchSport: "" });
    fetch(`${URL_BACKEND}/rest/teams/getAll`)
      .then(res => res.json())
      .then(data => setTeams(data));
  };

  // Add team handler
  const handleAddTeam = () => {
    fetch(`${URL_BACKEND}/rest/teams/create`, {
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
          setTeams(prev => [...prev, data]);
          setShowAdd(false);
          setForm({});
          setErrors([]);
        }
      });
  };

  // Edit team handler
  const handleEditTeam = () => {
    if (!form.teamid) return;
    fetch(`${URL_BACKEND}/rest/teams/update/${form.teamid}`, {
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
          setTeams(prev => prev.map(t => t.teamid === data.teamid ? data : t));
          setShowEdit(false);
          setForm({});
          setErrors([]);
        }
      });
  };

  // Delete team handler
  const handleDeleteTeam = (teamid: number) => {
    fetch(`${URL_BACKEND}/rest/teams/delete/${teamid}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(() => {
        setTeams(prev => prev.filter(t => t.teamid !== teamid));
        setShowEdit(false);
      });
  };

  // Open edit modal
  const openEditModal = (team: Team) => {
    setForm(team);
    setShowEdit(true);
    setErrors([]);
  };

  // Handle form change
  const handleFormChange = (field: keyof Team, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // Handle image upload
  const handleImageChange = (files: FileList | null) => {
    if (files && files[0]) {
      // Upload logic here, setForm({ ...form, avatar: ... })
    }
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
            <h3 className="mb-0">Đội thể thao</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Đội thể thao</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({}); setErrors([]); }}>
              <i className="fa fa-plus"></i> Thêm đội thể thao mới
            </button>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <input type="text" className="form-control"
              placeholder="Tên đội thể thao"
              value={search.searchName}
              onChange={e => setSearch(s => ({ ...s, searchName: e.target.value }))}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <select className="form-select"
              value={search.searchSport}
              onChange={e => setSearch(s => ({ ...s, searchSport: e.target.value }))}
            >
              <option value="">Tất cả</option>
              {sportTypes.map(c => (
                <option key={c.sporttypeid} value={c.sporttypeid}>{c.categoryname}</option>
              ))}
            </select>
          </div>
          <div className="col-sm-6 col-md-2">
            <button type="button" className="btn btn-success w-100" onClick={handleSearch}>Tìm kiếm</button>
          </div>
          <div className="col-sm-6 col-md-2">
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
                    <th>Loại môn thể thao</th>
                    <th>Tên đội</th>
                    <th>Ảnh đại diện</th>
                    <th>Số lượng thành viên</th>
                    <th>Người tạo</th>
                    <th>Ngày tạo</th>
                    <th>Liên hệ</th>
                    <th>Mô tả</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((item, idx) => (
                    <tr key={item.teamid}>
                      <td>{idx + 1}</td>
                      <td>{item.sporttype?.categoryname || item.sporttypeid}</td>
                      <td>{item.nameteam}</td>
                      <td>
                        <img src={`/user/images/${item.avatar}`} width={100} height={100} alt={item.nameteam} />
                      </td>
                      <td>{item.quantity}</td>
                      <td>{item.users?.fullname || item.username}</td>
                      <td>{formatDate(item.createdate)}</td>
                      <td>{item.contact}</td>
                      <td>{item.descriptions}</td>
                      <td className="text-center">
                        <button className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => openEditModal(item)}>
                          <i className="fa fa-pencil me-1"></i> Xem chi tiết
                        </button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteTeam(item.teamid)}>
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
                  <h5 className="modal-title">Thêm đội thể thao mới</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row g-3">
                      <div className="col-sm-12 text-center mb-3">
                        <label htmlFor="avatar" className="form-label">
                          <img src={form.avatar ? `/user/images/${form.avatar}` : "https://via.placeholder.com/200x200?text=Team"} style={{ maxWidth: "100%", height: 200, objectFit: "cover" }} alt="team" />
                        </label>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Tên đội <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.nameteam || ""}
                            onChange={e => handleFormChange("nameteam", e.target.value)}
                          />
                          {errors.filter(e => e.field === "nameteam").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ảnh đại diện <span className="text-danger">*</span></label>
                          <input type="file"
                            className="form-control"
                            id="avatar"
                            onChange={e => handleImageChange(e.target.files)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Số lượng thành viên <span className="text-danger">*</span></label>
                          <input className="form-control" type="number"
                            value={form.quantity || ""}
                            onChange={e => handleFormChange("quantity", Number(e.target.value))}
                          />
                          {errors.filter(e => e.field === "quantity").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Loại môn thể thao <span className="text-danger">*</span></label>
                          <select className="form-select"
                            value={form.sporttypeid || ""}
                            onChange={e => handleFormChange("sporttypeid", e.target.value)}
                          >
                            <option value="">Chọn loại môn thể thao</option>
                            {sportTypes.map(c => (
                              <option key={c.sporttypeid} value={c.sporttypeid}>{c.categoryname}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Người tạo <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.username || ""}
                            onChange={e => handleFormChange("username", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ngày tạo <span className="text-danger">*</span></label>
                          <input className="form-control" type="date"
                            value={form.createdate || ""}
                            onChange={e => handleFormChange("createdate", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Liên hệ <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.contact || ""}
                            onChange={e => handleFormChange("contact", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="form-group">
                          <label>Mô tả <span className="text-danger">*</span></label>
                          <textarea className="form-control"
                            value={form.descriptions || ""}
                            onChange={e => handleFormChange("descriptions", e.target.value)}
                          />
                          {errors.filter(e => e.field === "descriptions").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <button type="button" className="btn btn-primary" onClick={handleAddTeam}>
                        Thêm đội thể thao
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
                  <h5 className="modal-title">Chỉnh sửa đội thể thao</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEdit(false)}></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row g-3">
                      <div className="col-sm-12 text-center mb-3">
                        <label htmlFor="avatar" className="form-label">
                          <img src={form.avatar ? `/user/images/${form.avatar}` : "https://via.placeholder.com/200x200?text=Team"} style={{ maxWidth: "100%", height: 200, objectFit: "cover" }} alt="team" />
                        </label>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Tên đội <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.nameteam || ""}
                            onChange={e => handleFormChange("nameteam", e.target.value)}
                          />
                          {errors.filter(e => e.field === "nameteam").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ảnh đại diện <span className="text-danger">*</span></label>
                          <input type="file"
                            className="form-control"
                            id="avatar"
                            onChange={e => handleImageChange(e.target.files)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Số lượng thành viên <span className="text-danger">*</span></label>
                          <input className="form-control" type="number"
                            value={form.quantity || ""}
                            onChange={e => handleFormChange("quantity", Number(e.target.value))}
                          />
                          {errors.filter(e => e.field === "quantity").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Loại môn thể thao <span className="text-danger">*</span></label>
                          <select className="form-select"
                            value={form.sporttypeid || ""}
                            onChange={e => handleFormChange("sporttypeid", e.target.value)}
                          >
                            <option value="">Chọn loại môn thể thao</option>
                            {sportTypes.map(c => (
                              <option key={c.sporttypeid} value={c.sporttypeid}>{c.categoryname}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Người tạo <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.username || ""}
                            onChange={e => handleFormChange("username", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Ngày tạo <span className="text-danger">*</span></label>
                          <input className="form-control" type="date"
                            value={form.createdate || ""}
                            onChange={e => handleFormChange("createdate", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Liên hệ <span className="text-danger">*</span></label>
                          <input className="form-control" type="text"
                            value={form.contact || ""}
                            onChange={e => handleFormChange("contact", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="form-group">
                          <label>Mô tả <span className="text-danger">*</span></label>
                          <textarea className="form-control"
                            value={form.descriptions || ""}
                            onChange={e => handleFormChange("descriptions", e.target.value)}
                          />
                          {errors.filter(e => e.field === "descriptions").map((e, i) => (
                            <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-end">
                      <button type="button" className="btn btn-primary" onClick={handleEditTeam}>
                        Chỉnh sửa đội thể thao
                      </button>
                      <button type="button" className="btn btn-danger ms-2" onClick={() => handleDeleteTeam(form.teamid as number)}>
                        Xóa đội thể thao
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

export default TeamPage;
