import React, { useContext, useEffect, useState } from "react";
import OwnerBookingBoard from "../../components/owner/OwnerBookingBoard";
import { AuthContext } from "../../helper/AuthContext";
import OwnerFieldManager from "./OwnerFieldManager";
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface DashboardStats {
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

// API Response Interfaces
interface OwnerDashboardSummaryResponse {
  countOrderInDate: number;
  countBookingInDate: number;
  countFieldActiving: number;
  countProductActive: number;
  totalProduct: number;
  totalUser: number;
  totalField: number;
  totalOrderBooking: number;
}

interface OwnerDashboardDetailsResponse {
  demLienHeTrongNgay: number;
  thongKeOrderInDay: [string, number, number | null][];
  thongkebookingtrongngay: {
    totalBookings: number,
    hoanThanh: number,
    daCoc: number,
    huyDat: number
  }
  top3SanDatNhieu: [string, number, number, number][];
  top3SanPhamBanNhieu: [string, number, number, number][];
  danhsach3contact: ContactItem[];
}

const OwnerDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const ownerUsername = user?.username || "";
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<DashboardStats>({
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
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [topFields, setTopFields] = useState<TopField[]>([]);

  useEffect(() => {
    // Fetch dashboard data from APIs
    if (ownerUsername) {
      fetchDashboardData();
    }
  }, [ownerUsername]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch both APIs in parallel with owner parameter
      const [summaryResponse, detailsResponse] = await Promise.all([
        fetch(`${URL_BACKEND}/rest/dashboard/summary/owner?ownerUsername=${encodeURIComponent(ownerUsername)}`),
        fetch(`${URL_BACKEND}/rest/dashboard/all-details/owner?ownerUsername=${encodeURIComponent(ownerUsername)}`)
      ]);

      if (!summaryResponse.ok || !detailsResponse.ok) {
        console.error("Error fetching owner dashboard data");
        throw new Error("Failed to fetch dashboard data");
      }

      const summaryData: OwnerDashboardSummaryResponse = await summaryResponse.json();
      const detailsData: OwnerDashboardDetailsResponse = await detailsResponse.json();

      // Set dashboard stats
      setStats({
        countBookingInDate: summaryData.countBookingInDate,
        countFieldActiving: summaryData.totalField,
        countProductActive: summaryData.countProductActive,
        countLienHe: detailsData.demLienHeTrongNgay,
      });

      // Process booking stats from thongkebookingtrongngay
      const bookingData = detailsData.thongkebookingtrongngay;

      const totalBooking = bookingData.totalBookings;
      const completedBooking = bookingData.hoanThanh;
      const depositBooking = bookingData.daCoc;
      const cancelledBooking = bookingData.huyDat;

      setBookingStats({
        total: totalBooking || 0,
        completed: completedBooking || 0,
        deposit: depositBooking || 0,
        cancelled: cancelledBooking || 0,
        revenue: totalBooking || 0,
      });

      // Process top fields
      const topFieldsData = detailsData.top3SanDatNhieu.map(field => ({
        name: field[0],
        price: field[1],
        bookings: field[2],
        revenue: field[3],
      }));
      setTopFields(topFieldsData);

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
      setTopFields([]);
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



  return (
    <div className="page-wrapper">
      {/* Page Content */}
      <div className="content container-fluid">
        <OwnerBookingBoard selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <OwnerFieldManager selectDate={selectedDate} />


        <div className="row">
          <div className="col-md-12 d-flex">
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
                <a href="/owner/fields">Xem tất cả sân</a>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* /Page Content */}
    </div>
  );
};

export default OwnerDashboard;
