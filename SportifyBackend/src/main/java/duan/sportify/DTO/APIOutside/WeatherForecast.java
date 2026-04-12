package duan.sportify.DTO.APIOutside;
import lombok.Data;
import java.util.List;

@Data
public class WeatherForecast {
    private String locationName;
    private Current current;
    private List<ForecastDay> forecast;

    @Data
    public static class Current {
        private double tempC;
        private String conditionText;
    }

    @Data
    public static class ForecastDay {
        private String date;
        private double avgtempC;
        private double dailyChanceOfRain;
    }
}
