
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  categories: Category;
}

interface User {
  username: string;
  passwords: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  address: string;
  image: string | null;
  gender: boolean;
  status: boolean;
}

interface Order {
  orderid: number;
  username: string;
  createdate: string;
  address: string;
  note: string | null;
  orderstatus: string;
  paymentstatus: boolean;
  totalprice: number;
  users: User;
}

interface OrderDetail {
  orderdetailsid: number;
  price: number;
  quantity: number;
  products: Product;
  orders: Order;
}

interface ApiResponse {
  order: OrderDetail[];
  success: boolean;
}

const OrderDetail: React.FC = () => {
  const orderId = useParams().id;
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
    fetch(
      `${URL_BACKEND}/api/user/order/historyList/detail/${orderId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu đơn hàng");
        setLoading(false);
        console.error(err);
      });
  }, [orderId]);

  const handleDelete = (orderid: number) => {
    fetch(`${URL_BACKEND}/api/user/order/cancelOrder/${orderid}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Hủy đơn hàng thành công");
          window.history.back();
        }
      })
      .catch((err) => {
        alert("Có lỗi xảy ra khi hủy đơn hàng");
        console.error(err);
      });
  };

  if (loading) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error || !data || !data.order || data.order.length === 0) return (
    <div className="alert alert-danger text-center my-5">
      {error || "Không tìm thấy thông tin đơn hàng"}
    </div>
  );

  // Lấy thông tin đơn hàng từ chi tiết đầu tiên
  const orderInfo = data.order[0].orders;

  // Tính tổng tiền thực tế từ tất cả các chi tiết đơn hàng
  const totalOrderAmount = data.order.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* background */}
      <section className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: "url('/user/images/bg_product.png')" }}
        data-stellar-background-ratio="0.5">
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 mb-5 text-center">
              <p className="breadcrumbs mb-0">
                <span className="mr-2"><a href="/sportify">Trang Chủ <i
                  className="fa fa-chevron-right"></i></a></span> <span>Sản Phẩm <i
                    className="fa fa-chevron-right"></i></span>
              </p>
              <h2 className="mb-0 bread">Chi tiết đơn hàng</h2>
            </div>
          </div>
        </div>
      </section>

      {/* container sản phẩm */}
      <section className="ftco-section">
        <div className="container">
          <a href="/sportify/order/historyList" className="btn btn-outline-secondary mb-3">
            <i className="fa fa-arrow-left me-2"></i>
            Quay lại Lịch sử đặt hàng
          </a>

          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Đơn hàng #{orderInfo.orderid}</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <p><strong>Người đặt:</strong> {orderInfo.users.firstname} {orderInfo.users.lastname}</p>
                  <p><strong>Địa chỉ:</strong> {orderInfo.address}</p>
                  <p><strong>Ngày đặt:</strong> {formatDate(orderInfo.createdate)}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Trạng thái đơn hàng:</strong> <span className={`badge ${orderInfo.orderstatus === 'Đã Thanh Toán' ? 'bg-success' :
                      orderInfo.orderstatus === 'Chờ Xác Nhận' ? 'bg-warning' :
                        'bg-primary'
                    }`}>{orderInfo.orderstatus}</span></p>
                  <p><strong>Trạng thái thanh toán:</strong> <span className={`badge ${orderInfo.paymentstatus ? 'bg-success' : 'bg-danger'}`}>
                    {orderInfo.paymentstatus ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span></p>
                  {orderInfo.note && <p><strong>Ghi chú:</strong> {orderInfo.note}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Chi tiết sản phẩm</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0">
                  <thead>
                    <tr className="text-center">
                      <th scope="col">ID</th>
                      <th scope="col">Hình</th>
                      <th scope="col">Tên sản phẩm</th>
                      <th scope="col">Danh mục</th>
                      <th scope="col">Giá</th>
                      <th scope="col">Số lượng</th>
                      <th scope="col">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.order.map((item) => (
                      <tr key={item.orderdetailsid} className="text-center">
                        <th scope="row">{item.products.productid}</th>
                        <td>
                          <img
                            className="img-fluid"
                            src={
                              item.products.image.startsWith("v")
                                ? `${import.meta.env.VITE_CLOUDINARY_BASE_URL}/${item.products.image}`
                                : `/user/images/${item.products.image}`
                            }
                            alt={item.products.productname}
                            style={{ maxHeight: "80px", maxWidth: "80px", objectFit: "contain" }}
                          />
                        </td>
                        <td className="text-start">{item.products.productname}</td>
                        <td>{item.products.categories.categoryname}</td>
                        <td>
                          {item.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </td>
                        <td>{item.quantity}</td>
                        <td>
                          {(item.price * item.quantity).toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-group-divider">
                    <tr>
                      <td colSpan={5}></td>
                      <td className="text-end fw-bold">Tổng tiền:</td>
                      <td className="text-center fw-bold">
                        {totalOrderAmount.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="card-footer text-end">
              {orderInfo.orderstatus === "Chờ Xác Nhận" && (
                <button
                  onClick={() => { handleDelete(orderInfo.orderid) }}
                  className="btn btn-danger"
                >
                  <i className="fa fa-times-circle me-1"></i>
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrderDetail;
