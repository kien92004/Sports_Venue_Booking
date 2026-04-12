package duan.sportify.DTO.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FieldManagerDetailDTO {
    private Integer fieldId;
    private String fieldName;
    private String fieldImage;
    private Double fieldPrice;
    private Long oneTimeBookings;
    private Long permanentBookings;
    private Long totalBookings;
    private Long totalRevenue;
}
