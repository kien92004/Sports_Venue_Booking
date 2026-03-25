import { Helmet } from "@dr.pogodin/react-helmet";
import React, { useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminAIChatbox from "../components/admin/AdminAIChatbox";
import Header from "../components/admin/Header";
import Sidebar from "../components/admin/SideBar";
import { AuthContext } from "../helper/AuthContext";
import { loadScript } from "../helper/LoadScript";

const LayoutAdmin: React.FC = () => {
  const { user, loading } = useContext(AuthContext);

  const arrayScript = [
    "/admin/assets/js/jquery-3.5.1.min.js",
    "/admin/assets/js/jquery.dataTables.min.js",
    "/admin/assets/js/dataTables.bootstrap4.min.js",
    "/admin/assets/js/popper.min.js",
    "/admin/assets/js/bootstrap.min.js",
    "/admin/assets/js/jquery.slimscroll.min.js",
    "/admin/assets/plugins/raphael/raphael.min.js",
    "/admin/assets/plugins/morris/morris.min.js",
    "/admin/assets/js/chart.js",
    "/admin/assets/js/moment.min.js",
    "/admin/assets/js/bootstrap-datetimepicker.min.js",
    "/admin/assets/js/select2.min.js",
    "/admin/assets/js/app.js",
    // "https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js",
    // "https://cdnjs.cloudflare.com/ajax/libs/angular-route/1.8.3/angular-route.min.js",
  ];
  useEffect(() => {
    async function loadScripts() {
      try {
        for (const src of arrayScript) {
          loadScript(src)
        }
      } catch (e) {
        console.error("load script failed : ", e)
      }
    }

    loadScripts()
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "Admin") {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <i className="fa fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4>Không có quyền truy cập</h4>
          <p className="text-muted">Bạn không có quyền truy cập trang này.</p>
          <a href="/login" className="btn btn-primary">Đăng nhập</a>
        </div>
      </div>
    );
  }



  return (
    <>
      <Helmet>
        <title>Admin Sportify</title>

        {/* Base + Fonts + Favicon */}
        <base href="/" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:400,400i,500,500i,700,700i&display=swap"
        />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="/admin/assets/img/logotitle.png"
        />

        {/* CSS */}
        <link rel="stylesheet" href="/admin/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/admin/assets/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/admin/assets/css/line-awesome.min.css" />
        <link rel="stylesheet" href="/admin/assets/plugins/morris/morris.css" />
        <link rel="stylesheet" href="/admin/assets/css/style.css" />
        <link rel="stylesheet" href="/admin/assets/css/dataTables.bootstrap4.min.css" />
        <link rel="stylesheet" href="/admin/assets/css/select2.min.css" />
        <link rel="stylesheet" href="/admin/assets/css/bootstrap-datetimepicker.min.css" />


        {/* <!-- jQuery phải load trước --> */}
        <script src="/admin/assets/js/jquery-3.5.1.min.js"></script>

        {/* <!-- DataTables core + bootstrap integration --> */}
        <script src="/admin/assets/js/jquery.dataTables.min.js"></script>
        <script src="/admin/assets/js/dataTables.bootstrap4.min.js"></script>

        {/* <!-- Popper + Bootstrap 4 --> */}
        <script src="/admin/assets/js/popper.min.js"></script>
        <script src="/admin/assets/js/bootstrap.min.js"></script>

        {/* <!-- Plugins phụ thuộc jQuery --> */}
        <script src="/admin/assets/js/jquery.slimscroll.min.js"></script>
        <script src="/admin/assets/plugins/raphael/raphael.min.js"></script>
        <script src="/admin/assets/plugins/morris/morris.min.js"></script>
        <script src="/admin/assets/js/chart.js"></script>

        {/* <!-- Moment trước datetimepicker --> */}
        <script src="/admin/assets/js/moment.min.js"></script>
        <script src="/admin/assets/js/bootstrap-datetimepicker.min.js"></script>

        {/* <!-- Select2 --> */}
        <script src="/admin/assets/js/select2.min.js"></script>

        {/* <!-- Custom JS --> */}
        <script src="/admin/assets/js/app.js"></script>

        {/* <!-- AngularJS chỉ load 1 lần --> */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/angular-route/1.8.3/angular-route.min.js"></script>

      </Helmet>
      <div className="admin-layout">
        <Header username={user.username} />
        <Sidebar />
        <AdminAIChatbox />
        <main className="main-content mt-5">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default LayoutAdmin;
