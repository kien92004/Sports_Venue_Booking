package duan.sportify.dao;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import javax.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import duan.sportify.entities.Bookingdetails;
import duan.sportify.entities.PermanentBooking;

@SuppressWarnings("unused")
public interface BookingDetailDAO extends JpaRepository<Bookingdetails, Integer> {
	@Query(value = "SELECT  s.* FROM bookingdetails bd\r\n"
			+ "JOIN field s ON bd.fieldid = s.fieldid\r\n"
			+ "GROUP BY bd.fieldid\r\n"
			+ "ORDER BY COUNT(*) DESC\r\n", nativeQuery = true)
	List<Object[]> findTopFieldsWithMostBookings();

	@Query(value = "SELECT * FROM bookingdetails WHERE bookingid = :bookingid", nativeQuery = true)

	List<Bookingdetails> detailBooking(@Param("bookingid") Integer bookingid);

	@Query("SELECT p FROM PermanentBooking p " +
			"LEFT JOIN FETCH p.field " +
			"LEFT JOIN FETCH p.shift " +
			"WHERE p.bookingId = :bookingid")
	List<PermanentBooking> detailPermanentBooking(@Param("bookingid") Integer bookingid);

	// Check slot Trong
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			    SELECT b FROM Bookingdetails b
			    WHERE b.fieldid = :fieldId
			      AND b.shiftid = :shiftId
			      AND b.playdate = :playDate
			""")
	Optional<Bookingdetails> lockSlot(@Param("fieldId") Integer fieldId,
			@Param("shiftId") Integer shiftId,
			@Param("playDate") Date playDate);

	// top 3 san được dat nhiều nhất
	@Query(value = "SELECT\r\n"
			+ "    f.namefield AS field_name,\r\n"
			+ "    f.price AS field_price,\r\n"
			+ "    COUNT(b.fieldid) AS booking_count,\r\n"
			+ "    SUM(CASE\r\n"
			+ "        WHEN bk.bookingstatus = 'Hoàn Thành' THEN b.price\r\n"
			+ "        ELSE b.price * 0.3\r\n"
			+ "    END) AS total_revenue\r\n"
			+ "FROM\r\n"
			+ "    field f\r\n"
			+ "JOIN\r\n"
			+ "    bookingdetails b ON f.fieldid = b.fieldid\r\n"
			+ "JOIN\r\n"
			+ "    bookings bk ON b.bookingid = bk.bookingid\r\n"
			+ "WHERE\r\n"
			+ "    bk.bookingstatus <> 'Hủy Đặt'\r\n"
			+ "GROUP BY\r\n"
			+ "    f.fieldid, f.namefield, f.price\r\n"
			+ "ORDER BY\r\n"
			+ "    booking_count DESC\r\n"
			+ "LIMIT 3;", nativeQuery = true)
	List<Object[]> top3SanDatNhieu();

	// top 5 dăt san
	@Query(value = "SELECT\r\n"
			+ "    u.firstname,\r\n"
			+ "    u.lastname,\r\n"
			+ "    u.phone,\r\n"
			+ "    COUNT(b.bookingid) AS booking_count,\r\n"
			+ "    SUM(CASE\r\n"
			+ "        WHEN b.bookingstatus IN ('Hoàn Thành', 'Đã Cọc') THEN b.bookingprice * 0.3\r\n"
			+ "        ELSE 0\r\n"
			+ "    END) AS total_revenue\r\n"
			+ "FROM\r\n"
			+ "    users u\r\n"
			+ "JOIN\r\n"
			+ "    bookings b ON u.username = b.username\r\n"
			+ "GROUP BY\r\n"
			+ "    u.username, u.firstname, u.lastname, u.phone\r\n"
			+ "ORDER BY\r\n"
			+ "    booking_count DESC\r\n"
			+ "LIMIT 5;", nativeQuery = true)
	List<Object[]> top5UserDatSan();

	// ================= LƯỢT ĐẶT & DOANH THU THEO NGÀY =================
	@Query(value = """
			    SELECT
			        f.fieldid,
			        f.namefield,
			        f.image,
			        f.price,

			        COUNT(DISTINCT bd.bookingdetailid) AS one_time_bookings,
			        COUNT(DISTINCT pb.permanent_id) AS permanent_bookings,

			        (COUNT(DISTINCT bd.bookingdetailid) + COUNT(DISTINCT pb.permanent_id)) AS total_bookings,

			        (
			            /* BOOKING ONCE */
			            COALESCE(
			                SUM(
			                    CASE
			                        WHEN b.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') THEN b.bookingprice
			                        ELSE 0
			                    END
			                ), 0
			            )

			            +

			            /* BOOKING PERMANENT (CHỈ LẦN ĐẦU THEO SHIFT / dayOfWeek) */
			            COALESCE(
			                SUM(
			                    CASE
			                        WHEN pb.permanent_id IS NOT NULL
			                             AND :date = DATE_FORMAT(
			                                 DATE_ADD(pb.start_date, INTERVAL ((pb.day_of_week - DAYOFWEEK(pb.start_date) + 7) % 7) DAY),
			                                 '%Y-%m-%d'
			                             )
			                        THEN
			                            CASE
			                                WHEN b2.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') THEN b2.bookingprice
			                                ELSE f.price
			                            END
			                        ELSE 0
			                    END
			                ), 0
			            )
			        ) AS total_revenue

			    FROM field f

			    LEFT JOIN bookingdetails bd
			        ON f.fieldid = bd.fieldid
			        AND DATE_FORMAT(bd.playdate, '%Y-%m-%d') = :date

			    LEFT JOIN bookings b
			        ON bd.bookingid = b.bookingid

			    LEFT JOIN permanent_booking pb
			        ON f.fieldid = pb.field_id
			        AND pb.start_date <= :date
			        AND pb.end_date >= :date
			        AND pb.day_of_week = DAYOFWEEK(STR_TO_DATE(:date, '%Y-%m-%d'))
			        AND pb.active = 1

			    LEFT JOIN bookings b2
			        ON pb.booking_id = b2.bookingid

			    WHERE (bd.bookingdetailid IS NULL OR b.bookingid IS NOT NULL)
			      AND (pb.permanent_id IS NULL OR b2.bookingid IS NOT NULL)

			    GROUP BY f.fieldid, f.namefield, f.image, f.price
			""", nativeQuery = true)
	List<Object[]> findActiveFieldsByDate(@Param("date") String date);

	// ================= LƯỢT ĐẶT & DOANH THU THEO THÁNG =================
	@Query(value = """
			    SELECT
			        f.fieldid,
			        f.namefield,
			        f.image,
			        f.price,

			        COUNT(DISTINCT bd.bookingdetailid) AS one_time_bookings,

			        /* PERMANENT BOOKINGS COUNT (THEO TUẦN) */
			        SUM(
			            CASE
			                WHEN pb.permanent_id IS NOT NULL THEN
			                    FLOOR(
			                        LEAST(
			                            DATEDIFF(
			                                LAST_DAY(STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d')),
			                                GREATEST(
			                                    STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d'),
			                                    pb.start_date
			                                )
			                            ) / 7,
			                            DATEDIFF(
			                                pb.end_date,
			                                GREATEST(
			                                    STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d'),
			                                    pb.start_date
			                                )
			                            ) / 7
			                        ) + 1
			                    )
			                ELSE 0
			            END
			        ) AS permanent_bookings,

			        /* TOTAL BOOKINGS */
			        (
			            COUNT(DISTINCT bd.bookingdetailid)
			            +
			            SUM(
			                CASE
			                    WHEN pb.permanent_id IS NOT NULL THEN
			                        FLOOR(
			                            LEAST(
			                                DATEDIFF(
			                                    LAST_DAY(STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d')),
			                                    GREATEST(
			                                        STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d'),
			                                        pb.start_date
			                                    )
			                                ) / 7,
			                                DATEDIFF(
			                                    pb.end_date,
			                                    GREATEST(
			                                        STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d'),
			                                        pb.start_date
			                                    )
			                                ) / 7
			                            ) + 1
			                        )
			                    ELSE 0
			                END
			            )
			        ) AS total_bookings,

			        /* TOTAL REVENUE */
			        (
			            /* BOOKING ONCE */
			            COALESCE(
			                SUM(
			                    CASE
			                        WHEN b.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') THEN b.bookingprice
			                        ELSE 0
			                    END
			                ), 0
			            )

			            +

			            /* BOOKING PERMANENT (CHỈ LẦN ĐẦU THEO SHIFT / dayOfWeek TRONG THÁNG) */
			            COALESCE(
			                SUM(
			                    CASE
			                        WHEN pb.permanent_id IS NOT NULL
			                             AND DATE_FORMAT(
			                                 DATE_ADD(pb.start_date, INTERVAL ((pb.day_of_week - DAYOFWEEK(pb.start_date) + 7) % 7) DAY),
			                                 '%Y-%m'
			                             ) = :yearMonth
			                        THEN
			                            CASE
			                                WHEN b2.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') THEN b2.bookingprice
			                                ELSE f.price
			                            END
			                        ELSE 0
			                    END
			                ), 0
			            )
			        ) AS total_revenue

			    FROM field f

			    LEFT JOIN bookingdetails bd
			        ON f.fieldid = bd.fieldid
			        AND DATE_FORMAT(bd.playdate, '%Y-%m') = :yearMonth

			    LEFT JOIN bookings b
			        ON bd.bookingid = b.bookingid

			    LEFT JOIN permanent_booking pb
			        ON f.fieldid = pb.field_id
			        AND pb.start_date <= LAST_DAY(STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d'))
			        AND pb.end_date >= STR_TO_DATE(CONCAT(:yearMonth, '-01'), '%Y-%m-%d')
			        AND pb.active = 1

			    LEFT JOIN bookings b2
			        ON pb.booking_id = b2.bookingid

			    WHERE (bd.bookingdetailid IS NULL OR b.bookingid IS NOT NULL)
			      AND (pb.permanent_id IS NULL OR b2.bookingid IS NOT NULL)

			    GROUP BY f.fieldid, f.namefield, f.image, f.price
			""", nativeQuery = true)
	List<Object[]> findActiveFieldsByMonth(@Param("yearMonth") String yearMonth);

	// 7 ngày trước đó
	@Query(value = "SELECT f.fieldid AS fieldId, f.namefield AS fieldName, f.image AS fieldImage, " +

	// Tổng 7 ngày
			"(COUNT(DISTINCT bd.bookingdetailid) + " +
			" SUM(CASE WHEN pb.permanent_id IS NOT NULL THEN " +
			"    FLOOR(LEAST(DATEDIFF(CURDATE(), GREATEST(DATE_SUB(CURDATE(), INTERVAL 7 DAY), pb.start_date))/7, " +
			"           DATEDIFF(pb.end_date, GREATEST(DATE_SUB(CURDATE(), INTERVAL 7 DAY), pb.start_date))/7) +1) ELSE 0 END)) AS totalBookings7Day, "
			+

			// Tổng 3 ngày
			"(COUNT(DISTINCT CASE WHEN bd.playdate BETWEEN DATE_SUB(CURDATE(), INTERVAL 3 DAY) AND CURDATE() THEN bd.bookingdetailid END) + "
			+
			" SUM(CASE WHEN pb.permanent_id IS NOT NULL THEN " +
			"    FLOOR(LEAST(DATEDIFF(CURDATE(), GREATEST(DATE_SUB(CURDATE(), INTERVAL 3 DAY), pb.start_date))/7, " +
			"           DATEDIFF(pb.end_date, GREATEST(DATE_SUB(CURDATE(), INTERVAL 3 DAY), pb.start_date))/7) +1) ELSE 0 END)) AS totalBookings3Day, "
			+

			// Tổng 1 ngày
			"(COUNT(DISTINCT CASE WHEN bd.playdate = DATE_SUB(CURDATE(), INTERVAL 1 DAY)  THEN bd.bookingdetailid END) + "
			+
			" SUM(CASE WHEN pb.permanent_id IS NOT NULL AND pb.start_date <= DATE_SUB(CURDATE(), INTERVAL 1 DAY)  AND pb.end_date >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)  THEN 1 ELSE 0 END)) AS totalBookings1Day "
			+

			"FROM field f " +
			"LEFT JOIN bookingdetails bd ON f.fieldid = bd.fieldid " +
			"AND bd.playdate BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() " + // join bookingdetails 7 ngày
			"LEFT JOIN bookings b ON bd.bookingid = b.bookingid " +
			"AND b.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') " +
			"LEFT JOIN permanent_booking pb ON f.fieldid = pb.field_id " +
			"AND pb.active = 1 " +
			"AND pb.end_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
			"AND pb.start_date <= CURDATE() " +
			"LEFT JOIN bookings b2 ON pb.booking_id = b2.bookingid " +
			"AND b2.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') " +
			"WHERE (bd.bookingdetailid IS NULL OR b.bookingid IS NOT NULL) " +
			"AND (pb.permanent_id IS NULL OR b2.bookingid IS NOT NULL) " +
			"GROUP BY f.fieldid, f.namefield, f.image", nativeQuery = true)
	List<Object[]> findFieldTotalBookingsLast7_3_1Days();

	// Lấy danh sách sân mà user đã đặt nhiều nhất
	@Query(value = "SELECT DISTINCT f.* FROM field f " +
			"INNER JOIN bookingdetails bd ON f.fieldid = bd.fieldid " +
			"INNER JOIN bookings b ON bd.bookingid = b.bookingid " +
			"WHERE b.username = :username AND b.bookingstatus <> 'Hủy Đặt' " +
			"AND f.status = 1 " +
			"GROUP BY f.fieldid " +
			"ORDER BY COUNT(*) DESC " +
			"LIMIT 4", nativeQuery = true)
	List<Object[]> findUserMostBookedFields(@Param("username") String username);

	// @Query(value = """
	// SELECT
	// f.fieldid,
	// f.namefield,
	// f.image,
	// f.price,

	// COUNT(DISTINCT bd.bookingdetailid) AS one_time_bookings,

	// COUNT(DISTINCT pb.permanent_id) AS permanent_bookings,

	// (COUNT(DISTINCT bd.bookingdetailid) + COUNT(DISTINCT pb.permanent_id)) AS
	// total_bookings,

	// (COUNT(DISTINCT bd.bookingdetailid) * f.price
	// +
	// COUNT(DISTINCT pb.permanent_id) * f.price
	// ) AS total_revenue

	// FROM field f

	// LEFT JOIN bookingdetails bd
	// ON f.fieldid = bd.fieldid
	// AND DATE_FORMAT(bd.playdate, '%Y-%m-%d') = :date

	// LEFT JOIN permanent_booking pb
	// ON f.fieldid = pb.field_id
	// AND pb.start_date <= :date
	// AND pb.end_date >= :date
	// AND pb.day_of_week = DAYOFWEEK(STR_TO_DATE(:date, '%Y-%m-%d'))
	// AND pb.active = 1

	// GROUP BY f.fieldid, f.namefield, f.image, f.price
	// ORDER BY f.fieldid;
	// """, nativeQuery = true)

	// List<Object[]> getListfieldsAction(@Param("date") String date);

	@Query(value = """
			    SELECT
			        f.fieldid,
			        f.namefield,
			        f.image,
			        f.price,

			        COUNT(DISTINCT bd.bookingdetailid) AS one_time_bookings,
			        COUNT(DISTINCT pb.permanent_id) AS permanent_bookings,

			        (COUNT(DISTINCT bd.bookingdetailid) + COUNT(DISTINCT pb.permanent_id)) AS total_bookings,

			        (
			            /* ================= BOOKING ONCE ================= */
			            COALESCE(
			                SUM(
			                    CASE
			                        WHEN b.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') THEN b.bookingprice
			                        ELSE 0
			                    END
			                ), 0
			            )

			            +

			            /* ============ BOOKING PERMANENT (CHỈ LẦN ĐẦU THEO SHIFT/DAYOFWEEK) ============ */
			            COALESCE(
			                SUM(
			                    CASE
			                        WHEN pb.permanent_id IS NOT NULL
			                             AND :date = DATE_FORMAT(
			                                 DATE_ADD(
			                                     pb.start_date,
			                                     INTERVAL ((pb.day_of_week - DAYOFWEEK(pb.start_date) + 7) % 7) DAY
			                                 ),
			                                 '%Y-%m-%d'
			                             )
			                        THEN
			                            CASE
			                                WHEN b2.bookingstatus IN ('Đã Cọc', 'Hoàn Thành') THEN b2.bookingprice
			                                ELSE f.price
			                            END
			                        ELSE 0
			                    END
			                ), 0
			            )
			        ) AS total_revenue

			    FROM field f

			    LEFT JOIN bookingdetails bd
			        ON f.fieldid = bd.fieldid
			        AND DATE_FORMAT(bd.playdate, '%Y-%m-%d') = :date

			    LEFT JOIN bookings b
			        ON bd.bookingid = b.bookingid

			    LEFT JOIN permanent_booking pb
			        ON f.fieldid = pb.field_id
			        AND pb.start_date <= :date
			        AND pb.end_date >= :date
			        AND pb.day_of_week = DAYOFWEEK(STR_TO_DATE(:date, '%Y-%m-%d'))
			        AND pb.active = 1

			    LEFT JOIN bookings b2
			        ON pb.booking_id = b2.bookingid

			    WHERE (bd.bookingdetailid IS NULL OR b.bookingid IS NOT NULL)
			      AND (pb.permanent_id IS NULL OR b2.bookingid IS NOT NULL)

			    GROUP BY f.fieldid, f.namefield, f.image, f.price
			    ORDER BY f.fieldid
			""", nativeQuery = true)
	List<Object[]> getListfieldsAction(@Param("date") String date);

	// checkbooking detail tồn tại
	@Query("""
			    SELECT COUNT(bd) > 0
			    FROM Bookingdetails bd
			    WHERE bd.fieldid = :fieldId
			      AND bd.shiftid = :shiftId
			      AND bd.playdate = :playDate
			""")
	boolean existsBookingDetail(
			@Param("fieldId") Integer fieldId,
			@Param("shiftId") Integer shiftId,
			@Param("playDate") Date playDate);

}
