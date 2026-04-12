package duan.sportify.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
public class FieldRequestAI {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class requestDataAI {
        private List<FieldInfo> fields;
        private List<EventInfo> events;
        private List<ProductsInfo> products;
        private List<FavoriteInfo> favoriteInfo;
        private UserInfo users;
    }

    // 🏟️ Thông tin user
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String username;
        private String firstname;
        private String lastname;
        private String phone;
        private String email;
        private String address;
        private Boolean gender;

    }

    // 🏟️ Thông tin sân
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldInfo {
        private Integer fieldId;
        private String nameField;
        private String descriptionField;
        private Double price;
        private String address;

        // lien ket
        private String sportType;
    }

    // 🎉 Thông tin sự kiện
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventInfo {
        private Integer eventId;
        private String nameEvent;
        private Date dateStart;
        private Date dateEnd;
        private String descriptions;
        private String eventType;

        // Mối quan hệ phụ thuộc
    }

    // ⏰ Thông tin ca (shift)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShiftsInfo {
        private Integer shiftId;
        private String nameShift;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    // 🛒 Thông tin sản phẩm
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductsInfo {
        private Integer productId;
        private Integer categoryId;
        private String productName;
        private Double discountPrice;
        private Double price;
        private Boolean productStatus;
        private String descriptions;
        private Integer quantity;

        // Gợi ý: liên kết với danh mục
        private String categoryName;

    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FavoriteInfo {
        private String username;
        private FieldInfo fieldInfo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class ActionDTO {
    private String action; // FILTER_FIELDS | CHECK_FIELD_AVAILABILITY | BOOK_FIELD | UNKNOWN
    private Map<String, Object> params; // params or filters
    private List<Map<String,Object>> filters; // optional
    }
}
