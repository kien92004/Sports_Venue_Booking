package duan.sportify.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import duan.sportify.entities.Shifts;

public interface ShiftDAO extends JpaRepository<Shifts, Integer> {
	@Query(value = "select * from shifts where shifts.shiftid LIKE ?1", nativeQuery = true)
	List<Shifts> findShiftById(Integer id);

	@Query(value = "select * from shifts where nameshift LIKE :name", nativeQuery = true)
	List<Shifts> findShiftByName(String name);

	// Tìm ca trống cho ngày và sân đã chọn
	@Query(value = "SELECT * \r\n" + //
			"FROM shifts s\r\n" + //
			"WHERE s.shiftid NOT IN (\r\n" + //
			"    -- Loại bỏ ca đã đặt lẻ (chỉ ca active hoặc chưa hết hạn thanh toán)\r\n" + //
			"    SELECT bd.shiftid\r\n" + //
			"    FROM bookingdetails bd\r\n" + //
			"    JOIN bookings b ON bd.bookingid = b.bookingid\r\n" + //
			"    WHERE bd.fieldid = :id \r\n" + //
			"      AND bd.playdate = :date\r\n" + //
			"      AND (\r\n" + //
			"          b.bookingstatus IN ('Hoàn Thành', 'Đã Cọc', 'Đã Thanh Toán')\r\n" + //
			"          OR (b.bookingstatus = 'Chưa Thanh Toán' AND b.bookingdate > :expiryTime)\r\n" + //
			"      )\r\n" + //
			")\r\n" + //
			"AND s.shiftid NOT IN (\r\n" + //
			"    -- Loại bỏ ca đã đặt cố định\r\n" + //
			"    SELECT p.shift_id\r\n" + //
			"    FROM permanent_booking p\r\n" + //
			"    JOIN bookings b ON p.booking_id = b.bookingid\r\n" + //
			"    WHERE p.field_id = :id\r\n" + //
			"      AND p.active = true\r\n" + //
			"      AND :date BETWEEN p.start_date AND p.end_date\r\n" + //
			"      AND p.day_of_week = DAYOFWEEK(:date)\r\n" + //
			"      AND (\r\n" + //
			"          b.bookingstatus IN ('Hoàn Thành', 'Đã Cọc', 'Đã Thanh Toán')\r\n" + //
			"          OR (b.bookingstatus = 'Chưa Thanh Toán' AND b.bookingdate > :expiryTime)\r\n" + //
			"      )\r\n" + //
			")\r\n" + //
			"", nativeQuery = true)
	List<Shifts> findShiftDate(@Param("id") Integer id, @Param("date") String date, @Param("expiryTime") java.util.Date expiryTime);
}
