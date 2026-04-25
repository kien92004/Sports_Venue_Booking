package duan.sportify.dao;

import duan.sportify.entities.PaymentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface PaymentLogDAO extends JpaRepository<PaymentLog, Long> {
    @Query("SELECT p FROM PaymentLog p ORDER BY p.logDate DESC")
    List<PaymentLog> findAllOrderByDateDesc();

    @Query("SELECT p FROM PaymentLog p WHERE p.content LIKE %:orderId%")
    List<PaymentLog> findByContentContaining(String orderId);

    @Query("SELECT p FROM PaymentLog p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PaymentLog> findByContentKeywordIgnoreCase(@Param("keyword") String keyword);

    @Query("SELECT p FROM PaymentLog p WHERE p.transferAmount BETWEEN :minAmount AND :maxAmount AND p.logDate >= :since ORDER BY p.logDate DESC")
    List<PaymentLog> findRecentByAmountRange(@Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            @Param("since") Date since);
}
