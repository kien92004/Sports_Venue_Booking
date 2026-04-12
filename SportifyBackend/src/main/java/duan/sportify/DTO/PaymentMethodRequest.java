package duan.sportify.DTO;

import lombok.*;

@Data
public class PaymentMethodRequest {
    private Long userId;
    private String provider;
    private String cardLast4;
    private String cardHolderName;
    private Integer expMonth;
    private Integer expYear;
}
