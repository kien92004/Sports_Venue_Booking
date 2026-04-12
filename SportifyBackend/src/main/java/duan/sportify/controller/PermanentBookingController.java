package duan.sportify.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import duan.sportify.entities.Field;
import duan.sportify.entities.Users;
import duan.sportify.service.ShiftService;
import duan.sportify.service.FieldService;
import duan.sportify.service.UserService;
import duan.sportify.utils.BookingCalculator;
import duan.sportify.DTO.booking.PermanentBookingRequest;
import duan.sportify.Repository.PermanentBookingRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user/field/permanent-booking")
@RequiredArgsConstructor
public class PermanentBookingController {
    @Autowired
    PermanentBookingRepository shiftRepository;
    @Autowired
    UserService userService;
    @Autowired
    ShiftService shiftservice;
    @Autowired
    FieldService fieldservice;

    List<PermanentBookingRequest.DetailRequest> detailList;
    LocalDate startDate;
    LocalDate endDate;

    @PostMapping("/{idField}")
    public ResponseEntity<?> bookingPermanent(
            @RequestBody PermanentBookingRequest body,
            @PathVariable("idField") Integer idField,
            HttpServletRequest request) {
        // 2. detail
        detailList = body.getDetails();

        // date
        startDate = body.getStartDate();
        endDate = body.getEndDate();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Chuyen sang trang dat san "));

    }

 @GetMapping("/{idField}")
public ResponseEntity<?> previewBookingPermanent(
        @PathVariable("idField") Integer idField,
        HttpServletRequest request) {

    if (detailList == null || startDate == null || endDate == null) {
        return ResponseEntity.badRequest()
                .body(Collections.singletonMap("error", "Chưa có dữ liệu booking permanent"));
    }

    String username = (String) request.getSession().getAttribute("username");
    if (username == null) {
        return ResponseEntity.status(401)
                .body(Collections.singletonMap("redirect", "/sportify/login"));
    }

    Users profile = userService.findByUsername(username);

    List<Field> fieldList = fieldservice.findFieldById(idField);
    if (fieldList.isEmpty()) {
        return ResponseEntity.badRequest()
                .body(Collections.singletonMap("error", "Sân không tồn tại"));
    }

    Field field = fieldList.get(0);

    // map từ detailList sang list dayOfWeek
    List<Integer> dayOfWeeks = detailList.stream()
            .map(PermanentBookingRequest.DetailRequest::getDayOfWeek)
            .toList();

    int totalDay = BookingCalculator.countTotalBookings(startDate, endDate, dayOfWeeks);
    double totalPrice = BookingCalculator.calculateTotalPrice(startDate, endDate, dayOfWeeks, field.getPrice());

    return ResponseEntity.ok(Map.of(
            "user", profile,
            "field", field,
            "startDate", startDate,
            "endDate", endDate,
            "shifts", detailList,
            "totalDay", totalDay,
            "totalPrice", totalPrice
    ));
}
}