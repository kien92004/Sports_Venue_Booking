import React, { useEffect, useState } from "react";
import BootstrapModal from '../../components/admin/BootstrapModal';
import "../../styles/AdminModal.css";

interface Event {
  eventid: number;
  nameevent: string;
  datestart: string;
  dateend: string;
  image: string;
  descriptions: string;
  eventtype: string;
}

interface ErrorField {
  field?: string;
  message: string;
}

const eventTypeOptions = [
  "Thể thao",
  "Bóng đá",
  "Cầu lông",
  "Bóng rổ",
  "Tennis",
  "Bảo trì",
  "Khác"
];
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
const VITE_CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";

const EventPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState<Partial<Event>>({});
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [search, setSearch] = useState({
    searchName: "",
    searchType: "",
  });

  // Fetch all events
  useEffect(() => {
    fetch(`${URL_BACKEND}/rest/events/getAll`)
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.searchName) params.append("nameevent", search.searchName);
    if (search.searchType) params.append("eventtype", search.searchType);
    fetch(`${URL_BACKEND}/rest/events/search?${params}`)
      .then(res => res.json())
      .then(data => setEvents(data));
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearch({ searchName: "", searchType: "" });
    fetch(`${URL_BACKEND}/rest/events/getAll`)
      .then(res => res.json())
      .then(data => setEvents(data));
  };

  // Add event handler
  const handleAddEvent = () => {
    try {
      const formData = new FormData();
      // Thêm từng trường  vào formData
      Object.entries(form).forEach(([key, value]) => {
        if ((key === "fieldid" || key === "userid") && value === undefined) return;

        if (value !== undefined && value !== null) {
          if (typeof value === "boolean") {
            formData.append(key, value ? "true" : "false");
          } else {
            formData.append(key, value as string);
          }
        }
        if (imageFile) {
          formData.append("imageFile", imageFile);
        }
      });
      console.log("formdata", Array.from(formData.entries()));
      fetch(`${URL_BACKEND}/rest/events/create`, {
        method: "POST",
        body: formData,
      })
        .then(async res => {
          alert("Thêm sự kiện thành công!");
          if (!res.ok) {
            const err = await res.json();
            setErrors((err.errors || []).map((msg: string) => ({ message: msg })));
            return;
          }
          return res.json();
        })
        .then(data => {
          if (data) {
            setEvents(prev => [...prev, data]);
            setShowAdd(false);
            setForm({});
            setErrors([]);
          }
        });
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors((err.response.data.errors || []).map((msg: string) => ({ message: msg })));
      }
    }
  };


  // Edit event handler
  const handleEditEvent = () => {
    if (!form.eventid) return;
    fetch(`${URL_BACKEND}/rest/events/update/${form.eventid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async res => {
        alert("Thêm sự kiện thành công!");
        if (!res.ok) {
          const err = await res.json();
          setErrors((err.errors || []).map((msg: string) => ({ message: msg })));
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setEvents(prev => prev.map(e => e.eventid === data.eventid ? data : e));
          setShowEdit(false);
          setForm({});
          setErrors([]);
        }
      });
  };

  // Delete event handler
  const handleDeleteEvent = (eventid: number) => {
    fetch(`${URL_BACKEND}/rest/events/delete/${eventid}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(() => {
        alert("Xóa sự kiện thành công!");
        setEvents(prev => prev.filter(e => e.eventid !== eventid));
        setShowEdit(false);
      });
  };
  function toInputDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    // Lấy đúng yyyy-MM-dd
    return d.toISOString().slice(0, 10);
  }
  // Open edit modal
  const openEditModal = (event: Event) => {
    setForm({
      ...event,
      datestart: toInputDate(event.datestart),
      dateend: toInputDate(event.dateend),
    });
    setShowEdit(true);
    setErrors([]);
  };

  // Handle form change
  const handleFormChange = (field: keyof Event, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // Handle image upload
  const handleImageChange = (files: FileList | null) => {
    if (files && files[0]) {
      setImageFile(files[0]);
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
            <h3 className="mb-0">Sự kiện</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/admin/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Sự kiện</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({}); setErrors([]); }}>
              <i className="fa fa-plus"></i> Thêm sự kiện mới
            </button>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <input type="text" className="form-control"
              placeholder="Tên sự kiện"
              value={search.searchName}
              onChange={e => setSearch(s => ({ ...s, searchName: e.target.value }))}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <select className="form-select"
              value={search.searchType}
              onChange={e => setSearch(s => ({ ...s, searchType: e.target.value }))}
            >
              <option value="">Tất cả</option>
              {eventTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
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
                    <th>Tên sự kiện</th>
                    <th>Ảnh sự kiện</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Loại sự kiện</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((item, idx) => (
                    <tr key={item.eventid}>
                      <td>{idx + 1}</td>
                      <td>{item.nameevent}</td>
                      <td>
                        <img
                          src={
                            item.image
                              ? item.image.startsWith("v")
                                ? `${VITE_CLOUDINARY_BASE_URL}/${item.image}`
                                : `/user/images/${item.image}`
                              : "/user/images/default.png"
                          }
                          width={100}
                          height={100}
                          style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee", background: "#fafbfc" }}
                          alt={item.nameevent}
                        />
                      </td>
                      <td>{formatDate(item.datestart)}</td>
                      <td>{formatDate(item.dateend)}</td>
                      <td>{item.eventtype}</td>
                      <td className="text-center">
                        <button className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => openEditModal(item)}>
                          <i className="fa fa-pencil me-1"></i> Xem chi tiết
                        </button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteEvent(item.eventid)}>
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
          onHide={() => setShowAdd(false)}
          title="Tạo sự kiện mới"
          footer={
            <button type="button" className="btn btn-primary" onClick={handleAddEvent}>
              Thêm sự kiện mới
            </button>
          }
          size="lg"
          scrollable={false}
          bodyClassName="event-modal-body"
          topOffset="6%"
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-12 text-center mb-3">
                <label htmlFor="image" className="form-label">
                  <img
                    src={
                      form.image
                        ? form.image.startsWith("v") // hoặc form.image.includes("/")
                          ? `${VITE_CLOUDINARY_BASE_URL}/${form.image}`
                          : `/user/images/${form.image}`
                        : "/user/images/default.png" // fallback nếu null
                    }
                    width="70%"
                    style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee", background: "#fafbfc" }}
                    alt={form.nameevent}
                  />
                </label>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Tên sự kiện <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.nameevent || ""}
                    onChange={e => handleFormChange("nameevent", e.target.value)}
                  />
                  {errors.filter(e => e.field === "nameevent").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ảnh sự kiện <span className="text-danger">*</span></label>
                  <input type="file"
                    className="form-control"
                    id="image"
                    onChange={e => handleImageChange(e.target.files)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày bắt đầu <span className="text-danger">*</span></label>
                  <input className="form-control" type="date"
                    value={form.datestart || ""}
                    onChange={e => handleFormChange("datestart", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày kết thúc <span className="text-danger">*</span></label>
                  <input className="form-control" type="date"
                    value={form.dateend || ""}
                    onChange={e => handleFormChange("dateend", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Loại sự kiện</label>
                  <select className="form-select"
                    value={form.eventtype || ""}
                    onChange={e => handleFormChange("eventtype", e.target.value)}
                  >
                    <option value="">Chọn loại sự kiện</option>
                    {eventTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Description</label>
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
          </form>
        </BootstrapModal>

        {/* Edit Modal */}
        <BootstrapModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          title="Chỉnh sửa sự kiện"
          footer={
            <>
              <button type="button" className="btn btn-primary" onClick={handleEditEvent}>
                Chỉnh sửa sự kiện
              </button>
              <button type="button" className="btn btn-danger ms-2" onClick={() => handleDeleteEvent(form.eventid as number)}>
                Xóa sự kiện
              </button>
            </>
          }
          size="xl"
          scrollable={false}
          bodyClassName="event-modal-body"
          topOffset="6%"
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-12 text-center mb-3">
                <label htmlFor="image" className="form-label">
                  <img
                    src={
                      form.image
                        ? form.image.startsWith("v") // hoặc form.image.includes("/")
                          ? `${VITE_CLOUDINARY_BASE_URL}/${form.image}`
                          : `/user/images/${form.image}`
                        : "/user/images/default.png" // fallback nếu null
                    }
                    width="70%"
                    style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee", background: "#fafbfc" }}
                    alt={form.nameevent}
                  />
                </label>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Tên sự kiện <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.nameevent || ""}
                    onChange={e => handleFormChange("nameevent", e.target.value)}
                  />
                  {errors.filter(e => e.field === "nameevent").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ảnh sự kiện <span className="text-danger">*</span></label>
                  <input type="file"
                    className="form-control"
                    id="image"
                    onChange={e => handleImageChange(e.target.files)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày bắt đầu <span className="text-danger">*</span></label>
                  <input className="form-control" type="date"
                    value={form.datestart || ""}
                    onChange={e => handleFormChange("datestart", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày kết thúc <span className="text-danger">*</span></label>
                  <input className="form-control" type="date"
                    value={form.dateend || ""}
                    onChange={e => handleFormChange("dateend", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Loại sự kiện</label>
                  <select className="form-select"
                    value={form.eventtype || ""}
                    onChange={e => handleFormChange("eventtype", e.target.value)}
                  >
                    <option value="">Chọn loại sự kiện</option>
                    {eventTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Description</label>
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
          </form>
        </BootstrapModal>

        {/* Toast/Notification */}
        <div id="toast"></div>
      </div>
    </div>
  );
};

export default EventPage;
