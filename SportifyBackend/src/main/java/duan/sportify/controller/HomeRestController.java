package duan.sportify.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.dao.BookingDetailDAO;
import duan.sportify.dao.EventDAO;
import duan.sportify.dao.ProductDAO;
import duan.sportify.entities.Shifts;
import duan.sportify.service.FootballDataService;
import duan.sportify.service.FootballPredictionService;
import duan.sportify.service.ShiftService;
import duan.sportify.service.HomeService;


@RestController
@RequestMapping("/api/sportify")
public class HomeRestController {
    @Autowired EventDAO eventDAO;
    @Autowired BookingDetailDAO bookingDetailDAO;
    @Autowired ProductDAO productDAO;
    @Autowired FootballDataService footballDataService;
    @Autowired FootballPredictionService footballPredictionService;
	@Autowired ShiftService shiftService;
	@Autowired HomeService homeService;

    @GetMapping
    public Map<String, Object> getHomeData(@RequestParam(required = false) String username) {
        Map<String, Object> data = new HashMap<>();
        data.put("eventList", eventDAO.fillEventInMonth());
        
        // Sử dụng service mới để lấy sân ưu tiên
        data.put("fieldList", homeService.getPrioritizedFieldsForHome(username));
        
        data.put("topproduct", productDAO.Top4OrderProduct());
        return data;
    }


	@GetMapping("football-prediction")
	public Map<String, Object> footballPrediction() {
		Map<String, Object> result = new HashMap<>();
		try {
			System.out.println("🚀 Loading Football Prediction page...");
			
			// Lấy danh sách trận đấu với AI predictions từ Football-Data.org
			List<Map<String, Object>> upcomingMatches = footballPredictionService.getUpcomingMatches();
			result.put("upcomingMatches", upcomingMatches);
			
			// Test API connection
			Map<String, String> apiStatus = footballDataService.testApiConnection();
			result.put("apiStatus", apiStatus);
			
			// Thông tin về API và AI được sử dụng
			result.put("apiInfo", "Tích hợp Football-Data.org API + AI Prediction Engine");
			
			System.out.println("✅ Successfully loaded " + upcomingMatches.size() + " matches with predictions");
			
		} catch (Exception e) {
			System.err.println("❌ Error in footballPrediction controller: " + e.getMessage());
			e.printStackTrace();
			
			// Fallback data nếu có lỗi
			result.put("upcomingMatches", new ArrayList<>());
			result.put("apiInfo", "Đang khắc phục lỗi kết nối API...");
			
			Map<String, String> errorStatus = new HashMap<>();
			errorStatus.put("status", "ERROR");
			errorStatus.put("message", "Lỗi: " + e.getMessage());
			result.put("apiStatus", errorStatus);
		}
		
		return result;
	}

	@GetMapping("football-test")
	public Map<String, Object> footballTest() {
		Map<String, Object> result = new HashMap<>();
		try {
			System.out.println("🧪 Football API Test Mode");
			
			// Test API connection
			Map<String, String> apiStatus = footballDataService.testApiConnection();
			result.put("apiStatus", apiStatus);
			
			// Get real matches
			List<Map<String, Object>> realMatches = footballDataService.getUpcomingMatches();
			result.put("realMatches", realMatches);
			
			// Get enhanced matches with AI
			List<Map<String, Object>> aiMatches = footballPredictionService.getUpcomingMatches();
			result.put("aiMatches", aiMatches);
			
			result.put("message", "🔥 Football-Data.org API + AI Testing 🔥");
			
		} catch (Exception e) {
			System.err.println("❌ Error in football test: " + e.getMessage());
			result.put("error", "Error: " + e.getMessage());
		}
		
		return result;
	}

	@GetMapping("shift")
	public List<Shifts> getShift() {
		return shiftService.findAll();
	}
	
}



