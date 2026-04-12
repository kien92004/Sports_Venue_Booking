package duan.sportify.DTO;

import java.util.Map;
import lombok.Data;


@Data
public class AIRequest {
    private String intent;
    private Map<String, Object> params;
    private String userId;
}
