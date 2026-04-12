// bookingService.ts
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

export const fetchBookingData = async (
  fieldid: string | number,
  parmanent: string,
  shiftid?: string | number,
  dateselect?: string
) => {
  if (!fieldid) throw new Error("Thiếu fieldid");

  const isPermanent = parmanent === "true";
  let url = "";

  if (isPermanent) {
    url = `${URL_BACKEND}/api/user/field/permanent-booking/${fieldid}`;
  } else {
    if (!shiftid || !dateselect) {
      throw new Error("Thiếu shiftid hoặc dateselect khi gọi API booking");
    }
    url = `${URL_BACKEND}/api/user/field/booking/${fieldid}?shiftid=${encodeURIComponent(
      shiftid
    )}&dateselect=${encodeURIComponent(dateselect)}`;
  }

  const res = await fetch(url, { method: "GET", credentials: "include" });
  if (!res.ok) throw new Error(`API lỗi ${res.status}`);

  return res.json();
};
