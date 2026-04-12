package duan.sportify.service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import duan.sportify.DTO.ShiftDTO;
import duan.sportify.DTO.booking.BookingDetailDTO;
import duan.sportify.DTO.booking.BookingEventDTO;
import duan.sportify.entities.Bookings;

@SuppressWarnings("unused")
public interface BookingService {
	List<Bookings> findAll();

	Bookings createBooking(String username, Double bookingprice, String phone,
			String note, int shiftid, int fieldid, Date playdate, Double priceField);

	Bookings createBookingPermanent(String username, Double bookingprice, String phone,
			String note, List<ShiftDTO> shifts,
			Integer fieldId, Double priceField,
			LocalDate start_date, LocalDate end_date);

	Bookings create(Bookings bookings);

	Bookings update(Bookings bookings);

	void delete(Integer id);

	Bookings findByBookingid(Integer id);

	List<Object[]> getBookingInfoByUsername(String username);

	List<Object[]> getPermanentBookingByBookingId(Integer bookingId);

	List<Object[]> getBookingInfoByBookingDetail(Integer bookingid);

	int countBooking();

	List<BookingEventDTO> getCalendarEvents();

	List<BookingEventDTO> getCalendarEventsField(Integer fieldId);

	List<BookingDetailDTO> getBookingDetail(Integer bookingId);

	int countUserBookingsToday(String username);

	boolean existsBookingDetail(Integer fieldId, Integer shiftId, Date playDate);

	boolean existsOverlappingPermanentBooking(
			Integer fieldId,
			Integer shiftId,
			Integer dayOfWeek,
			LocalDate startDate,
			LocalDate endDate);
}
