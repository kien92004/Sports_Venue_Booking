package duan.sportify.service.impl;

import duan.sportify.entities.*;
import duan.sportify.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AdminGeminiServiceImpl - Sử dụng Google Generative AI (Gemini) cho Admin
 * Gọi Gemini API bằng REST với context từ database
 */
@Service
public class AdminGeminiServiceImpl implements AIService {

    @Value("${gemini.api.key:AIzaSyCMzeffGly3YyAHiiBhcdppK8F1Hs-1KmA}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.0-flash-exp}")
    private String geminiModel;

    @Autowired
    private ProductService productService;
    
    @Autowired
    private FieldService fieldService;
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private ShiftService shiftService;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private OrderService orderService;

    @Override
    public Object data() {
        return null;
    }

    @Override
    public String chat(String message) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "⚠️ Gemini API key chưa được cấu hình.";
        }

        try {
            // Lấy dữ liệu từ tất cả các service
            List<Products> products = productService.findAll();
            List<Field> fields = fieldService.findAll();
            List<Eventweb> events = eventService.findAll();
            List<Users> users = userService.findAll();
            List<Categories> categories = categoryService.findAll();
            List<Shifts> shifts = shiftService.findAll();
            List<Bookings> bookings = bookingService.findAll();
            List<Orders> orders = orderService.findAll();
            
            // Xây dựng context HTML cho tất cả
            String productHTML = buildProductHTML(products, categories);
            String fieldHTML = buildFieldHTML(fields);
            String eventHTML = buildEventHTML(events);
            String userHTML = buildUserHTML(users);
            String shiftHTML = buildShiftHTML(shifts);
            String categoryHTML = buildCategoryHTML(categories);
            String bookingHTML = buildBookingHTML(bookings);
            String revenueHTML = buildRevenueHTML(bookings, orders);

            // Xây dựng prompt với tất cả context
            String prompt = buildAdminPrompt(message, productHTML, fieldHTML, eventHTML, userHTML, shiftHTML, categoryHTML, bookingHTML, revenueHTML);

            System.out.println("🔵 Gọi Gemini API (Admin) với câu hỏi: " + message);
            System.out.println("📦 Dữ liệu: " + products.size() + " sản phẩm, " + 
                             fields.size() + " sân, " + events.size() + " sự kiện, " +
                             users.size() + " người dùng, " + categories.size() + " danh mục, " +
                             bookings.size() + " booking, " + orders.size() + " đơn hàng");

            // Retry logic - thử lại 3 lần nếu lỗi
            int maxRetries = 3;
            int retryCount = 0;
            Exception lastException = null;
            
            while (retryCount < maxRetries) {
                try {
                    String response = callGeminiAPI(prompt);
                    if (response != null && !response.isEmpty()) {
                        System.out.println("✅ Response nhận được từ Gemini (Admin)");
                        return response;
                    }
                } catch (Exception ex) {
                    lastException = ex;
                    retryCount++;
                    System.out.println("⏳ Lần thử lại " + retryCount + "/" + maxRetries + ": " + ex.getMessage());
                    
                    if (retryCount < maxRetries) {
                        // Chờ 1 giây trước khi thử lại
                        Thread.sleep(1000);
                    }
                }
            }
            
            // Nếu tất cả lần thử đều fail
            if (lastException != null) {
                System.out.println("❌ Lỗi sau " + maxRetries + " lần thử: " + lastException.getMessage());
                return "😅 Xin lỗi, AI Gemini đang quá tải. Vui lòng thử lại sau vài giây!";
            }
            
            return "❌ Không nhận được phản hồi từ Gemini";
        } catch (Exception ex) {
            System.out.println("❌ Exception: " + ex.getClass().getName() + " - " + ex.getMessage());
            ex.printStackTrace();
            return "😅 Có lỗi xảy ra: " + ex.getMessage();
        }
    }

    /**
     * Gọi Gemini API với retry logic
     */
    private String callGeminiAPI(String prompt) throws Exception {
        Map<String, Object> payload = Map.of(
            "contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        RestTemplate restTemplate = new RestTemplate();
        String url = String.format(
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
            geminiModel, geminiApiKey
        );

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> res = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) 
            restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(payload, headers), Map.class);

        System.out.println("📥 Response Status: " + res.getStatusCode());

        String result = extractGeminiText(res.getBody());
        // Làm sạch markdown formatting từ response
        result = cleanMarkdownFormatting(result);
        return result;
    }

    /**
     * Xây dựng danh sách sản phẩm dưới dạng HTML
     */
    private String buildProductHTML(List<Products> products, List<Categories> categories) {
        if (products == null || products.isEmpty()) return "Chưa có sản phẩm nào.";
        
        return "<h3>📦 Quản Lý Sản Phẩm</h3>" + products.stream()
            .limit(20)
            .map(product -> {
                String categoryName = categories.stream()
                    .filter(c -> c.getCategoryid().equals(product.getCategoryid()))
                    .map(Categories::getCategoryname)
                    .findFirst()
                    .orElse("Không xác định");
                
                return String.format(
                    "<div style=\"border: 1px solid #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f5f5f5;\">" +
                    "<strong>%s</strong> - %.0f VND<br>" +
                    "Danh mục: %s | Số lượng: %d<br>" +
                    "%s" +
                    "</div>",
                    product.getProductname(),
                    product.getPrice(),
                    categoryName,
                    product.getQuantity(),
                    product.getDescriptions() != null ? product.getDescriptions() : ""
                );
            })
            .collect(Collectors.joining());
    }

    /**
     * Xây dựng danh sách sân dưới dạng HTML
     */
    private String buildFieldHTML(List<Field> fields) {
        if (fields == null || fields.isEmpty()) return "Chưa có sân nào.";
        
        return "<h3>⚽ Quản Lý Sân Thể Thao</h3>" + fields.stream()
            .limit(20)
            .map(field -> String.format(
                "<div style=\"border: 1px solid #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f5f5f5;\">" +
                "<strong>%s</strong> - %.0f VND/giờ<br>" +
                "Địa chỉ: %s<br>" +
                "Trạng thái: %s" +
                "</div>",
                field.getNamefield(),
                field.getPrice(),
                field.getAddress(),
                (field.getStatus() != null && field.getStatus()) ? "Hoạt động ✅" : "Đã tắt ❌"
            ))
            .collect(Collectors.joining());
    }

    /**
     * Xây dựng danh sách sự kiện dưới dạng HTML
     */
    private String buildEventHTML(List<Eventweb> events) {
        if (events == null || events.isEmpty()) return "Chưa có sự kiện nào.";
        
        return "<h3>📅 Quản Lý Sự Kiện</h3>" + events.stream()
            .limit(20)
            .map(event -> String.format(
                "<div style=\"border: 1px solid #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f5f5f5;\">" +
                "<strong>%s</strong><br>" +
                "Mô tả: %s<br>" +
                "Thời gian: %s - %s" +
                "</div>",
                event.getNameevent(),
                event.getDescriptions() != null ? event.getDescriptions() : "N/A",
                event.getDatestart(),
                event.getDateend()
            ))
            .collect(Collectors.joining());
    }

    /**
     * Xây dựng danh sách người dùng dưới dạng HTML
     */
    private String buildUserHTML(List<Users> users) {
        if (users == null || users.isEmpty()) return "Chưa có người dùng nào.";
        
        long totalUsers = users.size();
        long activeUsers = users.stream().filter(u -> u.getStatus() != null && u.getStatus()).count();
        
        return "<h3>👥 Quản Lý Tài Khoản</h3>" +
            String.format(
                "<div style=\"border: 1px solid #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f5f5f5;\">" +
                "<strong>Tổng người dùng:</strong> %d<br>" +
                "<strong>Người dùng hoạt động:</strong> %d<br>" +
                "<strong>Người dùng không hoạt động:</strong> %d" +
                "</div>",
                totalUsers, activeUsers, totalUsers - activeUsers
            ) +
            users.stream()
                .limit(20)
                .map(user -> String.format(
                    "<div style=\"border: 1px solid #ddd; padding: 8px; margin: 3px 0; background: #fff;\">" +
                    "<strong>%s</strong> (%s %s)<br>" +
                    "Email: %s | Trạng thái: %s" +
                    "</div>",
                    user.getUsername(),
                    user.getFirstname() != null ? user.getFirstname() : "",
                    user.getLastname() != null ? user.getLastname() : "",
                    user.getEmail(),
                    (user.getStatus() != null && user.getStatus()) ? "✅" : "❌"
                ))
                .collect(Collectors.joining());
    }

    /**
     * Xây dựng danh sách ca sân dưới dạng HTML
     */
    private String buildShiftHTML(List<Shifts> shifts) {
        if (shifts == null || shifts.isEmpty()) return "Chưa có ca nào.";
        
        return "<h3>🕐 Quản Lý Ca Sân</h3>" + shifts.stream()
            .limit(20)
            .map(shift -> String.format(
                "<div style=\"border: 1px solid #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f5f5f5;\">" +
                "<strong>%s</strong><br>" +
                "Thời gian: %s - %s" +
                "</div>",
                shift.getNameshift(),
                shift.getStarttime(),
                shift.getEndtime()
            ))
            .collect(Collectors.joining());
    }

    /**
     * Xây dựng danh sách danh mục dưới dạng HTML
     */
    private String buildCategoryHTML(List<Categories> categories) {
        if (categories == null || categories.isEmpty()) return "Chưa có danh mục nào.";
        
        return "<h3>📂 Quản Lý Danh Mục</h3>" + categories.stream()
            .limit(20)
            .map(category -> String.format(
                "<div style=\"border: 1px solid #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f5f5f5;\">" +
                "<strong>%s</strong>" +
                "</div>",
                category.getCategoryname()
            ))
            .collect(Collectors.joining());
    }

    /**
     * Xây dựng prompt cho admin
     */
    private String buildAdminPrompt(String userMessage, String productHTML, String fieldHTML, 
                                   String eventHTML, String userHTML, String shiftHTML,
                                   String categoryHTML, String bookingHTML, String revenueHTML) {
        return "Bạn là một trợ lý AI thông minh cho hệ thống quản lý Sportify dành cho Admin.\n" +
               "Bạn sẽ trợ giúp admin quản lý:\n" +
               "1. Sản phẩm (xem, thêm, xóa, cập nhật)\n" +
               "2. Sân thể thao (xem, thêm, xóa, cập nhật)\n" +
               "3. Tài khoản người dùng (quản lý, khóa, mở khóa)\n" +
               "4. Sự kiện / Đội (tạo, sửa, xóa)\n" +
               "5. Đơn đặt sân (xem chi tiết, hủy, xác nhận)\n" +
               "6. Danh mục (quản lý)\n" +
               "7. Doanh thu (xem thống kê, báo cáo)\n" +
               "8. Ca sân (quản lý giờ mở cửa)\n\n" +
               "DỮ LIỆU HIỆN TẠI HỆ THỐNG:\n" +
               productHTML + "\n\n" +
               fieldHTML + "\n\n" +
               eventHTML + "\n\n" +
               userHTML + "\n\n" +
               shiftHTML + "\n\n" +
               categoryHTML + "\n\n" +
               bookingHTML + "\n\n" +
               revenueHTML + "\n\n" +
               "YÊU CẦU CỦA ADMIN:\n" + userMessage + "\n\n" +
               "HƯỚNG DẪN ĐỊNH DẠNG TRẢ LỜI:\n" +
               "- Hãy trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp\n" +
               "- TUYỆT ĐỐI KHÔNG sử dụng ký tự Markdown như: ---, ###, **, *, __, ==, etc.\n" +
               "- Sử dụng định dạng số: 1. ..., 2. ..., 3. ... cho danh sách, và phải xuống dòng cho mỗi định dạng\n" +
               "- Tách các phần bằng dòng trống (Enter)\n" +
               "- Nếu cần bảng, sử dụng HTML table hoặc định dạng text đơn giản (không dùng Markdown table)\n" +
               "- Nhấn mạnh quan trọng: dùng CHỮ IN HOA thay vì **bold** hoặc __underline__\n" +
               "- Sử dụng HTML để tạo định dạng đẹp với màu sắc và link:\n" +
               "  + Phần tiêu đề: <span style=\"color: #2e7d32; font-weight: bold; font-size: 16px;\">TIÊU ĐỀ</span>\n" +
               "  + Chữ quan trọng: <span style=\"color: #c62828; font-weight: bold;\">TEXT</span> (đỏ)\n" +
               "  + Chữ bình thường: <span style=\"color: #558b2f;\">TEXT</span> (xanh nhạt)\n" +
               "  + Link nội bộ: <a href=\"#products\" style=\"color: #1976d2; text-decoration: underline;\">Xem sản phẩm</a>\n" +
               "  + Link có thể dùng: #products, #fields, #bookings, #users, #categories, #revenue, #events\n" +
               "- Sử dụng định dạng số: 1. ..., 2. ..., 3. ... cho danh sách\n" +
               "- Tách các phần bằng dòng trống (Enter) hoặc <br/>\n" +
               "- Nếu cần bảng, sử dụng HTML table với border và styling\n" +
               "- Nếu là HTML, hãy format đẹp mắt để hiển thị tốt trên web\n" +
               "- Cung cấp thông tin hữu ích, đề xuất và hướng dẫn chi tiết cho admin\n" +
               "- Đảm bảo nội dung dễ đọc và không có ký tự kỳ lạ";
    }

    /**
     * Xây dựng danh sách booking dưới dạng HTML
     */
    private String buildBookingHTML(List<Bookings> bookings) {
        if (bookings == null || bookings.isEmpty()) return "Chưa có booking nào.";
        
        // Thống kê theo trạng thái
        long pending = bookings.stream().filter(b -> "PENDING".equalsIgnoreCase(b.getBookingstatus())).count();
        long confirmed = bookings.stream().filter(b -> "CONFIRMED".equalsIgnoreCase(b.getBookingstatus())).count();
        long completed = bookings.stream().filter(b -> "COMPLETED".equalsIgnoreCase(b.getBookingstatus())).count();
        long cancelled = bookings.stream().filter(b -> "CANCELLED".equalsIgnoreCase(b.getBookingstatus())).count();
        
        // Tính tổng doanh thu booking
        Double totalBookingRevenue = bookings.stream()
            .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getBookingstatus()))
            .mapToDouble(b -> b.getBookingprice() != null ? b.getBookingprice() : 0)
            .sum();
        
        return "<h3>📋 Quản Lý Đặt Sân (Booking)</h3>" +
            String.format(
                "<div style=\"border: 1px solid #e0e0e0; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f5f5f5;\">" +
                "<strong>📊 Thống Kê Booking:</strong><br>" +
                "Tổng booking: %d | Chờ xác nhận: %d | Đã xác nhận: %d | Hoàn thành: %d | Hủy: %d<br>" +
                "<strong>💰 Tổng doanh thu booking:</strong> %.0f VND" +
                "</div>",
                bookings.size(), pending, confirmed, completed, cancelled, totalBookingRevenue
            ) +
            "<div style=\"margin-top: 10px; font-size: 0.9em;\"><strong>Chi tiết booking mới nhất:</strong></div>" +
            bookings.stream()
                .sorted((b1, b2) -> {
                    Date d1 = b1.getBookingdate() != null ? b1.getBookingdate() : new Date();
                    Date d2 = b2.getBookingdate() != null ? b2.getBookingdate() : new Date();
                    return d2.compareTo(d1);
                })
                .limit(10)
                .map(booking -> String.format(
                    "<div style=\"border: 1px solid #ddd; padding: 8px; margin: 3px 0; background: #fff;\">" +
                    "<strong>%s</strong> - %.0f VND<br>" +
                    "Trạng thái: %s | SĐT: %s | Ngày: %s" +
                    "</div>",
                    booking.getUsername(),
                    booking.getBookingprice(),
                    booking.getBookingstatus(),
                    booking.getPhone(),
                    booking.getBookingdate()
                ))
                .collect(Collectors.joining());
    }

    /**
     * Xây dựng thống kê doanh thu dưới dạng HTML
     */
    private String buildRevenueHTML(List<Bookings> bookings, List<Orders> orders) {
        // Tính doanh thu từ booking
        Double bookingRevenue = bookings.stream()
            .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getBookingstatus()))
            .mapToDouble(b -> b.getBookingprice() != null ? b.getBookingprice() : 0)
            .sum();
        
            // Tính doanh thu từ order
        Double orderRevenue = 0.0;
        long successOrders = 0;
        if (orders != null) {
            successOrders = orders.stream()
                .filter(o -> o.getPaymentstatus() != null && o.getPaymentstatus())
                .count();
            orderRevenue = orders.stream()
                .filter(o -> o.getPaymentstatus() != null && o.getPaymentstatus())
                .mapToDouble(o -> o.getTotalprice() != null ? o.getTotalprice() : 0)
                .sum();
        }
        
        // Tính tổng doanh thu
        Double totalRevenue = bookingRevenue + orderRevenue;
        
        // Đếm booking thành công
        long successBookings = bookings.stream()
            .filter(b -> "COMPLETED".equalsIgnoreCase(b.getBookingstatus()))
            .count();
        
        return "<h3>💰 Thống Kê Doanh Thu</h3>" +
            String.format(
                "<div style=\"border: 2px solid #4CAF50; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f1f8f4;\">" +
                "<strong>💵 Tổng Doanh Thu:</strong> %.0f VND<br>" +
                "<strong>📊 Chi tiết:</strong><br>" +
                "  • Doanh thu từ booking: %.0f VND (%d booking hoàn thành)<br>" +
                "  • Doanh thu từ đơn hàng: %.0f VND (%d đơn thành công)<br>" +
                "<strong>📈 Tỷ lệ:</strong> Booking %.1f%% | Hàng hóa %.1f%%" +
                "</div>",
                totalRevenue,
                bookingRevenue, successBookings,
                orderRevenue, successOrders,
                totalRevenue > 0 ? (bookingRevenue / totalRevenue * 100) : 0,
                totalRevenue > 0 ? (orderRevenue / totalRevenue * 100) : 0
            );
    }

    /**
     * Trích xuất text từ response của Gemini API
     */
    private String extractGeminiText(Map<String, Object> responseBody) {
        try {
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<?> candidates = (List<?>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                    if (content != null) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<?, ?> part = (Map<?, ?>) parts.get(0);
                            Object text = part.get("text");
                            return text != null ? text.toString() : "";
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Error extracting text from Gemini response: " + e.getMessage());
        }
        return "";
    }

    /**
     * Làm sạch markdown formatting từ response của AI
     */
    private String cleanMarkdownFormatting(String text) {
        if (text == null) return "";
        
        // Loại bỏ các dòng ngang Markdown (---, ___, ***)
        text = text.replaceAll("^(---|___?|\\*\\*\\*)(\\s|$)", "\n");
        text = text.replaceAll("\\n(---|___?|\\*\\*\\*)(\\s|$)", "\n");
        
        // Loại bỏ các header Markdown (###, ##, #)
        text = text.replaceAll("^#+\\s+", "");
        text = text.replaceAll("\\n#+\\s+", "\n");
        
        // Loại bỏ bold formatting (**text** hoặc __text__)
        text = text.replaceAll("\\*\\*(.+?)\\*\\*", "$1");
        text = text.replaceAll("__(.+?)__", "$1");
        
        // Loại bỏ italic formatting (*text* hoặc _text_)
        text = text.replaceAll("\\*(.+?)\\*", "$1");
        text = text.replaceAll("_(.+?)_", "$1");
        
        // Loại bỏ backticks (code formatting)
        text = text.replaceAll("`(.+?)`", "$1");
        
        // Loại bỏ highlight/emphasis (~~text~~)
        text = text.replaceAll("~~(.+?)~~", "$1");
        
        // Loại bỏ các bullet points Markdown (-, *, +) nhưng giữ lại content
        text = text.replaceAll("^\\s*[\\-\\*\\+]\\s+", "• ");
        text = text.replaceAll("\\n\\s*[\\-\\*\\+]\\s+", "\n• ");
        
        // Dọn sạch khoảng trắng thừa
        text = text.replaceAll("\\n\\n\\n+", "\n\n");
        text = text.trim();
        
        return text;
    }
}
