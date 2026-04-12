package duan.sportify.dao;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import duan.sportify.entities.Orderdetails;

public interface OrderDetailDAO extends JpaRepository<Orderdetails, Integer> {
    @Query(value = "SELECT * FROM orderdetails where orderid = :orderid", nativeQuery = true)
    List<Orderdetails> detailOrder(@Param("orderid") Integer orderid);

    @Modifying
    @Transactional
    @Query("DELETE FROM Orderdetails d WHERE d.orders.orderid = :orderId")
    void deleteByOrderId(@Param("orderId") Integer orderId);

    @Query(value = "SELECT * FROM orderdetails where orderid = :orderid", nativeQuery = true)
    List<Orderdetails> findByOrderId(@Param("orderid") Integer orderid);

    // Đếm nó lượng order active của user trong hôm nay
    @Query(value = "SELECT COUNT(*) FROM orders o JOIN orderdetails od ON o.orderid = od.orderid "
            + "WHERE o.username = :username AND o.orderstatus = 'Đã Thanh Toán' "
            + "AND DATE(o.createdate) = CURRENT_DATE", nativeQuery = true)
    int countUserBookingsToday(@Param("username") String username);
}
