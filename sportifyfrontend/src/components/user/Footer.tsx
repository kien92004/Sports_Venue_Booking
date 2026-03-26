import { Link } from "react-router-dom";

export default function Footer() {

  return (
    <>
      {/* Footer */}
      <footer className="ftco-footer">
        <div className="container">
          <div className="row mb-5">
            <div className="col-sm-12 col-md">
              <div className="ftco-footer-widget mb-4">
                <h2 className="ftco-heading-2 logo">
                  <a href="#">Sportify - Giải Pháp Sân Thể Thao</a>
                </h2>
                <p>Nền tảng đa năng cho đặt sân, tạo đội và mua sắm sản phẩm thể thao</p>
                <ul className="ftco-footer-social list-unstyled mt-2">
                  <li className="ftco-animate">
                    <a href="https://x.com/home"><span className="fa fa-twitter"></span></a>
                  </li>
                  <li className="ftco-animate">
                    <a href="https://www.facebook.com/?locale=vi_VN">
                      <span className="fa fa-facebook"></span>
                    </a>
                  </li>
                  <li className="ftco-animate">
                    <a href="https://www.instagram.com/"><span className="fa fa-instagram"></span></a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-sm-12 col-md">
              <div className="ftco-footer-widget mb-4 ml-md-4">
                <h2 className="ftco-heading-2">Chính sách và điều kiện</h2>
                <ul className="list-unstyled">
                  <li>
                    <Link to="/sportify/policy" className="d-flex align-items-center">
                      <span className="fa fa-chevron-right mr-2"></span><span>Quy định chung</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/sportify/regulations" className="d-flex align-items-center">
                      <span className="fa fa-chevron-right mr-2"></span><span>Quy Định & Điều Kiện</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-sm-12 col-md">
              <div className="ftco-footer-widget mb-4">
                <h2 className="ftco-heading-2">Liên hệ </h2>
                <ul className="list-unstyled">
                  <li>
                    <a href="/sportify/contact">
                      <span className="fa fa-chevron-right mr-2"></span>Liên hệ với chúng tôi
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-sm-12 col-md">
              <div className="ftco-footer-widget mb-4">
                <h2 className="ftco-heading-2">Thông tin liên hệ</h2>
                <div className="block-23 mb-3">
                  <ul>
                    <li>
                      <span className="icon fa fa-map marker"></span>
                      <span className="text">
                        Số nhà 13 ngõ 112/1 Nguyên Xá, Minh Khai, Bắc Từ Liêm, Hà Nội
                      </span>
                    </li>
                    <li>
                      <a href="#">
                        <span className="icon fa fa-phone"></span>
                        <span className="text">0987738620</span>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <span className="icon fa fa-paper-plane pr-4"></span>
                        <span className="text">dangdinhkien2k4@gmail.com</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid px-0 py-5 bg-black">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <p className="mb-0 text-center" style={{ color: "rgba(255, 255, 255, .5)" }}>
                  Bản quyền &copy; {new Date().getFullYear()} Bảo lưu mọi quyền | Mẫu này được thực hiện{" "}
                  <i className="fa fa-heart color-danger" aria-hidden="true"></i> bởi{" "}
                  <a href="/sportify/about" target="_blank">
                    Đặng Đình Kiên 
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}