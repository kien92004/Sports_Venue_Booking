package duan.sportify.DTO.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FieldTotalBookingsDTO {
    private Integer fieldId;
    private String fieldName;
    private String fieldImage;

    private Long totalBookings7Day;
    private Long totalBookings3Day;
    private Long totalBookings1Day;
}
