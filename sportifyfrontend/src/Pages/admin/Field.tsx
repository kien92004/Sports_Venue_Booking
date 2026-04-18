const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import BootstrapModal from "../../components/admin/BootstrapModal";
import { AuthContext } from "../../helper/AuthContext";
import "../../styles/AdminModal.css";

// Ensure JSX intrinsic elements are recognized
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface Field {
  fieldid: number;
  sporttypeid?: string;
  namefield: string;
  descriptionfield: string;
  price: number;
  image: string;
  address: string;
  status: boolean;
  clientIP?: string;
  latitude?: string;
  longitude?: string;
  availableShifts?: string; // JSON array: "[1,2,3,4]"
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  sporttype?: {
    sporttypeid: string;
    categoryname?: string;
  };
  owner?: {
    ownerId?: number;
    username?: string;
    businessName?: string;
  } | null;
}

interface Shift {
  shiftid: number;
  nameshift: string;
  starttime: string;
  endtime: string;
}

interface SportType {
  sporttypeid: string;
  categoryname: string;
}

interface ErrorField {
  field?: string;
  message: string;
}

const VITE_CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";

interface FieldPageProps {
  context?: "admin" | "owner";
}

const FieldPage: React.FC<FieldPageProps> = ({ context = "admin" }) => {
  const authContext = useContext(AuthContext);
  const ownerUsername = context === "owner" ? authContext?.user?.username || "" : "";
  const [fields, setFields] = useState<Field[]>([]);
  const [form, setForm] = useState<Partial<Field>>({ status: true });
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState({
    namefield: "",
    sporttypeid: "",
    status: "",
  });
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<number[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFields(fields.map(f => f.fieldid));
    } else {
      setSelectedFields([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedFields(prev => [...prev, id]);
    } else {
      setSelectedFields(prev => prev.filter(fid => fid !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedFields.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sân để xóa!");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedFields.length} sân đã chọn không?`)) {
      axios.delete(`${URL_BACKEND}/rest/fields/delete-multiple`, { data: selectedFields })
        .then(res => {
          alert(res.data.message || "Xóa thành công");
          setFields(prev => prev.filter(f => !selectedFields.includes(f.fieldid)));
          setSelectedFields([]);
        })
        .catch(err => {
          alert("Lỗi khi xóa: " + err.message);
        });
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    axios.post(`${URL_BACKEND}/rest/fields/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        alert(res.data.message || "Import thành công");
        handleRefresh();
      })
      .catch(err => {
        alert("Lỗi khi import: " + (err.response?.data || err.message));
      })
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetImageState = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setImageFile(null);
  };

  // Helper function to get client IP and geolocation
  const getIPGeolocation = async (): Promise<{ ip: string; latitude: string; longitude: string }> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        ip: data.ip || 'unknown',
        latitude: data.latitude ? data.latitude.toString() : '10.7769',
        longitude: data.longitude ? data.longitude.toString() : '106.7'
      };
    } catch (error) {
      console.error('Error fetching geolocation:', error);
      // Default to Ho Chi Minh City
      return {
        ip: 'unknown',
        latitude: '10.7769',
        longitude: '106.7'
      };
    }
  };

  // Helper function to geocode address to latitude/longitude
  const geocodeAddress = async (address: string): Promise<{ latitude: string; longitude: string } | null> => {
    if (!address || address.trim() === '') return null;
    try {
      // Thử tìm kiếm địa chỉ đầy đủ trước
      let searchAddress = `${address}, Vietnam`;
      let response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`);
      let data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: data[0].lat.toString(),
          longitude: data[0].lon.toString()
        };
      }

      // Nếu không tìm được, thử trích xuất quận/huyện từ địa chỉ
      // Tìm các từ khóa quận/huyện phổ biến
      const districtKeywords = ['quận', 'huyện', 'tp', 'tpho chi minh', 'hcm', 'ho chi minh', 'thành phố'];
      const parts = address.toLowerCase().split(',').map(p => p.trim());
      let districtPart = '';

      for (const part of parts) {
        for (const keyword of districtKeywords) {
          if (part.includes(keyword)) {
            districtPart = part;
            break;
          }
        }
        if (districtPart) break;
      }

      if (districtPart) {
        searchAddress = `${districtPart}, Vietnam`;
        response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`);
        data = await response.json();
        if (data && data.length > 0) {
          return {
            latitude: data[0].lat.toString(),
            longitude: data[0].lon.toString()
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  const uiConfig = useMemo(() => {
    if (context === "owner") {
      return {
        homeHref: "/owner/fields",
        homeLabel: "Trang quản trị",
        pageTitle: "Sân thể thao của tôi",
      };
    }
    return {
      homeHref: "/admin/dashboard",
      homeLabel: "Dashboard",
      pageTitle: "Sân thể thao",
    };
  }, [context]);

  const filterByContext = (data: Field[]) => {
    if (context === "owner" && ownerUsername) {
      return data.filter(field => field.owner?.username === ownerUsername);
    }
    return data;
  };

  // Fetch all fields
  useEffect(() => {

    if (context === "owner" && !ownerUsername) {
      return;
    }

    fetch(`${URL_BACKEND}/rest/fields/getAll`)
      .then(res => res.json())
      .then((data: Field[]) => setFields(filterByContext(data)));
    // Fetch sport types
    fetch(`${URL_BACKEND}/rest/sportTypes/getAll`)
      .then(res => res.json())
      .then(data => setSportTypes(data));
    // Fetch all shifts
    fetch(`${URL_BACKEND}/rest/shifts/getAll`)
      .then(res => res.json())
      .then(data => setAllShifts(data))
      .catch(err => console.error("Error fetching shifts:", err));
  }, [context, ownerUsername]);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.namefield) params.append("namefield", search.namefield);
    if (search.sporttypeid) params.append("sporttypeid", search.sporttypeid);
    if (search.status) params.append("status", search.status);
    fetch(`${URL_BACKEND}/rest/fields/search?${params}`)
      .then(res => res.json())
      .then((data: Field[]) => setFields(filterByContext(data)));
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearch({ namefield: "", sporttypeid: "", status: "" });
    fetch(`${URL_BACKEND}/rest/fields/getAll`)
      .then(res => res.json())
      .then((data: Field[]) => setFields(filterByContext(data)));
  };

  // Handle image upload
  const handleImageChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      resetImageState();
    }
  };

  // Add field handler
  const handleAddField = async () => {
    try {
      // Tự động lấy tọa độ nếu đang trống
      let finalLat = form.latitude;
      let finalLng = form.longitude;
      
      if (!finalLat || !finalLng) {
        if (form.address && form.address.trim() !== '') {
          const coords = await geocodeAddress(form.address);
          if (coords) {
            finalLat = coords.latitude;
            finalLng = coords.longitude;
          }
        }
      }

      const formData = new FormData();
      // Thêm từng trường vào formData
      Object.entries(form).forEach(([key, value]) => {
        if ((key === "fieldid" || key === "userid") && value === undefined) return;

        // Bỏ qua clientIP - không gửi lên backend
        if (key === "clientIP") return;
        // Bỏ qua address nếu nó rỗng - để backend tự động set từ IP
        if (key === "address" && (!value || (typeof value === "string" && value.trim() === ""))) {
          return;
        }
        // Ghi đè latitude/longitude nếu vừa lấy tự động
        if (key === "latitude" && finalLat) return;
        if (key === "longitude" && finalLng) return;

        if (value !== undefined && value !== null) {
          if (typeof value === "boolean") {
            formData.append(key, value ? "true" : "false");
          } else {
            formData.append(key, value as string);
          }
        }
      });
      
      if (finalLat) formData.append("latitude", finalLat);
      if (finalLng) formData.append("longitude", finalLng);

      // Thêm availableShifts
      formData.append("availableShifts", JSON.stringify(selectedShifts.map(id => parseInt(id))));

      // Thêm username từ auth context
      if (authContext?.user?.username) {
        formData.append("username", authContext.user.username);
      }

      // Thêm file ảnh nếu có
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }
      // Không set Content-Type ở đây!
      const res = await axios.post(`${URL_BACKEND}/rest/fields/create`, formData);
      const data = res.data;
      if (data) {
        alert("Thêm sân thành công");
        setFields(prev => {
          const filtered = filterByContext([data]);
          return filtered.length > 0 ? [...prev, filtered[0]] : prev;
        });
        setShowAdd(false);
        setForm({ status: true });
        resetImageState();
        setErrors([]);
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors((err.response.data.errors || []).map((msg: string) => ({ message: msg })));
      }
    }
  };

  // Edit field handler
  const handleEditField = async () => {
    if (!form.fieldid) return;
    try {
      // Tạo đối tượng field với sporttype
      const fieldData = {
        ...form,
        status: form.status ?? true,
        sporttype: { sporttypeid: form.sporttypeid },
        availableShifts: JSON.stringify(selectedShifts.map(id => parseInt(id))),
        startDate: form.startDate,
        endDate: form.endDate
      };
      delete fieldData.sporttypeid;

      // Chuẩn bị formData
      const formData = new FormData();
      formData.append("field", new Blob([JSON.stringify(fieldData)], { type: "application/json" }));

      // Thêm file ảnh nếu có
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      // Gửi request PUT
      const res = await axios.put(
        `${URL_BACKEND}/rest/fields/update/${form.fieldid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = res.data;
      if (data) {
        alert("Cập nhật sân thành công");
        setFields(prev => {
          const filtered = filterByContext([data]);
          if (filtered.length === 0) {
            return prev.filter(f => f.fieldid !== data.fieldid);
          }
          return prev.map(f => (f.fieldid === data.fieldid ? filtered[0] : f));
        });
        setShowEdit(false);
        setForm({ status: true });
        resetImageState();
        setErrors([]);
      }
    } catch (err: any) {
      console.error("Error updating field:", err);
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors((err.response.data.errors || []).map((msg: string) => ({ message: msg })));
      } else {
        alert("Có lỗi xảy ra khi cập nhật sân thể thao: " + (err.response?.data || err.message));
      }
    }
  };

  // Delete field handler
  const handleDeleteField = (fieldid: number) => {
    fetch(`${URL_BACKEND}/rest/fields/delete/${fieldid}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(() => {
        alert("Xóa sân thành công");
        setFields(prev => prev.filter(f => f.fieldid !== fieldid));
      });
  };

  // Open edit modal
  const openEditModal = (field: Field & { sporttype?: { sporttypeid: string } }) => {
    // Nếu field.sporttype là object, lấy sporttypeid từ đó
    let sporttypeid = field.sporttypeid;
    if ((field as any).sporttype && (field as any).sporttype.sporttypeid) {
      sporttypeid = (field as any).sporttype.sporttypeid;
    }
    resetImageState();
    setForm({ ...field, sporttypeid });
    // Parse availableShifts từ JSON string
    if (field.availableShifts) {
      try {
        const shiftsArray = JSON.parse(field.availableShifts);
        setSelectedShifts(shiftsArray.map((id: number) => id.toString()));
      } catch (e) {
        setSelectedShifts([]);
      }
    } else {
      setSelectedShifts([]);
    }
    setShowEdit(true);
    setErrors([]);
  };

  // Handle shift checkbox change
  const handleShiftChange = (shiftId: string) => {
    setSelectedShifts(prev =>
      prev.includes(shiftId)
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  // Handle form change
  const handleFormChange = (field: keyof Field, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // Handle Set IP button - geocode address to latitude/longitude
  const handleSetIP = async () => {
    const address = form.address;
    if (!address || address.trim() === '') {
      alert("Vui lòng nhập địa chỉ sân trước khi lấy tọa độ!");
      return;
    }

    const coords = await geocodeAddress(address);
    if (coords) {
      setForm(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }));
      alert(`Đã lấy tọa độ thành công!\nVĩ độ: ${coords.latitude}\nKinh độ: ${coords.longitude}`);
    } else {
      alert("Không thể tìm thấy tọa độ cho địa chỉ này. Vui lòng nhập chi tiết hơn (vd: có thêm tên Quận, Thành phố) hoặc tự điền tọa độ thủ công.");
    }
  };

  // Format currency
  const formatCurrency = (value: number) => value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className=" page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">{uiConfig.pageTitle}</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href={uiConfig.homeHref}>{uiConfig.homeLabel}</a></li>
                <li className="breadcrumb-item active" aria-current="page">{uiConfig.pageTitle}</li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
            />
            <button className="btn btn-success me-2" onClick={() => fileInputRef.current?.click()}>
              <i className="fa fa-file-excel-o"></i> Import Excel
            </button>
            <button className="btn btn-danger me-2" onClick={handleBulkDelete} disabled={selectedFields.length === 0}>
              <i className="fa fa-trash"></i> Xóa {selectedFields.length > 0 ? `(${selectedFields.length})` : ""}
            </button>
            <button className="btn btn-primary" onClick={async () => {
              resetImageState();
              setShowAdd(true);
              const geo = await getIPGeolocation();
              setForm({ status: true, clientIP: geo.ip, latitude: geo.latitude, longitude: geo.longitude });
              setErrors([]);
            }}>
              <i className="fa fa-plus"></i> Thêm mới sân thể thao
            </button>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-3">
            <input type="text" className="form-control"
              placeholder="Tên sân thể thao"
              value={search.namefield}
              onChange={e => setSearch(s => ({ ...s, namefield: e.target.value }))}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <select
              className="form-select"
              value={search.sporttypeid}
              onChange={e => setSearch(s => ({ ...s, sporttypeid: e.target.value }))}
            >
              <option value="">Tất cả môn thể thao</option>
              {sportTypes.map(st => (
                <option key={st.sporttypeid} value={st.sporttypeid}>
                  {st.categoryname} ({st.sporttypeid})
                </option>
              ))}
            </select>
          </div>
          <div className="col-sm-6 col-md-2">
            <select className="form-select"
              value={search.status}
              onChange={e => setSearch(s => ({ ...s, status: e.target.value }))}
            >
              <option value="">Tất cả</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Ngưng hoạt động</option>
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
                    <th>
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll} 
                        checked={fields.length > 0 && selectedFields.length === fields.length}
                      />
                    </th>
                    <th>#</th>
                    <th>Mã môn thể thao</th>
                    <th>Tên sân</th>
                    <th>Hình ảnh</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Địa chỉ</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((item, idx) => (
                    <tr key={item.fieldid}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedFields.includes(item.fieldid)}
                          onChange={(e) => handleSelectOne(e, item.fieldid)}
                        />
                      </td>
                      <td>{idx + 1}</td>
                      <td>{item.sporttypeid || item.sporttype?.sporttypeid || ""}</td>
                      <td>{item.namefield}</td>
                      <td>
                        <img
                          src={
                            item.image
                              ? item.image.startsWith("v")
                                ? `${VITE_CLOUDINARY_BASE_URL}/${item.image}`
                                : `/user/images/${item.image}`
                              : "/user/images/default.png"
                          }
                          alt=""
                          style={{
                            width: "70%",
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #eee",
                            background: "#fafbfc"
                          }}
                        />
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.status ? "Đang hoạt động" : "Ngưng hoạt động"}</td>
                      <td>{item.address}</td>
                      <td className="text-center">
                        <button className="btn btn-outline-primary btn-sm me-2"
                          onClick={() => openEditModal(item)}>
                          <i className="fa fa-pencil me-1"></i> Xem chi tiết
                        </button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteField(item.fieldid)}>
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
          onHide={() => {
            setShowAdd(false);
            resetImageState();
          }}
          title="Thêm mới sân thể thao"
          size="lg"
          className="custom-modal"
          bodyClassName="modal-body"
          footer={
            <button type="button" className="btn btn-primary" onClick={handleAddField}>
              Thêm sân thể thao
            </button>
          }
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-12 text-center mb-3">
                <label htmlFor="image" className="form-label">
                  <img
                    src={
                      imagePreview
                        ? imagePreview
                        : form.image
                          ? form.image.startsWith("v")
                            ? `${VITE_CLOUDINARY_BASE_URL}/${form.image}`
                            : `/user/images/${form.image}`
                          : "/user/images/default.png"
                    }
                    alt=""
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "1px solid #eee",
                      background: "#fafbfc"
                    }}
                  />
                </label>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Tên sân thể thao <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.namefield || ""}
                    onChange={e => handleFormChange("namefield", e.target.value)}
                  />
                  {errors.filter(e => e.field === "namefield").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Hình ảnh <span className="text-danger">*</span></label>
                  <input type="file"
                    className="form-control"
                    id="image"
                    onChange={e => handleImageChange(e.target.files)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Giá sân <span className="text-danger">*</span></label>
                  <input className="form-control" type="number"
                    value={form.price || ""}
                    onChange={e => handleFormChange("price", Number(e.target.value))}
                  />
                  {errors.filter(e => e.field === "price").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Địa chỉ <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input className="form-control" type="text"
                      placeholder="Nhập địa chỉ sân"
                      value={form.address || ""}
                      onChange={e => handleFormChange("address", e.target.value)}
                    />
                    <button className="btn btn-outline-primary" type="button" onClick={handleSetIP}>
                      Lấy Tọa Độ
                    </button>
                  </div>
                  {errors.filter(e => e.field === "address").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Môn thể thao <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={form.sporttypeid || ""}
                    onChange={e => handleFormChange("sporttypeid", e.target.value)}
                  >
                    <option value="">-- Chọn môn thể thao --</option>
                    {sportTypes.map(st => (
                      <option key={st.sporttypeid} value={st.sporttypeid}>
                        {st.categoryname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Latitude</label>
                  <input className="form-control" type="text"
                    placeholder="Latitude sẽ hiển thị ở đây"
                    value={form.latitude || ""}
                    onChange={e => handleFormChange("latitude", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Longitude</label>
                  <input className="form-control" type="text"
                    placeholder="Longitude sẽ hiển thị ở đây"
                    value={form.longitude || ""}
                    onChange={e => handleFormChange("longitude", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Trạng thái <span className="text-danger">*</span></label>
                  <select className="form-select"
                    value={form.status === undefined ? "1" : form.status ? "1" : "0"}
                    onChange={e => handleFormChange("status", e.target.value === "1")}
                  >
                    <option value="1">Đang hoạt động</option>
                    <option value="0">Ngưng hoạt động</option>
                  </select>
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Mô tả <span className="text-danger">*</span></label>
                  <textarea className="form-control"
                    value={form.descriptionfield || ""}
                    onChange={e => handleFormChange("descriptionfield", e.target.value)}
                  />
                  {errors.filter(e => e.field === "descriptionfield").map((e, i) => (
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
          onHide={() => {
            setShowEdit(false);
            resetImageState();
          }}
          title="Chỉnh sửa sân thể thao"
          size="lg"
          className="fade show"
          bodyClassName=""
          footer={
            <div className="text-end">
              <button type="button" className="btn btn-primary" onClick={handleEditField}>
                Chỉnh sửa sân thể thao
              </button>
              <button type="button" className="btn btn-danger ms-2" onClick={() => handleDeleteField(form.fieldid as number)}>
                Xóa sân thể thao
              </button>
            </div>
          }
        >
          <form>
            <div className="row g-3">
              <div className="col-sm-12 text-center mb-3">
                <label htmlFor="image" className="form-label">
                  <img
                    src={
                      imagePreview
                        ? imagePreview
                        : form.image
                          ? form.image.startsWith("v")
                            ? `${VITE_CLOUDINARY_BASE_URL}/${form.image}`
                            : `/user/images/${form.image}`
                          : "/user/images/default.png"
                    }
                    alt=""
                    style={{
                      width: "70%",

                      objectFit: "cover",
                      borderRadius: 12,
                      border: "1px solid #eee",
                      background: "#fafbfc"
                    }}
                  />
                </label>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Tên sân thể thao <span className="text-danger">*</span></label>
                  <input className="form-control" type="text"
                    value={form.namefield || ""}
                    onChange={e => handleFormChange("namefield", e.target.value)}
                  />
                  {errors.filter(e => e.field === "namefield").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Hình ảnh <span className="text-danger">*</span></label>
                  <input type="file"
                    className="form-control"
                    id="image"
                    onChange={e => handleImageChange(e.target.files)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Giá sân <span className="text-danger">*</span></label>
                  <input className="form-control" type="number"
                    value={form.price || ""}
                    onChange={e => handleFormChange("price", Number(e.target.value))}
                  />
                  {errors.filter(e => e.field === "price").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Địa chỉ <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input className="form-control" type="text"
                      placeholder="Nhập địa chỉ sân"
                      value={form.address || ""}
                      onChange={e => handleFormChange("address", e.target.value)}
                    />
                    <button className="btn btn-outline-primary" type="button" onClick={handleSetIP}>
                      Set IP
                    </button>
                  </div>
                  {errors.filter(e => e.field === "address").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Môn thể thao <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={form.sporttypeid || ""}
                    onChange={e => handleFormChange("sporttypeid", e.target.value)}
                  >
                    <option value="">-- Chọn môn thể thao --</option>
                    {sportTypes.map(st => (
                      <option key={st.sporttypeid} value={st.sporttypeid}>
                        {st.categoryname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Latitude</label>
                  <input className="form-control" type="text"
                    placeholder="Vĩ độ"
                    value={form.latitude || ""}
                    onChange={e => handleFormChange("latitude", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Longitude</label>
                  <input className="form-control" type="text"
                    placeholder="Kinh độ"
                    value={form.longitude || ""}
                    onChange={e => handleFormChange("longitude", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Trạng thái <span className="text-danger">*</span></label>
                  <select className="form-select"
                    value={form.status === undefined ? "1" : form.status ? "1" : "0"}
                    onChange={e => handleFormChange("status", e.target.value === "1")}
                  >
                    <option value="1">Đang hoạt động</option>
                    <option value="0">Ngưng hoạt động</option>
                  </select>
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-group">
                  <label>Mô tả <span className="text-danger">*</span></label>
                  <textarea className="form-control"
                    value={form.descriptionfield || ""}
                    onChange={e => handleFormChange("descriptionfield", e.target.value)}
                  />
                  {errors.filter(e => e.field === "descriptionfield").map((e, i) => (
                    <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                  ))}
                </div>
              </div>

              {/* Ngày hoạt động */}
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input className="form-control" type="date"
                    value={form.startDate || ""}
                    onChange={e => handleFormChange("startDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input className="form-control" type="date"
                    value={form.endDate || ""}
                    onChange={e => handleFormChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Chọn giờ */}
              <div className="col-sm-12">
                <div className="form-group">
                  <label className="mb-3"><strong>Chọn giờ hoạt động <span className="text-danger">*</span></strong></label>

                  <div style={{
                    backgroundColor: "#f8f9fa",
                    border: "2px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "20px",
                    maxHeight: "400px",
                    overflowY: "auto"
                  }}>
                    {allShifts.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        <p className="mb-0">⏳ Đang tải danh sách giờ...</p>
                      </div>
                    ) : (
                      <>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                          {allShifts.map(shift => {
                            const isSelected = selectedShifts.includes(shift.shiftid.toString());
                            return (
                              <div key={shift.shiftid} className="col">
                                <div
                                  onClick={() => handleShiftChange(shift.shiftid.toString())}
                                  style={{
                                    padding: "12px 15px",
                                    border: isSelected ? "2px solid #28a745" : "2px solid #e9ecef",
                                    borderRadius: "6px",
                                    backgroundColor: isSelected ? "#d4edda" : "#fff",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: isSelected ? "0 2px 8px rgba(40, 167, 69, 0.2)" : "none"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.backgroundColor = "#f1f3f5";
                                      e.currentTarget.style.borderColor = "#ced4da";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.backgroundColor = "#fff";
                                      e.currentTarget.style.borderColor = "#e9ecef";
                                    }
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                      <div style={{ fontWeight: "600", fontSize: "15px", color: isSelected ? "#28a745" : "#333" }}>
                                        {shift.nameshift}
                                      </div>
                                      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                                        {shift.starttime} → {shift.endtime}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div style={{ fontSize: "18px", color: "#28a745" }}>✓</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{
                          marginTop: "20px",
                          paddingTop: "15px",
                          borderTop: "1px solid #dee2e6",
                          textAlign: "center"
                        }}>
                          <span style={{
                            display: "inline-block",
                            backgroundColor: "#e7f3ff",
                            color: "#0066cc",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}>
                            ✓ Đã chọn: <strong>{selectedShifts.length}</strong> / {allShifts.length} giờ
                          </span>
                        </div>
                      </>
                    )}
                  </div>
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

export default FieldPage;
