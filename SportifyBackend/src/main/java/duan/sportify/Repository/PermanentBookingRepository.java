package duan.sportify.Repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import duan.sportify.entities.PermanentBooking;

@Repository
public interface PermanentBookingRepository extends JpaRepository<PermanentBooking, Integer> {
      @Query("""
                      SELECT COUNT(pb) > 0
                      FROM PermanentBooking pb
                      WHERE pb.fieldId = :fieldId
                        AND pb.shiftId = :shiftId
                        AND pb.dayOfWeek = :dayOfWeek
                        AND pb.active = 1
                        AND (
                              (:startDate <= COALESCE(pb.endDate, :maxDate))
                          AND (:endDate IS NULL OR :endDate >= pb.startDate)
                            )
                  """)
      boolean existsOverlappingPermanentBooking(
                  Integer fieldId,
                  Integer shiftId,
                  Integer dayOfWeek,
                  LocalDate startDate,
                  LocalDate endDate,
                  LocalDate maxDate);

}
