package duan.sportify.DTO.booking;

import java.util.Date;

import lombok.Data;

@Data
public class CreateBookingRequestDTO {
    private String username;
    private Double amount;
    private String phone;
    private String note;
    private Integer shiftId;
    private Integer fieldId;
    private Date playdate;
    private Double pricefield;
}
