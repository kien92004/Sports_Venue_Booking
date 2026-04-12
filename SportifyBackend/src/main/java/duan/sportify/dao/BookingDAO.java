package duan.sportify.dao;

import java.sql.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import duan.sportify.entities.Bookings;

public interface BookingDAO extends JpaRepository<Bookings, Integer> {

	@Query(value = "SELECT " +
			"b.bookingid, " +
			"ANY_VALUE(b.bookingdate) AS bookingdate, " +
			"ANY_VALUE(b.bookingprice) AS bookingprice, " +
			"ANY_VALUE(b.note) AS note, " +
			"ANY_VALUE(b.bookingstatus) AS bookingstatus, " +
			"ANY_VALUE(COALESCE(f.namefield, f2.namefield)) AS field_name, " +
			"ANY_VALUE(COALESCE(f.image, f2.image)) AS field_image, " +
			"COALESCE(MIN(p.start_date), MIN(bd.playdate)) AS start_date, " +
			"COALESCE(MAX(p.end_date), MAX(bd.playdate)) AS end_date, " +
			"GROUP_CONCAT(p.day_of_week ORDER BY p.day_of_week ASC) AS day_of_weeks, " +
			"GROUP_CONCAT(p.shift_id ORDER BY p.shift_id ASC) AS shift_ids, " +
			"GROUP_CONCAT(p.field_id ORDER BY p.field_id ASC) AS field_ids, " +
			"CASE WHEN COUNT(p.permanent_id) > 0 THEN 'PERMANENT' ELSE 'ONCE' END AS booking_type " +
			"FROM bookings AS b " +
			"LEFT JOIN bookingdetails AS bd ON b.bookingid = bd.bookingid " +
			"LEFT JOIN field AS f ON bd.fieldid = f.fieldid " +
			"LEFT JOIN permanent_booking AS p ON b.bookingid = p.booking_id " +
			"LEFT JOIN field AS f2 ON p.field_id = f2.fieldid " +
			"WHERE b.username = :username " +
			"GROUP BY b.bookingid " +
			"ORDER BY bookingdate DESC " +
			"LIMIT 20", nativeQuery = true)
	List<Object[]> getBookingInfoByUsername(@Param("username") String username);

	@Query(value = "SELECT \r\n" + "    b.bookingid,\r\n" + "    b.bookingdate,\r\n" + "    b.bookingstatus,\r\n"
			+ "    bd.shiftid,\r\n" + "    bd.playdate,\r\n" + "    bd.price,\r\n" + "    f.namefield,\r\n"
			+ "    f.image,\r\n" + "    s.nameshift\r\n" + "FROM \r\n" + "    bookings AS b\r\n" + "JOIN \r\n"
			+ "    bookingdetails AS bd ON b.bookingid = bd.bookingid\r\n" + "JOIN \r\n"
			+ "    field AS f ON bd.fieldid = f.fieldid\r\n" + "JOIN \r\n"
			+ "    shifts AS s ON bd.shiftid = s.shiftid\r\n" + "WHERE \r\n"
			+ "    b.bookingid = :bookingid", nativeQuery = true)
	List<Object[]> getBookingInfoByBookingDetail(Integer bookingid);

	@Query(value = "SELECT " +
			"p.booking_id, p.start_date, p.end_date, p.shift_id, p.day_of_week, p.field_id, f.namefield, f.image " +
			"FROM permanent_booking p " +
			"LEFT JOIN field f ON p.field_id = f.fieldid " +
			"WHERE p.booking_id = :bookingId " +
			"ORDER BY p.start_date, p.field_id, p.shift_id", nativeQuery = true)
	List<Object[]> getPermanentBookingByBookingId(@Param("bookingId") Integer bookingId);

	@Query(value = "select count(*) from bookings", nativeQuery = true)
	int countBooking();

	// admin
	@Query(value = "SELECT b.* FROM bookings b \r\n"
			+ "	        JOIN users u ON b.username = u.username where b.bookingstatus like '%Đã Cọc%' and date(b.bookingdate) = curdate()\r\n", nativeQuery = true)
	List<Bookings> findAllBookingAndUser();

	// find all booking
	@Query(value = "SELECT * FROM bookings", nativeQuery = true)
	List<Bookings> findAllBooking();

	// search admin
	@Query(value = "SELECT b.* FROM bookings b " +
			"JOIN users u ON b.username = u.username " +
			"WHERE (:keyword IS NULL OR CONCAT(u.firstname, ' ', u.lastname) LIKE CONCAT('%', :keyword, '%')) " +
			"AND (:datebook IS NULL OR DATE(b.bookingdate) = :datebook) " +
			"AND (:status IS NULL OR b.bookingstatus LIKE CONCAT('%', :status, '%'))", nativeQuery = true)
	List<Bookings> findByFlexibleConditions(@Param("keyword") String keyword,
			@Param("datebook") Date datebook,
			@Param("status") String status);

	// dashboard
	// tổng phiểu booking and order
	@Query(value = "SELECT COUNT(*) AS total_count\r\n" + "FROM (\r\n"
			+ "    SELECT bookingid AS id, bookingdate AS date FROM bookings WHERE DATE(bookingdate) = CURDATE()\r\n"
			+ "    UNION ALL\r\n"
			+ "    SELECT orderid AS id, createdate AS date FROM orders WHERE DATE(createdate) = CURDATE()\r\n"
			+ ") AS combined_data;", nativeQuery = true)
	public Long sumOrderBooking();

	// tổng doanh thu booking trong 6 ngăm trở lại
	@Query(value = "SELECT\r\n"
			+ "	SUM(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 5 THEN bookingprice ELSE 0 END) AS revenue_5_years_ago,\r\n"
			+ "  SUM(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 4 THEN bookingprice ELSE 0 END) AS revenue_4_years_ago,\r\n"
			+ "  SUM(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 3 THEN bookingprice ELSE 0 END) AS revenue_3_years_ago,\r\n"
			+ "  SUM(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 2 THEN bookingprice ELSE 0 END) AS revenue_2_years_ago,\r\n"
			+ " \r\n"
			+ "   SUM(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 1 THEN bookingprice ELSE 0 END) AS revenue_last_year,\r\n"
			+ "  SUM(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) THEN bookingprice ELSE 0 END) AS revenue_current_year\r\n"
			+ "  \r\n" + "FROM\r\n" + "  bookings\r\n" + "WHERE\r\n" + "  YEAR(bookingdate) >= YEAR(CURDATE()) - 6\r\n"
			+ "  AND bookingstatus IN ('Hoàn Thành', 'Đã Cọc')", nativeQuery = true)
	List<Object[]> getBookingPriceSummary();

	// đếm tổng số phiếu trong 6 năm
	@Query(value = "SELECT\r\n"
			+ "  COUNT(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 5 THEN bookingid END) AS `Prev5`,\r\n"
			+ "  COUNT(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 4 THEN bookingid END) AS `Prev4`,\r\n"
			+ "  COUNT(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 3 THEN bookingid END) AS `Prev3`,\r\n"
			+ "  COUNT(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 2 THEN bookingid END) AS `Prev2`,\r\n"
			+ "  COUNT(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) - 1 THEN bookingid END) AS `Prev1`,\r\n"
			+ "  COUNT(CASE WHEN YEAR(bookingdate) = YEAR(CURDATE()) THEN bookingid END) AS `Now`\r\n"
			+ "FROM bookings\r\n" + "WHERE bookingdate >= DATE_SUB(CURDATE(), INTERVAL 6 YEAR);", nativeQuery = true)
	List<Object[]> countBookingOn6YearReturn();

	// Đếm số lượng hóa đơn trong ngày
	@Query(value = "  SELECT COUNT(*) AS total_bookings\r\n" + "FROM bookings\r\n"
			+ "WHERE DATE(bookingdate) = CURDATE();", nativeQuery = true)
	int countBookingInDate();

	// thong kê booking trong ngày
	@Query(value = "SELECT\r\n" + "    'Tổng số booking' AS description,\r\n" + "    COUNT(*) AS value,\r\n"
			+ "    IFNULL(SUM(bookingprice), 0) AS total_revenue\r\n" + "FROM bookings\r\n"
			+ "WHERE date(bookingdate) = curdate()\r\n" + "\r\n" + "UNION ALL\r\n" + "\r\n" + "SELECT\r\n"
			+ "    'Hoàn Thành' AS description,\r\n" + "    COUNT(*) AS value,\r\n"
			+ "    IFNULL(SUM(bookingprice), 0) AS total_revenue\r\n" + "FROM bookings\r\n"
			+ "WHERE bookingstatus = 'Hoàn Thành' AND date(bookingdate) = curdate()\r\n" + "\r\n" + "UNION ALL\r\n"
			+ "\r\n" + "SELECT\r\n" + "    'Đã Cọc' AS description,\r\n" + "    COUNT(*) AS value,\r\n"
			+ "    IFNULL(SUM(bookingprice), 0) AS total_revenue\r\n" + "FROM bookings\r\n"
			+ "WHERE bookingstatus = 'Đã Cọc' AND date(bookingdate) = curdate()\r\n" + "\r\n" + "UNION ALL\r\n" + "\r\n"
			+ "SELECT\r\n" + "    'Hủy Đặt' AS description,\r\n" + "    COUNT(*) AS value,\r\n"
			+ "    IFNULL(SUM(bookingprice), 0) AS total_revenue\r\n" + "FROM bookings\r\n"
			+ "WHERE bookingstatus = 'Hủy Đặt' AND date(bookingdate) = curdate();", nativeQuery = true)
	List<Object[]> thongkebookingtrongngay();

	// tổng số phiểu dat san tháng này và tháng trước
	@Query(value = "SELECT 'This Month' AS period, COUNT(*) AS total_bookings\r\n" + "FROM bookings\r\n"
			+ "WHERE YEAR(bookingdate) = YEAR(CURDATE()) AND MONTH(bookingdate) = MONTH(CURDATE())\r\n"
			+ "UNION ALL\r\n" + "SELECT 'Last Month', COUNT(*)\r\n" + "FROM bookings\r\n"
			+ "WHERE YEAR(bookingdate) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(bookingdate) = MONTH(CURDATE() - INTERVAL 1 MONTH);", nativeQuery = true)
	List<Object[]> tongSoPhieuDatSan2Thang();

	// tổng doanh thu booking thang nay va thang trước
	@Query(value = "SELECT\r\n"
			+ "    COALESCE(SUM(CASE \r\n"
			+ "        WHEN bookingstatus = 'Hoàn Thành' AND \r\n"
			+ "             YEAR(bookingdate) = YEAR(CURRENT_DATE) AND \r\n"
			+ "             MONTH(bookingdate) = MONTH(CURRENT_DATE) THEN bookingprice \r\n"
			+ "        WHEN bookingstatus = 'Đã Cọc' AND \r\n"
			+ "             YEAR(bookingdate) = YEAR(CURRENT_DATE) AND \r\n"
			+ "             MONTH(bookingdate) = MONTH(CURRENT_DATE) THEN (bookingprice * 0.3 )\r\n"
			+ "         WHEN bookingstatus = 'Hủy Đặt' AND \r\n"
			+ "             YEAR(bookingdate) = YEAR(CURRENT_DATE) AND \r\n"
			+ "             MONTH(bookingdate) = MONTH(CURRENT_DATE) THEN (- (bookingprice * 0.3 * 2) )\r\n"
			+ "    END), 0) AS doanh_thu_thang_hien_tai,\r\n"
			+ "    COALESCE(SUM(CASE \r\n"
			+ "        WHEN bookingstatus = 'Hoàn Thành' AND \r\n"
			+ "             YEAR(bookingdate) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND \r\n"
			+ "             MONTH(bookingdate) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN bookingprice \r\n"
			+ "        WHEN bookingstatus = 'Đã Cọc' AND \r\n"
			+ "             YEAR(bookingdate) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND \r\n"
			+ "             MONTH(bookingdate) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN (bookingprice * 0.3 )\r\n"
			+ "        WHEN bookingstatus = 'Hủy Đặt' AND \r\n"
			+ "             YEAR(bookingdate) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND \r\n"
			+ "             MONTH(bookingdate) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) THEN (- (bookingprice * 0.3 * 2) )\r\n"
			+ "    END), 0) AS doanh_thu_thang_truoc\r\n"
			+ "FROM bookings;", nativeQuery = true)
	List<Object[]> tongDoanhThuBooking2Month();

	// rp
	// rp doanh thu dặt sân trong tháng
	@Query(value = "SELECT " +
			"   DAY(b.bookingdate) AS day, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice " +
			"            WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 " +
			"            WHEN b.bookingstatus = 'Hủy Đặt' THEN - b.bookingprice * 0.3 * 2 ELSE 0 END) AS doanhThuThucTe, "
			+
			"   SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN b.bookingprice * 0.3 * 2 ELSE 0 END) AS huy, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 ELSE 0 END) AS coc, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice ELSE 0 END) AS hoanthanh, " +
			"   SUM(b.bookingprice) AS DoanhThuUocTinh " +
			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year AND MONTH(b.bookingdate) = :month " +
			"GROUP BY DAY(b.bookingdate) " +
			"ORDER BY DAY(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpDoanhThuBookingTrongThang(@Param("year") String year, @Param("month") String month);

	// lấy năm của các phiếu dặt
	@Query(value = "SELECT DISTINCT YEAR(bookingdate) AS booking_year\r\n"
			+ "FROM bookings;", nativeQuery = true)
	List<Object[]> getYearBooking();

	// rp daonh thu dặt sân trong năm
	// @Query(value = "SELECT " +
	// " CONCAT('Tháng ', MONTH(b.bookingdate)) AS booking_date_month, " +
	// " SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice " +
	// " WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 " +
	// " WHEN b.bookingstatus = 'Hủy Đặt' THEN - b.bookingprice * 0.3 * 2 " +
	// " ELSE 0 END) AS doanhThuThucTe, " +
	// " SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN b.bookingprice * 0.3 * 2
	// ELSE 0 END) AS huy, " +
	// " SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 ELSE 0
	// END) AS coc, " +
	// " SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice ELSE 0
	// END) AS hoanthanh, " +
	// " SUM(b.bookingprice) AS DoanhThuUocTinh " +
	// "FROM bookings b " +
	// "WHERE YEAR(b.bookingdate) = :year " +
	// "GROUP BY YEAR(b.bookingdate), MONTH(b.bookingdate) " +
	// "ORDER BY YEAR(b.bookingdate), MONTH(b.bookingdate)", nativeQuery = true)
	// List<Object[]> rpDoanhThuBookingTrongNam(@Param("year") String year);
	@Query(value = "SELECT " +
			"   MONTH(b.bookingdate) AS month, " +

			"   SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice ELSE 0 END) AS doanh_thu_thuc_te, " +

			"   SUM(CASE WHEN b.bookingstatus = 'Hủy' THEN b.bookingprice ELSE 0 END) AS chi_tra_huy_don, " +

			"   SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice ELSE 0 END) AS doanh_thu_da_coc, " +

			"   SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice ELSE 0 END) AS doanh_thu_hoan_thanh, "
			+

			"   SUM(CASE WHEN b.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') THEN b.bookingprice ELSE 0 END) AS doanh_thu_uoc_tinh "
			+

			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year " +
			"GROUP BY MONTH(b.bookingdate) " +
			"ORDER BY MONTH(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpDoanhThuBookingTrongNam(@Param("year") String year);

	// rp so luong phieu dat san trong thang
	@Query(value = "SELECT " +
			"   DAY(b.bookingdate) AS day, " +
			"   COUNT(b.bookingid) AS tongphieu, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN 1 ELSE 0 END) AS huy, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN 1 ELSE 0 END) AS coc, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN 1 ELSE 0 END) AS hoanthanh " +
			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year AND MONTH(b.bookingdate) = :month " +
			"GROUP BY DAY(b.bookingdate) " +
			"ORDER BY DAY(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpSoLuongBookingTrongThang(@Param("year") String year, @Param("month") String month);

	// @Query(value = "SELECT " +
	// " CONCAT('Tháng ', MONTH(b.bookingdate)) AS booking_date_month, " +
	// " COUNT(b.bookingid) AS tongphieu, " +
	// " SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN 1 ELSE 0 END) AS huy, " +
	// " SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN 1 ELSE 0 END) AS coc, " +
	// " SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN 1 ELSE 0 END) AS
	// hoanthanh " +
	// "FROM bookings b " +
	// "WHERE YEAR(b.bookingdate) = :year " +
	// "GROUP BY YEAR(b.bookingdate), MONTH(b.bookingdate) " +
	// "ORDER BY YEAR(b.bookingdate), MONTH(b.bookingdate)", nativeQuery = true)
	// List<Object[]> rpSoLuongBookingTrongNam(@Param("year") String year);
	@Query(value = "SELECT " +
			"   MONTH(b.bookingdate) AS month, " +
			"   COUNT(*) AS total_bookings, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Hủy' THEN 1 ELSE 0 END) AS canceled_count, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN 1 ELSE 0 END) AS deposit_count, " +
			"   SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN 1 ELSE 0 END) AS completed_count " +
			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year " +
			"GROUP BY MONTH(b.bookingdate) " +
			"ORDER BY MONTH(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpSoLuongBookingTrongNam(@Param("year") String year);

	// -------------------LẤY THÔNG TIN CHO CALANDAR------------------------------

	Bookings findByBookingid(Integer bookingId);

	List<Bookings> findAll();

	// Lấy thông tin cơ bản cho Calendar (ONCE)
	@Query(value = "SELECT bd.bookingid, f.namefield, s.nameshift, bd.playdate, s.starttime, s.endtime, " +
			"b.bookingstatus, b.username, b.phone, f.fieldid, st.categoryname " +
			"FROM bookingdetails bd " +
			"JOIN bookings b ON bd.bookingid = b.bookingid " +
			"JOIN field f ON bd.fieldid = f.fieldid " +
			"JOIN sporttype st ON f.sporttypeid = st.sporttypeid " +
			"JOIN shifts s ON bd.shiftid = s.shiftid", nativeQuery = true)
	List<Object[]> findBookingOnceEvents();

	// Lấy thông tin cơ bản cho Calendar (PERMANENT)
	@Query(value = "SELECT pb.booking_id, f.namefield, s.nameshift, pb.start_date, pb.end_date, pb.day_of_week, " +
			"s.starttime, s.endtime, b.bookingstatus, b.username, b.phone, f.fieldid, st.categoryname " +
			"FROM permanent_booking pb " +
			"JOIN bookings b ON pb.booking_id = b.bookingid " +
			"JOIN field f ON pb.field_id = f.fieldid " +
			"JOIN sporttype st ON f.sporttypeid = st.sporttypeid " +
			"JOIN shifts s ON pb.shift_id = s.shiftid", nativeQuery = true)
	List<Object[]> findBookingPermanentEvents();

	// ------- Lấy theo id sân --------------
	// Lấy lịch ONCE theo fieldId
	@Query(value = """
			    SELECT
			        bd.bookingid,
			        f.namefield,
			        s.nameshift,
			        bd.playdate,
			        s.starttime,
			        s.endtime,
			        u.username AS booking_name,
			        u.phone AS booking_phone,
			        b.bookingstatus AS booking_status,
			        CAST(NULL AS SIGNED) AS day_of_week,
			        st.categoryname AS field_type
			    FROM bookingdetails bd
			    JOIN field f ON bd.fieldid = f.fieldid
			    JOIN shifts s ON bd.shiftid = s.shiftid
			    JOIN bookings b ON bd.bookingid = b.bookingid
			    JOIN users u ON b.username = u.username
			    JOIN sporttype st ON f.sporttypeid = st.sporttypeid
			    WHERE bd.fieldid = :fieldId
			""", nativeQuery = true)
	List<Object[]> findBookingOnceEventsByFieldId(@Param("fieldId") Integer fieldId);

	// Lấy lịch PERMANENT theo fieldId
	@Query(value = """
				SELECT
			    pb.booking_id,
			    f.namefield,
			    s.nameshift,
			    pb.start_date,
			    pb.end_date,
			    pb.day_of_week,
			    s.starttime,
			    s.endtime,
			    u.username AS booking_name,
			    u.phone AS booking_phone,
			    b.bookingstatus AS booking_status,
			    st.categoryname AS field_type
			FROM permanent_booking pb
			JOIN field f ON pb.field_id = f.fieldid
			JOIN shifts s ON pb.shift_id = s.shiftid
			JOIN bookings b ON pb.booking_id = b.bookingid
			JOIN users u ON b.username = u.username
			JOIN sporttype st ON f.sporttypeid = st.sporttypeid
			WHERE pb.field_id = :fieldId
			""", nativeQuery = true)
	List<Object[]> findBookingPermanentEventsByFieldId(@Param("fieldId") Integer fieldId);

	// Lấy chi tiết 1 booking (cho popup)
	@Query(value = "SELECT b.bookingid, b.username, b.phone, b.note, b.bookingstatus, b.booking_type, " +
			"f.namefield, f.image, s.nameshift, s.starttime, s.endtime, " +
			"b.bookingprice, bd.playdate, pb.start_date, pb.end_date, pb.day_of_week " +
			"FROM bookings b " +
			"LEFT JOIN bookingdetails bd ON b.bookingid = bd.bookingid " +
			"LEFT JOIN permanent_booking pb ON b.bookingid = pb.booking_id " +
			"LEFT JOIN field f ON (bd.fieldid = f.fieldid OR pb.field_id = f.fieldid) " +
			"LEFT JOIN shifts s ON (bd.shiftid = s.shiftid OR pb.shift_id = s.shiftid) " +
			"WHERE b.bookingid = :bookingId", nativeQuery = true)
	List<Object[]> findBookingDetail(@Param("bookingId") Integer bookingId);

	@Modifying
	@Query("DELETE FROM Bookingdetails d WHERE d.booking.bookingid IN :ids")
	void deleteBookingDetailsByBookingIds(@Param("ids") List<Integer> ids);

	@Modifying
	@Query("DELETE FROM PermanentBooking p WHERE p.booking.bookingid IN :ids")
	void deletePermanentBookingByBookingIds(@Param("ids") List<Integer> ids);

	@Modifying
	@Query("DELETE FROM Bookingdetails d WHERE d.booking.bookingid = :id")
	void deleteBookingDetailsByBookingId(@Param("id") Integer id);

	@Modifying
	@Query("DELETE FROM PermanentBooking p WHERE p.booking.bookingid = :id")
	void deletePermanentBookingByBookingId(@Param("id") Integer id);

	// -------------------LẤY THÔNG TIN CHO CHỦ SÂN------------------------------

	// Lấy booking của chủ sân
	@Query(value = "(SELECT DISTINCT b.* FROM bookings b " +
			"JOIN bookingdetails bd ON b.bookingid = bd.bookingid " +
			"JOIN field f ON bd.fieldid = f.fieldid " +
			"JOIN infor_owner io ON f.owner_id = io.owner_id " +
			"WHERE io.username = :ownerUsername) " +
			"UNION " +
			"(SELECT DISTINCT b.* FROM bookings b " +
			"JOIN permanent_booking pb ON b.bookingid = pb.booking_id " +
			"JOIN field f ON pb.field_id = f.fieldid " +
			"JOIN infor_owner io ON f.owner_id = io.owner_id " +
			"WHERE io.username = :ownerUsername) " +
			"ORDER BY bookingdate DESC", nativeQuery = true)
	List<Bookings> findBookingsByOwner(@Param("ownerUsername") String ownerUsername);

	// Báo cáo doanh thu đặt sân trong tháng cho chủ sân
	@Query(value = "SELECT " +
			"  DAY(b.bookingdate) AS day, " +
			"  MONTH(b.bookingdate) AS month, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice " +
			"           WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 " +
			"           WHEN b.bookingstatus = 'Hủy Đặt' THEN - b.bookingprice * 0.3 * 2 ELSE 0 END) AS doanhThuThucTe, "
			+
			"  SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN b.bookingprice * 0.3 * 2 ELSE 0 END) AS huy, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 ELSE 0 END) AS coc, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice ELSE 0 END) AS hoanthanh, " +
			"  SUM(b.bookingprice) AS DoanhThuUocTinh " +
			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year AND MONTH(b.bookingdate) = :month " +
			"  AND b.bookingid IN ( " +
			"    SELECT DISTINCT b2.bookingid " +
			"    FROM bookings b2 " +
			"    LEFT JOIN bookingdetails bd ON b2.bookingid = bd.bookingid " +
			"    LEFT JOIN permanent_booking pb ON b2.bookingid = pb.booking_id " +
			"    LEFT JOIN field f ON bd.fieldid = f.fieldid OR pb.field_id = f.fieldid " +
			"    JOIN infor_owner io ON f.owner_id = io.owner_id " +
			"    WHERE io.username = :ownerUsername " +
			"  ) " +
			"GROUP BY DAY(b.bookingdate), MONTH(b.bookingdate) " +
			"ORDER BY MONTH(b.bookingdate), DAY(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpDoanhThuBookingTrongThangByOwner(@Param("year") String year, @Param("month") String month,
			@Param("ownerUsername") String ownerUsername);

	// Báo cáo doanh thu đặt sân trong năm cho chủ sân
	@Query(value = "SELECT " +
			"  MONTH(b.bookingdate) AS month, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice " +
			"           WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 " +
			"           WHEN b.bookingstatus = 'Hủy Đặt' THEN - b.bookingprice * 0.3 * 2 ELSE 0 END) AS doanhThuThucTe, "
			+
			"  SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN b.bookingprice * 0.3 * 2 ELSE 0 END) AS huy, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN b.bookingprice * 0.3 ELSE 0 END) AS coc, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN b.bookingprice ELSE 0 END) AS hoanthanh, " +
			"  SUM(b.bookingprice) AS DoanhThuUocTinh " +
			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year " +
			"  AND b.bookingid IN ( " +
			"    SELECT DISTINCT b2.bookingid " +
			"    FROM bookings b2 " +
			"    LEFT JOIN bookingdetails bd ON b2.bookingid = bd.bookingid " +
			"    LEFT JOIN permanent_booking pb ON b2.bookingid = pb.booking_id " +
			"    LEFT JOIN field f ON bd.fieldid = f.fieldid OR pb.field_id = f.fieldid " +
			"    JOIN infor_owner io ON f.owner_id = io.owner_id " +
			"    WHERE io.username = :ownerUsername " +
			"  ) " +
			"GROUP BY MONTH(b.bookingdate) " +
			"ORDER BY MONTH(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpDoanhThuBookingTrongNamByOwner(@Param("year") String year,
			@Param("ownerUsername") String ownerUsername);

	@Query(value = "SELECT " +
			"  DAY(b.bookingdate) AS day, " +
			"  MONTH(b.bookingdate) AS month, " +
			"  COUNT(b.bookingid) AS tongphieu, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN 1 ELSE 0 END) AS huy, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN 1 ELSE 0 END) AS coc, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN 1 ELSE 0 END) AS hoanthanh " +
			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year AND MONTH(b.bookingdate) = :month " +
			"  AND b.bookingid IN ( " +
			"    SELECT DISTINCT b2.bookingid " +
			"    FROM bookings b2 " +
			"    LEFT JOIN bookingdetails bd ON b2.bookingid = bd.bookingid " +
			"    LEFT JOIN permanent_booking pb ON b2.bookingid = pb.booking_id " +
			"    LEFT JOIN field f ON bd.fieldid = f.fieldid OR pb.field_id = f.fieldid " +
			"    JOIN infor_owner io ON f.owner_id = io.owner_id " +
			"    WHERE io.username = :ownerUsername " +
			"  ) " +
			"GROUP BY DAY(b.bookingdate), MONTH(b.bookingdate) " +
			"ORDER BY MONTH(b.bookingdate), DAY(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpSoLuongBookingTrongThangByOwner(@Param("year") String year,
			@Param("month") String month,
			@Param("ownerUsername") String ownerUsername);

	// Báo cáo số lượng phiếu đặt trong năm cho chủ sân
	@Query(value = "SELECT " +
			"  MONTH(b.bookingdate) AS month, " +
			"  COUNT(b.bookingid) AS tongphieu, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN 1 ELSE 0 END) AS huy, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN 1 ELSE 0 END) AS coc, " +
			"  SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN 1 ELSE 0 END) AS hoanthanh " +
			"FROM bookings b " +
			"WHERE YEAR(b.bookingdate) = :year " +
			"  AND b.bookingid IN ( " +
			"    SELECT DISTINCT b2.bookingid FROM bookings b2 " +
			"    LEFT JOIN bookingdetails bd ON b2.bookingid = bd.bookingid " +
			"    LEFT JOIN permanent_booking pb ON b2.bookingid = pb.booking_id " +
			"    LEFT JOIN field f ON bd.fieldid = f.fieldid OR pb.field_id = f.fieldid " +
			"    JOIN infor_owner io ON f.owner_id = io.owner_id " +
			"    WHERE io.username = :ownerUsername " +
			"  ) " +
			"GROUP BY MONTH(b.bookingdate) " +
			"ORDER BY MONTH(b.bookingdate)", nativeQuery = true)
	List<Object[]> rpSoLuongBookingTrongNamByOwner(@Param("year") String year,
			@Param("ownerUsername") String ownerUsername);

	// Lấy năm của các phiếu đặt của chủ sân
	@Query(value = "SELECT DISTINCT YEAR(b.bookingdate) AS booking_year\r\n"
			+ "FROM bookings b\r\n"
			+ "WHERE b.bookingid IN (\r\n"
			+ "  SELECT DISTINCT b2.bookingid FROM bookings b2\r\n"
			+ "  LEFT JOIN bookingdetails bd ON b2.bookingid = bd.bookingid\r\n"
			+ "  LEFT JOIN permanent_booking pb ON b2.bookingid = pb.booking_id\r\n"
			+ "  LEFT JOIN field f ON (bd.fieldid = f.fieldid OR pb.field_id = f.fieldid)\r\n"
			+ "  JOIN infor_owner io ON f.owner_id = io.owner_id\r\n"
			+ "  WHERE io.username = :ownerUsername\r\n"
			+ ");", nativeQuery = true)
	List<Object[]> getYearBookingByOwner(@Param("ownerUsername") String ownerUsername);

	// chủ sân
	@Query(value = """
			    SELECT
			        COUNT(*) AS totalBookings,
			        SUM(CASE WHEN b.bookingstatus = 'Hoàn Thành' THEN 1 ELSE 0 END) AS hoanThanh,
			        SUM(CASE WHEN b.bookingstatus = 'Đã Cọc' THEN 1 ELSE 0 END) AS daCoc,
			        SUM(CASE WHEN b.bookingstatus = 'Hủy Đặt' THEN 1 ELSE 0 END) AS huyDat
			    FROM bookings b
			    WHERE DATE(b.bookingdate) = CURDATE()
			      AND b.bookingid IN (
			            SELECT bd.bookingid
			            FROM bookingdetails bd
			            JOIN field f ON bd.fieldid = f.fieldid
			            JOIN infor_owner o ON f.owner_id = o.owner_id
			            WHERE o.username = :ownerUsername

			            UNION

			            SELECT pb.booking_id
			            FROM permanent_booking pb
			            JOIN field f2 ON pb.field_id = f2.fieldid
			            JOIN infor_owner o2 ON f2.owner_id = o2.owner_id
			            WHERE o2.username = :ownerUsername
			      )
			""", nativeQuery = true)
	Map<String, Object> countFieldsBookedToday(@Param("ownerUsername") String ownerUsername);

	// danh sách 3 sân được đặt nhiều nhất

	@Query(value = """
			    SELECT
			        f.namefield,
			        f.price,
			        COUNT(*) AS booking_count,
			        SUM(
			            CASE
			                WHEN b.bookingstatus IN ('Hoàn Thành', 'Đã Cọc') THEN b.bookingprice
			                ELSE 0
			            END
			        ) AS total_revenue
			    FROM bookings b
			    JOIN (
			        SELECT bd.bookingid, bd.fieldid
			        FROM bookingdetails bd
			        JOIN field f1 ON bd.fieldid = f1.fieldid
			        JOIN infor_owner o1 ON f1.owner_id = o1.owner_id
			        JOIN bookings b1 ON bd.bookingid = b1.bookingid
			        WHERE o1.username = :ownerUsername

			        UNION ALL

			        SELECT pb.booking_id AS bookingid, pb.field_id AS fieldid
			        FROM permanent_booking pb
			        JOIN field f2 ON pb.field_id = f2.fieldid
			        JOIN infor_owner o2 ON f2.owner_id = o2.owner_id
			        JOIN bookings b2 ON pb.booking_id = b2.bookingid
			        WHERE o2.username = :ownerUsername

			    ) AS all_bookings ON all_bookings.bookingid = b.bookingid
			    JOIN field f ON all_bookings.fieldid = f.fieldid
			    GROUP BY f.fieldid, f.namefield, f.price
			    ORDER BY booking_count DESC
			    LIMIT 3
			""", nativeQuery = true)
	List<Object[]> getTop3FieldsBookedToday(@Param("ownerUsername") String ownerUsername);

	// Đếm lượt đặt sân của user trong ngày
	@Query(value = """
			SELECT
			    COUNT(*) AS total_bookings
			FROM bookings b
			WHERE DATE(b.bookingdate) = CURDATE()
			  AND b.username = :username
			  AND b.bookingstatus IN ('Hoàn Thành', 'Đã Cọc')
			""", nativeQuery = true)
	int countUserBookingsToday(@Param("username") String username);

}
