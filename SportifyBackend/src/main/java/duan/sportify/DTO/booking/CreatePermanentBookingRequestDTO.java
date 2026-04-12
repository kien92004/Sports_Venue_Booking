package duan.sportify.DTO.booking;

import java.time.LocalDate;
import java.util.List;

import duan.sportify.DTO.ShiftDTO;
import lombok.Data;

@Data
public class CreatePermanentBookingRequestDTO {
    private String username;
    private Double amount;
    private String phone;
    private String note;
    private List<ShiftDTO> shifts;
    private Integer fieldId;
    private Double pricefield;
    private LocalDate startDate;
    private LocalDate endDate;
}
