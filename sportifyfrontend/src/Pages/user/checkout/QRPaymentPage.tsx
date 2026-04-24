import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useNotification } from "../../../helper/NotificationContext";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const QRPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const amount = searchParams.get("amount") || "0";
  const orderId = searchParams.get("orderId") || "";
  const desc = searchParams.get("desc") || "";

  const [isSuccess, setIsSuccess] = useState(false);

  // URL tạo ảnh VietQR
  const qrUrl = `https://img.vietqr.io/image/MB-0362947198-compact2.png?amount=${amount}&addInfo=${desc}&accountName=DANG%20DINH%20KIEN`;

  // Polling check payment status
  useEffect(() => {
    if (!orderId || isSuccess) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${URL_BACKEND}/api/user/payment/status?orderId=${orderId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isPaid) {
            setIsSuccess(true);
            clearInterval(intervalId);
            addNotification("Thanh toán thành công! Hệ thống đã xác nhận.", "success");
            
            // Xử lý redirect sau 2 giây
            setTimeout(() => {
              if (orderId.startsWith("FIELD_")) {
                navigate("/sportify/field/profile/historybooking");
              } else {
                navigate("/sportify/order/historyList");
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000); // Check mỗi 3 giây

    return () => clearInterval(intervalId);
  }, [orderId, isSuccess, navigate, addNotification]);

  return (
    <>
      <section className="hero-wrap hero-wrap-2" 
        style={{ backgroundImage: "url('/user/images/bg_product.png')", height: "300px" }}>
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center" style={{height: "300px"}}>
            <div className="col-md-9 mb-5 text-center">
              <h2 className="mb-0 bread">Thanh Toán Bằng Mã QR</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center p-5 bg-white shadow-sm rounded">
              {isSuccess ? (
                <div>
                  <i className="fa fa-check-circle text-success" style={{ fontSize: "80px" }}></i>
                  <h3 className="mt-4 mb-3 text-success">Thanh Toán Thành Công!</h3>
                  <p>Hệ thống đã nhận được thanh toán của bạn.</p>
                  <p>Đang chuyển hướng về trang lịch sử...</p>
                </div>
              ) : (
                <>
                  <h3 className="mb-4">Quét Mã Để Thanh Toán</h3>
                  <div className="d-flex justify-content-center mb-4">
                    <img src={qrUrl} alt="Mã QR Thanh Toán" style={{ maxWidth: "100%", maxHeight: "400px", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }} />
                  </div>
                  <div className="payment-info text-left p-4 bg-light rounded" style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <p className="mb-2"><strong>Ngân hàng:</strong> MBBank</p>
                    <p className="mb-2"><strong>Chủ tài khoản:</strong> ĐẶNG ĐÌNH KIÊN</p>
                    <p className="mb-2"><strong>Số tài khoản:</strong> 0362947198</p>
                    <p className="mb-2"><strong>Số tiền:</strong> <span className="text-danger font-weight-bold">{Number(amount).toLocaleString('vi-VN')} đ</span></p>
                    <p className="mb-0"><strong>Nội dung CK:</strong> <span className="bg-warning px-2 py-1 rounded">{desc}</span></p>
                  </div>
                  <p className="mt-4 text-muted">
                    <i className="fa fa-spinner fa-spin mr-2"></i> Hệ thống đang chờ nhận tiền...
                  </p>
                  <button 
                    className="btn btn-primary mt-2" 
                    onClick={async () => {
                      try {
                        const response = await fetch(`${URL_BACKEND}/api/user/payment/status?orderId=${orderId}`);
                        if (response.ok) {
                          const data = await response.json();
                          if (data.isPaid) {
                            setIsSuccess(true);
                            addNotification("Thanh toán đã được xác nhận!", "success");
                          } else {
                            addNotification("Hệ thống chưa nhận được tiền. Vui lòng đợi hoặc kiểm tra lại nội dung chuyển khoản.", "info");
                          }
                        }
                      } catch (err) {
                        addNotification("Lỗi khi kiểm tra trạng thái. Vui lòng thử lại.", "error");
                      }
                    }}
                  >
                    Tôi đã chuyển tiền, kiểm tra ngay
                  </button>
                  <p className="small text-danger mt-3">
                    * Vui lòng giữ nguyên trang này sau khi quét mã, hệ thống sẽ tự động xác nhận khi nhận được tiền.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default QRPaymentPage;
