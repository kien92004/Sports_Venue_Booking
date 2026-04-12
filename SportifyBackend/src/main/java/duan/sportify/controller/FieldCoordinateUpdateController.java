package duan.sportify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.Field;
import duan.sportify.service.FieldService;

import java.util.Map;

/**
 * Controller để cập nhật tọa độ cho một sân cụ thể
 */
@RestController
@RequestMapping("api")
public class FieldCoordinateUpdateController {

    @Autowired
    private FieldService fieldService;

    @PostMapping("admin/field/update-specific-coordinates")
    public ResponseEntity<?> updateSpecificFieldCoordinates(@RequestBody Map<String, Object> request) {
        Integer fieldId;
        Double latitude;
        Double longitude;
        
        try {
            fieldId = Integer.parseInt(request.get("fieldId").toString());
            latitude = Double.parseDouble(request.get("latitude").toString());
            longitude = Double.parseDouble(request.get("longitude").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Dữ liệu không hợp lệ. Vui lòng cung cấp fieldId, latitude và longitude."
            ));
        }
        
        try {
            Field field = fieldService.findById(fieldId);
            field.setLatitude(latitude);
            field.setLongitude(longitude);
            fieldService.update(field);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã cập nhật tọa độ cho sân " + field.getNamefield() + " thành công.",
                "field", field
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể cập nhật tọa độ: " + e.getMessage()
            ));
        }
    }
}