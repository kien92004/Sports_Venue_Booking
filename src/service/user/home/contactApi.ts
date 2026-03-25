// API for Contact
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
export async function sendContact(payload: any) {
  const res = await fetch(`${URL_BACKEND}/api/user/submit-contact`, {
    credentials: 'include',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
