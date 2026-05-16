const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentExpression from "../../../components/user/PaymentExpression";
import getImageUrl from "../../../helper/getImageUrl";
import VoucherSelect from "../../../components/user/VoucherSelect";
import { useNotification } from "../../../helper/NotificationContext";


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

interface CartItem {
  cartItemId: number;
  quantity: number;
  price: number;
  discountprice: number;
  productName: string | null;
  image: string | null;
}

interface ApiResponse {
  totalPrice: number;
  user: User;
  items: CartItem[];
  cartid: number;
  success: boolean;
}

const CheckoutCartItems: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const { addNotification } = useNotification();
  // State cho voucher
  const [voucherInfo, setVoucherInfo] = useState<{ voucherId: string; discountPercent: number; isValid: boolean }>({ voucherId: "", discountPercent: 0, isValid: false });
  const [voucherOfUserId, setVoucherOfUserId] = useState<number | null>(null);

  // State cho payment method
  const [showCardList, setShowCardList] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);


  useEffect(() => {
    const ids = searchParams.get("ids");

    if (!ids) {
      addNotification("Không tìm thấy sản phẩm!", "error");
      navigate("/sportify/cart/view");
      return;
    }

    fetch(`${URL_BACKEND}/api/user/cart/checkout/items?ids=${ids}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res: ApiResponse) => {
        if (res.success) {
          setData(res);
        } else {
          addNotification("Không thể tải thông tin thanh toán!", "error");
          navigate("/sportify/cart/view");
        }
      })
      .catch(() => {
        addNotification("Có lỗi xảy ra khi tải dữ liệu!", "error");
        navigate("/sportify/cart/view");
      });
  }, [searchParams, addNotification, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data) return;

    const discountAmount = Math.round(totalPrice * (voucherInfo.discountPercent / 100));
    const finalPrice = totalPrice - discountAmount + shippingFee;

    const formData = new FormData();
    formData.append('cartid', data.cartid.toString());
    formData.append('totalPrice', finalPrice.toString());
    formData.append('phone', data.user.phone.toString());
    formData.append('productid', data.items.map(item => item.cartItemId).join(','));
    formData.append('quantity', data.items.map(item => item.quantity).join(','));

    if (voucherInfo.isValid && voucherOfUserId !== null) {
      formData.append('voucherOfUserId', voucherOfUserId.toString());
    }

    // Thêm thông tin phương thức thanh toán
    if (showCardList && selectedCardId) {
      formData.append('paymentMethod', 'saved_card');
      formData.append('cardId', selectedCardId);
    } else {
      formData.append('paymentMethod', 'vietqr');
    }

    try {
      const res = await fetch(`${URL_BACKEND}/api/user/cart/payment`, {
        method: 'POST',
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`API trả về lỗi ${res.status}`);
      }

      const responseData = await res.json();

      // Nếu API trả về url để redirect, chuyển hướng tại đây
      if (responseData && responseData.url) {
        addNotification("Đang chuyển hướng đến trang thanh toán...", "info");
        window.location.href = responseData.url;
      } else {
        // Xử lý khi không có url trả về
        addNotification("Thanh toán thành công!", "success");
        navigate("/sportify/cart/view");
      }
    } catch (err: any) {
      addNotification("Có lỗi khi thanh toán, vui lòng thử lại!", "error");
    }
  };

  if (!data) return <div>Loading...</div>;

  const { user, items } = data;
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * (item.price - item.discountprice),
    0
  );
  const shippingFee = 30000;
  const finalPrice = totalPrice + shippingFee;

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
                <span className="mr-2"><a href="index.html">Trang Chủ <i className="fa fa-chevron-right"></i></a></span>
                <span>Cửa hàng<i className="fa fa-chevron-right"></i></span>
              </p>
              <h2 className="mb-0 bread">Thanh Toán ({items.length} sản phẩm)</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section">
        <div className="container">
          <div className="row justify-content-center">
            {/* Form điền thông tin để thanh toán */}
            <div className="col-xl-10">
              <form action="#" className="billing-form" style={{ background: "white" }}>
                <h3 className="mb-4 billing-heading">Chi tiết thanh toán đơn hàng</h3>
                <div className="row align-items-end">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="firstname">Họ: </label>
                      <input type="text" className="form-control" value={user.firstname} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="lastname">Tên: </label>
                      <input type="text" className="form-control" value={user.lastname} readOnly />
                    </div>
                  </div>
                  <div className="w-100"></div>
                  <div className="w-100"></div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="streetaddress">Địa chỉ nhận hàng: </label>
                      <input type="text" className="form-control" value={user.address} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="streetaddress">Ngày đặt hàng: </label>
                      <input type="text" className="form-control" value={new Date().toLocaleDateString('vi-VN')} readOnly />
                    </div>
                  </div>
                  <div className="w-100"></div>
                  <div className="w-100"></div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại: </label>
                      <input type="text" className="form-control" value={user.phone} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="emailaddress">Email: </label>
                      <input type="text" className="form-control" value={user.email} readOnly />
                    </div>
                  </div>
                </div>
              </form>
              {/* END */}

              {/* khu hình thức thanh toán */}
              <hr />
              <div className="row mt-5 pt-3 d-flex">
                <div className="col-md-6 d-flex">
                  <div className="cart-detail cart-total p-3 p-md-4" style={{ background: "white" }}>
                    <h3>Chi tiết giỏ hàng ({items.length} sản phẩm)</h3>

                    {/* Hiển thị danh sách sản phẩm */}
                    <div className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {items.map((item) => (
                        <div key={item.cartItemId} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                          <div className="img mr-3" style={{ width: 88, height: 88, minWidth: 88 }}>
                            {item.image ? (
                              <img
                                src={getImageUrl(item.image)}
                                alt="sp"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: 8,
                                  border: "1px solid #eee"
                                }}
                              />
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center"
                                style={{ width: "100%", height: "100%" }}>
                                <span className="text-muted">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="text flex-grow-1">
                            <h6 className="mb-1">{item.productName || `#${item.cartItemId}`}</h6>
                            <p className="mb-0">
                              <span className="quantity">SL: {item.quantity}</span>
                              <span className="price ml-3">
                                {(item.quantity * (item.price - item.discountprice)).toLocaleString("vi-VN")}đ
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="d-flex">
                      <span>Tạm tính: </span>
                      <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                    </p>
                    <p className="d-flex">
                      <span>Phí vận chuyển: </span>
                      <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                    </p>
                    <hr />
                    <p className="d-flex total-price">
                      <span>Thành tiền</span>
                      <span>{finalPrice.toLocaleString("vi-VN")}đ</span>
                    </p>
                    {/* Voucher selection */}
                    <div className="mb-3">
                      <VoucherSelect
                        username={user?.username}
                        onVoucherApplied={(discountPercent, voucherId) => {
                          setVoucherInfo({ voucherId: voucherId?.toString() || "", discountPercent, isValid: discountPercent > 0 });
                          setVoucherOfUserId(voucherId ?? null);
                        }}
                      />
                    </div>

                    {/* Totals */}
                    {(() => {
                      const discountAmount = Math.round(totalPrice * (voucherInfo.discountPercent / 100));
                      const finalPriceValue = totalPrice - discountAmount + shippingFee;
                      return (
                        <>
                          <p className="d-flex">
                            <span>Tạm tính: </span>
                            <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                          </p>
                          {voucherInfo.isValid && (
                            <p className="d-flex text-success">
                              <span>Giảm giá ({voucherInfo.discountPercent}%): </span>
                              <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                            </p>
                          )}
                          <p className="d-flex">
                            <span>Phí vận chuyển: </span>
                            <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                          </p>
                          <hr />
                          <p className="d-flex total-price">
                            <span>Thành tiền</span>
                            <span>{finalPriceValue.toLocaleString("vi-VN")}đ</span>
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="col-md-6">
                  <form onSubmit={handleSubmit}>
                    <PaymentExpression
                      titleButton={`Thanh toán ${items.length} sản phẩm`}
                      showCardList={showCardList}
                      setShowCardList={setShowCardList}
                      username={user?.username}
                      selectedCardId={selectedCardId}
                      setSelectedCardId={setSelectedCardId}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutCartItems;
