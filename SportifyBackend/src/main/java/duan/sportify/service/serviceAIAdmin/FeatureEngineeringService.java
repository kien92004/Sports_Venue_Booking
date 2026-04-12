package duan.sportify.service.serviceAIAdmin;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import duan.sportify.DTO.APIOutside.FieldUsage;
import duan.sportify.DTO.APIOutside.HolidayEvent;
import duan.sportify.DTO.APIOutside.WeatherForecast;

@Service
public class FeatureEngineeringService {

    public float[] buildFeatureVector(FieldUsage field, FieldUsage field7day, WeatherForecast.ForecastDay weather,
            boolean isHoliday) {
        // ví dụ mô hình có các feature:
        // [totalBookings_today, avgtempC, dailyChanceOfRain, isHoliday]

        float totalBookings7Day = field7day != null ? field7day.getTotalBookings7Day() : 0;
        float totalBookings3Day = field7day != null ? field7day.getTotalBookings7Day() : 0;
        float totalBookings1Day = field7day != null ? field7day.getTotalBookings7Day() : 0;
        float totalBookingsMonth = field.getTotalBookings();
        float avgTemp = (float) weather.getAvgtempC();
        float rain = (float) weather.getDailyChanceOfRain();
        float holidayFlag = isHoliday ? 1f : 0f;
        System.out.println(
                "Month=" + totalBookingsMonth +
                        ", 7day=" + totalBookings7Day +
                        ", Temp=" + avgTemp +
                        ", Rain=" + rain +
                        ", Holiday=" + holidayFlag);

        return new float[] {
                totalBookingsMonth, totalBookings7Day, totalBookings3Day, totalBookings1Day, avgTemp, rain,
                holidayFlag };
    }

    public boolean isHoliday(LocalDate date, List<HolidayEvent> holidays) {
        return holidays.stream().anyMatch(h -> !date.isBefore(LocalDate.parse(h.getStartDate())) &&
                !date.isAfter(LocalDate.parse(h.getEndDate())));
    }
}
