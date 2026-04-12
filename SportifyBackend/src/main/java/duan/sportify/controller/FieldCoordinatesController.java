package duan.sportify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.Field;
import duan.sportify.service.FieldService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Controller tạm thời để cập nhật dữ liệu tọa độ cho các sân bóng
 * (Có thể xóa sau khi đã cập nhật dữ liệu)
 */
@RestController
@RequestMapping("api")
public class FieldCoordinatesController {

    @Autowired
    private FieldService fieldService;

    @GetMapping("admin/field/update-coordinates")
    public ResponseEntity<?> updateFieldCoordinates() {
        // Lấy tất cả sân bóng
        List<Field> allFields = fieldService.findAll();
        int updatedCount = 0;
        
        // Danh sách các sân bóng và tọa độ tương ứng
        Map<String, double[]> fieldCoordinates = new HashMap<>();
        
        // Thêm tọa độ cho các sân dựa trên địa chỉ hoặc tên
        // An Hội
        fieldCoordinates.put("An Hội", new double[]{10.8363776, 106.6893312});
        // TNG
        fieldCoordinates.put("TNG", new double[]{10.8408233, 106.6802108});
        // Sân Nguyễn Kiệm
        fieldCoordinates.put("Nguyễn Kiệm", new double[]{10.8230, 106.6296});
        // Phan Văn Trị
        fieldCoordinates.put("Phan Văn Trị", new double[]{10.8305, 106.6635});
        // Thủ Đức
        fieldCoordinates.put("Thủ Đức", new double[]{10.8484, 106.7811});
        // Quận 1
        fieldCoordinates.put("Quận 1", new double[]{10.7769, 106.6980});
        // Quận 10
        fieldCoordinates.put("Quận 10", new double[]{10.7732, 106.6674});
        // Quận 7
        fieldCoordinates.put("Quận 7", new double[]{10.7278, 106.7141});
        // Quận 2
        fieldCoordinates.put("Quận 2", new double[]{10.7894, 106.7501});
        // Phú Mỹ Hưng
        fieldCoordinates.put("Phú Mỹ Hưng", new double[]{10.7286, 106.7214});
        // Thủ Thiêm
        fieldCoordinates.put("Thủ Thiêm", new double[]{10.7848, 106.7487});
        // Tân Bình
        fieldCoordinates.put("Tân Bình", new double[]{10.8031, 106.6599});
        // Tân Phú
        fieldCoordinates.put("Tân Phú", new double[]{10.7859, 106.6256});
        // Bình Thạnh
        fieldCoordinates.put("Bình Thạnh", new double[]{10.8109, 106.7107});

        // Cập nhật tọa độ cho các sân bóng
        for (Field field : allFields) {
            boolean updated = false;
            
            // Kiểm tra xem sân đã có tọa độ chưa
            if (field.getLatitude() == null || field.getLongitude() == null) {
                // Tìm tọa độ dựa trên tên hoặc địa chỉ
                for (Map.Entry<String, double[]> entry : fieldCoordinates.entrySet()) {
                    String keyword = entry.getKey();
                    double[] coordinates = entry.getValue();
                    
                    if ((field.getNamefield() != null && field.getNamefield().contains(keyword)) || 
                        (field.getAddress() != null && field.getAddress().contains(keyword))) {
                        field.setLatitude(coordinates[0]);
                        field.setLongitude(coordinates[1]);
                        fieldService.update(field);
                        updatedCount++;
                        updated = true;
                        break;
                    }
                }
                
                // Nếu không tìm thấy tọa độ phù hợp, đặt tọa độ ngẫu nhiên xung quanh trung tâm TP.HCM
                if (!updated) {
                    double baseLat = 10.7769;
                    double baseLng = 106.7;
                    double range = 0.075; // Khoảng ±0.075 độ (khoảng 8km)
                    
                    double randomLat = baseLat + (Math.random() * range * 2 - range);
                    double randomLng = baseLng + (Math.random() * range * 2 - range);
                    
                    field.setLatitude(randomLat);
                    field.setLongitude(randomLng);
                    fieldService.update(field);
                    updatedCount++;
                }
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đã cập nhật tọa độ cho " + updatedCount + " sân bóng.",
            "totalFields", allFields.size()
        ));
    }
}