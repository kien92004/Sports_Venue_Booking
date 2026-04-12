package duan.sportify.rest.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.GlobalExceptionHandler;
import duan.sportify.DTO.booking.BookingDetailDTO;
import duan.sportify.dao.BookingDetailDAO;
import duan.sportify.entities.Bookingdetails;
import duan.sportify.service.BookingService;
import duan.sportify.service.FieldService;
import duan.sportify.service.ShiftService;
import duan.sportify.utils.ErrorResponse;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/rest/bookingdetails/")
public class BookingDetailRestController {
	@Autowired
	MessageSource messagesource;
	@Autowired
	BookingDetailDAO bookingDetailDAO;
	@Autowired
	ShiftService shiftService;
	@Autowired
	FieldService fieldService;
	@Autowired
	BookingService bookingService;

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
		return GlobalExceptionHandler.handleValidationException(ex);
	}

	@GetMapping("{bookingid}")
	public ResponseEntity<Map<String, Object>> getBookingDetails(@PathVariable("bookingid") Integer bookingid) {
		List<BookingDetailDTO> permanentBookings = bookingService.getBookingDetail(bookingid);

		List<Bookingdetails> bookingDetail = bookingDetailDAO.detailBooking(bookingid);
		Map<String, Object> response = new HashMap<>();
		response.put("bookingPermanent", permanentBookings);
		response.put("bookingDetail", bookingDetail);
		return ResponseEntity.ok(response);
	}
}
