import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminBookingBoard.css";
import BookingDetailModal from "./BookingDetailModal";

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

const SLOT_INTERVAL = 90; // minutes

const IconChevron: React.FC<{ direction: "left" | "right"; className?: string }> = ({ direction, className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {direction === "left" ? (
      <path d="M10.854 1.646a.5.5 0 0 1 0 .708L5.707 7.5l5.147 5.146a.5.5 0 0 1-.708.708l-5.5-5.5a.5.5 0 0 1 0-.708l5.5-5.5a.5.5 0 0 1 .708 0z" />
    ) : (
      <path d="M5.146 1.646a.5.5 0 0 1 .708 0l5.5 5.5a.5.5 0 0 1 0 .708l-5.5 5.5a.5.5 0 0 1-.708-.708L10.293 7.5 5.146 2.354a.5.5 0 0 1 0-.708z" />
    )}
  </svg>
);



interface BookingEvent {
  bookingId: number;
  title: string;
  shiftName: string;
  start: string;
  end: string;
  dayOfWeek?: number;
  type: string;
  bookingStatus?: string;
  customerName?: string;
  customerPhone?: string;
  fieldId: number;
  fieldType?: string;
}

interface CalendarBooking {
  id: string;
  bookingId: number;
  fieldId: number;
  fieldName: string;
  fieldType?: string;
  start: Date;
  end: Date;
  type: string;
  bookingStatus?: string;
  customerName?: string;
  customerPhone?: string;
  shiftName?: string;
}

interface FieldInfo {
  id: number;
  name: string;
  type?: string;
}

interface FieldApiResponse {
  fieldid: number;
  namefield: string;
  sporttype?: {
    categoryname?: string;
  };
}







const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const toDateOnly = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createTimeSlots = (): string[] => {
  return [
    '04H00-05H00', '05H00-06H00', '06H00-07H00', '07H00-08H00',
    '08H00-09H00', '09H00-10H00', '10H00-11H00', '11H00-12H00',
    '12H00-13H00', '13H00-14H00', '14H00-15H00', '15H00-16H00',
    '16H00-17H00', '17H00-18H00', '18H00-19H00', '19H00-20H00',
    '20H00-21H00', '21H00-22H00', '22H00-23H00', '23H00-00H00'
  ];
};

const getBookingWidth = (start: Date, end: Date): number => {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const durationMinutes = endMinutes - startMinutes;
  const slots = durationMinutes / SLOT_INTERVAL;
  return Math.max(1, slots);
};





const BookingCalendar: React.FC = () => {
  const [rawEvents, setRawEvents] = useState<BookingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string>("");

  const [fieldsFromApi, setFieldsFromApi] = useState<FieldInfo[]>([]);

  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSport, setSelectedSport] = useState<string>("ALL");
  const [fieldFilter, setFieldFilter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => formatInputDate(new Date()));
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const goToRelativeDate = (deltaDays: number) => {
    const base = new Date(selectedDate ? `${selectedDate}T00:00:00` : new Date());
    if (Number.isNaN(base.getTime())) {
      return;
    }
    base.setDate(base.getDate() + deltaDays);
    setSelectedDate(formatInputDate(base));
  };

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const selectedDateObj = useMemo(() => {
    const parsed = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    if (Number.isNaN(parsed.getTime())) {
      return toDateOnly(new Date());
    }
    return toDateOnly(parsed);
  }, [selectedDate]);

  const timeSlots = useMemo(() => createTimeSlots(), []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsError("");
        setEventsLoading(true);
        const res = await fetch(`${URL_BACKEND}/api/rest/calander/`);
        if (!res.ok) {
          throw new Error("Không thể tải dữ liệu lịch");
        }
        const data: BookingEvent[] = await res.json();
        setRawEvents(data);
      } catch (error) {
        console.error("Error fetching calendar events", error);
        setRawEvents([]);
        setEventsError("Lỗi khi tải dữ liệu lịch đặt sân");
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await fetch(`${URL_BACKEND}/rest/fields/getAll`);
        if (!res.ok) {
          throw new Error("Không thể tải danh sách sân");
        }
        const data: FieldApiResponse[] = await res.json();
        const mapped = data.map<FieldInfo>((field) => ({
          id: field.fieldid,
          name: field.namefield,
          type: field.sporttype?.categoryname,
        }));
        setFieldsFromApi(mapped);
      } catch (error) {
        console.error("Error fetching fields", error);
        setFieldsFromApi([]);
      }
    };

    fetchFields();
  }, []);

  const availableFields = useMemo<FieldInfo[]>(() => {
    const map = new Map<number, FieldInfo>();

    fieldsFromApi.forEach((field) => {
      map.set(field.id, field);
    });

    rawEvents.forEach((event) => {
      if (!map.has(event.fieldId)) {
        map.set(event.fieldId, {
          id: event.fieldId,
          name: event.title || `Sân ${event.fieldId}`,
          type: event.fieldType,
        });
      } else {
        const existing = map.get(event.fieldId)!;
        if (!existing.type && event.fieldType) {
          map.set(event.fieldId, { ...existing, type: event.fieldType });
        }
      }
    });

    return Array.from(map.values())
      .filter((field): field is FieldInfo & { name: string } => !!field.name && field.name.trim().length > 0)
      .sort((a, b) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base", numeric: true })
      );
  }, [fieldsFromApi, rawEvents]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    rawEvents.forEach((item) => {
      if (item.bookingStatus) {
        set.add(item.bookingStatus);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" }));
  }, [rawEvents]);

  const sportOptions = useMemo(() => {
    const set = new Set<string>();

    fieldsFromApi.forEach((field) => {
      if (field.type) {
        set.add(field.type);
      }
    });

    rawEvents.forEach((event) => {
      if (event.fieldType) {
        set.add(event.fieldType);
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" }));
  }, [fieldsFromApi, rawEvents]);

  const filteredFields = useMemo(() => {
    const filterText = fieldFilter.trim().toLowerCase();

    return availableFields.filter((field) => {
      if (selectedSport !== "ALL" && field.type !== selectedSport) {
        return false;
      }

      if (filterText) {
        const matchesName = field.name.toLowerCase().includes(filterText);
        const matchesId = field.id.toString().includes(filterText);
        if (!matchesName && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [availableFields, selectedSport, fieldFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedSport, fieldFilter, selectedDate]);

  const totalFieldPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredFields.length / pageSize));
  }, [filteredFields.length]);

  const paginatedFields = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFields.slice(start, start + pageSize);
  }, [filteredFields, currentPage]);

  const allowedFieldIds = useMemo(() => new Set(filteredFields.map((field) => field.id)), [filteredFields]);

  const bookingsForSelectedDate = useMemo(() => {
    if (!rawEvents.length) {
      return [];
    }

    const results: CalendarBooking[] = [];
    const selectedDateOnly = toDateOnly(selectedDateObj);

    const matchesStatus = (value?: string) => {
      if (selectedStatus === "ALL") {
        return true;
      }
      if (!value) {
        return false;
      }
      return normalizeText(value) === normalizeText(selectedStatus);
    };

    rawEvents.forEach((item) => {
      if (!allowedFieldIds.has(item.fieldId)) {
        return;
      }

      if (selectedSport !== "ALL" && item.fieldType && item.fieldType !== selectedSport) {
        return;
      }

      if (item.type === "ONCE") {
        const start = new Date(item.start);
        const end = new Date(item.end);
        if (isSameDay(start, selectedDateOnly) && matchesStatus(item.bookingStatus)) {
          results.push({
            id: `${item.bookingId}-${start.getTime()}`,
            bookingId: item.bookingId,
            fieldId: item.fieldId,
            fieldName: item.title,
            fieldType: item.fieldType,
            start,
            end,
            type: item.type,
            bookingStatus: item.bookingStatus,
            customerName: item.customerName,
            customerPhone: item.customerPhone,
            shiftName: item.shiftName,
          });
        }
        return;
      }

      // ===== PERMANENT BOOKING =====
      const startRange = new Date(item.start);
      const endRange = new Date(item.end);
      const startRangeDate = toDateOnly(startRange);
      const endRangeDate = toDateOnly(endRange);

      // 1️⃣ Kiểm tra ngày có nằm trong khoảng hiệu lực không
      if (selectedDateOnly < startRangeDate || selectedDateOnly > endRangeDate) {
        return;
      }

      // 2️⃣ Kiểm tra đúng thứ trong tuần
      if (item.dayOfWeek != null) {
        // Backend: 1=Mon ... 7=Sun
        // JS: 0=Sun ... 6=Sat
        const jsDay = item.dayOfWeek === 7 ? 0 : item.dayOfWeek;
        if (jsDay !== selectedDateOnly.getDay()) {
          return;
        }
      }

      // 3️⃣ Kiểm tra trạng thái
      if (!matchesStatus(item.bookingStatus)) {
        return;
      }

      // 4️⃣ Tạo booking cho NGÀY ĐANG XEM
      const start = new Date(selectedDateOnly);
      start.setHours(startRange.getHours(), startRange.getMinutes(), 0, 0);

      // Lấy giờ kết thúc từ shiftName nếu có, nếu không thì lấy giờ kết thúc của startRange + 1
      let endHour = startRange.getHours() + 1;
      if (item.shiftName) {
        const match = item.shiftName.match(/(\d{2})H(\d{2})-(\d{2})H(\d{2})/);
        if (match) {
          endHour = parseInt(match[3], 10);
        }
      }
      const end = new Date(selectedDateOnly);
      end.setHours(endHour, 0, 0, 0);

      results.push({
        id: `${item.bookingId}-${selectedDateOnly.getTime()}`,
        bookingId: item.bookingId,
        fieldId: item.fieldId,
        fieldName: item.title,
        fieldType: item.fieldType,
        start,
        end,
        type: item.type,
        bookingStatus: item.bookingStatus,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        shiftName: item.shiftName,
      });
    });

    results.sort((a, b) => a.start.getTime() - b.start.getTime());
    return results;
  }, [rawEvents, allowedFieldIds, selectedDateObj, selectedStatus, selectedSport]);



  const openBookingDetail = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setModalIsOpen(true);
  };

  const handleBookingClick = (bookingId: number) => {
    openBookingDetail(bookingId);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedBookingId(null);
  };





  return (
    <div className="card booking-board">
      <div className="card-header booking-board__top">
        <div className="booking-board__title-group">
          <div>
            <h2 className="booking-board__title">Trạng thái sân</h2>
            <p className="booking-board__subtitle">Theo dõi tình trạng sân theo thời gian thực</p>
          </div>
        </div>
      </div>

      <div className="card-body booking-board__body">
        <div className="booking-board__filters">
          <div className="filter-control">
            <label htmlFor="status-filter">Loại sân / Trạng thái</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="ALL">Tất cả</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label htmlFor="sport-filter">Loại thể thao</label>
            <select
              id="sport-filter"
              value={selectedSport}
              onChange={(event) => setSelectedSport(event.target.value)}
            >
              <option value="ALL">Tất cả</option>
              {sportOptions.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label htmlFor="field-filter">Tìm Kiếm Theo Tên</label>
            <input
              id="field-filter"
              type="text"
              placeholder="Nhập tên sân..."
              value={fieldFilter}
              onChange={(event) => setFieldFilter(event.target.value)}
            />
          </div>

          <div className="filter-control">
            <label htmlFor="date-filter">Ngày</label>
            <div className="filter-control__date filter-control__date--with-nav">
              <button
                type="button"
                className="date-nav-button"
                aria-label="Ngày trước"
                onClick={() => goToRelativeDate(-1)}
              >
                <IconChevron direction="left" />
              </button>
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
              <button
                type="button"
                className="date-nav-button"
                aria-label="Ngày tiếp theo"
                onClick={() => goToRelativeDate(1)}
              >
                <IconChevron direction="right" />
              </button>
              <i className="bi bi-calendar-event" />
            </div>
          </div>
        </div>

        <div className="color-legend">
          <div className="legend-item">
            <div className="legend-color permanent"></div>
            <span>Đặt cố định</span>
          </div>
          <div className="legend-item">
            <div className="legend-color temporary"></div>
            <span>Đặt lẻ</span>
          </div>
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Còn trống</span>
          </div>
          <div className="legend-item">
            <div className="legend-color ribbon-shape" style={{ backgroundColor: '#dc3545' }}></div>
            <span>Đã Cọc</span>
          </div>
          <div className="legend-item">
            <div className="legend-color ribbon-shape" style={{ backgroundColor: '#ffc107' }}></div>
            <span>Hoàn Thành</span>
          </div>
          <div className="legend-item">
            <div className="legend-color ribbon-shape" style={{ backgroundColor: '#6c757d' }}></div>
            <span>Đã Hủy</span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '5px 15px',
          fontSize: '12px',
          color: '#2E7D32',
          fontWeight: 'bold'
        }}>
          {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long' })}<br />
          {new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
        </div>

        {/* Calendar Table */}
        <div className="calendar-table-container">
          {eventsLoading && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <span className="visibly-hidden">Đang tải...</span>
            </div>
          )}
          {eventsError && (
            <div className="alert alert-danger" role="alert" style={{ margin: '20px' }}>
              {eventsError}
            </div>
          )}
          {!eventsLoading && !eventsError && (
            <table className="calendar-table">
              <thead>
                <tr>
                  <th className="time-header"></th>
                  {timeSlots.map((slot, idx) => (
                    <th key={idx} className="time-slot-header">
                      {slot.split('-')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedFields.map((field) => {
                  const fieldBookings = bookingsForSelectedDate.filter(b => b.fieldId === field.id);

                  return (
                    <tr key={field.id}>
                      <td className="day-header">
                        {field.name}
                      </td>
                      {timeSlots.map((slot, slotIndex) => {
                        const booking = fieldBookings.find(b => {
                          const startHour = b.start.getHours();
                          const slotHour = parseInt(slot.split('H')[0]);
                          return startHour === slotHour;
                        });

                        // Nếu có booking và đây là ô đầu tiên
                        if (booking) {
                          const startHour = booking.start.getHours();
                          const slotHour = parseInt(slot.split('H')[0]);

                          if (startHour === slotHour) {
                            const width = getBookingWidth(booking.start, booking.end);
                            const span = Math.ceil(width);

                            return (
                              <td
                                key={`${field.id}-${slotIndex}`}
                                className="time-slot booked"
                                colSpan={span}
                                onClick={() => handleBookingClick(booking.bookingId)}
                                style={{ position: 'relative', cursor: 'pointer' }}
                              >
                                <div className="booking-label" style={{ position: 'relative' }}>
                                  {/* Ribbon trạng thái góc trên phải */}
                                  {booking.bookingStatus && (
                                    <div
                                      className={`ribbon-position ribbon-shape ${booking.bookingStatus === 'Đã Cọc' ? 'ribbon-dacoc' :
                                        booking.bookingStatus === 'Hoàn Thành' ? 'ribbon-hoanthanh' :
                                          'ribbon-dahuy'
                                        }`}
                                    >
                                    </div>
                                  )}

                                  <div className={`booking-tag ${booking.type === 'PERMANENT' ? 'permanent' :
                                    booking.type === 'ONCE' ? 'once' : 'temporary'
                                    }`}>
                                    {booking.customerName || 'Khách hàng'}<br />
                                    {booking.customerPhone}
                                  </div>
                                </div>
                              </td>
                            );
                          }
                        }

                        // Kiểm tra xem ô này có bị booking khác che không
                        const isCovered = fieldBookings.some(b => {
                          const startHour = b.start.getHours();
                          const endHour = b.end.getHours();
                          const slotHour = parseInt(slot.split('H')[0]);
                          return slotHour > startHour && slotHour < endHour;
                        });

                        if (isCovered) {
                          return null; // Không render vì đã bị colSpan che
                        }

                        // Ô trống
                        return (
                          <td
                            key={`${field.id}-${slotIndex}`}
                            className="time-slot available"
                            title="Trống"
                          >
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!eventsLoading && !eventsError && filteredFields.length > 0 && (
          <div className="booking-pagination">
            <button
              type="button"
              className="booking-pagination__btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Trang trước
            </button>
            <span className="booking-pagination__info">
              Trang {currentPage}/{totalFieldPages} - Hiển thị {paginatedFields.length}/{filteredFields.length} sân
            </span>
            <button
              type="button"
              className="booking-pagination__btn"
              disabled={currentPage === totalFieldPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalFieldPages, prev + 1))}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      <BookingDetailModal
        bookingId={selectedBookingId}
        isOpen={modalIsOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default BookingCalendar;
