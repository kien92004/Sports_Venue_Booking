package duan.sportify.DTO.booking;

import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.NoArgsConstructor;
import lombok.Data;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDetailDTO {
    private Integer bookingId;
    private String username;
    private String phone;
    private String note;
    private String bookingStatus;
    private String bookingType;

    private String fieldName;
    private String fieldImage;

    private String shiftName;
    private LocalTime shiftStart;   // tách rõ thay vì String
    private LocalTime shiftEnd;     // ví dụ: 07:00 - 09:00

    private Double price;
    private LocalDate playDate;     // ONCE
    private LocalDate startDate;    // PERMANENT
    private LocalDate endDate;      // PERMANENT
    private Integer dayOfWeek;      // PERMANENT
}

