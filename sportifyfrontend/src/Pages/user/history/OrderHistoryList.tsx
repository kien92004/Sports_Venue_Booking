import React, { useCallback, useEffect, useState } from "react";

interface User {
  username: string;
  firstname: string;
  lastname: string;
  image?: string | null;
}

interface Order {
  orderid: number;
  createdate: string;
  address: string;
  orderstatus: string;
  paymentstatus: boolean;
  totalprice: number;
  users: User;
}

type OrderPreview = {
  image: string;
  name: string;
};

const statusColors: Record<string, string> = {
  "Hoàn Thành": "green",
  "Chờ Xác Nhận": "#F86F03",
  "Đang Giao": "#FFA41B",
  "Hủy Đặt": "red",
};

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [orderPreviews, setOrderPreviews] = useState<Record<number, OrderPreview | null>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL as string | undefined;

  const resolveImageUrl = useCallback((image?: string | null): string | null => {
    if (!image) return null;
    if (/^https?:/i.test(image)) return image;
    if (image.startsWith("v") && CLOUDINARY_BASE_URL) return `${CLOUDINARY_BASE_URL}/${image}`;
    return `/user/images/${image}`;
  }, [CLOUDINARY_BASE_URL]);

  const loadOrders = useCallback(async (page: number) => {
    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
    try {
      const res = await fetch(`${URL_BACKEND}/api/user/order/historyList?page=${page}&size=${pageSize}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        const sortedOrders = [...(data.orders || [])].sort((a: Order, b: Order) =>
          new Date(b.createdate).getTime() - new Date(a.createdate).getTime() || b.orderid - a.orderid
        );
        setOrders(sortedOrders);
        setCurrentPage(data.page ?? page);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
      } else {
        setOrders([]);
        setOrderPreviews({});
      }
    } catch {
      setOrders([]);
      setOrderPreviews({});
    }
  }, [pageSize]);

  useEffect(() => {
    let isActive = true;
    loadOrders(currentPage).then(() => {
      if (!isActive) return;
    });

    return () => {
      isActive = false;
    };
  }, [currentPage, loadOrders]);

  useEffect(() => {
    const pendingOrders = orders.filter(order => orderPreviews[order.orderid] === undefined);
    if (pendingOrders.length === 0) return;

    let isActive = true;
    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

    const fetchPreviews = async () => {
      const previews: Record<number, OrderPreview | null> = {};

      await Promise.all(pendingOrders.map(async (order) => {
        try {
          const res = await fetch(`${URL_BACKEND}/api/user/order/historyList/detail/${order.orderid}`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            previews[order.orderid] = null;
            return;
          }

          const data: {
            success: boolean;
            order?: Array<{ products?: { image?: string | null; productname?: string } }>;
          } = await res.json();

          if (!data.success || !data.order || data.order.length === 0) {
            previews[order.orderid] = null;
            return;
          }

          const firstProduct = data.order[0]?.products;
          const resolvedImage = resolveImageUrl(firstProduct?.image);
          if (!resolvedImage) {
            previews[order.orderid] = null;
            return;
          }

          previews[order.orderid] = {
            image: resolvedImage,
            name: firstProduct?.productname || "Sản phẩm",
          };
        } catch {
          previews[order.orderid] = null;
        }
      }));

      if (isActive) {
        setOrderPreviews(prev => ({ ...prev, ...previews }));
      }
    };

    fetchPreviews();

    return () => {
      isActive = false;
    };
  }, [orders, orderPreviews, resolveImageUrl]);

  const handleDelete = async (orderId: number) => {
    if (processingIds.includes(orderId) || bulkDeleting) return;
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;

    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
    try {
      setProcessingIds(prev => [...prev, orderId]);
      const res = await fetch(`${URL_BACKEND}/api/user/order/cancelOrder/${orderId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Xóa đơn hàng thất bại");
      }

      setOrders(prev => prev.filter(order => order.orderid !== orderId));
      setOrderPreviews(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      const isLastItemOnPage = orders.length === 1 && currentPage > 0;
      if (isLastItemOnPage) {
        setCurrentPage(prev => prev - 1);
      } else {
        await loadOrders(currentPage);
      }
    } catch (err) {
      console.error("Delete order error", err);
      window.alert(err instanceof Error ? err.message : "Xóa đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleDeleteAll = async () => {
    if (orders.length === 0 || bulkDeleting) return;
    if (!window.confirm("Bạn có chắc muốn xóa tất cả đơn hàng?")) return;

    const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
    const ids = orders.map(order => order.orderid);

    try {
      setBulkDeleting(true);
      const res = await fetch(`${URL_BACKEND}/api/user/order/historyList/deleteMultiple`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Xóa tất cả đơn hàng thất bại");
      }

      setOrderPreviews({});
      setCurrentPage(0);
      await loadOrders(0);
    } catch (err) {
      console.error("Delete all orders error", err);
      window.alert(err instanceof Error ? err.message : "Xóa tất cả đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div>
      {/* background */}
      <section className="hero-wrap hero-wrap-2"
        style={{ backgroundImage: "url('/user/images/bg_product.png')" }}
        data-stellar-background-ratio="0.5">
        <div className="overlay"></div>
        <div className="container">
          <div
            className="row no-gutters slider-text align-items-center justify-content-center"
            style={{
              minHeight: 320,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center"
            }}
          >
            <div className="col-md-9 text-center">
              <h2 className="text-uppercase" style={{ letterSpacing: 2, color: "#fff" }}>Lịch Sử Đơn Hàng Của Bạn</h2>
              <p className="mt-3 mb-0" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)" }}>
                Theo dõi các đơn đã đặt và cập nhật trạng thái giao hàng mới nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* container sản phẩm */}
      <section className="ftco-section">
        <div className="container">
          <div className="row">
            <div className="container d-flex justify-content-center rounded mb-5">
              <div className="col-md-12 rounded row" id="profiles"
                style={{ marginTop: 50, backgroundColor: "rgb(247, 249, 250)" }}>
                <div className="col-12 text-center py-3">
                  <h3 className="mb-0 text-uppercase" style={{ letterSpacing: 1 }}>Danh sách đơn hàng</h3>
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                  <h5 className="mb-0">Lịch sử đơn hàng gần nhất ({totalElements})</h5>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteAll}
                    disabled={orders.length === 0 || bulkDeleting}
                  >
                    {bulkDeleting ? "Đang xóa..." : "Xóa tất cả"}
                  </button>
                </div>

                {orders.length === 0 && (
                  <div className="col-12 py-5 text-center text-muted">
                    Bạn chưa có đơn hàng nào hoặc dữ liệu đang được cập nhật.
                  </div>
                )}

                {orders.map(order => {
                  const preview = orderPreviews[order.orderid];
                  return (
                    <div key={order.orderid} className="card col-12 mb-3" style={{ borderRadius: 10 }}>
                      <h6 className="card-header row">
                        <span className="col-4">Đơn hàng # <span>{order.orderid}</span></span>
                        <span className="col-6" style={{ color: "#1F8A70", fontWeight: "bold" }}>
                          Đặt lúc: <span style={{ color: "#1F8A70", fontWeight: "bold" }}>
                            {new Date(order.createdate).toLocaleString("vi-VN")}
                          </span>
                        </span>
                        <span
                          className="col-2"
                          style={{
                            fontSize: "medium",
                            color: "snow",
                            fontWeight: "bold",
                            textAlign: "center",
                            padding: "3px 10px 3px 10px",
                            borderRadius: 10,
                            backgroundColor: statusColors[order.orderstatus] || "crimson"
                          }}
                        >
                          {order.orderstatus}
                        </span>
                      </h6>

                      <div className="card-body row align-items-center gy-3">
                        <div className="col-md-3 text-center">
                          {preview === undefined && (
                            <div className="d-inline-flex flex-column align-items-center justify-content-center w-100 border rounded py-4"
                              style={{ minHeight: 180, backgroundColor: "#f8f9fa" }}>
                              <div className="spinner-border text-success" role="status" style={{ width: 36, height: 36 }}>
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <span className="text-muted small mt-2">Đang tải ảnh sản phẩm</span>
                            </div>
                          )}

                          {preview === null && (
                            <div className="d-inline-flex flex-column align-items-center justify-content-center w-100 border rounded py-4"
                              style={{ minHeight: 180, backgroundColor: "#f8f9fa" }}>
                              <i className="fa fa-image fa-2x text-secondary mb-2"></i>
                              <span className="text-muted small">Chưa có ảnh sản phẩm</span>
                            </div>
                          )}

                          {preview && (
                            <>
                              <img
                                src={preview.image}
                                alt={preview.name}
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: 180, objectFit: "contain", width: "100%" }}
                              />
                              <small className="d-block mt-2 text-muted">
                                {preview.name}
                              </small>
                            </>
                          )}
                        </div>

                        <div className="col-md-4">
                          <p className="mb-2">
                            <strong>Tổng tiền: </strong>
                            <span>{formatCurrency(order.totalprice)}</span>
                          </p>
                          <p className="mb-0">
                            <strong>Thanh toán: </strong>
                            <span style={{ color: order.paymentstatus ? "green" : "red" }}>
                              {order.paymentstatus ? "Đã thanh toán" : "Chưa thanh toán"}
                            </span>
                          </p>
                        </div>

                        <div className="col-md-3" style={{ color: "#1F8A70", fontWeight: "bold" }}>
                          Giao đến: <span style={{ color: "#1F8A70", fontWeight: "bold" }}>{order.address}</span>
                        </div>

                        <div className="col-md-2 d-flex flex-column gap-2">
                          <a href={`/sportify/order/historyList/detail/${order.orderid}`} className="w-100">
                            <button type="button" className="btn btn-outline-info w-100">
                              Xem Chi Tiết
                            </button>
                          </a>
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() => handleDelete(order.orderid)}
                            disabled={processingIds.includes(order.orderid) || bulkDeleting}
                          >
                            {processingIds.includes(order.orderid) ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className="col-12 d-flex justify-content-center align-items-center gap-2 py-3">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                    >
                      Trước
                    </button>
                    <span className="px-2">
                      Trang {currentPage + 1}/{totalPages}
                    </span>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderList;
