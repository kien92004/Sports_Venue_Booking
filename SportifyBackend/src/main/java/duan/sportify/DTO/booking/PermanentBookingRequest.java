package duan.sportify.DTO.booking;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PermanentBookingRequest {
    private Integer fieldId;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<DetailRequest> details;

    @Data
    public static class DetailRequest {
        private Integer dayOfWeek; // 1-7
        private Integer shiftId;
    }
}
