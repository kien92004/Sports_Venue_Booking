package duan.sportify.entities;

import javax.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Table(name = "payment_methods")
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String token; // vnp_token

    @Column(nullable = false, length = 255)
    private String username; // vnp_app_user_id

    @Column(name = "card_number", nullable = false, length = 30)
    private String cardNumber; // masked card number (9704xxxxxx1234)

    @Column(name = "card_type", nullable = false, length = 5)
    private String cardType; // 01 = nội địa, 02 = quốc tế

    @Column(name = "bank_code", nullable = false, length = 20)
    private String bankCode; // NCB, VCB, VISA, ...

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false; // Thẻ mặc định

    @Column(name = "createdAt")
    private LocalDate createdAt; // Thời gian giao dịch tại VNPay


}

