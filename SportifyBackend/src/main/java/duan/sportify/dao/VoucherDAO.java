package duan.sportify.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import duan.sportify.entities.Voucher;

public interface VoucherDAO extends JpaRepository<Voucher, String> {
	// lọc danh sách vc còn hạn
	@Query(value = "SELECT *\r\n"
			+ "FROM voucher\r\n"
			+ "WHERE enddate >= CURDATE() and startdate <=  CURDATE();", nativeQuery = true)
	List<Voucher> fillActive();

	// lọc danh sách vc hết hạn
	@Query(value = "SELECT *\r\n"
			+ "FROM voucher\r\n"
			+ "WHERE enddate < CURDATE();", nativeQuery = true)
	List<Voucher> fillInActive();

	// lọc danh sách vc áp dụng
	@Query(value = "SELECT *\r\n"
			+ "FROM voucher\r\n"
			+ "WHERE enddate > CURDATE() and startdate >  CURDATE();", nativeQuery = true)
	List<Voucher> fillWillActive();
	
	@Query("Select v From Voucher v Where v.voucherid = :voucherid")
	Voucher findByVoucherId(@Param("voucherid")  String voucherid);

	@Query("SELECT v FROM Voucher v WHERE v.id = ?1")
	Optional<Voucher> findById(String id);

	@Query(value = "SELECT discountpercent FROM voucher "
			+ "WHERE voucherid = :voucherId "
			+ "AND startdate <= CURDATE() "
			+ "AND enddate >= CURDATE() "
			+ "LIMIT 1", nativeQuery = true)
	Integer findActiveDiscountPercent(@Param("voucherId") String voucherId);

}
