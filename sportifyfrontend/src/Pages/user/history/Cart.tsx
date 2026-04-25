import React, { useEffect, useRef, useState } from "react";
import getImageUrl from "../../../helper/getImageUrl";
import { useCart } from "../../../helper/useCartCount";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface CartItem {
  cartItemId: number;
  quantity: number;
  price: number;
  discountprice: number;
  // Nếu có thêm thông tin sản phẩm, thêm vào đây
  productName?: string;
  image?: string;
}

interface CartData {
  cartid: number;
  username: string;
  status: string;
  createdate: string;
  items: CartItem[];
}

interface ApiResponse {
  success: boolean;
  cart: CartData;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { updateCartCount } = useCart();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`${URL_BACKEND}/api/user/cart/view`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        if (data.success) setCart(data.cart);
      });
  }, []);

  const handleQuantityChange = (index: number, quantity: number) => {
    if (!cart) return;

    const newQuantity = Math.max(1, Math.min(15, quantity));
    const item = cart.items[index];

    // Cập nhật UI ngay lập tức
    const items = [...cart.items];
    items[index].quantity = newQuantity;
    setCart({ ...cart, items });

    // Clear timeout cũ nếu có
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Đợi 500ms sau khi người dùng ngừng thay đổi mới gọi API
    updateTimeoutRef.current = setTimeout(() => {
      fetch(`${URL_BACKEND}/api/user/cart/update/${item.cartItemId}?quantity=${newQuantity}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("Quantity updated successfully");
            // Cập nhật số lượng giỏ hàng trong header
            updateCartCount();
          }
        })
        .catch((err) => {
          console.error("Error updating quantity:", err);
          // Nếu có lỗi, reload lại giỏ hàng từ server
          fetch(`${URL_BACKEND}/api/user/cart/view`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data: ApiResponse) => {
              if (data.success) setCart(data.cart);
            })
            .catch((reloadErr) => {
              console.error("Error reloading cart:", reloadErr);
            });
        });
    }, 500);
  };

  const toggleSelectItem = (cartItemId: number) => {
    setSelectedItems(prev => {
      if (prev.includes(cartItemId)) {
        return prev.filter(id => id !== cartItemId);
      } else {
        return [...prev, cartItemId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (!cart) return;
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map(item => item.cartItemId));
    }
  };

  const removeProduct = (cartItemId: number) => {
    console.log("Removing item with ID:", cartItemId);

    if (!cart) return;

    // Cập nhật UI ngay lập tức để trải nghiệm mượt mà
    const updatedItems = cart.items.filter((item) => item.cartItemId !== cartItemId);
    setCart({ ...cart, items: updatedItems });
    setSelectedItems(prev => prev.filter(id => id !== cartItemId));

    // Gọi API để xóa trong database
    fetch(`${URL_BACKEND}/api/user/cart/remove/${cartItemId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("Delete response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Delete response data:", data);
        if (data.success) {
          // Cập nhật số lượng giỏ hàng trong header
          updateCartCount();
        }
      })
      .catch((err) => {
        console.error("Error removing product:", err);
        // Nếu API lỗi, reload lại giỏ hàng từ server
        fetch(`${URL_BACKEND}/api/user/cart/view`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data: ApiResponse) => {
            if (data.success) setCart(data.cart);
          })
          .catch((reloadErr) => {
            console.error("Error reloading cart:", reloadErr);
          });
      });
  };

  const clearCart = () => {
    if (!cart) return;

    // Cập nhật UI ngay lập tức
    setCart({ ...cart, items: [] });
    setSelectedItems([]);

    // Gọi API để xóa trong database
    fetch(`${URL_BACKEND}/api/user/cart/remove-all`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          // Cập nhật số lượng giỏ hàng trong header
          updateCartCount();
        }
      })
      .catch((err) => {
        console.error("Error clearing cart:", err);
        // Nếu API lỗi, reload lại giỏ hàng từ server
        fetch(`${URL_BACKEND}/api/user/cart/view`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data: ApiResponse) => {
            if (data.success) setCart(data.cart);
          })
          .catch((reloadErr) => {
            console.error("Error reloading cart:", reloadErr);
          });
      });
  };

  // Hàm kiểm tra số lượng đơn hàng trong ngày
  const checkDailyOrderLimit = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/user/order/count-today`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success && data.count >= 10) {
        alert("Bạn chỉ có thể đặt tối đa 10 đơn trong ngày. Hãy thử lại vào ngày mai!");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking daily order limit:", error);
      return true; // Cho phép tiếp tục nếu có lỗi khi kiểm tra
    }
  };

  // Hàm xử lý thanh toán
  const handlePayment = async () => {
    const canProceed = await checkDailyOrderLimit();
    if (canProceed) {
      window.location.href = `/sportify/cart/checkout/items?ids=${selectedItems.join(',')}`;
    }
  };


  // Tính tổng tiền của các sản phẩm ĐƯỢC CHỌN
  const selectedTotalPrice = cart
    ? cart.items
      .filter(item => selectedItems.includes(item.cartItemId))
      .reduce((sum, item) => sum + item.quantity * (item.price - item.discountprice), 0)
    : 0;

  const shippingFee = selectedTotalPrice > 0 ? 30000 : 0;
  const updateTotalPrice = selectedTotalPrice + shippingFee;

  return (
    <div>
      <style>
        {`
          body {
            background-image: url('/user/images/bgAll.png');
            background-repeat: repeat;
            background-size: 100% 100%;
          }
        `}
      </style>

      {/* Background */}
      <section className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: "url('/user/images/bg_product.png')" }}
        data-stellar-background-ratio="0.5">
        <div className="overlay"></div>
        <div className="container">
          <div className="row no-gutters slider-text align-items-end justify-content-center">
            <div className="col-md-9 mb-5 text-center">
              <p className="breadcrumbs mb-0">
                <span className="mr-2"><a href="index.html">Trang Chủ <i className="fa fa-chevron-right"></i></a></span>
                <span>Cửa hàng <i className="fa fa-chevron-right"></i></span>
              </p>
              <h2 className="mb-0 bread">Giỏ Hàng</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="table-wrap col-12">
              <table className="table">
                <thead className="thead-primary">
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={!!(cart && cart.items.length > 0 && selectedItems.length === cart.items.length)}
                        onChange={toggleSelectAll}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </th>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {cart && cart.items.length > 0 ? (
                    cart.items.map((item, idx) => (
                      <tr className="alert" role="alert" key={item.cartItemId}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.cartItemId)}
                            onChange={() => toggleSelectItem(item.cartItemId)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </td>
                        <td>
                          <img
                            className="img"
                            alt={item.productName || "Sản phẩm"}
                            src={getImageUrl(item.image ?? null)}
                            style={{
                              width: 96,
                              height: 96,
                              objectFit: "cover",
                              borderRadius: 8,
                              border: "1px solid #eee",
                              backgroundColor: "#fff"
                            }}
                          />
                        </td>
                        <td>
                          <div className="email">
                            <span>{item.productName}</span>
                            <span></span>
                          </div>
                        </td>
                        <td className="price-tag">
                          {(item.price - item.discountprice).toLocaleString()}đ
                        </td>
                        <td className="quantity">
                          <div className="input-group">
                            <input
                              type="number"
                              name="quantity"
                              className="quantity form-control input-number"
                              value={item.quantity}
                              min={1}
                              max={15}
                              onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                            />
                          </div>
                        </td>
                        <td className="price-tag total-price">
                          {(item.quantity * (item.price - item.discountprice)).toLocaleString()}đ
                        </td>
                        <td>
                          <button
                            type="button"
                            className="close"
                            data-dismiss="alert"
                            aria-label="Close"
                            onClick={() => removeProduct(item.cartItemId)}
                          >
                            <span aria-hidden="true"><i className="fa fa-close"></i></span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        Giỏ hàng trống
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div>
                <button onClick={clearCart} className="btn btn-danger" style={{ float: "right" }}>
                  Clear
                </button>
              </div>
            </div>
          </div>
          <br />
          <div className="row justify-content-end">
            <div className="col col-lg-5 col-md-6 mt-5 cart-wrap" style={{ background: "white" }}>
              <div className="cart-total mb-3">
                <h3>Thanh toán giỏ hàng</h3>
                {selectedItems.length > 0 ? (
                  <>
                    <p className="d-flex">
                      <span>Đã chọn: </span>
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        {selectedItems.length} sản phẩm
                      </span>
                    </p>
                    <p className="d-flex">
                      <span>Tạm tính: </span>
                      <span>{selectedTotalPrice.toLocaleString()}đ</span>
                    </p>
                    <p className="d-flex">
                      <span>Phí vận chuyển: </span>
                      <span>{shippingFee.toLocaleString()}đ</span>
                    </p>
                    <hr />
                    <p className="d-flex total-price">
                      <span>Thành tiền</span>
                      <span>{updateTotalPrice.toLocaleString()}đ</span>
                    </p>
                  </>
                ) : (
                  <p className="text-center text-muted" style={{ padding: '20px 0' }}>
                    Vui lòng chọn sản phẩm để thanh toán
                  </p>
                )}
              </div>
              <p className="text-center">
                {selectedItems.length > 0 ? (
                  <button
                    onClick={handlePayment}
                    className="btn btn-primary py-3 px-4"
                  >
                    Thanh toán ({selectedItems.length} sản phẩm)
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary py-3 px-4"
                    disabled
                    style={{ cursor: 'not-allowed' }}
                  >
                    Thanh toán
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cart;
