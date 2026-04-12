package duan.sportify.DTO.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductManagerDTO {
    private Integer productId;
    private String productName;
    private String image;
    private Double price;
    private Long quantitySold;
}
