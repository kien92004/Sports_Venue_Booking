package duan.sportify.rest.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.DTO.booking.BookingDetailDTO;
import duan.sportify.DTO.booking.BookingEventDTO;
import duan.sportify.service.BookingService;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RequestMapping("api/rest/calander")
@RestController
@RequiredArgsConstructor
public class CalendarController {
    private final BookingService calendarService;

    @GetMapping
    public List<BookingEventDTO> getCalendar() {
        return calendarService.getCalendarEvents();
    }

    @GetMapping("/field/{fieldId}")
    public List<BookingEventDTO> getCalendarField(@PathVariable Integer fieldId) {
        return calendarService.getCalendarEventsField(fieldId);
    }

    @GetMapping("/{bookingId}")
    public List<BookingDetailDTO> getBookingDetail(@PathVariable Integer bookingId) {
        return calendarService.getBookingDetail(bookingId);
    }
}

// table booking
// :bookingid,username,bookingdate,bookingprice,phone,note,bookingstatus,booking_type
// table bookingdetail:
// bookingdetailid,bookingid,fieldid,starttime,endtime,price,status
// table field: fieldid,fieldname,fieldtype,fieldstatus,description,location,
