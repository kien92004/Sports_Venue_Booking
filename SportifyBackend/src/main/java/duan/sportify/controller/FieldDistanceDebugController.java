package duan.sportify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.Field;
import duan.sportify.service.FieldService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller để kiểm tra khoảng cách chính xác giữa tọa độ người dùng và các sân
 */
@RestController
@RequestMapping("api")
public class FieldDistanceDebugController {

    @Autowired
    private FieldService fieldService;

    @GetMapping("admin/field/debug-distances")
    public ResponseEntity<?> debugFieldDistances(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        
        List<Field> allFields = fieldService.findAll();
        List<Map<String, Object>> fieldsWithDistances = new ArrayList<>();
        
        for (Field field : allFields) {
            if (field.getLatitude() != null && field.getLongitude() != null) {
                Map<String, Object> fieldInfo = new HashMap<>();
                
                // Tính khoảng cách (km) giữa hai tọa độ sử dụng công thức Haversine
                double distance = calculateHaversine(
                    latitude, longitude, field.getLatitude(), field.getLongitude());
                
                fieldInfo.put("fieldId", field.getFieldid());
                fieldInfo.put("name", field.getNamefield());
                fieldInfo.put("latitude", field.getLatitude());
                fieldInfo.put("longitude", field.getLongitude());
                fieldInfo.put("distance", distance);
                fieldInfo.put("formattedDistance", formatDistance(distance));
                fieldInfo.put("sportTypeId", field.getSporttype().getSporttypeid());
                
                fieldsWithDistances.add(fieldInfo);
            }
        }
        
        // Sắp xếp các sân theo khoảng cách tăng dần
        fieldsWithDistances.sort((m1, m2) -> {
            Double d1 = (Double) m1.get("distance");
            Double d2 = (Double) m2.get("distance");
            return d1.compareTo(d2);
        });
        
        return ResponseEntity.ok(Map.of(
            "userCoordinates", Map.of(
                "latitude", latitude,
                "longitude", longitude
            ),
            "totalFields", allFields.size(),
            "fieldsWithCoordinates", fieldsWithDistances.size(),
            "fieldsWithDistances", fieldsWithDistances
        ));
    }
    
    /**
     * Tính khoảng cách giữa hai tọa độ sử dụng công thức Haversine
     */
    private double calculateHaversine(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371; // Bán kính Trái Đất (km)
        
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
                   
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return earthRadius * c; // Khoảng cách (km)
    }
    
    /**
     * Format khoảng cách để dễ đọc
     */
    private String formatDistance(double distance) {
        if (distance < 1) {
            // Nếu dưới 1km, hiển thị bằng mét
            return String.format("%.0f m", distance * 1000);
        } else {
            // Hiển thị bằng km với 2 chữ số thập phân
            return String.format("%.2f km", distance);
        }
    }
}