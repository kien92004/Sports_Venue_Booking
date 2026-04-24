package duan.sportify.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "payment_logs")
public class PaymentLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id")
    private Long transactionId; // ID từ SePay

    @Column(name = "gateway")
    private String gateway;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "transaction_date")
    private Date transactionDate;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "content")
    private String content;

    @Column(name = "transfer_amount")
    private Double transferAmount;

    @Column(name = "reference_code")
    private String referenceCode;

    @Column(name = "account_name")
    private String accountName;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "log_date")
    private Date logDate = new Date();
}
