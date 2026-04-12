package duan.sportify.DTO.APIOutside;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ForecastResult {
    private int fieldId;
    private String fieldName;
    private String date;
    private double predictedBookings;
}
