package duan.sportify.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.service.serviceAIAdmin.ForecastService;
import duan.sportify.service.serviceAIAdmin.ForecastServiceOnwer;

@RestController
@RequestMapping("/api")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @Autowired
    private ForecastServiceOnwer forecastServiceOnwer;

    @CrossOrigin(origins = "*")
    @GetMapping("/forecast/next-week")
    public ResponseEntity<?> predictNextWeek() {
        try {
            return ResponseEntity.ok(forecastService.forecastNextWeek());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/forecast/next-week-owner")
    public ResponseEntity<?> predictNextWeekOwner(
            @RequestParam(required = false) String ownerUsername) {
        try {
            return ResponseEntity.ok(forecastServiceOnwer.forecastNextWeekOwner(ownerUsername));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

// [Client/UI]
// ↓
// (1) /api/forecast/next-week
// ↓
// ForecastController
// ↓
// ForecastService
// ├── DataFetchService → gọi API động (field usage, weather, holiday)
// ├── FeatureEngineeringService → build feature vector (số, flag, ngày, mưa,
// lễ,…)
// └── ModelService → nạp ONNX model, chạy inference → kết quả dự đoán
// ↓
// Trả kết quả JSON cho client.
