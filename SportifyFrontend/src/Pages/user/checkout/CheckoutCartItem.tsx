// const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useNotification } from "../../../helper/NotificationContext";

// interface User {
//   username: string;
//   passwords: string;
//   firstname: string;
//   lastname: string;
//   phone: string;
//   email: string;
//   address: string;
//   image: string | null;
//   gender: boolean;
//   status: boolean;
// }

// interface CartItem {
//   cartItemId: number;
//   quantity: number;
//   price: number;
//   discountprice: number;
//   productName: string | null;
//   image: string | null;
// }

// interface ApiResponse {
//   totalPrice: number;
//   user: User;
//   item: CartItem;
//   cartid: number;
//   success: boolean;
// }

// const CheckoutCartItem: React.FC = () => {
//   const { cartItemId } = useParams<{ cartItemId: string }>();
//   const navigate = useNavigate();
//   const [data, setData] = useState<ApiResponse | null>(null);
//   const { addNotification } = useNotification();

//   useEffect(() => {
//     if (!cartItemId) {
//       addNotification("Không tìm thấy sản phẩm!", "error");
//       navigate("/sportify/cart/view");
//       return;
//     }

//     fetch(`${URL_BACKEND}/api/user/cart/checkout/${cartItemId}`, {
//       method: "GET",
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then((res) => res.json())
//       .then((res: ApiResponse) => {
//         if (res.success) {
//           setData(res);
//         } else {
//           addNotification("Không thể tải thông tin thanh toán!", "error");
//           navigate("/sportify/cart/view");
//         }
//       })
//       .catch(() => {
//         addNotification("Có lỗi xảy ra khi tải dữ liệu!", "error");
//         navigate("/sportify/cart/view");
//       });
//   }, [cartItemId, addNotification, navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!data) return;

//     const formData = new FormData();
//     formData.append('cartid', data.cartid.toString());
//     formData.append('totalPrice', totalPrice.toString());
//     formData.append('phone', data.user.phone.toString());
//     formData.append('productid', data.item.cartItemId.toString());
//     formData.append('quantity', data.item.quantity.toString());

//     try {
//       const res = await fetch(`${URL_BACKEND}/api/user/cart/payment`, {
//         method: 'POST',
//         body: formData,
//         credentials: "include",
//       });

//       if (!res.ok) {
//         throw new Error(`API trả về lỗi ${res.status}`);
//       }

//       const responseData = await res.json();

//       // Nếu API trả về url để redirect, chuyển hướng tại đây
//       if (responseData && responseData.url) {
//         addNotification("Đang chuyển hướng đến trang thanh toán...", "info");
//         window.location.href = responseData.url;
//       } else {
//         // Xử lý khi không có url trả về
//         addNotification("Thanh toán thành công!", "success");
//         navigate("/sportify/cart/view");
//       }
//     } catch (err: any) {
//       addNotification("Có lỗi khi thanh toán, vui lòng thử lại!", "error");
//     }
//   };

//   if (!data) return <div>Loading...</div>;

//   const { user, item } = data;
//   const totalPrice = item.quantity * (item.price - item.discountprice);

//   return (
//     <>
//       {/* background */}
//       <section className="hero-wrap hero-wrap-2"
//         style={{ backgroundImage: "url('/user/images/bg_product.png')" }}
//         data-stellar-background-ratio="0.5">
//         <div className="overlay"></div>
//         <div className="container">
//           <div className="row no-gutters slider-text align-items-end justify-content-center">
//             <div className="col-md-9 mb-5 text-center">
//               <p className="breadcrumbs mb-0">
//                 <span className="mr-2"><a href="index.html">Trang Chủ <i className="fa fa-chevron-right"></i></a></span>
//                 <span>Cửa hàng<i className="fa fa-chevron-right"></i></span>
//               </p>
//               <h2 className="mb-0 bread">Thanh Toán Sản Phẩm</h2>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="ftco-section">
//         <div className="container">
//           <div className="row justify-content-center">
//             {/* Form điền thông tin để thanh toán */}
//             <div className="col-xl-10">
//               <form action="#" className="billing-form" style={{ background: "white" }}>
//                 <h3 className="mb-4 billing-heading">Chi tiết thanh toán đơn hàng</h3>
//                 <div className="row align-items-end">
//                   <div className="col-md-6">
//                     <div className="form-group">
//                       <label htmlFor="firstname">Họ: </label>
//                       <input type="text" className="form-control" value={user.firstname} readOnly />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="form-group">
//                       <label htmlFor="lastname">Tên: </label>
//                       <input type="text" className="form-control" value={user.lastname} readOnly />
//                     </div>
//                   </div>
//                   <div className="w-100"></div>
//                   <div className="w-100"></div>
//                   <div className="col-md-6">
//                     <div className="form-group">
//                       <label htmlFor="streetaddress">Địa chỉ nhận hàng: </label>
//                       <input type="text" className="form-control" value={user.address} readOnly />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="form-group">
//                       <label htmlFor="streetaddress">Ngày đặt hàng: </label>
//                       <input type="text" className="form-control" value={new Date().toLocaleDateString('vi-VN')} readOnly />
//                     </div>
//                   </div>
//                   <div className="w-100"></div>
//                   <div className="w-100"></div>
//                   <div className="col-md-6">
//                     <div className="form-group">
//                       <label htmlFor="phone">Số điện thoại: </label>
//                       <input type="text" className="form-control" value={user.phone} readOnly />
//                     </div>
//                   </div>
//                   <div className="col-md-6">
//                     <div className="form-group">
//                       <label htmlFor="emailaddress">Email: </label>
//                       <input type="text" className="form-control" value={user.email} readOnly />
//                     </div>
//                   </div>
//                 </div>
//               </form>
//               {/* END */}

//               {/* khu hình thức thanh toán */}
//               <hr />
//               <div className="row mt-5 pt-3 d-flex">
//                 <div className="col-md-6 d-flex">
//                   <div className="cart-detail cart-total p-3 p-md-4" style={{ background: "white" }}>
//                     <h3>Chi tiết sản phẩm</h3>

//                     {/* Hiển thị sản phẩm đang thanh toán */}
//                     <div className="mb-3">
//                       <div className="d-flex align-items-center mb-2 pb-2 border-bottom">
//                         <div className="img mr-3" style={{ width: 80, height: 80 }}>
//                           {item.image ? (
//                             <img
//                               src={`/user/images/products_img/${item.image}`}
//                               alt="sp"
//                               style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                             />
//                           ) : (
//                             <div className="bg-light d-flex align-items-center justify-content-center"
//                               style={{ width: "100%", height: "100%" }}>
//                               <span className="text-muted">No image</span>
//                             </div>
//                           )}
//                         </div>
//                         <div className="text flex-grow-1">
//                           <h5 className="mb-2">{item.productName || `#${item.cartItemId}`}</h5>
//                           <p className="mb-0">
//                             <span className="quantity">Số lượng: {item.quantity}</span>
//                           </p>
//                           <p className="mb-0">
//                             <span className="price">Đơn giá: {(item.price - item.discountprice).toLocaleString("vi-VN")}đ</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <p className="d-flex">
//                       <span>Tạm tính: </span>
//                       <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
//                     </p>
//                     <p className="d-flex">
//                       <span>Phí vận chuyển: </span>
//                       <span>30.000đ</span>
//                     </p>
//                     <hr />
//                     <p className="d-flex total-price">
//                       <span>Thành tiền</span>
//                       <span>{(totalPrice + 30000).toLocaleString("vi-VN")}đ</span>
//                     </p>
//                   </div>
//                 </div>
//                 <div className="col-md-6">
//                   <div className="cart-detail p-3 p-md-4" style={{ background: "white" }}>
//                     <h3 className="billing-heading mb-4">Hình thức thanh toán</h3>
//                     <form onSubmit={handleSubmit}>
//                       <div className="form-group">
//                         <div className="col-md-12">
//                           <div className="radio">
//                             <label>
//                               <input type="radio" checked name="optradio" className="mr-2" readOnly />
//                               <img style={{ width: "12%", height: "14%" }} src="/user/images/iconVNP.png" alt="VNPay" /> VNPay
//                             </label>
//                           </div>
//                         </div>
//                       </div>
//                       <div style={{ color: "black" }} className="font-italic">
//                         Khi nhấn vào nút này bạn công nhận mình đã đọc và đồng ý với các
//                         <a href="/sportify/quydinh" style={{ color: "blue" }}> Điều khoản & Điều kiện </a> và
//                         <a href="/sportify/chinhsach" style={{ color: "blue" }}> Chính sách quyền riêng tư</a> của Sportify.
//                         <p>
//                           <button type="submit" className="btn btn-primary py-3 px-4 mt-3">Thanh toán</button>
//                         </p>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default CheckoutCartItem;
