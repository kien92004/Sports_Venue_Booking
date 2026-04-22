import React, { useEffect, useState } from "react";
import BootstrapModal from '../../components/admin/BootstrapModal';
import "../../styles/AdminModal.css";

interface Sporttype {
  sporttypeid: string;
  categoryname: string;
}

interface Tournament {
  tournamentid: number;
  tournamentname: string;
  sporttype: Sporttype;
  startdate: string;
  enddate: string;
  description: string;
  image: string;
  status: string;
  teamcount: number;
}

interface ErrorField {
  field?: string;
  message: string;
}

const statusOptions = [
  "Đang mở đăng ký",
  "Đang diễn ra",
  "Đã kết thúc",
  "Tạm hoãn"
];

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
const VITE_CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";

const TournamentManager: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sporttypes, setSporttypes] = useState<Sporttype[]>([]);
  const [form, setForm] = useState<Partial<Tournament>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Fetch all tournaments and sporttypes
  useEffect(() => {
    fetchTournaments();
    fetchSporttypes();
  }, []);

  const fetchTournaments = () => {
    fetch(`${URL_BACKEND}/rest/tournaments`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTournaments(data);
      })
      .catch(err => console.error("Lỗi fetch tournaments:", err));
  };

  const fetchSporttypes = () => {
    fetch(`${URL_BACKEND}/rest/sportTypes/getAll`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSporttypes(data);
      })
      .catch(err => console.error("Lỗi fetch sporttypes:", err));
  };

  // Add tournament handler
  const handleAddTournament = () => {
    if (!form.tournamentname || !form.sporttype?.sporttypeid) {
        alert("Vui lòng nhập tên giải đấu và chọn môn thể thao!");
        return;
    }

    const payload = {
        ...form,
        sporttype: { sporttypeid: form.sporttype.sporttypeid },
        startdate: form.startdate || null,
        enddate: form.enddate || null
    };

    fetch(`${URL_BACKEND}/rest/tournaments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let msg = errData.message || res.statusText || "Lỗi hệ thống";
          if (msg.includes("JDBC") || msg.includes("execute statement")) {
            msg += "\n\nHướng dẫn sửa lỗi: Bạn hãy truy cập đường dẫn sau trên trình duyệt để khởi tạo bảng dữ liệu: http://localhost:8081/rest/db-check/create-table";
          }
          alert("Lỗi khi thêm giải đấu: " + msg);
          return;
        }
        alert("Thêm giải đấu thành công!");
        fetchTournaments();
        setShowAdd(false);
        setForm({});
      })
      .catch(err => console.error("Lỗi thêm tournament:", err));
  };

  // Edit tournament handler
  const handleEditTournament = () => {
    if (!form.tournamentid || !form.tournamentname || !form.sporttype?.sporttypeid) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const payload = {
        ...form,
        sporttype: { sporttypeid: form.sporttype.sporttypeid },
        startdate: form.startdate || null,
        enddate: form.enddate || null
    };

    fetch(`${URL_BACKEND}/rest/tournaments/${form.tournamentid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        if (!res.ok) {
            alert("Lỗi khi cập nhật giải đấu!");
            return;
        }
        alert("Cập nhật giải đấu thành công!");
        fetchTournaments();
        setShowEdit(false);
        setForm({});
      })
      .catch(err => console.error("Lỗi sửa tournament:", err));
  };

  // Delete handler
  const handleDelete = (id: number) => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa giải đấu này?")) return;
    fetch(`${URL_BACKEND}/rest/tournaments/${id}`, {
      method: "DELETE",
    })
      .then(res => {
        if(res.ok) {
            alert("Xóa giải đấu thành công!");
            fetchTournaments();
        }
      })
      .catch(err => console.error("Lỗi xóa tournament:", err));
  };

  const toInputDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 10);
  };

  const openEditModal = (item: Tournament) => {
    setForm({
      ...item,
      startdate: toInputDate(item.startdate),
      enddate: toInputDate(item.enddate),
    });
    setShowEdit(true);
  };

  const handleFormChange = (field: keyof Tournament, value: any) => {
    if (field === "sporttype") {
        setForm(prev => ({ ...prev, sporttype: { sporttypeid: value, categoryname: "" } }));
    } else {
        setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className="page-wrapper py-4" style={{ marginLeft: "250px", marginTop: "70px" }}>
      <div className="container-fluid bg-white rounded shadow-sm p-4">
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Quản lý Giải đấu</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active">Giải đấu</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({ status: "Đang mở đăng ký", teamcount: 16 }); }}>
              <i className="fa fa-plus mr-2"></i> Thêm giải đấu mới
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Tên giải đấu</th>
                <th>Môn thể thao</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Số đội</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((item, idx) => (
                <tr key={item.tournamentid}>
                  <td>{idx + 1}</td>
                  <td><span className="font-weight-bold text-success">{item.tournamentname}</span></td>
                  <td>{item.sporttype?.categoryname}</td>
                  <td>{formatDate(item.startdate)}</td>
                  <td>{formatDate(item.enddate)}</td>
                  <td>{item.teamcount}</td>
                  <td>
                    <span className={`badge ${item.status === 'Đang diễn ra' ? 'bg-success' : 'bg-info'} text-white`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-outline-primary btn-sm mr-2" onClick={() => openEditModal(item)}>
                      <i className="fa fa-pencil mr-1"></i> Sửa
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(item.tournamentid)}>
                      <i className="fa fa-trash mr-1"></i> Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        <BootstrapModal
          show={showAdd}
          onHide={() => setShowAdd(false)}
          title="Tạo giải đấu mới"
          footer={<button className="btn btn-success" onClick={handleAddTournament}>Lưu giải đấu</button>}
          size="lg"
        >
          <div className="row g-3">
            <div className="col-md-12 mb-3">
              <label className="form-label font-weight-bold">Tên giải đấu</label>
              <input type="text" className="form-control" value={form.tournamentname || ""} onChange={e => handleFormChange("tournamentname", e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Môn thể thao</label>
              <select className="form-select" value={form.sporttype?.sporttypeid || ""} onChange={e => handleFormChange("sporttype", e.target.value)}>
                <option value="">Chọn môn thể thao</option>
                {sporttypes.map(s => <option key={s.sporttypeid} value={s.sporttypeid}>{s.categoryname}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Số lượng đội</label>
              <input type="number" className="form-control" value={form.teamcount || 0} onChange={e => handleFormChange("teamcount", parseInt(e.target.value))} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Ngày bắt đầu</label>
              <input type="date" className="form-control" value={form.startdate || ""} onChange={e => handleFormChange("startdate", e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Ngày kết thúc</label>
              <input type="date" className="form-control" value={form.enddate || ""} onChange={e => handleFormChange("enddate", e.target.value)} />
            </div>
            <div className="col-md-12 mb-3">
              <label className="form-label font-weight-bold">Trạng thái</label>
              <select className="form-select" value={form.status || ""} onChange={e => handleFormChange("status", e.target.value)}>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="col-md-12 mb-3">
              <label className="form-label font-weight-bold">Mô tả</label>
              <textarea className="form-control" rows={3} value={form.description || ""} onChange={e => handleFormChange("description", e.target.value)} />
            </div>
          </div>
        </BootstrapModal>

        {/* Edit Modal */}
        <BootstrapModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          title="Chỉnh sửa giải đấu"
          footer={<button className="btn btn-primary" onClick={handleEditTournament}>Cập nhật giải đấu</button>}
          size="lg"
        >
          <div className="row g-3">
            <div className="col-md-12 mb-3">
              <label className="form-label font-weight-bold">Tên giải đấu</label>
              <input type="text" className="form-control" value={form.tournamentname || ""} onChange={e => handleFormChange("tournamentname", e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Môn thể thao</label>
              <select className="form-select" value={form.sporttype?.sporttypeid || ""} onChange={e => handleFormChange("sporttype", e.target.value)}>
                {sporttypes.map(s => <option key={s.sporttypeid} value={s.sporttypeid}>{s.categoryname}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Số lượng đội</label>
              <input type="number" className="form-control" value={form.teamcount || 0} onChange={e => handleFormChange("teamcount", parseInt(e.target.value))} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Ngày bắt đầu</label>
              <input type="date" className="form-control" value={form.startdate || ""} onChange={e => handleFormChange("startdate", e.target.value)} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label font-weight-bold">Ngày kết thúc</label>
              <input type="date" className="form-control" value={form.enddate || ""} onChange={e => handleFormChange("enddate", e.target.value)} />
            </div>
            <div className="col-md-12 mb-3">
              <label className="form-label font-weight-bold">Trạng thái</label>
              <select className="form-select" value={form.status || ""} onChange={e => handleFormChange("status", e.target.value)}>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="col-md-12 mb-3">
              <label className="form-label font-weight-bold">Mô tả</label>
              <textarea className="form-control" rows={3} value={form.description || ""} onChange={e => handleFormChange("description", e.target.value)} />
            </div>
          </div>
        </BootstrapModal>
      </div>
    </div>
  );
};

export default TournamentManager;
