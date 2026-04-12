package duan.sportify.utils;

import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import duan.sportify.DTO.APIOutside.GoogleEventCalander;
import duan.sportify.DTO.APIOutside.WeatherResponseDTO;
import duan.sportify.rest.controller.ReportBookingRestController;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class APIOutside {

    private final ReportBookingRestController reportBookingRestController;
    @Value("${google.api.calendar.key}")
    private String API_KEY;
    @Value("${weatherapi.api.key}")
    private String weatherapi;

    private final String CALENDAR_ID = "en.vietnamese%23holiday@group.v.calendar.google.com";

    APIOutside(ReportBookingRestController reportBookingRestController) {
        this.reportBookingRestController = reportBookingRestController;
    }

    public List<GoogleEventCalander> getVietnamHolidays() {
        String url = "https://www.googleapis.com/calendar/v3/calendars/" + CALENDAR_ID + "/events?key=" + API_KEY;
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                URI.create(url),
                HttpMethod.GET,
                new HttpEntity<>(new HttpHeaders()),
                String.class);

        List<GoogleEventCalander> events = new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            //  String day = "2024-09-01"  ;
            // LocalDate today = LocalDate.parse(day);
            LocalDate today = LocalDate.now();
            LocalDate oneWeekLater = today.plusDays(7);
            for (JsonNode item : root.path("items")) {
                LocalDate startDate = LocalDate.parse(item.path("start").path("date").asText());
                if(!startDate.isBefore(today) && !startDate.isAfter(oneWeekLater)) {
                    String summary = item.path("summary").asText();
                    String endDate = item.path("end").path("date").asText();
                    events.add(new GoogleEventCalander(summary, startDate.toString(), endDate));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return events;
    }

    public WeatherResponseDTO get7DayForecast(String location) throws Exception {
          String encodedLocation = URLEncoder.encode(location, StandardCharsets.UTF_8);
        String url = String.format(
                "https://api.weatherapi.com/v1/forecast.json?key=%s&q=%s&days=7",
                weatherapi, encodedLocation);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                URI.create(url),
                HttpMethod.GET,
                new HttpEntity<>(new HttpHeaders()),
                String.class);

        WeatherResponseDTO weatherResponse = new WeatherResponseDTO();
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.getBody());
        weatherResponse.setLocationName(root.path("location").path("name").asText());

           // --- CURRENT ---
        WeatherResponseDTO.CurrentWeather current = new WeatherResponseDTO.CurrentWeather();
        JsonNode currentNode = root.path("current");
        current.setTempC(currentNode.path("temp_c").asDouble());
        current.setConditionText(currentNode.path("condition").path("text").asText());
        current.setConditionIcon(currentNode.path("condition").path("icon").asText());
        weatherResponse.setCurrent(current);

        // --- FORECAST ---
        List<WeatherResponseDTO.ForecastDay> forecastList = new ArrayList<>();
        for (JsonNode dayNode : root.path("forecast").path("forecastday")) {
            WeatherResponseDTO.ForecastDay fd = new WeatherResponseDTO.ForecastDay();
            fd.setDate(dayNode.path("date").asText());
            fd.setAvgtempC(dayNode.path("day").path("avgtemp_c").asDouble());
            fd.setDailyChanceOfRain(dayNode.path("day").path("daily_chance_of_rain").asInt());
            fd.setConditionText(dayNode.path("day").path("condition").path("text").asText());
            fd.setConditionIcon(dayNode.path("day").path("condition").path("icon").asText());
            forecastList.add(fd);
        }
        weatherResponse.setForecast(forecastList);

        return weatherResponse;
    }


}
