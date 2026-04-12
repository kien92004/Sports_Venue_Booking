package duan.sportify.service.serviceAIAdmin;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import duan.sportify.DTO.APIOutside.FieldUsage;
import duan.sportify.DTO.APIOutside.ForecastResult;
import duan.sportify.DTO.APIOutside.HolidayEvent;
import duan.sportify.DTO.APIOutside.WeatherForecast;

@Service
public class ForecastServiceOnwer {

    @Autowired
    DataFetchService dataFetchService;
    @Autowired
    FeatureEngineeringService featureService;
    @Autowired
    ModelService modelService;
    @Autowired
    ModelServiceOwner modelServiceOwner;

    public List<ForecastResult> forecastNextWeekOwner(String ownerUsername) throws Exception {
        // gọi Service để lấy dữ liệu từ API ngoài
        // yearMonth = 2025/10
        String yearMonth = LocalDate.now().toString().substring(0, 7);
        List<FieldUsage> usageMonthOnwer = dataFetchService.getFieldUsageByMonthOwner(yearMonth, ownerUsername);
        List<FieldUsage> usage7Day = dataFetchService.getFieldUsageBy7daylast();
        WeatherForecast weather = dataFetchService.getWeatherForecast();
        List<HolidayEvent> holidays = dataFetchService.getHolidays();

        List<ForecastResult> results = new ArrayList<>();
        // weather
        for (int i = 0; i < 7; i++) {
            LocalDate targetDate = LocalDate.now().plusDays(i + 1);
            WeatherForecast.ForecastDay weatherDay = weather.getForecast().stream()
                    .filter(f -> f.getDate().equals(targetDate.toString()))
                    .findFirst()
                    .orElse(weather.getForecast().get(0));
            // holiday
            boolean isHoliday = featureService.isHoliday(targetDate, holidays);

            // onwer Field
            for (FieldUsage fieldMonth : usageMonthOnwer) {
                // Tìm field tương ứng trong 7 ngày gần nhất
                FieldUsage field7day = usage7Day.stream()
                        .filter(f -> f.getFieldId() == fieldMonth.getFieldId())
                        .findFirst()
                        .orElse(null);

                float[] featureVec = featureService.buildFeatureVector(
                        fieldMonth, // dữ liệu tháng
                        field7day, // dữ liệu 7 ngày
                        weatherDay,
                        isHoliday);
                // nạp ONNX model, chạy inference → kết quả dự đoán
                float predicted = modelService.predictSingle(featureVec);

                results.add(new ForecastResult(
                        fieldMonth.getFieldId(),
                        fieldMonth.getFieldName(),
                        targetDate.toString(),
                        (Math.floor(predicted))));
            }
        }

        return results;
    }
}
