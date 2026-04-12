package duan.sportify.DTO;
import lombok.*;

import java.util.Date;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
@Getter
@Setter
@Data
public class PermanentPaymentRequest  {
    private Double amount;
    private Double thanhtien;
    private String phone;
    private String note;
    private Integer fieldid;
    private Double pricefield;
     @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date  playdate;
     @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
     @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    private Integer shiftId;
    private Integer bookingId;
    private String voucherOfUserId;
    private String cardId; 
    private List<ShiftDTO> shifts; // <-- list các cặp (dayOfWeek, shiftId)
}
