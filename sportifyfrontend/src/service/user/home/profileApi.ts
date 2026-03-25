// API for Profile
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

export async function fetchProfile() {
  const res = await fetch(`${URL_BACKEND}/api/user/profile`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function saveProfile(formData: FormData) {
  const res = await fetch(`${URL_BACKEND}/api/user/profile/save-profile`, {
    method: 'POST',
    credentials: "include",
    body: formData
  });
  if (!res.ok) throw new Error(await res.text() || 'Lỗi khi lưu hồ sơ');
  return res;
}

export async function changePassword(newPassword: string) {
  const res = await fetch(`${URL_BACKEND}/api/user/profile/change-password`, {
    method: 'POST',
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword })
  });
  if (!res.ok) throw new Error(await res.text() || 'Lỗi đổi mật khẩu');
  return res;
}
