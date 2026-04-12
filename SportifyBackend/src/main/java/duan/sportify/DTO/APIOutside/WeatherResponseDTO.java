package duan.sportify.DTO.APIOutside;

import lombok.Data;
import java.util.List;

@Data
public class WeatherResponseDTO {

    private String locationName; // Tên thành phố (Hanoi,...)

    private CurrentWeather current; // Thời tiết hiện tại

    private List<ForecastDay> forecast; // Danh sách dự báo (7 ngày)

    @Data
    public static class CurrentWeather {
        private String conditionText;  // Ví dụ: "Partly cloudy"
        private String conditionIcon;  // URL icon
        private double tempC;          // Nhiệt độ hiện tại
    }

    @Data
    public static class ForecastDay {
        private String date;               // "2025-10-24"
        private double avgtempC;           // Nhiệt độ trung bình
        private int dailyChanceOfRain;     // Xác suất mưa (%)
        private String conditionText;      // Mô tả thời tiết
        private String conditionIcon;      // Icon URL
    }
}
