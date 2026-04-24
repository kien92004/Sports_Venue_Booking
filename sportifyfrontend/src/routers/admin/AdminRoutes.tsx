import React from "react";
import { Route, Routes } from "react-router-dom";
import AccountPage from "../../Pages/admin/Account";
import AiSupportPage from "../../Pages/admin/AISupport";
import BookingPage from "../../Pages/admin/Booking";
import CategoryProductPage from "../../Pages/admin/CategoryProduct";
import CategorySportPage from "../../Pages/admin/CategorySport";
import CommentPage from "../../Pages/admin/Comment";
import ContactPage from "../../Pages/admin/Contact";
import Dashboard from "../../Pages/admin/Dashboard";
import EventPage from "../../Pages/admin/Event";
import FieldPage from "../../Pages/admin/Field";
import FieldManager from "../../Pages/admin/FieldManager";
import FieldOwnerRequests from "../../Pages/admin/FieldOwnerRequests";
import ManggerFileActive from "../../Pages/admin/ManggerFileActive";
import ManagerFieldActiveDetail from "../../Pages/admin/ManggerFileActiveDetail";
import OrderManager from "../../Pages/admin/OrderManager";
import OrderProductPage from "../../Pages/admin/OrderProduct";
import ProductPage from "../../Pages/admin/Product";
import ReportBookingPage from "../../Pages/admin/ReportBooking";
import ReportOrderPage from "../../Pages/admin/ReportOrder";

import VoucherPage from "../../Pages/admin/Voucher";
import PaymentLogPage from "../../Pages/admin/PaymentLog";

const AdminRoutes: React.FC = () => (
  <Routes>
    <Route path="dashboard" element={<Dashboard />} />

    <Route path="manager-file-active" element={<ManggerFileActive />} />
    <Route path="manager-file-active-detail/:fieldId" element={<ManagerFieldActiveDetail />} />
    <Route path="accounts" element={<AccountPage />} />
    <Route path="bookings" element={<BookingPage />} />
    <Route path="manager-bookings" element={<FieldManager />} />
    <Route path="manager-orders" element={<OrderManager />} />
    <Route path="products" element={<ProductPage />} />
    <Route path="fields" element={<FieldPage />} />
    <Route path="events" element={<EventPage />} />
    <Route path="vouchers" element={<VoucherPage />} />
    <Route path="contacts" element={<ContactPage />} />
    <Route path="comments" element={<CommentPage />} />
    <Route path="field-owner-requests" element={<FieldOwnerRequests />} />
    <Route path="order-products" element={<OrderProductPage />} />
    <Route path="category-product" element={<CategoryProductPage />} />
    <Route path="category-sport" element={<CategorySportPage />} />
    <Route path="reportBooking" element={<ReportBookingPage />} />
    <Route path="reportOrder" element={<ReportOrderPage />} />
    <Route path="ai-support" element={<AiSupportPage />} />
    <Route path="payment-logs" element={<PaymentLogPage />} />
  </Routes>
);

export default AdminRoutes;
