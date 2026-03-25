const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
// API functions for FieldPage and FieldDetails
export async function fetchFieldList() {
  const res = await fetch(`${URL_BACKEND}/api/sportify/field`);
  if (!res.ok) throw new Error('Failed to fetch fields');
  return res.json();
}

export async function fetchFieldDetail(idField: any) {
  const res = await fetch(`${URL_BACKEND}/api/sportify/field/detail/${idField}`);
  if (!res.ok) throw new Error('Failed to fetch field detail');
  return res.json();
}

export async function PosthandlePermanentBookingData(idField: any, bookingData: any) {
  const res = await fetch(`${URL_BACKEND}/api/user/field/permanent-booking/${idField}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) throw new Error('Failed to post permanent booking data');
  return res.json();
}
