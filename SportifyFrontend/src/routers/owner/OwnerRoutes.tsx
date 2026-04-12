import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AiSupportPage from "../../Pages/owner/AISupport";
import OwnerDashboard from "../../Pages/owner/Dashboard";
import OwnerFieldPage from "../../Pages/owner/Field";
import ManggerFileActiveDetail from "../../Pages/owner/OnwerManggerFileActiveDetail";
import OwnerBookingListPage from "../../Pages/owner/OwnerBookingList";
import OwnerFieldManager from "../../Pages/owner/OwnerFieldManager";
import ManggerFileActive from "../../Pages/owner/OwnerManggerFileActive";
import OwnerReportBooking from "../../Pages/owner/OwnerReportBooking";
import OwnerReviewManager from "../../Pages/owner/OwnerReviewManager";

const OwnerRoutes: React.FC = () => (
  <Routes>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<OwnerDashboard />} />
    <Route path="manager-file-active" element={<ManggerFileActive />} />
    <Route path="manager-file-active-detail/:fieldId" element={<ManggerFileActiveDetail />} />
    <Route path="fields" element={<OwnerFieldPage />} />
    <Route path="bookings" element={<OwnerBookingListPage />} />
    <Route path="manager-bookings" element={<OwnerFieldManager />} />
    <Route path="reviews" element={<OwnerReviewManager />} />
    <Route path="report-bookings" element={<OwnerReportBooking />} />
    <Route path="ai-support" element={<AiSupportPage />} />
    <Route path="*" element={<Navigate to="dashboard" replace />} />
  </Routes>
);

export default OwnerRoutes;
