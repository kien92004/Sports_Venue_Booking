import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../helper/AuthContext";
import BookingModal from "../../Pages/owner/CreateBookingModal";
import "../../styles/AdminBookingBoard.css";
import BookingDetailModal from "../admin/BookingDetailModal";

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
    ownerUsername?: string;
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
    owner?: {
        username?: string;
    };
}

const toDateOnly = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

interface OwnerBookingBoardProps {
    selectedDate?: string;
    onDateChange?: (date: string) => void;
}

const OwnerBookingBoard: React.FC<OwnerBookingBoardProps> = ({ selectedDate: propSelectedDate, onDateChange }) => {
    const { user } = useContext(AuthContext);
    const ownerUsername = user?.username || "";

    const [rawEvents, setRawEvents] = useState<BookingEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const [fieldsFromApi, setFieldsFromApi] = useState<FieldInfo[]>([]);

    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [fieldFilter, setFieldFilter] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(() => propSelectedDate || formatInputDate(new Date()));

    const [show, setShow] = useState(false);

    useEffect(() => {
        if (propSelectedDate) {
            setSelectedDate(propSelectedDate);
        }
    }, [propSelectedDate]);

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        if (onDateChange) {
            onDateChange(newDate);
        }
    };

    const goToRelativeDate = (deltaDays: number) => {
        const base = new Date(selectedDate ? `${selectedDate}T00:00:00` : new Date());
        if (Number.isNaN(base.getTime())) {
            return;
        }
        base.setDate(base.getDate() + deltaDays);
        handleDateChange(formatInputDate(base));
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

    // Fetch events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setError("");
                setLoading(true);
                const res = await fetch(`${URL_BACKEND}/api/rest/calander/`);
                if (!res.ok) {
                    throw new Error("Không thể tải dữ liệu lịch");
                }
                const data: BookingEvent[] = await res.json();
                console.log("📅 Raw events fetched:", data);
                setRawEvents(data);
            } catch (error) {
                console.error("Error fetching calendar events", error);
                setRawEvents([]);
                setError("Lỗi khi tải dữ liệu lịch đặt sân");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Fetch fields - only for this owner
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch(`${URL_BACKEND}/rest/fields/getAll?ownerUsername=${encodeURIComponent(ownerUsername)}`);
                if (!res.ok) {
                    throw new Error("Không thể tải danh sách sân");
                }
                const allFields: FieldApiResponse[] = await res.json();
                console.log("🏟️ All fields from API:", allFields);

                // Filter fields by owner username
                // const ownerFields = allFields.filter(
                //     (field) => field.owner?.username === ownerUsername
                // );


                const mapped: FieldInfo[] = allFields.map((field) => ({
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

        if (ownerUsername) {
            fetchFields();
        }
    }, [ownerUsername]);

    const statusOptions = useMemo(
        () => Array.from(new Set(fieldsFromApi.map((f) => f.type).filter(Boolean))) as string[],
        [fieldsFromApi]
    );

    const bookingsForSelectedDate = useMemo(() => {
        // Lọc booking chỉ cho sân của chủ sân hiện tại
        const ownerFieldIds = new Set(fieldsFromApi.map(f => f.id));
        console.log("🔑 Owner field IDs:", Array.from(ownerFieldIds));

        const results: Array<{
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
        }> = [];
        rawEvents.forEach((event) => {
            // Chỉ lấy booking của sân thuộc về chủ sân này
            if (!ownerFieldIds.has(event.fieldId)) {
                return;
            }

            if (event.type === "ONCE") {
                // So sánh ngày: lấy phần ngày từ chuỗi ISO (YYYY-MM-DD)
                const eventDateStr = event.start.split('T')[0];
                const selectedDateStr = formatInputDate(selectedDateObj);
                if (eventDateStr !== selectedDateStr) {
                    return;
                }
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);
                results.push({
                    id: `${event.bookingId}-${event.start}`,
                    bookingId: event.bookingId,
                    fieldId: event.fieldId,
                    fieldName: fieldsFromApi.find((f) => f.id === event.fieldId)?.name || `Sân ${event.fieldId}`,
                    fieldType: event.fieldType,
                    start: startDate,
                    end: endDate,
                    type: event.type,
                    bookingStatus: event.bookingStatus,
                    customerName: event.customerName,
                    customerPhone: event.customerPhone,
                    shiftName: event.shiftName,
                });
                return;
            }

            // ===== PERMANENT BOOKING =====
            const startRange = new Date(event.start);
            const endRange = new Date(event.end);
            const startRangeDate = toDateOnly(startRange);
            const endRangeDate = toDateOnly(endRange);
            // 1️⃣ Kiểm tra ngày có nằm trong khoảng hiệu lực không
            if (selectedDateObj < startRangeDate || selectedDateObj > endRangeDate) {
                return;
            }
            // 2️⃣ Kiểm tra đúng thứ trong tuần
            if (event.dayOfWeek != null) {
                // Backend: 1=Mon ... 7=Sun
                // JS: 0=Sun ... 6=Sat
                // Mapping: Backend 1=Mon->JS 1, ..., 6=Fri->JS 5, 7=Sun->JS 0
                const jsDay = event.dayOfWeek === 7 ? 0 : event.dayOfWeek - 1;
                if (jsDay !== selectedDateObj.getDay()) {
                    return;
                }
            }
            // 3️⃣ Kiểm tra trạng thái (nếu cần, có thể thêm logic matchesStatus)
            // 4️⃣ Tạo booking cho NGÀY ĐANG XEM
            const start = new Date(selectedDateObj);
            start.setHours(startRange.getHours(), startRange.getMinutes(), 0, 0);

            // Lấy giờ kết thúc từ shiftName nếu có, nếu không thì lấy giờ kết thúc của startRange + 1
            let endHour = startRange.getHours() + 1;
            if (event.shiftName) {
                const match = event.shiftName.match(/(\d{2})H(\d{2})-(\d{2})H(\d{2})/);
                if (match) {
                    endHour = parseInt(match[3], 10);
                }
            }
            const end = new Date(selectedDateObj);
            end.setHours(endHour, 0, 0, 0);

            results.push({
                id: `${event.bookingId}-${selectedDateObj.getTime()}`,
                bookingId: event.bookingId,
                fieldId: event.fieldId,
                fieldName: fieldsFromApi.find((f) => f.id === event.fieldId)?.name || `Sân ${event.fieldId}`,
                fieldType: event.fieldType,
                start,
                end,
                type: event.type,
                bookingStatus: event.bookingStatus,
                customerName: event.customerName,
                customerPhone: event.customerPhone,
                shiftName: event.shiftName,
            });
        });
        return results;
    }, [rawEvents, selectedDateObj, fieldsFromApi]);

    const filteredFields = useMemo(() => {
        return fieldsFromApi.filter((field) => {
            if (selectedStatus !== "ALL" && field.type !== selectedStatus) {
                return false;
            }

            if (fieldFilter && !field.name.toLowerCase().includes(fieldFilter.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [fieldsFromApi, selectedStatus, fieldFilter]);

    const openBookingDetail = (bookingId: number) => {
        setSelectedBookingId(bookingId);
        setModalIsOpen(true);
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
                        <label htmlFor="status-filter">Loại sân</label>
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
                        <label htmlFor="field-filter">Tên sân</label>
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
                                onChange={(event) => handleDateChange(event.target.value)}
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

                <div className="d-flex mb-3 align-items-center justify-content-between">
                    <div className="w-100" style={{
                        backgroundColor: '#e8f5e9',
                        padding: '5px 15px',
                        fontSize: '12px',
                        color: '#2E7D32',
                        fontWeight: 'bold'
                    }}>
                        {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long' })}<br />
                        {new Date(selectedDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </div>
                    <button className="btn btn-success booking-board__create-btn" onClick={() => setShow(true)}>
                        + Tạo đặt sân
                    </button>

                </div>

                {/* Calendar Table */}
                <div className="calendar-table-container">
                    {loading && (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <span className="visibly-hidden">Đang tải...</span>
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-danger" role="alert" style={{ margin: '20px' }}>
                            {error}
                        </div>
                    )}
                    {!loading && !error && (
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
                                {filteredFields.map((field) => {
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
                                                                onClick={() => openBookingDetail(booking.bookingId)}
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
                                                                        {booking.customerName && <div style={{ fontSize: '0.7em', marginTop: '2px' }}>{booking.customerName}</div>}
                                                                        {booking.customerPhone && <div style={{ fontSize: '0.7em', marginTop: '1px' }}>{booking.customerPhone}</div>}
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
            </div>

            <BookingDetailModal
                bookingId={selectedBookingId}
                isOpen={modalIsOpen}
                onClose={closeModal}
            />
            <BookingModal
                show={show}
                onClose={() => setShow(false)}
                ownerUsername={ownerUsername}
                URL_BACKEND={URL_BACKEND}

                onSubmitOnce={(data) => {
                    console.log("Submitting once booking:", data);
                    fetch(`${URL_BACKEND}/rest/bookings/create`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    })
                        .then(response => {
                            if (response.ok) {
                                alert("Đặt sân thành công!");
                                // Refresh the calendar
                                window.location.reload();
                            } else {
                                alert("Có lỗi xảy ra khi đặt sân!");
                            }
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            alert("Có lỗi xảy ra khi đặt sân!");
                        });
                }}

                onSubmitPermanent={(data) => {
                    console.log("Submitting permanent booking:", data);
                    fetch(`${URL_BACKEND}/rest/bookings/create-permanent`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    })
                        .then(response => {
                            if (response.ok) {
                                alert("Đặt sân cố định thành công!");
                                // Refresh the calendar
                                window.location.reload();
                            } else {
                                alert("Có lỗi xảy ra khi đặt sân!");
                            }
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            alert("Có lỗi xảy ra khi đặt sân!");
                        });
                }}
            />
        </div>
    );
};

export default OwnerBookingBoard;
