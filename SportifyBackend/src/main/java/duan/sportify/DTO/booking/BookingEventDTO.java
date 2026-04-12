package duan.sportify.DTO.booking;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingEventDTO {
    private Integer bookingId;
    private String title;
    private String shiftName;
    private LocalDateTime start; // ISO datetime
    private LocalDateTime end; // ISO datetime
    private Integer dayOfWeek; // 1=Mon ... 7=Sun, chỉ dùng cho PERMANENT
    private String type; // ONCE hoặc PERMANENT
    private String bookingStatus; // Trạng thái đặt sân
    private String customerName; // Tên khách hàng
    private String customerPhone; // Số điện thoại
    private Integer fieldId; // Mã sân
    private String fieldType; // Loại sân/thể thao
}
