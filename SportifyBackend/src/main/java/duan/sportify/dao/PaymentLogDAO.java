package duan.sportify.dao;

import duan.sportify.entities.PaymentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaymentLogDAO extends JpaRepository<PaymentLog, Long> {
    @Query("SELECT p FROM PaymentLog p ORDER BY p.logDate DESC")
    List<PaymentLog> findAllOrderByDateDesc();
}
