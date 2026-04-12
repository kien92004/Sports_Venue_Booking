package duan.sportify.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.Field;
import duan.sportify.service.FieldService;

@RestController
@RequestMapping("api/debug")
public class FieldDebugController {

    @Autowired
    private FieldService fieldService;

    /**
     * API kiểm tra tất cả các trường có tọa độ hay không
     */
    @GetMapping("/field/all-coordinates")
    public ResponseEntity<?> getAllFieldsWithCoordinates() {
        List<Field> allFields = fieldService.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Field field : allFields) {
            Map<String, Object> fieldInfo = new HashMap<>();
            fieldInfo.put("fieldId", field.getFieldid());
            fieldInfo.put("name", field.getNamefield());
            fieldInfo.put("latitude", field.getLatitude());
            fieldInfo.put("longitude", field.getLongitude());
            fieldInfo.put("hasCoordinates", field.getLatitude() != null && field.getLongitude() != null);
            
            result.add(fieldInfo);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFields", allFields.size());
        summary.put("fieldsWithCoordinates", allFields.stream().filter(f -> f.getLatitude() != null && f.getLongitude() != null).count());
        summary.put("fieldsWithoutCoordinates", allFields.stream().filter(f -> f.getLatitude() == null || f.getLongitude() == null).count());
        summary.put("fields", result);

        return ResponseEntity.ok(summary);
    }
    
    /**
     * API tính toán khoảng cách giữa vị trí người dùng và tất cả các sân
     */
    @GetMapping("/field/calculate-distances")
    public ResponseEntity<?> calculateDistances(
            @RequestParam Double userLat,
            @RequestParam Double userLng) {
        
        List<Field> allFields = fieldService.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Field field : allFields) {
            Map<String, Object> fieldInfo = new HashMap<>();
            fieldInfo.put("fieldId", field.getFieldid());
            fieldInfo.put("name", field.getNamefield());
            fieldInfo.put("latitude", field.getLatitude());
            fieldInfo.put("longitude", field.getLongitude());
            
            // Chỉ tính khoảng cách nếu sân có tọa độ
            if (field.getLatitude() != null && field.getLongitude() != null) {
                double distance = calculateHaversineDistance(
                    userLat, userLng, 
                    field.getLatitude(), field.getLongitude()
                );
                
                fieldInfo.put("distanceKm", distance);
                fieldInfo.put("formattedDistance", formatDistance(distance));
            } else {
                fieldInfo.put("distanceKm", null);
                fieldInfo.put("formattedDistance", "Không có tọa độ");
            }
            
            result.add(fieldInfo);
        }
        
        // Sắp xếp theo khoảng cách tăng dần (gần nhất đầu tiên)
        result.sort((a, b) -> {
            Double distA = (Double) a.get("distanceKm");
            Double distB = (Double) b.get("distanceKm");
            
            if (distA == null && distB == null) return 0;
            if (distA == null) return 1;
            if (distB == null) return -1;
            
            return Double.compare(distA, distB);
        });
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Tính khoảng cách theo công thức Haversine
     */
    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        // Chuyển đổi từ độ sang radian
        lat1 = Math.toRadians(lat1);
        lon1 = Math.toRadians(lon1);
        lat2 = Math.toRadians(lat2);
        lon2 = Math.toRadians(lon2);
        
        // Công thức Haversine
        double dlon = lon2 - lon1;
        double dlat = lat2 - lat1;
        double a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
        double c = 2 * Math.asin(Math.sqrt(a));
        
        // Bán kính trái đất (km)
        double r = 6371;
        
        // Tính khoảng cách
        return c * r;
    }
    
    /**
     * Định dạng khoảng cách để hiển thị
     */
    private String formatDistance(double distance) {
        if (distance < 1) {
            // Nếu dưới 1km, hiển thị bằng mét
            int meters = (int) (distance * 1000);
            return meters + " m";
        } else {
            // Hiển thị km với 2 chữ số thập phân
            return String.format("%.2f km", distance);
        }
    }
}