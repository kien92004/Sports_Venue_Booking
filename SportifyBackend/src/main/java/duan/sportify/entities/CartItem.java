
package duan.sportify.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cart_items")

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cartItemId;

    @ManyToOne
    @JoinColumn(name = "cartid", nullable = false)
    @JsonIgnore
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "productid", nullable = false)
    @JsonIgnore
    private Products product;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double price;

    private Double discountprice;
    @Transient
    private String productName;

    @Transient
    private String image;
}
