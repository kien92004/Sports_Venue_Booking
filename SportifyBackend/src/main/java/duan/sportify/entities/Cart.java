package duan.sportify.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import javax.persistence.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
// CartItem đã nằm cùng package, không cần import

@Entity
@Table(name = "cart")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cartid;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String status = "Active"; // Active, CheckedOut

    @Column(nullable = false, updatable = false)
    private Timestamp createdate = new Timestamp(System.currentTimeMillis());

    // Quan hệ 1-n với cart_items
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CartItem> items = new ArrayList<>();
}
