package duan.sportify.DTO.order;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesReportDTO {
    private List<ProductManagerDTO> productSales;
    private Long totalQuantitySold;
    private String period; // "day" or "month"
    private String date; // The date or month for which the report is generated
}
