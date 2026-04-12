package duan.sportify.service.serviceAIAdmin;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import duan.sportify.DTO.APIOutside.FieldUsage;
import duan.sportify.DTO.APIOutside.HolidayEvent;
import duan.sportify.DTO.APIOutside.WeatherForecast;

@Service
public class DataFetchService {
    @Value("${backend.url}")
    private String BACKEND_URL;

    private final RestTemplate restTemplate;

    public DataFetchService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    // ALL fields
    public List<FieldUsage> getFieldUsageByDate(LocalDate date) {
        String url = BACKEND_URL + "/api/field-usage/active-fields/by-date?date=" + date;
        ResponseEntity<FieldUsage[]> response = restTemplate.getForEntity(url, FieldUsage[].class);
        return Arrays.asList(response.getBody());
    }

    public List<FieldUsage> getFieldUsageByMonth(String yearMonth) {
        String url = BACKEND_URL + "/api/field-usage/active-fields/by-month?yearMonth=" + yearMonth;
        ResponseEntity<FieldUsage[]> response = restTemplate.getForEntity(url, FieldUsage[].class);
        System.out.println("response" + response.getBody());
        return Arrays.asList(response.getBody());
    }

    public List<FieldUsage> getFieldUsageBy7daylast() {
        String url = BACKEND_URL + "/api/field-usage/active-fields/by-7daylast";
        ResponseEntity<FieldUsage[]> response = restTemplate.getForEntity(url, FieldUsage[].class);
        return Arrays.asList(response.getBody());
    }

    // Owner Field
    public List<FieldUsage> getFieldUsageByMonthOwner(String yearMonth, String ownerUsername) {
        String url = BACKEND_URL + "/api/field-usage/active-fields/by-month?yearMonth=" + yearMonth + "&ownerUsername="
                + ownerUsername;
        ResponseEntity<FieldUsage[]> response = restTemplate.getForEntity(url, FieldUsage[].class);
        return Arrays.asList(response.getBody());
    }

    public List<FieldUsage> getFieldUsageBy7daylastOwner(String ownerUsername) {
        String url = BACKEND_URL + "/api/field-usage/active-fields/by-7daylast?&ownerUsername="
                + ownerUsername;
        ResponseEntity<FieldUsage[]> response = restTemplate.getForEntity(url, FieldUsage[].class);
        return Arrays.asList(response.getBody());
    }
    // weather

    public WeatherForecast getWeatherForecast() {
        String url = BACKEND_URL + "/api/forecast/weather";
        return restTemplate.getForObject(url, WeatherForecast.class);
    }

    public List<HolidayEvent> getHolidays() {
        String url = BACKEND_URL + "/api/forecast/holiday";
        ResponseEntity<HolidayEvent[]> response = restTemplate.getForEntity(url, HolidayEvent[].class);
        return Arrays.asList(response.getBody());
    }

}
