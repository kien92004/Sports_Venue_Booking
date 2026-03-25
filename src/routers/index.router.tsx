// AppRouter.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./admin/AdminRoutes";
import OwnerRoutes from "./owner/OwnerRoutes";
import HomeRouter from "./user/HomeRouter";
import Layout from "../layouts/Layout";
import ForgetPass from "../Pages/security/ForgetPass";
import Login from "../Pages/security/Login";
import Register from "../Pages/security/Register";
import { AuthProvider } from "../helper/AuthContext";
import { NotificationProvider } from "../helper/NotificationContext";
import LayoutAdmin from "../layouts/LayoutAdmin";
import LayoutOwner from "../layouts/LayoutOwner";
import PaymentResult from "../Pages/user/checkout/PaymentResult";
import PaymentMethodResult from "../Pages/user/checkout/PaymentMethodResult";
import GroupChat from "../Pages/user/home/GroupChat";
const AppRouter = () => (
  <Router>
    <AuthProvider>
      <NotificationProvider>
        <Routes>
        {/* Auth routes - nằm ngoài layout chính */}
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<GroupChat />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login/forgotpassword" element={<ForgetPass />} />

        {/* Layout chính cho sportify */}
        <Route path="/sportify/*" element={<Layout />}>
          <Route path="*" element={<HomeRouter />} />
        </Route>

        {/* Admin site */}
        <Route path="admin/*" element={<LayoutAdmin />}>
          <Route path="*" element={<AdminRoutes />} />
        </Route>

        {/* Field owner site */}
        <Route path="owner/*" element={<LayoutOwner />}>
          <Route path="*" element={<OwnerRoutes />} />
        </Route>

        <Route path="payment-result" element={<PaymentResult />} />
        <Route path="payment-methods" element={<PaymentMethodResult />} />


        {/* Trang fallback */}
        <Route path="*" element={<Navigate to="/sportify" replace />} />
      </Routes>
      </NotificationProvider>
    </AuthProvider>
  </Router>
);

export default AppRouter;
