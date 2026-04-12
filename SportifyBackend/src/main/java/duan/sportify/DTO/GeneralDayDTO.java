package duan.sportify.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeneralDayDTO {
    private String bookingDate; // Ngày
    private Integer oneTimeBookings; // Số lượt booking 1 lần
    private Integer permanentBookings; // Số lượt booking cố định
    private Integer totalBookings; // Tổng số booking
    private Long totalRevenue; // Tổng doanh thu

}
