package duan.sportify.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import duan.sportify.DTO.APIOutside.GoogleEventCalander;
import duan.sportify.DTO.APIOutside.WeatherResponseDTO;
import duan.sportify.utils.APIOutside;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("api/forecast")
public class GoogleCalendarController {

    @Autowired
    private APIOutside googleCalanderEvent ;

    @GetMapping("/holiday")
    public List<GoogleEventCalander> getHolidays() {
        return googleCalanderEvent.getVietnamHolidays();
    }

    @GetMapping("/weather")
    public WeatherResponseDTO get7DayForecast(@RequestParam (defaultValue = "Ho Chi Minh") String location) {
        System.out.println("Location received: " + location);
        try {
            return googleCalanderEvent.get7DayForecast(location);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
