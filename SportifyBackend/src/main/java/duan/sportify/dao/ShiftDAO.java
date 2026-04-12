package duan.sportify.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
			"    -- Loại bỏ ca đã đặt lẻ\r\n" + //
			"    SELECT b.shiftid\r\n" + //
			"    FROM bookingdetails b\r\n" + //
			"    WHERE b.fieldid = :id \r\n" + //
			"      AND b.playdate = :date\r\n" + //
			")\r\n" + //
			"AND s.shiftid NOT IN (\r\n" + //
			"    -- Loại bỏ ca đã đặt cố định\r\n" + //
			"    SELECT p.shift_id\r\n" + //
			"    FROM permanent_booking p\r\n" + //
			"    WHERE p.field_id = :id\r\n" + //
			"      AND p.active = true\r\n" + //
			"      AND :date BETWEEN p.start_date AND p.end_date\r\n" + //
			"      AND p.day_of_week = DAYOFWEEK(:date)   -- hoặc EXTRACT(DOW FROM :date) nếu PostgreSQL\r\n" + //
			")\r\n" + //
			"", nativeQuery = true)
	List<Shifts> findShiftDate(Integer id, String date);
}
