import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import BookingDetailModal from '../../components/admin/BookingDetailModal';
import getImageUrl from '../../helper/getImageUrl';
import './../../styles/FieldCalendar.css';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

// Đăng ký các component của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);



// Interface cho dữ liệu booking
interface BookingData {
  bookingId: number;
  title: string;
  shiftName: string;
  start: string;
  end: string;
  dayOfWeek: number | null;
  customerName?: string;
  customerPhone?: string;
  bookingStatus: string;
  type: string;
}

interface SportType {
  sporttypeid: string;
  categoryname: string;
}
interface FieldInfo {
  fieldid: number;
  namefield: string;
  sporttype: SportType;
  image: string;
}


// Component chính cho quản lý lịch sân
const ManagerFieldActiveDetail: React.FC = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [fieldInfo, setFieldInfo] = useState<FieldInfo | null>(null);
  const [chartFilter, setChartFilter] = useState<'week' | 'month' | 'all'>('week');


  // Lấy giờ bắt đầu/kết thúc từ dữ liệu booking (fallback nếu shiftName khó parse)
  const getTimeInfoFromBooking = (booking: BookingData) => {
    const formatTime = (date: Date) => `${date.getHours().toString().padStart(2, '0')}H${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const parseFromShiftName = () => {
      if (!booking.shiftName) return null;
      const match = booking.shiftName.match(/(\d{1,2})[:H](\d{2}).*?(\d{1,2})[:H](\d{2})/);
      if (!match) return null;
      const [startHour, startMinute, endHour, endMinute] = match.slice(1).map(Number);
      const normalize = (hour?: number, minute?: number) =>
        `${(hour ?? 0).toString().padStart(2, '0')}H${(minute ?? 0)
          .toString()
          .padStart(2, '0')}`;
      return {
        startTime: normalize(startHour, startMinute),
        endTime: normalize(endHour, endMinute),
      };
    };

    try {
      const start = new Date(booking.start);
      const end = new Date(booking.end);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return parseFromShiftName();
      }

      return {
        startTime: formatTime(start),
        endTime: formatTime(end),
      };
    } catch (error) {
      console.error('Cannot parse booking time', booking, error);
      return parseFromShiftName();
    }
  };

  // Tính toán dữ liệu cho biểu đồ ca đặt
  const getShiftBookingStats = () => {
    const shiftCounts: { [key: string]: number } = {};
    const now = new Date();

    // Tính toán khoảng thời gian filter
    let startDate: Date | null = null;
    let endDate: Date = new Date(now);

    if (chartFilter === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (chartFilter === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }
    // chartFilter === 'all' thì startDate = null (không filter)

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.start);

      // Kiểm tra booking có trong khoảng thời gian filter không
      if (startDate && bookingDate < startDate) return;
      if (bookingDate > endDate) return;

      const timeInfo = getTimeInfoFromBooking(booking);
      if (timeInfo) {
        const shiftKey = `${timeInfo.startTime}-${timeInfo.endTime}`;
        shiftCounts[shiftKey] = (shiftCounts[shiftKey] || 0) + 1;
      }
    });

    // Sắp xếp theo thời gian
    const sortedShifts = Object.entries(shiftCounts).sort((a, b) => {
      const timeA = parseInt(a[0].split('H')[0]);
      const timeB = parseInt(b[0].split('H')[0]);
      return timeA - timeB;
    });

    return {
      labels: sortedShifts.map(([shift]) => shift),
      data: sortedShifts.map(([, count]) => count)
    };
  };

  // Tính toán dữ liệu cho biểu đồ lượt đặt sân theo ngày
  const getDateBookingStats = () => {
    const dateCounts: { [key: string]: number } = {};
    const now = new Date();

    // Tính toán khoảng thời gian filter
    let filterStartDate: Date | null = null;
    let filterEndDate: Date = new Date(now);

    if (chartFilter === 'week') {
      filterStartDate = new Date(now);
      filterStartDate.setDate(now.getDate() - 7);
    } else if (chartFilter === 'month') {
      filterStartDate = new Date(now);
      filterStartDate.setMonth(now.getMonth() - 1);
    }

    bookings.forEach(booking => {
      if (booking.type === 'ONCE') {
        const date = new Date(booking.start);

        // Kiểm tra booking có trong khoảng thời gian filter không
        if (filterStartDate && date < filterStartDate) return;
        if (date > filterEndDate) return;

        const dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      } else if (booking.type === 'PERMANENT') {
        // Với booking cố định, đếm số tuần trong khoảng thời gian
        const startDate = new Date(booking.start);
        const endDate = new Date(booking.end);
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weeksCount = Math.ceil(daysDiff / 7);

        for (let i = 0; i < weeksCount; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + (i * 7));

          if (currentDate <= endDate) {
            // Kiểm tra currentDate có trong khoảng thời gian filter không
            if (filterStartDate && currentDate < filterStartDate) continue;
            if (currentDate > filterEndDate) continue;

            const dateKey = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
            dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
          }
        }
      }
    });

    // Sắp xếp theo ngày
    const sortedDates = Object.entries(dateCounts).sort((a, b) => {
      const [dayA, monthA] = a[0].split('/').map(Number);
      const [dayB, monthB] = b[0].split('/').map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    });

    return {
      labels: sortedDates.map(([date]) => date),
      data: sortedDates.map(([, count]) => count)
    };
  };

  // Dữ liệu cho biểu đồ ca đặt (Bar Chart)
  const shiftStats = getShiftBookingStats();
  const shiftChartData = {
    labels: shiftStats.labels,
    datasets: [
      {
        label: 'Số lượng',
        data: shiftStats.data,
        backgroundColor: 'rgba(255, 182, 193, 0.8)',
        borderColor: 'rgba(255, 105, 135, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ lượt đặt sân (Line Chart)
  const dateStats = getDateBookingStats();
  const dateChartData = {
    labels: dateStats.labels,
    datasets: [
      {
        label: 'Số lượt đặt',
        data: dateStats.data,
        borderColor: 'rgba(255, 105, 135, 1)',
        backgroundColor: 'rgba(255, 182, 193, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };


  // Tạo danh sách các ca từ 4:00 đến 00:00
  const timeSlots = [
    '04H00-05H00', '05H00-06H00', '06H00-07H00', '07H00-08H00',
    '08H00-09H00', '09H00-10H00', '10H00-11H00', '11H00-12H00',
    '12H00-13H00', '13H00-14H00', '14H00-15H00', '15H00-16H00',
    '16H00-17H00', '17H00-18H00', '18H00-19H00', '19H00-20H00',
    '20H00-21H00', '21H00-22H00', '22H00-23H00', '23H00-00H00'
  ];


  // Lấy danh sách ngày trong tuần
  const getWeekDays = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Bắt đầu từ thứ 2
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);

  // Tìm index của cột thời gian trong timeSlots
  const findTimeSlotIndex = (time: string) => {
    // Xử lý trường hợp đặc biệt: 00H00 = 24H00 (cuối ngày)
    if (time === '00H00') {
      return timeSlots.length; // Vị trí sau slot cuối cùng
    }
    const index = timeSlots.findIndex(slot => slot.startsWith(time));
    return index;
  };

  // Kiểm tra booking có nằm trong khoảng thời gian của slot không
  const isBookingInTimeRange = (booking: BookingData, date: Date) => {
    const bookingStart = new Date(booking.start);
    const bookingEnd = new Date(booking.end);

    const timeInfo = getTimeInfoFromBooking(booking);
    if (!timeInfo) return null;

    // Xử lý theo loại booking
    if (booking.type === 'ONCE') {
      const bookingDate = new Date(bookingStart.getFullYear(), bookingStart.getMonth(), bookingStart.getDate());
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const isSameDate = bookingDate.getTime() === checkDate.getTime();

      return isSameDate ? timeInfo : null;

    } else if (booking.type === 'PERMANENT') {
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDateOnly = new Date(bookingStart.getFullYear(), bookingStart.getMonth(), bookingStart.getDate());
      const endDateOnly = new Date(bookingEnd.getFullYear(), bookingEnd.getMonth(), bookingEnd.getDate());

      const isInDateRange = targetDate >= startDateOnly && targetDate <= endDateOnly;

      // Xử lý dayOfWeek (1=Monday, 7=Sunday, 8=Monday của tuần sau?)
      let targetDayOfWeek = booking.dayOfWeek;

      // Nếu dayOfWeek là null, tự động tính từ ngày start
      if (targetDayOfWeek === null || targetDayOfWeek === undefined) {
        targetDayOfWeek = bookingStart.getDay() === 0 ? 7 : bookingStart.getDay();
      }

      if (targetDayOfWeek === 8) targetDayOfWeek = 1; // 8 = Monday

      const currentDayOfWeek = targetDate.getDay() === 0 ? 7 : targetDate.getDay(); // Convert Sunday to 7
      const isMatchingDay = currentDayOfWeek === targetDayOfWeek;

      return (isInDateRange && isMatchingDay) ? timeInfo : null;
    }

    return null;
  };

  // Fetch dữ liệu từ API
  const fetchBookings = async () => {
    if (!fieldId) return;

    setLoading(true);

    try {
      // 🔥 chạy song song 2 API cho nhanh
      const [fieldRes, bookingRes] = await Promise.all([
        fetch(`${URL_BACKEND}/rest/fields/get/${fieldId}`),
        fetch(`${URL_BACKEND}/api/rest/calander/field/${fieldId}`)
      ]);

      if (!fieldRes.ok || !bookingRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const fieldData: FieldInfo = await fieldRes.json();
      const bookingData = await bookingRes.json();

      const normalizedBookings: BookingData[] = (bookingData || []).map((item: any) => {
        const parsedDay = Number(item?.dayOfWeek);
        return {
          ...item,
          dayOfWeek: Number.isNaN(parsedDay) ? null : parsedDay,
        };
      });

      // ✅ set state
      setFieldInfo(fieldData);
      setBookings(normalizedBookings);

    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchBookings();
  }, [fieldId]);

  // Tìm booking cho ngày và ca cụ thể - phiên bản mới
  const getBookingForSlot = (date: Date, timeSlot: string) => {
    return bookings.find(booking => {
      const timeInfo = isBookingInTimeRange(booking, date);
      if (!timeInfo) return false;

      // Tìm index của startTime và endTime trong timeSlots
      const startIndex = findTimeSlotIndex(timeInfo.startTime);
      const endIndex = findTimeSlotIndex(timeInfo.endTime);
      const currentIndex = timeSlots.indexOf(timeSlot);

      if (startIndex === -1 || endIndex === -1 || currentIndex === -1) {
        return false;
      }

      // Booking nằm trong khoảng từ startIndex đến endIndex-1
      return currentIndex >= startIndex && currentIndex < endIndex;
    });
  };

  // Kiểm tra có phải ô đầu tiên của booking span không
  const isFirstSlotOfBooking = (date: Date, timeSlot: string, booking: BookingData) => {
    const timeInfo = isBookingInTimeRange(booking, date);
    if (!timeInfo) return false;

    const startIndex = findTimeSlotIndex(timeInfo.startTime);
    const currentIndex = timeSlots.indexOf(timeSlot);

    return currentIndex === startIndex;
  };

  // Tính số cột mà booking sẽ span
  const getBookingSpan = (booking: BookingData, date: Date) => {
    const timeInfo = isBookingInTimeRange(booking, date);
    if (!timeInfo) return 1;

    const startIndex = findTimeSlotIndex(timeInfo.startTime);
    const endIndex = findTimeSlotIndex(timeInfo.endTime);

    if (startIndex === -1 || endIndex === -1) {
      return 1;
    }

    return endIndex - startIndex;
  };

  // Xử lý click vào ô lịch
  const handleSlotClick = (date: Date, timeSlot: string) => {
    const booking = getBookingForSlot(date, timeSlot);
    if (booking) {
      setSelectedBookingId(booking.bookingId);
      setIsModalOpen(true);
    }
  };

  // Chuyển tuần
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Format ngày hiển thị
  const formatDate = (date: Date) => {
    const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[date.getDay()];
    const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
    return `${dayName} (${dateStr})`;
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="field-calendar-container page-wrapper">
      <div className=" bg-white rounded shadow-sm  p-4">
        <div className="calendar-header">
          <div className="field-info">
            <div className="field-image-small">
              <img
                src={getImageUrl(fieldInfo?.image ?? null)}
                alt={fieldInfo?.namefield ?? ""}
                className="img-fluid rounded"
              />
            </div>
            <div className="field-details">
              <h2>{fieldInfo?.namefield}</h2>
              <p><b>Thể loại : </b> {fieldInfo?.sporttype?.categoryname}</p>
              <p>Quản lí chi tiết sân</p>
            </div>
          </div>
          <div className="week-navigation">
            <button onClick={() => navigateWeek('prev')} className="nav-btn">Trước</button>
            <button onClick={() => navigateWeek('next')} className="nav-btn">Sau</button>
          </div>
        </div>


        {/* Chú thích màu sắc */}
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
          <div className="legend-item ">
            <div className="legend-color ribbon-shape" style={{ backgroundColor: '#dc3545' }}></div>
            <span>Đã Cọc</span>
          </div>
          <div className="legend-item">
            <div className="legend-color ribbon-shape" style={{ backgroundColor: '#ffc107' }}></div>
            <span>Hoàn Thành</span>
          </div>
          <div className="legend-item ">
            <div className="legend-color ribbon-shape" style={{ backgroundColor: '#6c757d' }}></div>
            <span>Đã Hủy</span>
          </div>
        </div>

        <div className="calendar-table-container">
          <table className="calendar-table">
            <thead>
              <tr>
                <th className="time-header"></th>
                {timeSlots.map(slot => (
                  <th key={slot} className="time-slot-header">
                    {slot.split('-')[0]}
                  </th>
                ))}
              </tr>

            </thead>
            <tbody>
              {weekDays.map((day, dayIndex) => (
                <tr key={dayIndex}>
                  <td className="day-header">
                    {formatDate(day)}
                  </td>
                  {timeSlots.map((slot, slotIndex) => {
                    const booking = getBookingForSlot(day, slot);

                    // Nếu có booking và đây là ô đầu tiên của booking
                    if (booking && isFirstSlotOfBooking(day, slot, booking)) {
                      const span = getBookingSpan(booking, day);

                      return (
                        <td
                          key={`${dayIndex}-${slotIndex}`}
                          className={`time-slot `}
                          colSpan={span}
                          onClick={() => handleSlotClick(day, slot)}
                          title={`${booking.title} - ${booking.shiftName}`}
                          style={{ position: 'relative' }}
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

                            <div className={`booking-tag ${booking.type === 'PERMANENT' ? 'permanent' : booking.type === 'ONCE' ? 'once' : 'temporary'}`}>
                              {booking.customerName && <div style={{ fontSize: '0.7em', marginTop: '2px' }}>{booking.customerName}</div>}
                              {booking.customerPhone && <div style={{ fontSize: '0.7em', marginTop: '1px' }}>{booking.customerPhone}</div>}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Nếu có booking nhưng không phải ô đầu tiên (sẽ bị skip bởi colSpan)đ
                    if (booking && !isFirstSlotOfBooking(day, slot, booking)) {
                      return null; // Không render vì đã được merge bởi colSpan
                    }

                    // Ô trống
                    return (
                      <td
                        key={`${dayIndex}-${slotIndex}`}
                        className="time-slot available"
                        onClick={() => handleSlotClick(day, slot)}
                        title="Trống"
                      >
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Biểu đồ */}

        {/* Bộ lọc biểu đồ */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px',
          marginBottom: '10px'
        }}>
          <button
            onClick={() => setChartFilter('week')}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: chartFilter === 'week' ? '2px solid #d97c8a' : '1px solid #ddd',
              backgroundColor: chartFilter === 'week' ? 'rgba(255, 182, 193, 0.2)' : 'white',
              color: chartFilter === 'week' ? '#d97c8a' : '#666',
              fontWeight: chartFilter === 'week' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Tuần này
          </button>
          <button
            onClick={() => setChartFilter('month')}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: chartFilter === 'month' ? '2px solid #d97c8a' : '1px solid #ddd',
              backgroundColor: chartFilter === 'month' ? 'rgba(255, 182, 193, 0.2)' : 'white',
              color: chartFilter === 'month' ? '#d97c8a' : '#666',
              fontWeight: chartFilter === 'month' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Tháng này
          </button>
          <button
            onClick={() => setChartFilter('all')}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: chartFilter === 'all' ? '2px solid #d97c8a' : '1px solid #ddd',
              backgroundColor: chartFilter === 'all' ? 'rgba(255, 182, 193, 0.2)' : 'white',
              color: chartFilter === 'all' ? '#d97c8a' : '#666',
              fontWeight: chartFilter === 'all' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Tất cả
          </button>
        </div>

        {/* Biểu đồ thống kê */}
        <div style={{

          gap: '20px',
          marginBottom: '30px',
          marginTop: '20px'
        }}>
          {/* Biểu đồ ca đặt */}
          <div style={{
            backgroundColor: 'rgba(255, 182, 193, 0.1)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 182, 193, 0.3)'
          }}>
            <h4 style={{
              textAlign: 'center',
              marginBottom: '15px',
              color: '#d97c8a',
              fontSize: '16px',
              fontWeight: 600
            }}>Biểu đồ ca đặt</h4>
            <div style={{
              height: '300px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bar data={shiftChartData} options={chartOptions} />
            </div>
            <p style={{
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '13px',
              color: '#666',
              fontStyle: 'italic'
            }}>Tên ca</p>
          </div>
          <br />

          {/* Biểu đồ lượt đặt sân */}
          <div style={{
            backgroundColor: 'rgba(255, 182, 193, 0.1)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 182, 193, 0.3)'
          }}>
            <h4 style={{
              textAlign: 'center',
              marginBottom: '15px',
              color: '#d97c8a',
              fontSize: '16px',
              fontWeight: 600
            }}>Biểu đồ lượt đặt sân</h4>
            <div style={{
              height: '300px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Line data={dateChartData} options={chartOptions} />
            </div>
            <p style={{
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '13px',
              color: '#666',
              fontStyle: 'italic'
            }}>ngày</p>
          </div>
        </div>

        <BookingDetailModal
          bookingId={selectedBookingId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBookingId(null);
          }}
        />
      </div>

    </div>
  );
};

export default ManagerFieldActiveDetail;
