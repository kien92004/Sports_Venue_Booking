import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { AuthContext } from '../../helper/AuthContext';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;


// Custom styles for Modal with better responsive design
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '0',
    border: 'none',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1050,
  },
};

Modal.setAppElement('#root');





interface BookingDetail {
  bookingId: number;
  username: string;
  phone: string;
  note: string;
  bookingStatus: string;
  bookingType: string;
  fieldName: string;
  fieldImage: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  price: number;
  playDate: string;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: string;
}

const OwnerBookingCalendar: React.FC = () => {
  const { user } = useContext(AuthContext);
  const ownerUsername = user?.username || "";

  const [events, setEvents] = useState<any[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');



  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setError('');
        setLoading(true);
        // Fetch calendar data for owner - using new endpoint that formats data for calendar
        const res = await fetch(`${URL_BACKEND}/rest/bookings/calendar/owner/${encodeURIComponent(ownerUsername)}`);
        if (!res.ok) {
          throw new Error('Không thể tải dữ liệu lịch');
        }
        const data: any[] = await res.json();
        let allEvents: any[] = [];

        // Data từ API đã định dạng sẵn, chỉ cần convert thành format FullCalendar cần
        data.forEach((item) => {
          const titleDisplay = `ID: ${item.bookingId}`;
          allEvents.push({
            id: item.bookingId.toString(),
            title: titleDisplay,
            start: item.start,
            end: item.end,
            extendedProps: {
              type: item.type,
              className: item.type === 'PERMANENT' ? 'permanent-booking' : 'regular-booking'
            },
            backgroundColor: item.type === 'PERMANENT' ? '#5bc0de' : '#55ce63',
            borderColor: item.type === 'PERMANENT' ? '#46b8da' : '#47b754',
          });
        });

        setEvents(allEvents);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu lịch đặt sân');
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ownerUsername) {
      fetchEvents();
    }
  }, [ownerUsername]);

  const handleEventClick = async (info: any) => {
    setLoading(true);
    setModalIsOpen(true);
    setError('');
    const bookingId = Number(info.event.id);
    try {
      const res = await fetch(`${URL_BACKEND}/api/rest/calander/${bookingId}`);
      if (!res.ok) {
        throw new Error('Không thể tải chi tiết đặt sân');
      }
      const data = await res.json();
      const detail = data[0];
      setBookingDetail(detail);
      console.log("detail", detail);
    } catch (err) {
      setError('Không thể tải thông tin chi tiết đặt sân');
      setBookingDetail(null);
      console.error('Error fetching booking detail:', err);
    }
    setLoading(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setBookingDetail(null);
    setError('');
  };
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'đã xác nhận':
        return 'badge bg-success';
      case 'pending':
      case 'chờ xác nhận':
        return 'badge bg-warning text-dark';
      case 'cancelled':
      case 'đã hủy':
        return 'badge bg-danger';
      case 'completed':
      case 'hoàn thành':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  };

  const getBookingTypeClass = (type: string) => {
    return type === 'PERMANENT' ? 'badge bg-info' : 'badge bg-success';
  };
  return (
    <div className="container-fluid p-0 mb-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center text-white" >
              <h4 className="card-title mb-0">
                <i className="bi bi-calendar-date me-2"></i>
                Lịch Đặt Sân
              </h4>
              <div>
                <span className="badge bg-info me-2">Đặt cố định</span>
                <span className="badge bg-success" style={{ backgroundColor: '#55ce63' }}>Đặt thông thường</span>
              </div>
            </div>
            <div className="card-body p-0">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                height="auto"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                locale="vi"
                buttonText={{
                  today: 'Hôm nay',
                  month: 'Tháng',
                  week: 'Tuần'
                }}
                buttonIcons={{
                  prev: 'chevron-left',
                  next: 'chevron-right'
                }}
                eventDisplay="block"
                eventBackgroundColor="#55ce63"
                eventBorderColor="#47b754"
                eventTextColor="#ffffff"
                dayCellClassNames="border"
                eventContent={(eventInfo) => {
                  return (
                    <div className="fw-bold text-center py-1">
                      {eventInfo.event.title}
                    </div>
                  )
                }}
                // Fix icon alignment and improve button look
                customButtons={{
                  todayButton: {
                    text: 'Hôm nay',
                    click: function () {
                      const calendarApi = document.querySelector('.fc')?.querySelector('.fc-today-button');
                      if (calendarApi) {
                        (calendarApi as HTMLElement).click();
                      }
                    }
                  }
                }}
                eventClassNames={(event) => {
                  const type = event.event.extendedProps.type;
                  return `rounded-1 shadow-sm ${type === 'PERMANENT' ? 'bg-info' : ''}`
                }}
                dayHeaderClassNames="bg-light text-success font-weight-bold"
                themeSystem="bootstrap"
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Chi tiết đặt sân"
        closeTimeoutMS={200}
      >
        <div className="modal-content border-0">
          {loading ? (
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-success" style={{ color: '#55ce63' }} role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3 text-muted">Đang tải thông tin...</p>
            </div>
          ) : bookingDetail ? (
            <>
              <div className="modal-header bg-success text-white border-0" style={{ backgroundColor: '#55ce63' }}>
                <h5 className="modal-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Chi tiết đặt sân {bookingDetail.bookingType === 'PERMANENT' &&
                    <span className="badge bg-info ms-2">Đặt cố định</span>}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                  aria-label="Đóng"
                ></button>
              </div>

              <div className="modal-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Field Image */}
                <div className="position-relative">
                  <img
                    src={"user/images/" + bookingDetail.fieldImage}
                    alt={bookingDetail.fieldName}
                    className="w-100"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'user/images/team-default.png';
                    }}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className={getStatusBadgeClass(bookingDetail.bookingStatus)}>
                      {bookingDetail.bookingStatus}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-4">
                  <h4 className="text-success mb-3" style={{ color: '#55ce63' }}>
                    <i className="bi bi-dribbble me-2"></i>
                    {bookingDetail.fieldName}
                  </h4>

                  <div className="row g-3">
                    {/* Customer Info */}
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body py-2">
                          <h6 className="card-title text-secondary mb-2">
                            <i className="bi bi-person me-2"></i>Thông tin khách hàng
                          </h6>
                          <div className="row">
                            <div className="col-sm-6">
                              <small className="text-muted">Tên khách hàng:</small>
                              <div className="fw-bold">{bookingDetail.username}</div>
                            </div>
                            <div className="col-sm-6">
                              <small className="text-muted">Số điện thoại:</small>
                              <div className="fw-bold">
                                <i className="bi bi-telephone me-1"></i>
                                {bookingDetail.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body py-2">
                          <h6 className="card-title text-secondary mb-2">
                            <i className="bi bi-calendar-check me-2"></i>Thông tin đặt sân
                          </h6>

                          <div className="row">
                            <div className="col-sm-6 mb-2">
                              <small className="text-muted">Loại đặt sân:</small>
                              <div>
                                <span className={getBookingTypeClass(bookingDetail.bookingType)}>
                                  {bookingDetail.bookingType === 'PERMANENT' ? 'Đặt cố định' : 'Đặt lẻ'}
                                </span>
                              </div>
                            </div>
                            <div className="col-sm-6 mb-2">
                              <small className="text-muted">Tên sân:</small>
                              <div>
                                <span >
                                  {bookingDetail.fieldName}
                                </span>
                              </div>
                            </div>

                            <div className="col-sm-6 mb-2">
                              <small className="text-muted">Trạng thái:</small>
                              <div>
                                <span className={getStatusBadgeClass(bookingDetail.bookingStatus)}>
                                  {bookingDetail.bookingStatus}
                                </span>
                              </div>
                            </div>
                            <div className="col-sm-6 mb-2">
                              <small className="text-muted">Ca chơi:</small>
                              <div className="fw-bold">
                                <i className="bi bi-clock me-1"></i>
                                {bookingDetail.shiftName}
                              </div>
                              <small className="text-success">
                                {bookingDetail.shiftStart} - {bookingDetail.shiftEnd}
                              </small>
                            </div>
                            <div className="col-sm-6 mb-2">
                              <small className="text-muted">Đã thanh toán :</small>
                              <div className="fw-bold text-danger">
                                <i className="bi bi-cash-coin me-1"></i>
                                {new Intl.NumberFormat('vi-VN').format(bookingDetail.price)}₫
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date Info */}
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body py-2">
                          <h6 className="card-title text-secondary mb-2">
                            <i className="bi bi-calendar3 me-2"></i>Thời gian
                          </h6>
                          {bookingDetail.bookingType === 'PERMANENT' ? (
                            <div className="row">
                              <div className="col-sm-4 mb-2">
                                <small className="text-muted">Từ ngày:</small>
                                <div className="fw-bold text-success" style={{ color: '#55ce63' }}>{bookingDetail.startDate}</div>
                              </div>
                              <div className="col-sm-4 mb-2">
                                <small className="text-muted">Đến ngày:</small>
                                <div className="fw-bold text-success" style={{ color: '#55ce63' }}>{bookingDetail.endDate}</div>
                              </div>

                            </div>
                          ) : (
                            <div>
                              <small className="text-muted">Ngày chơi:</small>
                              <div className="fw-bold text-success" style={{ color: '#55ce63' }}>
                                <i className="bi bi-calendar-day me-1"></i>
                                {bookingDetail.playDate}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {bookingDetail.note && (
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body py-2">
                            <h6 className="card-title text-secondary mb-2">
                              <i className="bi bi-journal-text me-2"></i>Ghi chú
                            </h6>
                            <p className="mb-0 fst-italic">{bookingDetail.note}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => window.print()}
                  style={{ backgroundColor: '#55ce63', borderColor: '#47b754' }}
                >
                  <i className="bi bi-printer me-1"></i>
                  In thông tin
                </button>
                {bookingDetail.bookingStatus === 'Chờ xác nhận' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ backgroundColor: '#55ce63', borderColor: '#47b754' }}
                    onClick={() => alert('Tính năng đang phát triển')}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    Xác nhận đặt sân
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="modal-body text-center py-5">
              <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3"></i>
              <h5 className="text-muted">
                {error || 'Không có dữ liệu!'}
              </h5>
              <p className="text-muted">
                {error ? 'Vui lòng thử lại sau.' : 'Không thể tải thông tin đặt sân. Vui lòng thử lại.'}
              </p>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closeModal}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OwnerBookingCalendar;
