package duan.sportify.utils.AI;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.google.api.client.util.Value;

import duan.sportify.entities.Field;
import duan.sportify.entities.Products;
import duan.sportify.entities.Shifts;
import duan.sportify.service.FieldService;
import duan.sportify.service.ProductService;
import duan.sportify.service.ShiftService;

@Component
public class AIActionHandler {
    @Value("${backend.url}")
    private String BACKEND_URL;
    private final ShiftService shiftService;

    private final FieldService fieldService; // service thật của bạn

    private final ProductService productService;

    public AIActionHandler(FieldService fieldService, ShiftService shiftService, ProductService productService) {
        this.fieldService = fieldService;
        this.shiftService = shiftService;
        this.productService = productService;
    }

    public Object handle(Map<String, Object> aiResponse) {
        String action = (String) aiResponse.get("action");

        return switch (action) {
            case "FILTER_FIELDS" -> handleSearchField(aiResponse);
            case "CHECK_FIELD_AVAILABILITY" -> handleCheckField(aiResponse);
            case "BOOK_FIELD" -> handleBookField(aiResponse);
            case "FILTER_PRODUCT" -> handleFilterProduct(aiResponse);
            case "CHECK_PRODUCT_AVAILABILITY" -> handleCheckProductAvailability(aiResponse);
            case "BOOK_PRODUCT" -> handleBookProduct(aiResponse);
            default -> Map.of("message", "Không hiểu yêu cầu hoặc hành động chưa hỗ trợ.");
        };
    }

    private Object handleSearchField(Map<String, Object> aiResponse) {
        List<Map<String, Object>> filters = (List<Map<String, Object>>) aiResponse.get("filters");

        // Lấy toàn bộ danh sách sân
        List<Field> allFields = fieldService.findAll();

        // Kiểm tra các bộ lọc sắp xếp theo giá
        boolean sortByMinPrice = filters.stream()
                .anyMatch(f -> "price".equals(f.get("field")) && "min".equals(f.get("operator")));

        boolean sortByMaxPrice = filters.stream()
                .anyMatch(f -> "price".equals(f.get("field")) && "max".equals(f.get("operator")));

        // Áp dụng các bộ lọc
        List<Field> filtered = allFields.stream()
                .filter(field -> matchesAllFilters(field, filters))
                .collect(Collectors.toList());

        // Sắp xếp theo giá nếu có yêu cầu
        if (sortByMinPrice) {
            filtered.sort(Comparator.comparing(Field::getPrice, Comparator.nullsLast(Comparator.naturalOrder())));
        } else if (sortByMaxPrice) {
            filtered.sort(Comparator.comparing(Field::getPrice, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        // Áp dụng giới hạn nếu có
        int limit = getLimit(filters);
        if (limit > 0 && filtered.size() > limit) {
            filtered = filtered.subList(0, limit);
        }

        return Map.of(
                "message", "Tìm thấy " + filtered.size() + " sân phù hợp.",
                "fields", filtered);
    }

    /** Kiểm tra xem field có thỏa tất cả điều kiện không */
    private boolean matchesAllFilters(Field field, List<Map<String, Object>> filters) {
        for (Map<String, Object> filter : filters) {
            String key = (String) filter.get("field");
            String op = (String) filter.get("operator");
            Object value = filter.get("value");

            if (!matchesSingleFilter(field, key, op, value)) {
                return false;
            }
        }
        return true;
    }

    /** Xử lý từng loại điều kiện */
    private boolean matchesSingleFilter(Field field, String key, String op, Object value) {
        switch (key) {
            case "price" -> {
                double price = field.getPrice() != null ? field.getPrice() : 0;
                return compareNumber(price, op, value);
            }
            case "namefield" -> {
                return compareString(field.getNamefield(), op, value);
            }
            case "address" -> {
                return compareString(field.getAddress(), op, value);
            }
            case "district" -> {
                // Nếu address chứa tên quận, ta kiểm tra substring
                return field.getAddress() != null
                        && field.getAddress().toLowerCase().contains(value.toString().toLowerCase());
            }
            case "type" -> {
                // so sánh theo tên loại sân (trong Sporttype)
                if (field.getSporttype() == null)
                    return false;
                String typeName = field.getSporttype().getCategoryname();
                return typeName.equalsIgnoreCase(value.toString());
            }
            case "status" -> {
                boolean status = field.getStatus() != null && field.getStatus();
                boolean target = Boolean.parseBoolean(value.toString());
                return status == target;
            }
            default -> {
                return true; // không biết field nào thì bỏ qua
            }
        }
    }

    /** So sánh giá trị số */
    private boolean compareNumber(double fieldValue, String op, Object value) {
        if (value == null) {
            // If value is null, we can't compare - return true to avoid filtering out
            return true;
        }

        return switch (op) {
            case "<" -> fieldValue < ((Number) value).doubleValue();
            case ">" -> fieldValue > ((Number) value).doubleValue();
            case "=" -> fieldValue == ((Number) value).doubleValue();
            case "between" -> {
                if (!(value instanceof List) || ((List<?>) value).size() < 2) {
                    yield true; // Invalid format, skip this filter
                }
                List<?> range = (List<?>) value;
                if (range.get(0) == null || range.get(1) == null) {
                    yield true; // One of the values is null, skip this filter
                }
                double min = ((Number) range.get(0)).doubleValue();
                double max = ((Number) range.get(1)).doubleValue();
                yield fieldValue >= min && fieldValue <= max;
            }
            case "min", "max" -> true; // These operators don't need value for filtering, only for sorting
            default -> true;
        };
    }

    /** So sánh chuỗi */
    private boolean compareString(String fieldValue, String op, Object value) {
        if (fieldValue == null)
            return false;

        // Một số operator không cần value (ví dụ min, max)
        if (value == null && (op.equals("min") || op.equals("max"))) {
            return true; // cho phép filter kiểu "min", "max"
        }

        if (value == null)
            return false;

        String field = fieldValue.toLowerCase();
        String v = value.toString().toLowerCase();

        return switch (op) {
            case "=" -> field.equals(v);
            case "contains" -> field.contains(v);
            default -> false;
        };
    }

    /** Lấy giá trị limit nếu có */
    private int getLimit(List<Map<String, Object>> filters) {
        return filters.stream()
                .filter(f -> "limit".equals(f.get("field")))
                .map(f -> ((Number) f.get("value")).intValue())
                .findFirst()
                .orElse(0);
    }

    // check time
    private Object handleCheckField(Map<String, Object> aiResponse) {
        Map<String, Object> params = (Map<String, Object>) aiResponse.get("params");

        String fieldName = (String) params.get("fieldName");
        String date = (String) params.get("date");
        String time = (String) params.get("time");
        String endTime = (String) params.get("endTime");

        // ✅ Kiểm tra dữ liệu bắt buộc
        List<String> missing = new ArrayList<>();
        if (fieldName == null || fieldName.isBlank())
            missing.add("tên sân");
        if (date == null || date.isBlank())
            missing.add("ngày");
        if (!missing.isEmpty()) {
            return Map.of("message", "Vui lòng cung cấp thêm: " + String.join(", ", missing));
        }

        // ✅ Tìm sân
        Optional<Field> optField = fieldService.findFieldByName(fieldName);
        if (optField.isEmpty()) {
            return Map.of("message", "Không tìm thấy sân có tên \"" + fieldName + "\"");
        }
        Field field = optField.get();

        // ✅ Lấy toàn bộ ca trống trong ngày
        List<Shifts> allAvailable = shiftService.findShiftDate(field.getFieldid(), date);
        if (allAvailable.isEmpty()) {
            return Map.of("message", "Sân " + fieldName + " không còn ca trống vào ngày " + date);
        }

        // Nếu không có time -> trả toàn bộ ca trống
        if (time == null || time.isBlank()) {
            return Map.of(
                    "message", "Sân " + fieldName + " còn " + allAvailable.size() + " ca trống vào ngày " + date,
                    "fieldId", field.getFieldid(),
                    "fieldName", field.getNamefield(),
                    "date", date,
                    "availableShifts", allAvailable);
        }

        // ✅ Xử lý khung giờ
        LocalTime start = LocalTime.parse(time);
        LocalTime end = (endTime != null && !endTime.isBlank()) ? LocalTime.parse(endTime) : null;

        // ✅ Lọc ra các ca hoàn toàn nằm trong khoảng yêu cầu
        List<Shifts> matchedShifts = allAvailable.stream()
                .filter(s -> {
                    LocalTime shiftStart = s.getStarttime();
                    LocalTime shiftEnd = s.getEndtime();

                    if (end == null) {
                        // Chỉ kiểm tra nếu ca bắt đầu sau giờ yêu cầu
                        return !shiftEnd.isBefore(start);
                    } else {
                        // Chỉ lấy những ca nằm hoàn toàn trong [start, end]
                        return !shiftStart.isBefore(start) && !shiftEnd.isAfter(end);
                    }
                })
                .sorted(Comparator.comparing(Shifts::getStarttime))
                .collect(Collectors.toList());

        // ✅ Gom các ca liên tiếp (nếu ca kết thúc khớp giờ bắt đầu ca tiếp theo)
        List<List<Shifts>> shiftGroups = groupContinuousShifts(matchedShifts);

        if (shiftGroups.isEmpty()) {
            String timeText = "từ " + time + (endTime != null ? " đến " + endTime : "");
            return Map.of("message", "Sân " + fieldName + " không còn ca trống vào " + date + " " + timeText);
        }

        return Map.of(
                "message",
                "Sân " + fieldName + " có " + shiftGroups.size() + " nhóm ca trống phù hợp trong khung giờ yêu cầu.",
                "fieldId", field.getFieldid(),
                "fieldName", field.getNamefield(),
                "date", date,
                "availableShiftGroups", shiftGroups);
    }

    /**
     * Gom các ca liên tiếp (ca sau bắt đầu ngay khi ca trước kết thúc)
     * → ví dụ: [08:00–09:00, 09:00–10:00] => 1 nhóm liên tục
     */
    private List<List<Shifts>> groupContinuousShifts(List<Shifts> shifts) {
        List<List<Shifts>> groups = new ArrayList<>();
        if (shifts.isEmpty())
            return groups;

        List<Shifts> currentGroup = new ArrayList<>();
        currentGroup.add(shifts.get(0));

        for (int i = 1; i < shifts.size(); i++) {
            Shifts prev = shifts.get(i - 1);
            Shifts current = shifts.get(i);

            if (current.getStarttime().equals(prev.getEndtime())) {
                currentGroup.add(current);
            } else {
                groups.add(new ArrayList<>(currentGroup));
                currentGroup.clear();
                currentGroup.add(current);
            }
        }
        groups.add(currentGroup);
        return groups;
    }

    private Object handleBookField(Map<String, Object> aiResponse) {
        Map<String, Object> params = (Map<String, Object>) aiResponse.get("params");

        String fieldName = (String) params.get("fieldName");
        String date = (String) params.get("date");
        String timeStr = (String) params.get("time");

        // ✅ Kiểm tra thông tin bắt buộc
        List<String> missing = new ArrayList<>();
        if (fieldName == null || fieldName.isBlank())
            missing.add("tên sân");
        if (date == null || date.isBlank())
            missing.add("ngày");
        if (timeStr == null || timeStr.isBlank())
            missing.add("giờ");
        if (!missing.isEmpty()) {
            return Map.of("message", "Vui lòng cung cấp thêm thông tin để đặt sân: " + String.join(", ", missing));
        }

        // ✅ Tìm sân theo tên
        Optional<Field> optionalField = fieldService.findFieldByName(fieldName);
        if (optionalField.isEmpty()) {
            return Map.of("message", "Không tìm thấy sân có tên \"" + fieldName + "\"");
        }

        Field field = optionalField.get();
        int idField = field.getFieldid();

        // ✅ Lấy danh sách ca còn trống
        List<Shifts> shifts = shiftService.findShiftDate(idField, date);
        if (shifts.isEmpty()) {
            return Map.of("message", "Sân " + fieldName + " không còn ca trống vào ngày " + date);
        }

        // ✅ Tìm ca khớp với giờ yêu cầu
        Optional<Shifts> match = shifts.stream()
                .filter(s -> s.getStarttime().equals(LocalTime.parse(timeStr)))
                .findFirst();

        if (match.isEmpty()) {
            return Map.of("message", "Không tìm thấy ca bắt đầu vào " + timeStr + " cho sân " + fieldName);
        }

        int shiftId = match.get().getShiftid();

        // ✅ Tạo URL chuyển hướng
        String bookingUrl = String.format(
                BACKEND_URL + "/api/user/field/booking/%d?shiftid=%d&dateselect=%s",
                idField, shiftId, date);

        // ✅ Trả về redirect (frontend hoặc Spring có thể dùng trực tiếp)
        return Map.of(
                "message", "Đang chuyển đến trang đặt sân...",
                "redirectUrl", bookingUrl,
                "fieldName", fieldName,
                "date", date,
                "time", timeStr);
    }

    private Object handleFilterProduct(Map<String, Object> aiResponse) {
        // Lấy filters từ AI response
        List<Map<String, Object>> filters = (List<Map<String, Object>>) aiResponse.get("filters");
        if (filters == null || filters.isEmpty()) {
            return Map.of("message", "Vui lòng cung cấp điều kiện lọc sản phẩm.");
        }

        // Lấy toàn bộ sản phẩm
        List<Products> allProducts = productService.findAll();

        // Kiểm tra các bộ lọc sắp xếp theo giá
        boolean sortByMinPrice = filters.stream()
                .anyMatch(f -> "price".equals(f.get("product")) && "min".equals(f.get("operator")));
        boolean sortByMaxPrice = filters.stream()
                .anyMatch(f -> "price".equals(f.get("product")) && "max".equals(f.get("operator")));

        // Áp dụng các bộ lọc
        List<Products> filtered = allProducts.stream()
                .filter(product -> matchesAllProductFilters(product, filters))
                .collect(Collectors.toList());

        // Sắp xếp theo giá nếu có yêu cầu
        if (sortByMinPrice) {
            filtered.sort(Comparator.comparing(Products::getPrice, Comparator.nullsLast(Comparator.naturalOrder())));
        } else if (sortByMaxPrice) {
            filtered.sort(Comparator.comparing(Products::getPrice, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        // Áp dụng giới hạn nếu có
        int limit = getProductLimit(filters);
        if (limit > 0 && filtered.size() > limit) {
            filtered = filtered.subList(0, limit);
        }

        if (filtered.isEmpty()) {
            return Map.of("message", "Không tìm thấy sản phẩm phù hợp với điều kiện lọc.");
        }

        return Map.of(
                "message", "Tìm thấy " + filtered.size() + " sản phẩm phù hợp.",
                "products", filtered);
    }

    /** Kiểm tra sản phẩm có thỏa tất cả điều kiện không */
    private boolean matchesAllProductFilters(Products product, List<Map<String, Object>> filters) {
        for (Map<String, Object> filter : filters) {
            String key = (String) filter.get("product");
            String op = (String) filter.get("operator");
            Object value = filter.get("value");

            if (!matchesSingleProductFilter(product, key, op, value)) {
                return false;
            }
        }
        return true;
    }

    /** Xử lý từng loại điều kiện cho sản phẩm */
    private boolean matchesSingleProductFilter(Products product, String key, String op, Object value) {
        switch (key) {
            case "price" -> {
                double price = product.getPrice() != null ? product.getPrice() : 0;
                return compareNumber(price, op, value);
            }
            case "category" -> {
                if (product.getCategories() == null)
                    return false;
                String categoryName = product.getCategories().getCategoryname();
                return compareString(categoryName, op, value);
            }
            case "brand" -> {
                // Nếu có trường brand trong Products
                if (product.getCategories() == null)
                    return false;
                return compareString(product.getCategories().getCategoryname(), op, value);
            }
            case "productname" -> {
                return compareString(product.getProductname(), op, value);
            }
            case "limit" -> {
                return true; // chỉ dùng cho limit, không lọc
            }
            default -> {
                return true;
            }
        }
    }

    /** Lấy giá trị limit nếu có cho sản phẩm */
    private int getProductLimit(List<Map<String, Object>> filters) {
        return filters.stream()
                .filter(f -> "limit".equals(f.get("product")))
                .map(f -> ((Number) f.get("value")).intValue())
                .findFirst()
                .orElse(0);
    }

    private Object handleCheckProductAvailability(Map<String, Object> aiResponse) {
        Map<String, Object> params = (Map<String, Object>) aiResponse.get("params");
        if (params == null) {
            return Map.of("message", "Vui lòng cung cấp thông tin sản phẩm để kiểm tra.");
        }
        String productName = (String) params.get("productName");
        if (productName == null || productName.isBlank()) {
            return Map.of("message", "Vui lòng cung cấp tên sản phẩm để kiểm tra.");
        }

        List<Products> products = productService.findByProductName(productName);
        if (products.isEmpty()) {
            return Map.of("message", "Không tìm thấy sản phẩm nào tên \"" + productName + "\".");
        }
        Products product = products.get(0);
        boolean available = product.getQuantity() != null && product.getQuantity() > 0;

        return Map.of(
                "message", available
                        ? "Sản phẩm \"" + product.getProductname() + "\" hiện còn hàng (" + product.getQuantity() + ")."
                        : "Sản phẩm \"" + product.getProductname() + "\" đã hết hàng.",
                "product", product);
    }

    private Object handleBookProduct(Map<String, Object> aiResponse) {
        Map<String, Object> params = (Map<String, Object>) aiResponse.get("params");
        if (params == null) {
            return Map.of("message", "Vui lòng cung cấp thông tin sản phẩm để đặt hàng.");
        }
        String productName = (String) params.get("productName");
        Integer quantity = params.get("quantity") instanceof Number ? ((Number) params.get("quantity")).intValue()
                : null;
        if (productName == null || productName.isBlank()) {
            return Map.of("message", "Vui lòng cung cấp tên sản phẩm để đặt hàng.");
        }
        if (quantity == null || quantity <= 0) {
            return Map.of("message", "Vui lòng cung cấp số lượng hợp lệ để đặt hàng.");
        }

        List<Products> products = productService.findByProductName(productName);
        if (products.isEmpty()) {
            return Map.of("message", "Không tìm thấy sản phẩm nào tên \"" + productName + "\".");
        }
        Products product = products.get(0);

        String checkoutUrl = BACKEND_URL + "/api/user/cart/add/" + product.getProductid() + "?quantity="
                + quantity;
        return Map.of(
                "message", "Đang chuyển đến trang đặt hàng...",
                "redirectUrl", checkoutUrl,
                "product", product,
                "quantity", quantity);
    }

}
