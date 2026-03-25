

import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light" id="ftco-navbar">
        <div className="container">
          <NavLink className="navbar-brand" to="/sportify">
            <img src="/user/images/Logo3.png" style={{ width: "200px" }} alt="" />
          </NavLink>

          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="oi oi-menu"></span> Menu
          </button>

          <div className="collapse navbar-collapse" id="ftco-nav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/sportify">Trang chủ</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/sportify/field">Sân</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/sportify/team">Đội</NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="footballDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Trực tiếp bóng đá
                </a>
                <div className="dropdown-menu" aria-labelledby="footballDropdown">
                  <a className="dropdown-item" href="https://xoilaczzcz.tv/" target="_blank" rel="noopener noreferrer">Xem trực tiếp</a>
                  <NavLink className={({ isActive }) => `dropdown-item${isActive ? ' active' : ''}`} to="/sportify/football-prediction">Dự đoán tỉ số</NavLink>
                </div>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/sportify/product">Cửa hàng</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/sportify/event">Tin Tức</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/sportify/contact">Liên hệ</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

