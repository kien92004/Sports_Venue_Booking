import React, { useState } from "react";
import ConfirmModal from "../user/Modal";

interface HeaderProps {
  username: string;
  userImage?: string;
  onRefreshPage?: () => void;
}


const Header: React.FC<HeaderProps> = ({ username, userImage, onRefreshPage }) => {
  const [modal, setModal] = useState(false);
  const [avatarDrop, setAvatarDrop] = useState(false);
  const toogleSidebar = () => {
    const aside = document.querySelector("aside");
    aside?.classList.toggle("toSidebar");

  }
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top border-bottom">
      <div className="container-fluid">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="/admin/dashboard">
          <img src="/admin/assets/img/logo.png" width="130" height="40" alt="Logo" className="me-2" />
        </a>


        <div className="d-flex align-items-center">
          <div className="position-relative me-2">
            <button className="btn p-0 border-0 bg-transparent"
              onClick={() => { setAvatarDrop(!avatarDrop) }}>

              {userImage ? (
                <img
                  src={`/admin/assets/img/profiles/${userImage}`}
                  alt="User"
                  className="rounded-circle me-2"
                  width="32"
                  height="32"
                />
              ) : (
                <div className="d-flex justify-content-center">
                  <div className=" bg-opacity-8 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: "32px", height: "32px", backgroundColor: "#fff3f4 " }}>
                    <i className="bi bi-person text-primary"></i>
                  </div>
                  <span className="d-none d-md-inline">Chào, {username}!</span>
                </div>

              )}
            </button>
            {avatarDrop && (
              <ul className="dropdown-menu show  dropdown-menu-end shadow border-0" style={{ minWidth: "180px" }}>
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="/sportify" onClick={onRefreshPage}>
                    <i className="fa fa-home me-2 text-primary"></i>
                    Về trang chính
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item d-flex align-items-center text-danger" onClick={() => { setModal(true) }}>
                    <i className="fa fa-sign-out-alt me-2"></i>
                    Đăng xuất
                  </a>
                </li>
                <ConfirmModal
                  show={modal}
                  title="Xác nhận đăng xuất"
                  message="Bạn có chắc chắn muốn đăng xuất không?"
                  onConfirm={() => {
                    setModal(false);
                    window.location.href = "/logout";
                  }}
                  onCancel={() => setModal(false)}
                />
              </ul>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler border-0  d-lg-none"
            onClick={() => toogleSidebar()}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
