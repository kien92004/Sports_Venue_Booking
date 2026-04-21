package duan.sportify.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.DTO.PermanentPaymentRequest;
import duan.sportify.DTO.ShiftDTO;
import duan.sportify.service.BookingService;

@RestController
@RequestMapping("/api/user/test-booking")
public class test {

    private final BookingService bookingService;

    public test(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/check-conflict")
    public ResponseEntity<?> checkBookingConflict(
            @RequestBody PermanentPaymentRequest body) {

        // 👉 CASE 1: PERMANENT BOOKING
        if (body.getShifts() != null && !body.getShifts().isEmpty()) {

            for (ShiftDTO shift : body.getShifts()) {

                boolean conflict = bookingService
                        .existsOverlappingPermanentBooking(
                                body.getFieldid(),
                                shift.getShiftId(),
                                shift.getDayOfWeek(),
                                body.getStartDate(),
                                body.getEndDate());

                if (conflict) {
                    return ResponseEntity
                            .status(HttpStatus.CONFLICT) // 409
                            .body(
                                    Map.of(
                                            "message",
                                            "Sân đã được người khác đặt, vui lòng chọn sân khác hoặc khung giờ khác."));
                }
            }
        }
        // 👉 CASE 2: BOOKING THEO NGÀY (ONCE)
        else {
            java.util.Date expiryTime = new java.util.Date(System.currentTimeMillis() - 15 * 60 * 1000);
            boolean booked = bookingService.existsActiveBookingDetail(
                    body.getFieldid(),
                    body.getShiftId(),
                    body.getPlaydate(),
                    expiryTime);

            if (booked) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT) // 409
                        .body(
                                Map.of(
                                        "message",
                                        "Sân đã được người khác đặt, vui lòng chọn sân khác hoặc khung giờ khác."));
            }
        }

        // ✅ KHÔNG TRÙNG
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Khung giờ hợp lệ, không có xung đột."));
    }
}
