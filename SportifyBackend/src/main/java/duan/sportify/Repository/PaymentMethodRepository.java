package duan.sportify.Repository;

import duan.sportify.entities.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByUsername(String username);
    long countByUsername(String username);
}
