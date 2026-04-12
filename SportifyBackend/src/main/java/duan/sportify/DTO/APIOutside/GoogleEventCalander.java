package duan.sportify.DTO.APIOutside;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor   
@NoArgsConstructor 
public class GoogleEventCalander {
    private String summary;
    private String startDate;
    private String endDate; 
}
