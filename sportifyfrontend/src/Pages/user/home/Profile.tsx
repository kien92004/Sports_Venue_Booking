import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { fetchProfile as fetchProfileApi, saveProfile, changePassword } from '../../../service/user/home/profileApi';

interface ProfileData {
  username: string;
  passwords: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  address: string;
  image?: string | null;
  gender: boolean;
  status?: boolean;
}

const VITE_CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || '';

export default function Profile(): React.ReactElement {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [messageError, setMessageError] = useState<string>('');

  // form state
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<boolean>(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarProfile, setAvatarProfile] = useState<string | null>(null); // old filename

  // validation messages
  const [firstnameError, setFirstnameError] = useState('');
  const [lastnameError, setLastnameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');

  // Modal state for change password
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [modalNewPassword, setModalNewPassword] = useState('');
  const [modalConfirmPassword, setModalConfirmPassword] = useState('');
  const [modalPasswordError, setModalPasswordError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await fetchProfileApi();
        const p: ProfileData = data.profile;
        setProfile(p);
        setRole(data.role || '');
        // initialize form fields
        setFirstname(p.firstname || '');
        setLastname(p.lastname || '');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setAddress(p.address || '');
        setGender(typeof p.gender === 'boolean' ? p.gender : true);
        setAvatarProfile(p.image || null);
        if (p.image) {
          setAvatarPreview(`${VITE_CLOUDINARY_BASE_URL}/${p.image}`);
        }
      } catch (err) {
        console.error(err);
        setMessageError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Gom validate vào 1 object
  const validators = {
    firstname: (value: string) => {
      if (value.trim() === '') return 'Họ không được để trống';
      if (!/^[\p{L}\s]*$/u.test(value)) return 'Không nhập số hoặc ký tự đặc biệt như: !@#.,';
      if (value.length > 50) return 'Không được quá 50 ký tự';
      return '';
    },
    lastname: (value: string) => {
      if (value.trim() === '') return 'Tên không được để trống';
      if (!/^[\p{L}\s]*$/u.test(value)) return 'Không nhập số hoặc ký tự đặc biệt như: !@#.,';
      if (value.length > 50) return 'Không được quá 50 ký tự';
      return '';
    },
    email: (value: string) => {
      if (value.trim() === '') return 'Email không được để trống';
      if (!/^[\w\.-]+@[\w\.-]+\.\w{2,}$/.test(value)) return 'Email không hợp lệ';
      return '';
    },
    phone: (value: string) => {
      if (value.trim() === '') return 'Số điện thoại không được để trống';
      if (!/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/.test(value)) return 'Không đúng số điện thoại Việt Nam';
      return '';
    },
    address: (value: string) => {
      if (value.trim() === '') return 'Địa chỉ không được để trống';
      if (!/^[\p{L}0-9\s.,/-]+$/u.test(value)) return 'Địa chỉ không hợp lệ';
      return '';
    }
  };

  // Hàm validate tổng
  function validateAll() {
    const firstNameErr = validators.firstname(firstname);
    const lastNameErr = validators.lastname(lastname);
    const emailErr = validators.email(email);
    const phoneErr = validators.phone(phone);
    const addressErr = validators.address(address);

    setFirstnameError(firstNameErr);
    setLastnameError(lastNameErr);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    setAddressError(addressErr);

    return !(firstNameErr || lastNameErr || emailErr || phoneErr || addressErr);
  }

  // NEW: validate for modal passwords
  function validateModalPasswords(newPwd: string, confirmPwd: string): boolean {
    if (newPwd === '' && confirmPwd === '') {
      setModalPasswordError('Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (newPwd.length < 6 || newPwd.length > 16) {
      setModalPasswordError('Mật khẩu phải từ 6 đến 16 ký tự');
      return false;
    }
    if (confirmPwd.length < 6 || confirmPwd.length > 16) {
      setModalPasswordError('Mật khẩu phải từ 6 đến 16 ký tự');
      return false;
    }
    if (newPwd !== confirmPwd) {
      setModalPasswordError('Mật khẩu mới và xác thực không khớp');
      return false;
    }
    setModalPasswordError('');
    return true;
  }

  // avatar handler
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarProfile(file.name); // lưu tên file để gửi lên nếu cần
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setAvatarBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!validateAll()) {
      setMessageError('Vui lòng sửa các lỗi trên form');
      return;
    }

    const formData = new FormData();
    formData.append('username', profile?.username || '');
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('gender', gender ? 'true' : 'false');
    formData.append('avatarProfile', avatarProfile || '');

    // Nếu người dùng chọn ảnh mới (avatarBase64 là base64, bạn nên gửi file gốc nếu có)
    const fileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('avatar', fileInput.files[0]); // Đổi tên trường thành 'avatar'
    } else if (avatarBase64) {
      formData.append('avatarBase64', avatarBase64);
    }

    try {
      await saveProfile(formData);
      setMessage('Cập nhật hồ sơ thành công');
      setMessageError('');
    } catch (err: any) {
      console.error(err);
      setMessageError(err.message || 'Lưu không thành công');
      setMessage('');
    }
  }


  if (loading) return <div>Đang tải...</div>;

  return (
    <>
      <div className="container d-flex justify-content-center rounded mt-5 mb-5 ">
        <div className="col-md-12 bg-white d-flex rounded" id="profiles">
          <form onSubmit={handleSubmit} className="d-flex" encType="multipart/form-data">
            <div className="col-md-5">
              <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                <div style={{ position: 'relative' }}>
                  <img 
                    id="previewAvatar"
                    className="border border-dark rounded-circle mt-5" 
                    width="250px"
                    height="250px" 
                    src={avatarPreview || "/user/images/noavatar.jpg"}
                    alt=""
                    style={{ cursor: "pointer" }}
                    onClick={() => document.getElementById('avatarFileInput')?.click()}
                  />
                  <input 
                    type="hidden" 
                    name="avatarProfile"
                    value={avatarProfile || ''}
                  />

                  <div style={{ position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
                    <label htmlFor="avatarFileInput">
                      <i style={{ fontSize: '25px', color: 'black' }} className="fa fa-camera"></i>
                    </label>
                    <input 
                      style={{ display: 'none' }} 
                      id="avatarFileInput"
                      className="form-control-file" 
                      type="file" 
                      name="avatarFile" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
                <br />
                <h3 className="">{firstname + ' ' + lastname}</h3>
                <span 
                  className="font-weight-bold rounded"
                  style={{ padding: '3px', color: '#4682A9', marginBottom: '10%' }}
                >
                  {role}
                </span>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="p-3 py-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="text-right text-uppercase">Thông tin cá nhân</h4>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <label className="labels">Họ</label> <span className="text-danger">*</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="firstname"
                      value={firstname}
                      onChange={e => setFirstname(e.target.value)}
                      onBlur={e => setFirstnameError(validators.firstname(e.target.value))}
                    />
                    {firstnameError && <div className="error-message text-danger">{firstnameError}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="labels">Tên</label> <span className="text-danger">*</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="lastname"
                      value={lastname}
                      onChange={e => setLastname(e.target.value)}
                      onBlur={e => setLastnameError(validators.lastname(e.target.value))}
                    />
                    {lastnameError && <div className="error-message text-danger">{lastnameError}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-12">
                    <label className="labels">Tài khoản</label>
                    <input 
                      type="text"
                      className="form-control" 
                      readOnly 
                      name="username"
                      value={profile?.username || ''}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="labels">Mật khẩu</label>
                    <div className="d-flex">
                      <input 
                        readOnly 
                        type="password" 
                        className="form-control col-md-12"
                        value="••••••••••"
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm mt-2"
                      onClick={() => setShowChangePwdModal(true)}
                    >
                      Đổi mật khẩu
                    </button>
                  </div>

                  <div className="col-md-12">
                    <label className="labels">Số điện thoại</label> <span className="text-danger">*</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="phone"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onBlur={e => setPhoneError(validators.phone(e.target.value))}
                    />
                    {phoneError && <div className="error-message text-danger">{phoneError}</div>}
                  </div>
                  
                  <div className="col-md-12">
                    <label className="labels">Email</label>
                    <input 
                      type="text"
                      className="form-control" 
                      name="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={e => setEmailError(validators.email(e.target.value))}
                    />
                    {emailError && <div className="error-message text-danger">{emailError}</div>}
                  </div>
                  
                  <div className="col-md-12">
                    <label className="labels">Giới tính</label> <span className="text-danger">*</span>
                    <div className="d-flex">
                      <div className="form-check mr-4">
                        <input 
                          type="radio" 
                          name="gender" 
                          id="male" 
                          value="true" 
                          className="form-check-input"
                          checked={gender === true}
                          onChange={() => setGender(true)}
                        />
                        <label className="form-check-label" htmlFor="male">Nam</label>
                      </div>
                      <div className="form-check">
                        <input 
                          type="radio" 
                          name="gender" 
                          id="female" 
                          value="false" 
                          className="form-check-input"
                          checked={gender === false}
                          onChange={() => setGender(false)}
                        />
                        <label className="form-check-label" htmlFor="female">Nữ</label>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="labels">Địa chỉ</label>
                    <input 
                      type="text"
                      className="form-control" 
                      name="address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      onBlur={e => setAddressError(validators.address(e.target.value))}
                    />
                    {addressError && <div className="error-message text-danger">{addressError}</div>}
                  </div>
                </div>
                
                <div className="mt-5 text-center">
                  <button 
                    className="btn btn-outline-success" 
                    type="submit"
                  >
                    Cập nhật hồ sơ
                  </button>
                  <a className="btn btn-outline-primary" href="profile/listcard" style={{ marginLeft: '10px' }}>
                    Quản lý tài khoản thẻ
                  </a>
                  <a className="btn btn-outline-primary" href="profile/listvoucher" style={{ marginLeft: '10px' }}>
                    Quản lý voucher
                  </a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Đoạn mã để hiển thị thông báo nếu có */}
      {message && (
        <div className="col-12 fixed-top" id="messageDiv" style={{ display: 'block' }}>
          <div className="col-3 alert alert-success"
            style={{ position: 'fixed', top: '0px', right: '0px', zIndex: 9999, fontSize: '20px' }}>
            <p>{message}</p>
          </div>
        </div>
      )}
      
      {messageError && (
        <div className="col-12 fixed-top" id="messageDiv1" style={{ display: 'block' }}>
          <div className="col-3 alert alert-danger"
            style={{ position: 'fixed', top: '0px', right: '0px', zIndex: 9999, fontSize: '20px' }}>
            <p>{messageError}</p>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePwdModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div className="card p-3" style={{ width: 480 }}>
            <h5 className="mb-3">Đổi mật khẩu</h5>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!validateModalPasswords(modalNewPassword, modalConfirmPassword)) return;
              
              setModalSubmitting(true);
              try {
                await changePassword(modalNewPassword);
                
                setModalMessage('Đổi mật khẩu thành công');
                setTimeout(() => {
                  setShowChangePwdModal(false);
                  setModalNewPassword('');
                  setModalConfirmPassword('');
                  setModalPasswordError('');
                  setModalMessage('');
                }, 1500);
              } catch (err: any) {
                setModalPasswordError(err.message || 'Đổi mật khẩu không thành công');
              } finally {
                setModalSubmitting(false);
              }
            }}>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={modalNewPassword} 
                  onChange={e => setModalNewPassword(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={modalConfirmPassword} 
                  onChange={e => setModalConfirmPassword(e.target.value)} 
                />
              </div>

              {modalPasswordError && <div className="text-danger mb-2">{modalPasswordError}</div>}
              {modalMessage && <div className="text-success mb-2">{modalMessage}</div>}

              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-secondary mr-2" 
                  onClick={() => { 
                    setShowChangePwdModal(false); 
                    setModalPasswordError(''); 
                    setModalNewPassword('');
                    setModalConfirmPassword('');
                    setModalMessage('');
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Đang gửi...' : 'Lưu mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}