// utils/validateSignup.ts

export interface SignupData {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  address: string;
  gender: boolean;
}

export const validateSignup = (data: SignupData): string | null => {
  const { username, password, firstname, lastname, phone, email, address } = data;

  if (!username || username.length < 6 || username.length > 15) {
    return "Username phải từ 6–15 ký tự";
  }
  if (!password || password.length < 6 || password.length > 15) {
    return "Mật khẩu phải từ 6–15 ký tự";
  }

  const nameRegex = /^[\p{L} ]+$/u; // chữ + khoảng trắng
  if (!firstname || !nameRegex.test(firstname) || firstname.length > 50) {
    return "Họ chỉ chứa chữ, tối đa 50 ký tự";
  }
  if (!lastname || !nameRegex.test(lastname) || lastname.length > 50) {
    return "Tên chỉ chứa chữ, tối đa 50 ký tự";
  }

  const phoneRegex = /^(0|\+84)\d{9,10}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return "Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 9–10 chữ số";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return "Email không hợp lệ";
  }

  if (!address) {
    return "Địa chỉ không được để trống";
  }

  return null; // ✅ hợp lệ
};
