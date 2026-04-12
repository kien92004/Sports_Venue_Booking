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
import java.util.stream.Collectors;

/**
 * Controller kiểm tra tọa độ của các sân bóng
 */
@RestController
@RequestMapping("api")
public class FieldCoordinatesCheckController {

    @Autowired
    private FieldService fieldService;

    @GetMapping("admin/field/check-coordinates")
    public ResponseEntity<?> checkFieldCoordinates() {
        // Lấy tất cả sân bóng
        List<Field> allFields = fieldService.findAll();
        
        // Đếm số lượng sân có tọa độ và không có tọa độ
        int withCoordinates = 0;
        int withoutCoordinates = 0;
        
        // Danh sách sân không có tọa độ
        List<Map<String, Object>> fieldsWithoutCoordinates = allFields.stream()
            .filter(field -> field.getLatitude() == null || field.getLongitude() == null)
            .map(field -> {
                Map<String, Object> fieldInfo = new HashMap<>();
                fieldInfo.put("fieldId", field.getFieldid());
                fieldInfo.put("name", field.getNamefield());
                fieldInfo.put("address", field.getAddress());
                return fieldInfo;
            })
            .collect(Collectors.toList());
        
        // Danh sách sân có tọa độ
        List<Map<String, Object>> fieldsWithCoordinates = allFields.stream()
            .filter(field -> field.getLatitude() != null && field.getLongitude() != null)
            .map(field -> {
                Map<String, Object> fieldInfo = new HashMap<>();
                fieldInfo.put("fieldId", field.getFieldid());
                fieldInfo.put("name", field.getNamefield());
                fieldInfo.put("latitude", field.getLatitude());
                fieldInfo.put("longitude", field.getLongitude());
                return fieldInfo;
            })
            .collect(Collectors.toList());
        
        // Đếm sân có và không có tọa độ
        withCoordinates = fieldsWithCoordinates.size();
        withoutCoordinates = fieldsWithoutCoordinates.size();
        
        return ResponseEntity.ok(Map.of(
            "totalFields", allFields.size(),
            "withCoordinates", withCoordinates,
            "withoutCoordinates", withoutCoordinates,
            "fieldsWithoutCoordinates", fieldsWithoutCoordinates,
            "fieldsWithCoordinates", fieldsWithCoordinates
        ));
    }
}