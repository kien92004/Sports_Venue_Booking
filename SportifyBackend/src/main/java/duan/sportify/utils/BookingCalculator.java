package duan.sportify.utils;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

public class BookingCalculator {

    /**
     * Tính tổng số buổi đặt theo danh sách thứ trong tuần
     *
     * @param startDate ngày bắt đầu
     * @param endDate   ngày kết thúc (bao gồm)
     * @param dayOfWeeks danh sách thứ (ISO: 1=Mon ... 7=Sun)
     * @return tổng số buổi đặt
     */
    public static int countTotalBookings(LocalDate startDate, LocalDate endDate, List<Integer> dayOfWeeks) {
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1; // bao gồm cả endDate
        long weeks = days / 7;
        long remainder = days % 7;

        int totalDay = 0;
        int startDow = startDate.getDayOfWeek().getValue();

        for (int targetDow : dayOfWeeks) {
            int offset = (targetDow - startDow + 7) % 7;
            int numDays = (int) weeks + (offset < remainder ? 1 : 0);
            totalDay += numDays;

            System.out.println("DayOfWeek " + targetDow + " → " + numDays + " lần");
        }

        return totalDay;
    }

    /**
     * Tính tổng tiền thuê sân
     */
    public static double calculateTotalPrice(LocalDate startDate, LocalDate endDate,
                                             List<Integer> dayOfWeeks, double pricePerBooking) {
        int totalDay = countTotalBookings(startDate, endDate, dayOfWeeks);
        return totalDay * pricePerBooking;
    }
}
