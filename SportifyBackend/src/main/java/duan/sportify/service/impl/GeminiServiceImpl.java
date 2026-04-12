package duan.sportify.service.impl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import duan.sportify.entities.Eventweb;
import duan.sportify.entities.Field;
import duan.sportify.entities.Products;
import duan.sportify.service.AIService;
import duan.sportify.service.EventService;
import duan.sportify.service.FieldService;
import duan.sportify.service.ProductService;

/**
 * GeminiServiceImpl - Sử dụng Google Generative AI (Gemini)
 * Gọi Gemini API bằng REST với context từ database (sản phẩm, sân, đội, tin
 * tức, liên hệ)
 */
@Service

public class GeminiServiceImpl implements AIService {
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${backend.url:http://localhost:8081}")
    private String backendUrl;

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

            // Xây dựng context HTML cho tất cả
            String productHTML = buildProductHTML(products);
            String fieldHTML = buildFieldHTML(fields);
            String eventHTML = buildEventHTML(events);
            String contactHTML = "<h3>📞 Thông Tin Liên Hệ</h3><p>📧 Email: support@sportify.com<br>☎️ Hotline: 0123-456-789<br>Hỗ trợ 24/7</p>";

            // Xây dựng prompt với tất cả context
            String prompt = buildPrompt(message, productHTML, fieldHTML, eventHTML, contactHTML);

            System.out.println("🔵 Gọi Gemini API với câu hỏi: " + message);
            System.out.println("📦 Dữ liệu: " + products.size() + " sản phẩm, " +
                    fields.size() + " sân, " + events.size() + " đội");

            // Retry logic - thử lại 3 lần nếu lỗi
            int maxRetries = 3;
            int retryCount = 0;
            Exception lastException = null;

            while (retryCount < maxRetries) {
                try {
                    String response = callGeminiAPI(prompt);
                    if (response != null) {
                        System.out.println("✅ Response nhận được từ Gemini");
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
                        "parts", List.of(Map.of("text", prompt)))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        RestTemplate restTemplate = new RestTemplate();
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                geminiModel, geminiApiKey);

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> res = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate
                .exchange(url, HttpMethod.POST, new HttpEntity<>(payload, headers), Map.class);

        System.out.println("📥 Response Status: " + res.getStatusCode());

        String result = extractGeminiText(res.getBody());
        return result;
    }

    /**
     * Xây dựng danh sách sản phẩm dưới dạng HTML
     */
    private String buildProductHTML(List<Products> products) {
        if (products == null || products.isEmpty())
            return "Chưa có sản phẩm nào.";

        return "<h3>📦 Danh Sách Sản Phẩm</h3>" + products.stream()
                .limit(15)
                .map(product -> {
                    String imageUrl = product.getImage() != null && !product.getImage().isEmpty()
                            ? (product.getImage().startsWith("http") ? product.getImage()
                                    : frontendUrl + "/user/images/products_img/" + product.getImage())
                            : frontendUrl + "/user/images/default.png";

                    return String.format(
                            "<div style=\"border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 4px; background: #fffacd; display: flex; gap: 10px; align-items: flex-start;\">"
                                    +
                                    "<img src=\"%s\" alt=\"%s\" style=\"width: 80px; height: 80px; object-fit: cover; border-radius: 4px; flex-shrink: 0;\">"
                                    +
                                    "<div>" +
                                    "<strong>%s</strong> - %s VND<br>" +
                                    "%s<br>" +
                                    "<a href=\"/sportify/product-single/%s\" style=\"color: #007bff; text-decoration: none; font-size: 12px; cursor: pointer;\" onclick=\"window.location.href='/sportify/product-single/%s'; return false;\">Xem sản phẩm</a>"
                                    +
                                    "</div>" +
                                    "</div>",
                            imageUrl,
                            product.getProductname() != null ? product.getProductname() : "Product",
                            product.getProductname(),
                            product.getPrice(),
                            product.getDescriptions() != null
                                    ? product.getDescriptions().substring(0,
                                            Math.min(50, product.getDescriptions().length())) + "..."
                                    : "",
                            product.getProductid(),
                            product.getProductid());
                })
                .collect(Collectors.joining("\n"));
    }

    /**
     * Xây dựng danh sách sân dưới dạng HTML
     */
    private String buildFieldHTML(List<Field> fields) {
        if (fields == null || fields.isEmpty())
            return "Chưa có sân nào.";

        return "<h3>🏟️ Danh Sách Sân</h3>" + fields.stream()
                .limit(10) // Giới hạn 10 sân để không quá dài
                .map(field -> {
                    String imageUrl = field.getImage() != null && !field.getImage().isEmpty()
                            ? (field.getImage().startsWith("http") ? field.getImage()
                                    : frontendUrl + "/user/images/" + field.getImage())
                            : frontendUrl + "/user/images/default.png";

                    return String.format(
                            "<div style=\"border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 4px; background: #f0f8ff; display: flex; gap: 10px; align-items: flex-start;\">"
                                    +
                                    "<img src=\"%s\" alt=\"%s\" style=\"width: 80px; height: 80px; object-fit: cover; border-radius: 4px; flex-shrink: 0;\">"
                                    +
                                    "<div>" +
                                    "<strong>%s</strong> - %s VND/giờ<br>" +
                                    "📍 %s<br>" +
                                    "<a href=\"/sportify/field/detail/%s\" style=\"color: #007bff; text-decoration: none; font-size: 12px; cursor: pointer;\" onclick=\"window.location.href='/sportify/field/detail/%s'; return false;\">Xem chi tiết & Đặt sân</a>"
                                    +
                                    "</div>" +
                                    "</div>",
                            imageUrl,
                            field.getNamefield() != null ? field.getNamefield() : "Field",
                            field.getNamefield(),
                            field.getPrice(),
                            field.getAddress(),
                            field.getFieldid(),
                            field.getFieldid());
                })
                .collect(Collectors.joining("\n"));
    }

    /**
     * Xây dựng danh sách đội/sự kiện dưới dạng HTML
     */
    private String buildEventHTML(List<Eventweb> events) {
        if (events == null || events.isEmpty())
            return "Chưa có đội/sự kiện nào.";

        return "<h3>⚽ Danh Sách Đội/Sự Kiện</h3>" + events.stream()
                .limit(10)
                .map(event -> String.format(
                        "<div style=\"border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 4px; background: #fff0f5;\">"
                                +
                                "<strong>%s</strong><br>" +
                                "📅 Từ %s đến %s" +
                                "</div>",
                        event.getNameevent() != null ? event.getNameevent() : "Sự kiện",
                        event.getDatestart() != null ? event.getDatestart() : "Chưa xác định",
                        event.getDateend() != null ? event.getDateend() : "Chưa xác định"))
                .collect(Collectors.joining("\n"));
    }

    /**
     * Xây dựng prompt với context từ sản phẩm, sân, đội, tin tức, liên hệ
     */
    private String buildPrompt(String question, String productHTML, String fieldHTML,
            String eventHTML, String contactHTML) {
        return String.format(
                "Bạn là một trợ lý AI chuyên nghiệp và thân thiện của Sportify - nền tảng kết nối về thể thao. " +
                        "Sportify cung cấp các dịch vụ: bán sản phẩm thể thao, cho thuê sân, quản lý đội, chia sẻ tin tức thể thao.\n\n"
                        +

                        "📦 DANH SÁCH SẢN PHẨM:\n%s\n\n" +

                        "🏟️ DANH SÁCH SÂN CHO THUÊ:\n%s\n\n" +

                        "⚽ DANH SÁCH ĐỘI/SỰ KIỆN:\n%s\n\n" +

                        "📞 THÔNG TIN LIÊN HỆ:\n%s\n\n" +

                        "❓ CÂU HỎI CỦA KHÁCH HÀNG: \"%s\"\n\n" +

                        "HƯỚNG DẪN TRẢ LỜI:\n" +
                        "1. Hãy trả lời một cách tự nhiên, thân thiện, chuyên nghiệp\n" +
                        "2. Nếu câu hỏi về sản phẩm → gợi ý sản phẩm phù hợp với link xem chi tiết\n" +
                        "3. Nếu câu hỏi về sân → gợi ý sân phù hợp, giá cả, location\n" +
                        "4. Nếu câu hỏi về đội/sự kiện → cung cấp thông tin chi tiết\n" +
                        "5. Nếu câu hỏi về liên hệ/hỗ trợ → cung cấp thông tin liên lạc\n" +
                        "6. Nếu câu hỏi không liên quan → hãy trả lời một cách tự nhiên, thân thiện\n" +
                        "7. Luôn trả lời bằng HTML để dễ đọc hơn\n" +
                        "8. Sử dụng emoji để làm cho câu trả lời thêm sinh động",
                productHTML, fieldHTML, eventHTML, contactHTML, question);
    }

    @SuppressWarnings("unchecked")
    private String extractGeminiText(Map<String, Object> body) {
        if (body == null)
            return null;
        var candidates = (List<Map<String, Object>>) body.get("candidates");
        if (candidates == null || candidates.isEmpty())
            return null;
        var content = (Map<String, Object>) candidates.get(0).get("content");
        var parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty())
            return null;

        String text = (String) parts.get(0).get("text");
        if (text == null)
            return null;

        // Clean markdown code blocks - remove ```html ... ``` or ``` ... ```
        // Only remove the backticks, not the content
        text = text.replaceAll("^```\\w*\\n", "").replaceAll("\n```$", "").trim();
        // Also handle case where backticks are on the same line
        text = text.replaceAll("```html\\n?|```json\\n?|```\\n?", "").trim();

        return text;
    }

    @Override
    public Object data() {
        return new Object();
    }
}
