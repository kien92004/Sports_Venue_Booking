package duan.sportify.entities;


import javax.persistence.*;
import lombok.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.*;

@Entity
@Table(name = "voucher_of_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherOfUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username")
    private String username;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucherid", referencedColumnName = "voucherid", nullable = false)
    private Voucher voucherid;


    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
}
