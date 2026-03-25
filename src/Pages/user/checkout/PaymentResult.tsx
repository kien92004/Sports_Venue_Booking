// PaymentResult.jsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useNotification } from "../../../helper/NotificationContext";

function formatCurrency(amount: string | number | null) {
  if (!amount) return "";
  const num = typeof amount === "string" ? Number(amount) : amount;
  return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function PaymentResult() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const { addNotification } = useNotification();

  // Lấy các tham số từ URL do backend redirect về
  const orderId = query.get("orderId");
  const status = query.get("status"); // "success" hoặc "fail"
  const amount = query.get("amount");
  const isField = query.get("field") === "true";
  const isCart = query.get("cart") === "true";
  const refundId = query.get("refundId");
  const fieldOwner = query.get("owner"); // Lấy owner từ URL

  const isSuccess = status === "success";
  const transactionStatus = isSuccess ? "Thành công" : "Thất bại";
  
  // Thêm thông báo khi trang được tải
  useEffect(() => {
    if (isSuccess) {
      if (isField) {
        addNotification("Thanh toán đặt sân thành công!", "success");
      } else if (isCart) {
        addNotification("Thanh toán đơn hàng thành công!", "success");
      } else {
        addNotification("Giao dịch của bạn đã được xử lý thành công", "success");
      }
    } else {
      addNotification("Giao dịch không thành công, vui lòng thử lại", "error");
    }
  }, []);

  // Xác định mô tả giao dịch
  let description = "Thanh toán";
  if (isField) description = refundId ? "Hoàn tiền đặt sân" : "Thanh toán đặt sân";
  else if (isCart) description = "Thanh toán đơn hàng";

  // Xác định URL trở về dựa trên owner
  const getBackUrl = () => {
    if (refundId) {
      return fieldOwner ? `/owner/bookings` : `/admin/bookings`;
    }
    if (isCart) {
      return `/sportify/order/historyList`;
    }
    if (isField) {
      return `/sportify/field/profile/historybooking`;
    }
    return `/sportify`;
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center mt-2">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-white border-0 text-center py-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <img 
                    src="/user/images/iconVNP.png" 
                    alt="VNPAY" 
                    className="me-3"
                    style={{ width: "60px", height: "60px" }}
                  />
                  <h2 className="text-primary fw-bold mb-0">Kết Quả Thanh Toán</h2>
                  <img 
                    src="/user/images/Logo3.png" 
                    alt="Logo" 
                    className="ms-3"
                    style={{ width: "80px", height: "60px" }}
                  />
                </div>
              </div>

              <div className="card-body p-5">
                {/* Thông tin giao dịch */}
                <div className="mb-4">
                  <h5 className="text-dark fw-semibold mb-3">
                    <i className="fa fa-info-circle text-primary me-2"></i>
                    Thông tin giao dịch
                  </h5>
                  <div className="bg-light rounded p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="d-flex">
                          <span className="text-muted fw-medium">Mã giao dịch:</span>
                          <span className="ms-2 fw-bold text-dark">{orderId}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex">
                          <span className="text-muted fw-medium">Mô tả:</span>
                          <span className="ms-2 fw-bold text-dark">{description}</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex">
                          <span className="text-muted fw-medium">Số tiền:</span>
                          <span className="ms-2 fw-bold text-success fs-5">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="mb-5">
                  <h5 className="text-dark fw-semibold mb-3">
                    <i className="fa fa-check-circle text-success me-2"></i>
                    Trạng thái giao dịch
                  </h5>
                  <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} d-flex align-items-center`}>
                    <i className={`fa ${isSuccess ? 'fa-check-circle' : 'fa-times-circle'} fs-4 me-3`}></i>
                    <div>
                      <h6 className="mb-1 fw-bold">{transactionStatus}</h6>
                      <small className="mb-0">
                        {isSuccess 
                          ? (refundId
                              ? "Hoàn tiền thành công!"
                              : isField
                                ? "Thanh toán đặt sân thành công!"
                                : isCart
                                  ? "Thanh toán đơn hàng thành công!"
                                  : "Giao dịch của bạn đã được xử lý thành công"
                            )
                          : "Giao dịch không thành công, vui lòng thử lại"
                        }
                      </small>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  {refundId ? (
                    <a href={getBackUrl()} className="btn btn-primary btn-lg px-4 text-decoration-none">
                      <i className="fa fa-arrow-left me-2"></i>
                      Trở về Quản lý đặt sân
                    </a>
                  ) : (
                    <>
                      <a href="/sportify" className="btn btn-primary btn-lg px-4 text-decoration-none">
                        <i className="fa fa-home me-2"></i>
                        Về Trang Chủ
                      </a>
                      {isCart ? (
                        <a href="/sportify/order/historyList" className="btn btn-outline-primary btn-lg px-4 text-decoration-none">
                          <i className="fa fa-history me-2"></i>
                          Lịch Sử Đơn Hàng
                        </a>
                      ) : isField && fieldOwner ? (
                        <a href="/owner/bookings" className="btn btn-outline-primary btn-lg px-4 text-decoration-none">
                          <i className="fa fa-history me-2"></i>
                          Lịch Sử Đặt Sân (Chủ sân)
                        </a>
                      ) : (
                        <a href="/sportify/field/profile/historybooking" className="btn btn-outline-primary btn-lg px-4 text-decoration-none">
                          <i className="fa fa-history me-2"></i>
                          Lịch Sử Đặt Sân
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="card-footer bg-light text-center py-3">
                <small className="text-muted">
                  <i className="fa fa-shield me-1"></i>
                  Giao dịch được bảo mật bởi VNPAY
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
