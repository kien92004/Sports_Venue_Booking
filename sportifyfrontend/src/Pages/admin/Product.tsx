const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import BootstrapModal from "../../components/admin/BootstrapModal";
import getImageUrl from "../../helper/getImageUrl";
import "../../styles/AdminModal.css";

interface Category {
  categoryid: number;
  categoryname: string;
}

interface Product {
  productid: number;
  categoryid: number;
  productname: string;
  image: string;
  discountprice: number;
  datecreate: string;
  price: number;
  productstatus: boolean;
  descriptions: string;
  quantity: number;
  categories?: Category;
}

interface ErrorField {
  field?: string;
  message: string;
}
const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Cache full list for refresh and offline fallback
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<ErrorField[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [search, setSearch] = useState({
    searchName: "",
    searchCate: "",
    searchStatus: "",
  });

  // Fetch all products and categories
  useEffect(() => {
    fetch(`${URL_BACKEND}/rest/products/getAll`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setAllProducts(data);
      });
    fetch(`${URL_BACKEND}/rest/categories/getAll`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.searchName.trim()) params.append("productname", search.searchName.trim());
    if (search.searchCate) params.append("categoryid", search.searchCate);
    if (search.searchStatus) params.append("productstatus", search.searchStatus);

    const query = params.toString();
    const url = query
      ? `${URL_BACKEND}/rest/products/search?${query}`
      : `${URL_BACKEND}/rest/products/getAll`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProducts(data);
        if (!query) {
          setAllProducts(data);
        }
      })
      .catch(err => {
        console.error("[Product Search] failed", err);
        const trimmedName = search.searchName.trim().toLowerCase();
        const filtered = allProducts.filter(product => {
          const productName = (product.productname || "").toLowerCase();
          const categoryId = product.categoryid ?? product.categories?.categoryid;
          const statusValue = product.productstatus;
          const matchesName = trimmedName ? productName.includes(trimmedName) : true;
          const matchesCategory = search.searchCate
            ? String(categoryId ?? "") === search.searchCate
            : true;
          const matchesStatus = search.searchStatus
            ? String(statusValue === true || statusValue ? 1 : 0) === search.searchStatus
            : true;
          return matchesName && matchesCategory && matchesStatus;
        });
        setProducts(filtered);
      });
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearch({ searchName: "", searchCate: "", searchStatus: "" });
    fetch(`${URL_BACKEND}/rest/products/getAll`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setAllProducts(data);
      });
  };

  // Add product handler
  const handleAddProduct = () => {
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          key !== "image"
        ) {
          if (typeof value === "boolean") {
            formData.append(key, value ? "true" : "false");
          } else {
            formData.append(key, String(value));
          }
        }
      });
      // Thêm file ảnh nếu có
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }
      console.log("formData", Array.from(formData.entries()));
      fetch(`${URL_BACKEND}/rest/products/create`, {
        method: "POST",
        body: formData,
      })
        .then(async res => {
          if (!res.ok) {
            alert("Thêm sản phẩm thất bại. Vui lòng kiểm tra lại thông tin.");
            setShowAdd(true);
            const err = await res.json();
            setErrors((err.errors || []).map((msg: string) => ({ message: msg })));
            return;
          }
          return res.json();
        })
        .then(data => {
          if (data) {
            setProducts(prev => [...prev, data]);
            setAllProducts(prev => [...prev, data]);
            setShowAdd(false);
            setForm({});
            setErrors([]);
          }
        });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Đã xảy ra lỗi khi thêm sản phẩm. Vui lòng thử lại.");
    }
  };

  // Edit product handler
  const handleEditProduct = () => {
    if (!form.productid) return;
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        key !== "image" &&
        key !== "categories"
      ) {
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, String(value));
        }
      }
    });
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    fetch(`${URL_BACKEND}/rest/products/update/${form.productid}`, {
      method: "PUT",
      body: formData,
    })
      .then(async res => {
        if (!res.ok) {
          let err: any = null;
          try {
            err = await res.json();
          } catch {
            // ignore
          }
          const msgs: string[] = err?.errors || (err?.message ? [err.message] : ["Cập nhật sản phẩm thất bại"]);
          setErrors(msgs.map((msg: string) => ({ message: msg })));
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        alert("Cập nhật sản phẩm thành công");
        setProducts(prev => prev.map(p => p.productid === data.productid ? data : p));
        setAllProducts(prev => prev.map(p => p.productid === data.productid ? data : p));
        setShowEdit(false);
        setForm({});
        setErrors([]);
        setImageFile(null);
      })
      .catch(err => {
        console.error("[Product Update] failed", err);
        alert("Đã xảy ra lỗi khi cập nhật sản phẩm");
      });
  };

  // Delete product handler
  const handleDeleteProduct = (productid: number) => {
    fetch(`${URL_BACKEND}/rest/products/delete/${productid}`, {
      method: "DELETE",
    })
      .then(async res => {
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            payload?.error ||
            payload?.message ||
            "Không thể xóa sản phẩm (có thể sản phẩm đã phát sinh đơn hàng).";
          throw new Error(msg);
        }
        return payload;
      })
      .then(() => {
        alert("Xóa sản phẩm thành công");
        setProducts(prev => prev.filter(p => p.productid !== productid));
        setAllProducts(prev => prev.filter(p => p.productid !== productid));
        setShowEdit(false);
        setImageFile(null);
      })
      .catch(err => {
        console.error("[Product Delete] failed", err);
        alert(err?.message || "Xóa sản phẩm thất bại");
      });
  };

  // Open edit modal
  const openEditModal = (product: Product) => {
    setForm(product);
    setShowEdit(true);
    setErrors([]);
    setImageFile(null);
  };

  // Handle form change
  const handleFormChange = (field: keyof Product, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  // Handle image upload
  const handleImageChange = (files: FileList | null) => {
    if (files && files[0]) {
      setImageFile(files[0]);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <div className="page-wrapper">
      {/* Page Content */}
      <div className="content ">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Sản phẩm</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin/index.html">Dashboard</a></li>
                <li className="breadcrumb-item active">Sản phẩm</li>
              </ul>
            </div>
            <div className="col-auto float-right ml-auto">
              <button className="btn add-btn" onClick={() => { setShowAdd(true); setForm({}); setErrors([]); }}>
                <i className="fa fa-plus"></i> Thêm mới sản phẩm
              </button>
            </div>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <div className="row filter-row align-items-end g-3 mb-4">
          <div className="col-sm-6 col-md-3">
            <div className="form-group mb-0">
              <label className="form-label">Tên sản phẩm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên sản phẩm"
                value={search.searchName}
                onChange={e => setSearch(s => ({ ...s, searchName: e.target.value }))}
              />
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="form-group mb-0">
              <label className="form-label">Loại sản phẩm</label>
              <select
                className="form-select"
                value={search.searchCate}
                onChange={e => setSearch(s => ({ ...s, searchCate: e.target.value }))}
              >
                <option value="">Tất cả</option>
                {categories.map(c => (
                  <option key={c.categoryid} value={c.categoryid}>{c.categoryname}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-sm-6 col-md-2">
            <div className="form-group mb-0">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={search.searchStatus}
                onChange={e => setSearch(s => ({ ...s, searchStatus: e.target.value }))}
              >
                <option value="">Tất cả</option>
                <option value="1">Đang bán</option>
                <option value="0">Ngưng bán</option>
              </select>
            </div>
          </div>
          <div className="col-sm-6 col-md-2 d-flex align-items-end">
            <button type="button" className="btn btn-success w-100" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>
          <div className="col-sm-6 col-md-2 d-flex align-items-end">
            <button type="button" className="btn btn-success w-100" onClick={handleRefresh}>
              Làm mới
            </button>
          </div>
        </div>
        {/* Search Filter */}

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <table className="table table-striped custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Loại sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Hình ảnh</th>
                    <th>Giảm giá</th>
                    <th>Ngày tạo</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Số lượng</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, idx) => (
                    <tr key={item.productid}>
                      <td>{idx + 1}</td>
                      <td>{item.categories?.categoryname || ""}</td>
                      <td>{item.productname}</td>
                      <td>
                        <img
                          src={
                            getImageUrl(item.image)
                          }
                          width="100px"
                          height="100px"
                          alt={item.productname}
                        />
                      </td>
                      <td>{item.discountprice}</td>
                      <td>{formatDate(item.datecreate)}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.productstatus ? "Đang bán" : "Ngưng Bán"}</td>
                      <td>{item.quantity}</td>
                      <td className="text-center">
                        <button className="btn btn-danger btn-block"
                          onClick={() => openEditModal(item)}>
                          <i className="fa fa-pencil m-r-5"></i> Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Content */}

      {/* Add Modal */}
      <BootstrapModal
        show={showAdd}
        onHide={() => setShowAdd(false)}
        title="Thêm mới sản phẩm"
        size="lg"
        className="custom-modal"
        bodyClassName="modal-body"
        footer={
          <button type="button" className="btn btn-primary" onClick={handleAddProduct}>
            Thêm sản phẩm
          </button>
        }
      >
        <form>
          <div className="row">
            <div className="col-sm-12">
              <div className="form-group d-flex justify-content-center">
                <label htmlFor="image" className="col-form-label">
                  <img
                    src={
                      form.image ? getImageUrl(form.image) : "/user/images/default.png"
                    }
                    style={{ maxWidth: "100%", height: "200px" }}
                    alt={form.productname}
                  />
                </label>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Tên sản phẩm <span className="text-danger">*</span></label>
                <input className="form-control" type="text"
                  value={form.productname || ""}
                  onChange={e => handleFormChange("productname", e.target.value)}
                />
                {errors.filter(e => e.field === "productname").map((e, i) => (
                  <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                ))}
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Giảm giá <span className="text-danger">*</span></label>
                <input className="form-control" type="number"
                  value={form.discountprice || ""}
                  onChange={e => handleFormChange("discountprice", Number(e.target.value))}
                />
                {errors.filter(e => e.field === "discountprice").map((e, i) => (
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
                <label>Ngày tạo <span className="text-danger">*</span></label>
                <input className="form-control" type="date"
                  value={form.datecreate || ""}
                  onChange={e => handleFormChange("datecreate", e.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Trạng thái <span className="text-danger">*</span></label>
                <select className="form-select"
                  value={form.productstatus === undefined ? "" : form.productstatus ? "1" : "0"}
                  onChange={e => handleFormChange("productstatus", e.target.value === "1")}
                >
                  <option value="1">Đang bán</option>
                  <option value="0">Ngưng bán</option>
                </select>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Số lượng <span className="text-danger">*</span></label>
                <input type="number"
                  className="form-control"
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
                <label>Loại sản phẩm <span className="text-danger">*</span></label>
                <select className="form-select"
                  value={form.categoryid || ""}
                  onChange={e => handleFormChange("categoryid", Number(e.target.value))}
                >
                  <option value="">Chọn loại sản phẩm</option>
                  {categories.map(c => (
                    <option key={c.categoryid} value={c.categoryid}>{c.categoryname}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Giá <span className="text-danger">*</span></label>
                <input type="number"
                  className="form-control"
                  value={form.price || ""}
                  onChange={e => handleFormChange("price", Number(e.target.value))}
                />
                {errors.filter(e => e.field === "price").map((e, i) => (
                  <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                ))}
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
        </form>
      </BootstrapModal>

      {/* Edit Modal */}
      <BootstrapModal
        show={showEdit}
        onHide={() => setShowEdit(false)}
        title="Chỉnh sửa sản phẩm"
        size="lg"
        className="fade show"
        bodyClassName=""
        footer={
          <div className="text-end">
            <button type="button" className="btn btn-primary" onClick={handleEditProduct}>
              Chỉnh sửa sản phẩm
            </button>
            <button type="button" className="btn btn-danger ms-2" onClick={() => handleDeleteProduct(form.productid as number)}>
              Xóa sản phẩm
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
                    form.image
                      ? getImageUrl(form.image)
                      : "/user/images/default.png" // fallback nếu null
                  }
                  width="60%"
                  style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee", background: "#fafbfc" }}
                  alt={form.productname}
                />
              </label>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Tên sản phẩm <span className="text-danger">*</span></label>
                <input className="form-control" type="text"
                  value={form.productname || ""}
                  onChange={e => handleFormChange("productname", e.target.value)}
                />
                {errors.filter(e => e.field === "productname").map((e, i) => (
                  <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                ))}
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Giảm giá <span className="text-danger">*</span></label>
                <input className="form-control" type="number"
                  value={form.discountprice || ""}
                  onChange={e => handleFormChange("discountprice", Number(e.target.value))}
                />
                {errors.filter(e => e.field === "discountprice").map((e, i) => (
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
                <label>Ngày tạo <span className="text-danger">*</span></label>
                <input className="form-control" type="date"
                  value={form.datecreate || ""}
                  onChange={e => handleFormChange("datecreate", e.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Trạng thái <span className="text-danger">*</span></label>
                <select className="form-select"
                  value={form.productstatus === undefined ? "" : form.productstatus ? "1" : "0"}
                  onChange={e => handleFormChange("productstatus", e.target.value === "1")}
                >
                  <option value="1">Đang bán</option>
                  <option value="0">Ngưng bán</option>
                </select>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Số lượng <span className="text-danger">*</span></label>
                <input type="number"
                  className="form-control"
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
                <label>Loại sản phẩm <span className="text-danger">*</span></label>
                <select className="form-select"
                  value={form.categoryid || ""}
                  onChange={e => handleFormChange("categoryid", Number(e.target.value))}
                >
                  <option value="">Chọn loại sản phẩm</option>
                  {categories.map(c => (
                    <option key={c.categoryid} value={c.categoryid}>{c.categoryname}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Giá <span className="text-danger">*</span></label>
                <input type="number"
                  className="form-control"
                  value={form.price || ""}
                  onChange={e => handleFormChange("price", Number(e.target.value))}
                />
                {errors.filter(e => e.field === "price").map((e, i) => (
                  <div key={i} className="badge bg-danger mt-1">{e.message}</div>
                ))}
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
        </form>
      </BootstrapModal>

      {/* Toast/Notification */}
      <div id="toast"></div>
    </div>
  );
};

export default ProductPage;
