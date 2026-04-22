import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/Sidebar.css";

const Sidebar: React.FC = () => {
  return (
    <aside
      className="sidebar bg-white shadow-sm border-end position-fixed"
      style={{
        width: "250px",
        height: "100vh",
        top: "70px",
        overflowY: "auto",
      }}
    >
      <div className="sidebar-content p-3">
        <ul className="nav flex-column">
          <li className="nav-item mb-1">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-speedometer2 mr-3 "></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item mb-1">
            <NavLink
              to="/admin/manager-file-active"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-speedometer mr-3 "></i>
              <span>Quản lí trạng thái sân</span>
            </NavLink>
          </li>



          <li className="nav-item mb-1">
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-box-seam mr-3"></i>
              <span>Sản phẩm</span>
            </NavLink>
          </li>

          <li className="nav-item mb-1">
            <NavLink
              to="/admin/fields"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-basket3 mr-3"></i>
              <span>Sân thể thao</span>
            </NavLink>
          </li>

          <li className="nav-item mb-1">
            <NavLink
              to="/admin/accounts"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-people mr-3"></i>
              <span>Quản lý tài khoản</span>
            </NavLink>
          </li>


          <li className="nav-item mb-1">
            <NavLink
              to="/admin/field-owner-requests"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-person-badge mr-3"></i>
              <span>Quản lý chủ sân</span>
            </NavLink>
          </li>

          <li className="nav-item mb-1">
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-newspaper mr-3"></i>
              <span>Tin tức & Sự kiện</span>
            </NavLink>
          </li>

          <li className="nav-item mb-1">
            <NavLink
              to="/admin/tournaments"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-trophy mr-3"></i>
              <span>Quản lý Giải đấu</span>
            </NavLink>
          </li>

          {/* Dropdown Menu - Khác */}
          <li className="nav-item mb-1">
            <div className="accordion" id="otherAccordion">
              <div className="accordion-item border-0">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed bg-transparent border-0 w-100 text-start d-flex justify-content-between align-items-center py-2 px-3 rounded text-dark nav-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#otherMenu"
                  >
                    <span>Khác</span>
                  </button>
                </h6>
                <div
                  id="otherMenu"
                  className="accordion-collapse collapse"
                  data-bs-parent="#otherAccordion"
                >
                  <div className="accordion-body p-0">
                    <ul className="nav flex-column ms-4">
                      <li className="nav-item">
                        <NavLink
                          to="/admin/vouchers"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Mã giảm giá</span>
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/admin/contacts"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Liên hệ</span>
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/admin/comments"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Quản lý bình luận</span>
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Dropdown Menu - Quản lý phiếu đặt */}
          <li className="nav-item mb-1">
            <div className="accordion" id="bookingAccordion">
              <div className="accordion-item border-0">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed bg-transparent border-0 w-100 text-start d-flex justify-content-between align-items-center py-2 px-3 rounded text-dark nav-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#bookingMenu"
                  >
                    <i className="bi bi-card-checklist mr-3"></i>
                    <span>Quản lý phiếu đặt</span>

                  </button>
                </h6>
                <div
                  id="bookingMenu"
                  className="accordion-collapse collapse"
                  data-bs-parent="#bookingAccordion"
                >
                  <div className="accordion-body p-0">
                    <ul className="nav flex-column ms-4">
                      <li className="nav-item">
                        <NavLink
                          to="/admin/bookings"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Lịch đặt sân</span>
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/admin/manager-bookings"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Quản lí đặt sân </span>
                        </NavLink>
                      </li>

                      <li className="nav-item">
                        <NavLink
                          to="/admin/order-products"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Đơn hàng</span>
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/admin/manager-orders"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Quản lí đơn hàng  </span>
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Dropdown Menu - Quản lý thể loại */}
          <li className="nav-item mb-1">
            <div className="accordion" id="categoryAccordion">
              <div className="accordion-item border-0">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed bg-transparent border-0 w-100 text-start d-flex justify-content-between align-items-center py-2 px-3 rounded text-dark nav-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#categoryMenu"
                  >
                    <i className="bi bi-tags mr-3"></i>
                    <span>Quản lý thể loại</span>

                  </button>
                </h6>
                <div
                  id="categoryMenu"
                  className="accordion-collapse collapse"
                  data-bs-parent="#categoryAccordion"
                >
                  <div className="accordion-body p-0">
                    <ul className="nav flex-column ms-4">
                      <li className="nav-item">
                        <NavLink
                          to="/admin/category-product"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Loại sản phẩm</span>
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/admin/category-sport"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Loại thể thao</span>
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Dropdown Menu - Báo cáo thống kê */}
          <li className="nav-item mb-1">
            <div className="accordion" id="reportAccordion">
              <div className="accordion-item border-0">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed bg-transparent border-0 w-100 text-start d-flex justify-content-between align-items-center py-2 px-3 rounded text-dark nav-link"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#reportMenu"
                  >
                    <i className="bi bi-bar-chart mr-3"></i>
                    <span>Báo cáo thống kê</span>

                  </button>
                </h6>
                <div
                  id="reportMenu"
                  className="accordion-collapse collapse"
                  data-bs-parent="#reportAccordion"
                >
                  <div className="accordion-body p-0">
                    <ul className="nav flex-column ms-4">
                      <li className="nav-item">
                        <NavLink
                          to="/admin/reportBooking"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Thống kê đặt sân</span>
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink
                          to="/admin/reportOrder"
                          className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
                          }
                        >
                          <span>Thống kê bán hàng</span>
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>
          <li className="nav-item mb-1">
            <NavLink
              to="/admin/ai-support"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center py-2 px-3 rounded text-dark${isActive ? ' active' : ''}`
              }
            >
              <i className="bi bi-robot mr-3"></i>
              <span>AI hỗ trợ</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
