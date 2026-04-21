import React, { useEffect, useState } from "react";
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface User {
  username: string;
  firstname: string;
  lastname: string;
  // ...other fields
}

interface Order {
  orderid: number;
  username: string;
  createdate: string;
  address: string;
  note: string;
  orderstatus: string;
  paymentstatus: boolean;
  paymentdate?: string;
  totalprice: number;
  users?: User;
  // ...other fields
}

interface OrderDetail {
  orderdetailsid: number;
  price: number;
  quantity: number;
  products: {
    productid: number;
    productname: string;
    // ...other fields
  };
  orders: {
    orderid: number;
    username: string;
    // ...other fields
  };
}

const OrderProductPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<Partial<Order>>({});
  const [orderDetail, setOrderDetail] = useState<OrderDetail[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState({
    searchName: "",
    searchDate: "",
    searchStatus: "",
    searchPayment: "",
  });

  // Fetch all orders
  useEffect(() => {
    fetch(`${URL_BACKEND}/sportify/rest/orders`)
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams({
      name: search.searchName,
      date: search.searchDate,
      status: search.searchStatus,
      payment: search.searchPayment,
    });
    fetch(`${URL_BACKEND}/sportify/rest/orders/search?${params}`)
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  // Refresh handler
  const handleRefresh = () => {
    setSearch({ searchName: "", searchDate: "", searchStatus: "", searchPayment: "" });
    fetch(`${URL_BACKEND}/sportify/rest/orders`)
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  // Open edit modal
  const openEditModal = (order: Order) => {
    setForm(order);
    setShowEdit(true);
    fetch(`${URL_BACKEND}/rest/orderdetails/${order.orderid}`)
      .then(res => res.json())
      .then(data => setOrderDetail(data));
  };

  // Handle form change
  const handleFormChange = (field: keyof Order, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Update order handler
  const handleUpdateOrder = () => {
    if (!form.orderid) return;
    fetch(`${URL_BACKEND}/sportify/rest/orders/${form.orderid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        setOrders(prev => prev.map(o => o.orderid === data.orderid ? data : o));
        setShowEdit(false);
      });
  };

  // Confirm order handler
  const handleConfirmOrder = () => {
    if (!form.orderid) return;
    fetch(`${URL_BACKEND}/sportify/rest/orders/confirm/${form.orderid}`, {
      method: "POST",
    })
      .then(() => handleRefresh());
  };

  // Cancel order handler
  const handleCancelOrder = () => {
    if (!form.orderid) return;
    fetch(`${URL_BACKEND}/sportify/rest/orders/cancel/${form.orderid}`, {
      method: "POST",
    })
      .then(() => handleRefresh());
  };

  // Format currency
  const formatCurrency = (value: number) => value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN");
  };

  return (
    <div className="page-wrapper py-4">
      {/* Page Content */}
      <div className="content ">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Đơn hàng</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><a href="/admin/index.html">Dashboard</a></li>
                <li className="breadcrumb-item active">Đơn hàng</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}

        {/* Search Filter */}
        <div className="row filter-row">
          <div className="col-sm-6 col-md-2">
            <label className="focus-label">Họ tên người đặt</label>
            <div className="form-group form-focus">
              <input
                type="text"
                className="form-control floating"
                value={search.searchName}
                onChange={e => setSearch(s => ({ ...s, searchName: e.target.value }))}
              />
            </div>
          </div>
          <div className="col-sm-6 col-md-2">
            <label className="focus-label">Ngày đặt</label>
            <div className="form-group form-focus">
              <input
                type="date"
                className="form-control floating"
                value={search.searchDate}
                onChange={e => setSearch(s => ({ ...s, searchDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="col-sm-2 col-md-2">
            <label className="focus-label">Trạng thái đơn hàng</label>
            <div className="form-group form-focus select-focus">
              <select
                className="select floating"
                value={search.searchStatus}
                onChange={e => setSearch(s => ({ ...s, searchStatus: e.target.value }))}
              >
                <option value="">Tất cả</option>
                <option value="Chờ Xác Nhận">Chờ Xác Nhận</option>
                <option value="Đang Giao">Đang Giao</option>
                <option value="Hoàn Thành">Hoàn Thành</option>
                <option value="Hủy Đặt">Hủy Đặt</option>
                <option value="Trả Hàng">Trả Hàng</option>
              </select>
            </div>
          </div>
          <div className="col-sm-2 col-md-2">
            <label className="focus-label">Trạng thái thanh toán</label>
            <div className="form-group form-focus select-focus">
              <select
                className="select floating"
                value={search.searchPayment}
                onChange={e => setSearch(s => ({ ...s, searchPayment: e.target.value }))}
              >
                <option value="">Tất cả</option>
                <option value="1">Đã thanh toán</option>
                <option value="0">Chưa thanh toán</option>
              </select>
            </div>
          </div>
          <div className="col-md-4 d-flex mt-4">
            <div className="col-sm-6 col-md-6 mt-1">
              <a href="#" className="mt-1 btn btn-success btn-block" onClick={(e) => { e.preventDefault(); handleSearch(); }}>
                Tìm kiếm
              </a>
            </div>
            <div className="col-sm-6 col-md-6 mt-1">
              <a href="#" className="mt-1 btn btn-success btn-block" onClick={(e) => { e.preventDefault(); handleRefresh(); }}>
                Làm mới
              </a>
            </div>
          </div>
        </div>
        {/* Search Filter */}

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <table className="table table-striped custom-table ">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Người dặt</th>
                    <th>Ngày đặt</th>
                    <th>Địa chỉ giao hàng</th>
                    <th>Trạng thái giao hàng</th>
                    <th>Thời gian thanh toán</th>
                    <th>Trạng thái thanh toán</th>
                    <th className="text-center no-sort">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((item, idx) => (
                    <tr key={item.orderid}>
                      <td>{idx + 1}</td>
                      <td>
                        {item.users
                          ? `${item.users.firstname} ${item.users.lastname}`
                          : item.username}
                      </td>
                      <td>{formatDate(item.createdate)}</td>
                      <td>{item.address}</td>
                      <td>{item.orderstatus}</td>
                      <td>{item.paymentdate ? formatDate(item.paymentdate) : "N/A"}</td>
                      <td>{item.paymentstatus ? "Đã thanh toán" : "Chưa thanh toán"}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-danger btn-block"
                          onClick={() => openEditModal(item)}
                        >
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

      {/* Edit Employee Modal */}
      {showEdit && (
        <div className="modal custom-modal fade show" role="dialog" style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: 1300 }} role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết phiếu đặt hàng</h5>
                <button type="button" className="close" onClick={() => setShowEdit(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="col-form-label">Mã phiếu <span className="text-danger">*</span></label>
                        <input className="form-control" type="text" value={form.orderid || ""} readOnly />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="col-form-label">Người đặt <span className="text-danger">*</span></label>
                        <input
                          className="form-control"
                          type="text"
                          value={
                            form.users
                              ? `${form.users.firstname} ${form.users.lastname}`
                              : form.username || ""
                          }
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="col-form-label">Ngày đặt <span className="text-danger">*</span></label>
                        <input className="form-control" type="text" value={formatDate(form.createdate || "")} readOnly />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="col-form-label">Địa chỉ <span className="text-danger">*</span></label>
                        <input className="form-control" type="email" value={form.address || ""} readOnly />
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="col-form-label">Trạng thái đặt hàng<span className="text-danger">*</span></label>
                        <select
                          className="form-control"
                          value={form.orderstatus || ""}
                          onChange={e => handleFormChange("orderstatus", e.target.value)}
                        >
                          <option value="Trả Hàng">Trả Hàng</option>
                          <option value="Hoàn Thành">Hoàn Thành</option>
                          <option value="Hủy Đặt">Hủy Đặt</option>
                          <option value="Đang Giao">Đang Giao</option>
                          <option value="Chờ Xác Nhận">Chờ Xác Nhận</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label className="col-form-label">Trạng thái thanh toán<span className="text-danger">*</span></label>
                        <select
                          className="form-control"
                          value={form.paymentstatus ? "true" : "false"}
                          onChange={e => handleFormChange("paymentstatus", e.target.value === "true")}
                        >
                          <option value="true">Đã thanh toán</option>
                          <option value="false">Chưa thanh toán</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label className="col-form-label">Thành tiền <span className="text-danger">*</span></label>
                        <input className="form-control" type="text" value={formatCurrency(form.totalprice || 0)} readOnly />
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label className="col-form-label">Ghi chú</label>
                        <textarea className="form-control" rows={3} value={form.note || ""} readOnly></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 d-flex">
                    <div className="card card-table flex-fill">
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-nowrap custom-table mb-0">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Tên sản phảm</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Tổng tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetail.map((o, idx) => (
                                <tr key={o.orderdetailsid}>
                                  <td>{idx + 1}</td>
                                  <td>{o.products.productname}</td>
                                  <td>{formatCurrency(o.price)}</td>
                                  <td>{o.quantity}</td>
                                  <td>{formatCurrency(o.price * o.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="submit-section">
                    {form.orderstatus === "Chờ Xác Nhận" && (
                      <>
                        <button className="btn btn-success submit-btn" type="button" onClick={handleConfirmOrder}>
                          Xác nhận đơn hàng
                        </button>
                        <button className="btn btn-danger submit-btn" type="button" onClick={handleCancelOrder}>
                          Hủy đơn hàng
                        </button>
                      </>
                    )}
                    <button className="btn btn-info submit-btn" type="button" onClick={handleUpdateOrder}>
                      Chỉnh sửa đơn hàng
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* /Edit Employee Modal */}

      <div id="toast"></div>
    </div>
  );
};

export default OrderProductPage;