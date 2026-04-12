package duan.sportify.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import duan.sportify.entities.Cart;
import duan.sportify.entities.Products;
import duan.sportify.entities.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Products product);

    void deleteAllByCart(Cart cart);
}