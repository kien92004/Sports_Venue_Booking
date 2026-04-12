package duan.sportify.DTO;

import duan.sportify.entities.Field;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FieldWithDistanceDTO {
    private Field field;
    private Double distance; // khoảng cách tính bằng km
    private String formattedDistance; // khoảng cách đã được định dạng (VD: "1.2 km")
}