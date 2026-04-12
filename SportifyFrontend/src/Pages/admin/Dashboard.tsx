const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
import React, { useEffect, useState } from "react";
import BookingCalendar from "../../components/admin/BookingCalendar";
import getImageUrl from "../../helper/getImageUrl";

interface DashboardStats {
  countOrderInDate: number;
  countBookingInDate: number;
  countFieldActiving: number;
  countProductActive: number;
  countLienHe: number;
}

interface BookingStats {
  total: number;
  completed: number;
  deposit: number;
  cancelled: number;
  revenue: number;
}

interface OrderStats {
  total: number;
  paid: number;
  unpaid: number;
  revenue: number;
}

interface ContactItem {
  contactid: string;
  title: string;
  category: string;
  datecontact: string;
  meesagecontact?: string;
  users: {
    firstname: string;
    lastname: string;
    image?: string;
    username?: string;
  };
}

interface TopField {
  name: string;
  price: number;
  bookings: number;
  revenue: number;
}

interface TopProduct {
  name: string;
  price: number;
  sales: number;
  revenue: number;
}

// API Response Interfaces
interface DashboardSummaryResponse {
  countOrderInDate: number;
  countBookingInDate: number;
  countFieldActiving: number;
  countProductActive: number;
  totalProduct: number;
  totalUser: number;
  totalField: number;
  totalOrderBooking: number;
}

interface DashboardDetailsResponse {
  demLienHeTrongNgay: number;
  thongKeOrderInDay: [string, number, number | null][];
  thongkebookingtrongngay: [string, number, number][];
  top3SanDatNhieu: [string, number, number, number][];
  top3SanPhamBanNhieu: [string, number, number, number][];
  danhsach3contact: ContactItem[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    countOrderInDate: 0,
    countBookingInDate: 0,
    countFieldActiving: 0,
    countProductActive: 0,
    countLienHe: 0,
  });
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    total: 0,
    completed: 0,
    deposit: 0,
    cancelled: 0,
    revenue: 0,
  });
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    paid: 0,
    unpaid: 0,
    revenue: 0,
  });
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [topFields, setTopFields] = useState<TopField[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    // Fetch dashboard data from APIs
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch both APIs in parallel
      const [summaryResponse, detailsResponse] = await Promise.all([
        fetch(`${URL_BACKEND}/rest/dashboard/summary`),
        fetch(`${URL_BACKEND}/rest/dashboard/all-details`)
      ]);

      const summaryData: DashboardSummaryResponse = await summaryResponse.json();
      const detailsData: DashboardDetailsResponse = await detailsResponse.json();

      // Set dashboard stats
      setStats({
        countOrderInDate: summaryData.countOrderInDate,
        countBookingInDate: summaryData.countBookingInDate,
        countFieldActiving: summaryData.countFieldActiving,
        countProductActive: summaryData.countProductActive,
        countLienHe: detailsData.demLienHeTrongNgay,
      });

      // Process booking stats from thongkebookingtrongngay
      const bookingData = detailsData.thongkebookingtrongngay;
      const totalBooking = bookingData.find(item => item[0] === "Tổng số booking");
      const completedBooking = bookingData.find(item => item[0] === "Hoàn Thành");
      const depositBooking = bookingData.find(item => item[0] === "Đã Cọc");
      const cancelledBooking = bookingData.find(item => item[0] === "Hủy Đặt");

      setBookingStats({
        total: totalBooking ? totalBooking[1] : 0,
        completed: completedBooking ? completedBooking[1] : 0,
        deposit: depositBooking ? depositBooking[1] : 0,
        cancelled: cancelledBooking ? cancelledBooking[1] : 0,
        revenue: totalBooking ? totalBooking[2] : 0,
      });

      // Process order stats from thongKeOrderInDay
      const orderData = detailsData.thongKeOrderInDay;
      const totalOrder = orderData.find(item => item[0] === "Tổng số order");
      const unpaidOrder = orderData.find(item => item[0] === "Chưa thanh toán");
      const paidOrder = orderData.find(item => item[0] === "Đã thanh toán");

      setOrderStats({
        total: totalOrder ? totalOrder[1] : 0,
        paid: paidOrder ? paidOrder[1] : 0,
        unpaid: unpaidOrder ? unpaidOrder[1] : 0,
        revenue: paidOrder ? paidOrder[2] || 0 : 0,
      });

      // Process top fields
      const topFieldsData = detailsData.top3SanDatNhieu.map(field => ({
        name: field[0],
        price: field[1],
        bookings: field[2],
        revenue: field[3],
      }));
      setTopFields(topFieldsData);

      // Process top products
      const topProductsData = detailsData.top3SanPhamBanNhieu.map(product => ({
        name: product[0],
        price: product[1],
        sales: product[2],
        revenue: product[3],
      }));
      setTopProducts(topProductsData);

      // Process contacts from API response
      if (detailsData.danhsach3contact && detailsData.danhsach3contact.length > 0) {
        setContacts(detailsData.danhsach3contact);
      } else {
        setContacts([]);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default values in case of error
      setStats({
        countOrderInDate: 0,
        countBookingInDate: 0,
        countFieldActiving: 0,
        countProductActive: 0,
        countLienHe: 0,
      });
      setBookingStats({
        total: 0,
        completed: 0,
        deposit: 0,
        cancelled: 0,
        revenue: 0,
      });
      setOrderStats({
        total: 0,
        paid: 0,
        unpaid: 0,
        revenue: 0,
      });
      setTopFields([]);
      setTopProducts([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0 ₫";
    }
    return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN");

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  };

  return (
    <div className="page-wrapper">
      {/* Page Content */}
      <div className="content container-fluid">
        <BookingCalendar />

        <div className="row">
          <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div className="card dash-widget">
              <div className="card-body">
                <span className="dash-widget-icon"><i className="fa fa-user"></i></span>
                <div className="dash-widget-info">
                  <h3>{stats.countOrderInDate}</h3>
                  <span>Phiếu đặt hàng trong ngày</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div className="card dash-widget">
              <div className="card-body">
                <span className="dash-widget-icon"><i className="fa fa-usd"></i></span>
                <div className="dash-widget-info">
                  <h3>{stats.countBookingInDate}</h3>
                  <span>Phiếu đặt sân trong ngày</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div className="card dash-widget">
              <div className="card-body">
                <span className="dash-widget-icon"><i className="fa fa-diamond"></i></span>
                <div className="dash-widget-info">
                  <h3>{stats.countFieldActiving}</h3>
                  <span>Sân đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
            <div className="card dash-widget">
              <div className="card-body">
                <span className="dash-widget-icon"><i className="fa fa-cubes"></i></span>
                <div className="dash-widget-info">
                  <h3>{stats.countProductActive}</h3>
                  <span>Sản phẩm đang bày bán</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 col-lg-12 col-xl-4 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <h4 className="card-title">Thống kê lịch đặt sân trong ngày</h4>
                <div className="statistics">
                  <div className="row">
                    <div className="col-md-6 col-6 text-center">
                      <div className="stats-box mb-4">
                        <p>Tổng số lịch đặt sân trong ngày</p>
                        <h3>{bookingStats.total}</h3>
                      </div>
                    </div>
                    <div className="col-md-6 col-6 text-center">
                      <div className="stats-box mb-4">
                        <p>Doanh thu</p>
                        <h3>{formatCurrency(bookingStats.revenue)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="progress mb-4">
                  <div className="progress-bar bg-purple" role="progressbar"
                    style={{ width: `${calculatePercentage(bookingStats.completed, bookingStats.total)}%` }} aria-valuenow={parseInt(calculatePercentage(bookingStats.completed, bookingStats.total))}
                    aria-valuemin={0} aria-valuemax={100}>{calculatePercentage(bookingStats.completed, bookingStats.total)}%</div>

                  <div className="progress-bar bg-warning" role="progressbar"
                    style={{ width: `${calculatePercentage(bookingStats.deposit, bookingStats.total)}%` }} aria-valuenow={parseInt(calculatePercentage(bookingStats.deposit, bookingStats.total))}
                    aria-valuemin={0} aria-valuemax={100}>{calculatePercentage(bookingStats.deposit, bookingStats.total)}%</div>

                  <div className="progress-bar bg-danger" role="progressbar"
                    style={{ width: `${calculatePercentage(bookingStats.cancelled, bookingStats.total)}%` }} aria-valuenow={parseInt(calculatePercentage(bookingStats.cancelled, bookingStats.total))}
                    aria-valuemin={0} aria-valuemax={100}>{calculatePercentage(bookingStats.cancelled, bookingStats.total)}%</div>
                </div>

                <div>
                  <p>
                    <i className="fa fa-dot-circle-o text-purple mr-2"></i>Hoàn thành <span
                      className="float-right">{bookingStats.completed}</span>
                  </p>
                  <p>
                    <i className="fa fa-dot-circle-o text-warning mr-2"></i>Đã đặt cọc <span
                      className="float-right">{bookingStats.deposit}</span>
                  </p>

                  <p>
                    <i className="fa fa-dot-circle-o text-danger mr-2"></i>Hủy đặt <span
                      className="float-right">{bookingStats.cancelled}</span>
                  </p>

                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 col-lg-12 col-xl-4 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <h4 className="card-title">Thống kê đơn hàng trong ngày</h4>
                <div className="statistics">
                  <div className="row">
                    <div className="col-md-6 col-6 text-center">
                      <div className="stats-box mb-4">
                        <p>Tổng số đơn hàng trong ngày</p>
                        <h3>{orderStats.total}</h3>
                      </div>
                    </div>
                    <div className="col-md-6 col-6 text-center">
                      <div className="stats-box mb-4">
                        <p>Doanh thu</p>
                        <h3>{formatCurrency(orderStats.revenue)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="progress mb-4">
                  <div className="progress-bar bg-purple" role="progressbar"
                    style={{ width: `${calculatePercentage(orderStats.paid, orderStats.total)}%` }}
                    aria-valuenow={parseInt(calculatePercentage(orderStats.paid, orderStats.total))} aria-valuemin={0}
                    aria-valuemax={100}>{calculatePercentage(orderStats.paid, orderStats.total)}%</div>

                  <div className="progress-bar bg-warning" role="progressbar"
                    style={{ width: `${calculatePercentage(orderStats.unpaid, orderStats.total)}%` }}
                    aria-valuenow={parseInt(calculatePercentage(orderStats.unpaid, orderStats.total))} aria-valuemin={0}
                    aria-valuemax={100}>{calculatePercentage(orderStats.unpaid, orderStats.total)}%</div>
                </div>

                <div>
                  <p>
                    <i className="fa fa-dot-circle-o text-purple mr-2"></i>Đã thanh toán
                    <span className="float-right">{orderStats.paid}</span>
                  </p>
                  <p>
                    <i className="fa fa-dot-circle-o text-warning mr-2"></i>Chưa thanh
                    toán <span className="float-right">{orderStats.unpaid}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 col-lg-6 col-xl-4 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <h4 className="card-title">
                  Góp ý trong ngày của khách hàng <span
                    className="badge bg-inverse-danger ml-2">{stats.countLienHe}</span>
                </h4>
                {loading ? (
                  <div className="text-center p-4">
                    <p>Đang tải...</p>
                  </div>
                ) : contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div key={contact.contactid} className="leave-info-box">
                      <div className="media row"  >
                        <div className="media-left col-8 d-flex align-items-center">
                          <div className="avatar">
                            <img alt="" src={contact.users.image ? getImageUrl(contact.users.image)
                              : `/user/images/${contact.users.image || 'avatar1.png'}`} />
                          </div>
                          <div className="media-body">
                            <div className="text-sm my-0">{contact.users.firstname + ' ' + contact.users.lastname}</div>
                          </div>
                        </div>
                        <div className="media-right col-4 text-right">
                          <div className="text-sm my-0">{formatDate(contact.datecontact)}</div>
                        </div>
                      </div>
                      <div className="row align-items-center mt-3">
                        <div className="col-6">
                          <span className="text-sm text-muted">{contact.title}</span>
                        </div>
                        <div className="col-6 text-right">
                          <span className="badge bg-inverse-danger">{contact.category}</span>
                        </div>
                      </div>
                      {contact.meesagecontact && (
                        <div className="row mt-2">
                          <div className="col-12">
                            <p className="text-muted small">{contact.meesagecontact}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted">Chưa có góp ý nào trong ngày hôm nay</p>
                  </div>
                )}
                <div className="load-more text-center">
                  <a className="text-dark" href="/admin/contacts">Xem thêm</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Statistics Widget */}

        <div className="row">
          <div className="col-md-6 d-flex">
            <div className="card card-table flex-fill">
              <div className="card-header">
                <h3 className="card-title mb-0">Top 3 sân được đặt nhiều nhất</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-nowrap custom-table mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên sân</th>
                        <th>Giá sân</th>
                        <th>Số lần đặt</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFields.map((field, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{field.name}</td>
                          <td>{formatCurrency(field.price)}</td>
                          <td>{field.bookings}</td>
                          <td>{formatCurrency(field.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <a href="/admin/fields">Xem tất cả sân</a>
              </div>
            </div>
          </div>
          <div className="col-md-6 d-flex">
            <div className="card card-table flex-fill">
              <div className="card-header">
                <h3 className="card-title mb-0">Top 3 sản phẩm bán được nhiều nhất</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table custom-table table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá sản phẩm</th>
                        <th>Số lượt bán</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{product.name}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{product.sales}</td>
                          <td>{formatCurrency(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <a href="/admin/products">Xem tất cả sản phẩm</a>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* /Page Content */}
    </div>
  );
};

export default Dashboard;
