package duan.sportify.rest.controller;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.GlobalExceptionHandler;
import duan.sportify.DTO.booking.CreateBookingRequestDTO;
import duan.sportify.DTO.booking.CreatePermanentBookingRequestDTO;
import duan.sportify.dao.BookingDAO;
import duan.sportify.dao.FieldDAO;
import duan.sportify.dao.FieldOwnerRegistrationDAO;
import duan.sportify.entities.Bookingdetails;
import duan.sportify.entities.Bookings;
import duan.sportify.entities.PermanentBooking;
import duan.sportify.service.BookingService;
import duan.sportify.utils.ErrorResponse;

@RestController
@RequestMapping("/rest/bookings/")
public class BookingRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	BookingDAO bookingDAO;
	@Autowired
	FieldDAO fieldDAO;
	@Autowired
	FieldOwnerRegistrationDAO fieldOwnerDAO;
	@Autowired
	private BookingService bookingService;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("getAll")
	public ResponseEntity<List<Bookings>> getAll(Model model) {
		return ResponseEntity.ok(bookingDAO.findAllBooking());
	}

	@PostMapping("/create")
	public ResponseEntity<?> createBooking(
			@RequestBody CreateBookingRequestDTO body,
			HttpServletRequest request) {

		Bookings booking = bookingService.createBooking(
				body.getUsername(),
				body.getAmount(),
				body.getPhone(),
				body.getNote(),
				body.getShiftId(),
				body.getFieldId(),
				body.getPlaydate(),
				body.getPricefield());

		return ResponseEntity.ok(booking);
	}

	@PostMapping("/create-permanent")
	public ResponseEntity<?> createBookingPermanent(
			@RequestBody CreatePermanentBookingRequestDTO body,
			HttpServletRequest request) {

		Bookings booking = bookingService.createBookingPermanent(
				body.getUsername(),
				body.getAmount(),
				body.getPhone(),
				body.getNote(),
				body.getShifts(),
				body.getFieldId(),
				body.getPricefield(),
				body.getStartDate(),
				body.getEndDate());

		return ResponseEntity.ok(booking);
	}

	@GetMapping("get/{id}")
	public ResponseEntity<Bookings> getOne(@PathVariable("id") Integer id) {
		if (!bookingDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(bookingDAO.findById(id).get());
	}

	@Transactional
	@PutMapping("update/{id}")
	public ResponseEntity<Bookings> update(@PathVariable("id") Integer id, @Valid @RequestBody Bookings booking) {
		if (!bookingDAO.existsById(id)) {
			return ResponseEntity.notFound().build();
		}

		booking.setBookingid(id); // đảm bảo Hibernate biết đây là update
		bookingDAO.save(booking);

		return ResponseEntity.ok(booking);
	}

	// search
	@GetMapping("/search")
	public ResponseEntity<List<Bookings>> search(
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "datebook", required = false) String datebookStr,
			@RequestParam(value = "status", required = false) String status) {

		keyword = (keyword != null && keyword.trim().isEmpty()) ? null : keyword;
		status = (status != null && status.trim().isEmpty()) ? null : status;

		Date datebook = null;
		if (datebookStr != null && !datebookStr.trim().isEmpty()) {
			datebook = Date.valueOf(datebookStr); // format yyyy-MM-dd
		}

		return ResponseEntity.ok(bookingDAO.findByFlexibleConditions(keyword, datebook, status));
	}

	@PostMapping("/deleteMultiple")
	@Transactional
	public ResponseEntity<Void> deleteBookings(@RequestBody List<Integer> bookingIds) {
		System.out.println("Deleting bookings with IDs: " + bookingIds);
		bookingDAO.deleteBookingDetailsByBookingIds(bookingIds);
		bookingDAO.deletePermanentBookingByBookingIds(bookingIds);
		bookingDAO.deleteAllByIdInBatch(bookingIds);
		return ResponseEntity.ok().build();
	}

	// Lấy booking của chủ sân
	@GetMapping("getByOwner/{ownerUsername}")
	public ResponseEntity<List<Bookings>> getBookingsByOwner(@PathVariable("ownerUsername") String ownerUsername) {
		return ResponseEntity.ok(bookingDAO.findBookingsByOwner(ownerUsername));
	}

	// Lấy dữ liệu calendar cho chủ sân
	@GetMapping("calendar/owner/{ownerUsername}")
	public ResponseEntity<List<java.util.Map<String, Object>>> getCalendarByOwner(
			@PathVariable("ownerUsername") String ownerUsername) {
		List<java.util.Map<String, Object>> calendarEvents = new java.util.ArrayList<>();

		// Get bookings for owner
		List<Bookings> bookings = bookingDAO.findBookingsByOwner(ownerUsername);

		for (Bookings booking : bookings) {
			// Handle ONCE bookings
			if ("ONCE".equals(booking.getBookingType())) {
				List<Bookingdetails> details = booking.getListOfBookingdetails();
				if (details != null) {
					for (Bookingdetails detail : details) {
						java.util.Map<String, Object> event = new java.util.HashMap<>();
						event.put("bookingId", booking.getBookingid());
						event.put("type", "ONCE");
						if (detail.getPlaydate() != null && detail.getShifts() != null) {
							String dateStr = new java.text.SimpleDateFormat("yyyy-MM-dd").format(detail.getPlaydate());
							String startTime = detail.getShifts().getStarttime() != null
									? detail.getShifts().getStarttime().toString()
									: "00:00";
							String endTime = detail.getShifts().getEndtime() != null
									? detail.getShifts().getEndtime().toString()
									: "23:59";
							event.put("start", dateStr + "T" + startTime);
							event.put("end", dateStr + "T" + endTime);
							calendarEvents.add(event);
						}
					}
				}
			}
			// Handle PERMANENT bookings
			else if ("PERMANENT".equals(booking.getBookingType())) {
				List<PermanentBooking> permanentBookings = booking.getListOfPermanentBookings();
				if (permanentBookings != null && permanentBookings.size() > 0) {
					PermanentBooking pb = permanentBookings.get(0);
					if (pb.getShift() != null) {
						Integer dayOfWeek = pb.getDayOfWeek();
						LocalDate startDate = pb.getStartDate() != null ? pb.getStartDate() : LocalDate.now();
						LocalDate endDate = pb.getEndDate() != null ? pb.getEndDate() : startDate.plusYears(1);

						String startTime = pb.getShift().getStarttime() != null
								? pb.getShift().getStarttime().toString()
								: "00:00";
						String endTime = pb.getShift().getEndtime() != null ? pb.getShift().getEndtime().toString()
								: "23:59";

						// Generate all dates for this permanent booking
						LocalDate current = startDate;

						while (!current.isAfter(endDate)) {
							if (current.getDayOfWeek().getValue() == dayOfWeek) {
								java.util.Map<String, Object> event = new java.util.HashMap<>();
								event.put("bookingId", booking.getBookingid());
								event.put("type", "PERMANENT");
								event.put("start", current + "T" + startTime);
								event.put("end", current + "T" + endTime);
								calendarEvents.add(event);
							}
							current = current.plusDays(1);
						}
					}
				}
			}
		}

		return ResponseEntity.ok(calendarEvents);
	}

}
