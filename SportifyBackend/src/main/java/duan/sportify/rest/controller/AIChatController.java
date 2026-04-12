package duan.sportify.rest.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.service.EventService;
import duan.sportify.service.FieldService;
import duan.sportify.service.ProductService;
import duan.sportify.service.SportTypeService;
import duan.sportify.service.UserService;
import duan.sportify.service.impl.BookingServiceImpl;
import duan.sportify.utils.AI.AIActionHandler;
import duan.sportify.utils.AI.AIServiceFactory;
import duan.sportify.utils.AI.ChatContextManager;
import duan.sportify.utils.AI.DataCache;
import duan.sportify.DTO.FieldRequestAI;
import duan.sportify.entities.Users;

@CrossOrigin("*")
@RestController
@RequestMapping("sportify/rest/ai")
public class AIChatController {

    @Autowired
    EventService eventService;
    @Autowired
    FieldService fieldService;
    @Autowired
    BookingServiceImpl bookingServiceImpl;
    @Autowired
    AIServiceFactory aiServiceFactory;
    @Autowired
    AIActionHandler aiActionHandler;
    @Autowired
    ChatContextManager contextManager;
    @Autowired
    DataCache dataCache;

    // Phương thức định dạng lịch sử trò chuyện để đưa vào prompt
    private String formatConversationHistory(ChatContextManager.UserChatContext context) {
        List<Map<String, String>> history = context.getConversationHistory();
        if (history.isEmpty()) {
            return "Đây là cuộc trò chuyện đầu tiên.";
        }

        StringBuilder formatted = new StringBuilder();
        for (Map<String, String> message : history) {
            String role = message.get("role");
            String content = message.get("content");

            if ("user".equals(role)) {
                formatted.append("User: ").append(content).append("\n\n");
            } else {
                formatted.append("Bot: ").append(content).append("\n\n");
            }
        }
        return formatted.toString();
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyze(
            @RequestBody Map<String, String> req,
            HttpServletRequest request) {

        String message = req.get("message");
        String provider = req.getOrDefault("provider", "gemini");

        // Lấy userId từ session hoặc request
        // String userId = (String) request.getSession().getAttribute("username");
        // if (userId == null && req.containsKey("userId")) {
        // userId = req.get("userId");
        // }
        // if (userId == null) {
        // // Nếu không có userId, dùng sessionId làm userId tạm thời
        // userId = request.getSession().getId();
        // }
        String userId = "nhanvien";

        // Lấy context của user
        ChatContextManager.UserChatContext userContext = contextManager.getOrCreateContext(userId);

        // Thêm tin nhắn mới vào context
        userContext.addUserMessage(message);

        // Lấy thông tin hiện tại từ context
        String currentAction = userContext.getCurrentAction();
        Map<String, Object> currentParams = userContext.getCurrentParams();

        // Lấy dữ liệu từ cache
        Map<String, Object> allData = dataCache.getCachedData();
        // Tạo prompt với context
        String systemPrompt = """
                Bạn là trợ lý AI của hệ thống đặt sân Sportify.
                Dữ liệu hiện có: """ + allData
                + """

                        🎯 Nhiệm vụ:
                        Phân tích tin nhắn người dùng và xác định hành động (action) phù hợp.
                        Chỉ trả về **JSON hợp lệ**, không giải thích thêm gì.

                        ---

                        🔹 DANH SÁCH HÀNH ĐỘNG HỖ TRỢ:

                        1️⃣ FILTER_FIELDS – khi người dùng tìm sân theo điều kiện:
                        {
                          "action": "FILTER_FIELDS",
                          "filters": [
                            {"field": "price" | "type" | "district" | "time_range" | "limit", "operator": "<" | ">" | "=" | "between" | "min" | "max", "value": any}
                          ],
                          "missing": []
                        }
                        Mapping ví dụ:
                        - "rẻ nhất", "bình dân" → {"field": "price", "operator": "min"}
                        - "đắt nhất", "vip" → {"field": "price", "operator": "max"}
                        - "dưới 500k" → {"field": "price", "operator": "<", "value": 500000}
                        - "từ 200 đến 400" → {"field": "price", "operator": "between", "value": [200000,400000]}
                        - "quận 7" → {"field": "district", "operator": "=", "value": "Quận 7"}
                        - "sân 5" → {"field": "type", "operator": "=", "value": "5"}
                        - "tối nay" → {"field": "time_range", "operator": "=", "value": "18:00-22:00"}
                        - "5 sân rẻ nhất" → [{"field": "limit", "operator": "=", "value": 5}, {"field": "price", "operator": "min"}]
                        -"có những loại sân nào ở quận 1" → [{"field": "type", "operator": "="}, {"field": "district", "operator": "=", "value": "Quận 1"}]

                        2️⃣ CHECK_FIELD_AVAILABILITY – khi người dùng hỏi sân còn trống:
                        {
                          "action": "CHECK_FIELD_AVAILABILITY",
                          "params": {"fieldName": string, "date": "yyyy-MM-dd", "time": "HH:mm" | null, "endTime": "HH:mm" | null},
                          "missing": []
                        }

                        3️⃣ BOOK_FIELD – khi người dùng muốn đặt sân:
                        {
                          "action": "BOOK_FIELD",
                          "params": {"fieldName": string, "date": "yyyy-MM-dd", "time": "HH:mm"},
                          "missing": []
                        }

                        ---

                        🛒 HỖ TRỢ SẢN PHẨM (PRODUCT):

                        4️⃣ FILTER_PRODUCT – khi người dùng tìm sản phẩm theo điều kiện:
                        {
                          "action": "FILTER_PRODUCT",
                          "filters": [
                            {"product": "price" | "category" | "brand"  | "limit", "operator": "<" | ">" | "=" | "between" | "min" | "max", "value": any}
                          ],
                          "missing": []
                        }
                        Mapping ví dụ:
                        - "sản phẩm rẻ nhất" → {"product": "price", "operator": "min"}
                        - "đắt nhất" → {"product": "price", "operator": "max"}
                        - "dưới 200k" → {"product": "price", "operator": "<", "value": 200000}
                        - "trên 500k" → {"product": "price", "operator": ">", "value": 500000}
                        - "từ 100 đến 300" → {"product": "price", "operator": "between", "value": [100000,300000]}
                        - "đồ thể thao Nike" → [{"product": "category", "operator": "=", "value": "đồ thể thao"}, {"product": "brand", "operator": "=", "value": "Nike"}]
                        - "top 10 sản phẩm bán chạy" → [{"product": "limit", "operator": "=", "value": 10}]
                        -"có những loại sân nào ở quận 1" → [{"product": "type", "operator": "="}, {"product": "district", "operator": "=", "value": "Quận 1"}]


                        5️⃣ CHECK_PRODUCT_AVAILABILITY – khi người dùng hỏi sản phẩm còn hàng:
                        {
                          "action": "CHECK_PRODUCT_AVAILABILITY",
                          "params": {"productName": string},
                          "missing": []
                        }

                        6️⃣ BOOK_PRODUCT – khi người dùng muốn đặt mua sản phẩm:
                        {
                          "action": "BOOK_PRODUCT",
                          "params": {"productName": string, "quantity": int},
                          "missing": []
                        }

                        7️⃣ OTHER -  các hành động không trong danh sách trên:
                        {
                          "action": "OTHER"
                        }

                        ---

                        ⚙️ QUY TẮC CHUNG:

                        1. **Luôn hỏi thêm nếu thiếu param**, không bao giờ để null.
                           - Nếu thiếu param, trả về JSON dạng:
                           {
                             "action": "<action_dự_kiến>",
                             "params": {...},
                             "missing": ["param_missing_1", "param_missing_2"],
                             "question": "Hỏi thông tin param còn thiếu?"
                           }

                        2. **Khi người dùng trả lời bổ sung**, merge thông tin mới vào JSON trước đó:
                           - Nếu đủ → loại bỏ `missing`.
                           - Nếu chưa đủ → giữ nguyên action, cập nhật missing.

                        3. **Mapping ngôn ngữ tự nhiên → JSON**:
                           - "hôm nay", "tối nay" → map theo ngày hiện tại.
                           - Giá → filter price.
                           - Gần quận → filter district.
                           - Giới hạn số lượng → {"field": "limit", "operator": "=", "value": 10}.
                           - Chỉ trả về JSON, không thêm giải thích.

                        4. **Ví dụ stateful (BOOK_FIELD)**:
                        - Người dùng: "Tôi muốn đặt sân tối nay"
                        - AI: {
                            "action": "BOOK_FIELD",
                            "params": {"fieldName": null, "date": "2025-10-13", "time": "18:00"},
                            "missing": ["fieldName"],
                            "question": "Bạn muốn đặt sân nào vào tối nay?"
                          }
                        - Người dùng: "Sân A"
                        - AI: {
                            "action": "BOOK_FIELD",
                            "params": {"fieldName": "Sân A", "date": "2025-10-13", "time": "18:00"},
                            "missing": []
                          }

                        ---

                        💡 Lưu ý:
                        - Luôn hỏi thêm nếu thiếu thông tin.
                        - Giữ **action cũ** khi bổ sung param.
                        - Chỉ trả về JSON hợp lệ.
                        - Nếu không hiểu → {"action": "UNKNOWN"}.
                        """;

        String fullPrompt = systemPrompt;
        // Thêm context của user vào prompt
        if (currentAction != null) {
            fullPrompt += "\n\nHành động đang thực hiện: " + currentAction;
            fullPrompt += "\nThông tin đã có: " + currentParams;
        }

        // Thêm lịch sử trò chuyện rút gọn
        fullPrompt += "\n\nLịch sử trò chuyện:\n" + formatConversationHistory(userContext);
        fullPrompt += "\nNgười dùng: " + message;

        // Gọi AI
        var aiService = aiServiceFactory.getService(provider);
        String reply = aiService.chat(fullPrompt);

        // Sử dụng clearReply để làm sạch và parse JSON
        ResponseEntity<Map<String, Object>> parsedReply = clearReply(reply);
        Map<String, Object> aiResponse = parsedReply.getBody();
        if (parsedReply.getStatusCode().isError()) {
            return parsedReply;
        }

        // Cập nhật context với thông tin mới
        String action = (String) aiResponse.get("action");
        if (action != null) {
            userContext.setCurrentAction(action);
        }

        // Cập nhật params nếu có
        if (aiResponse.containsKey("params")) {
            Map<String, Object> params = (Map<String, Object>) aiResponse.get("params");
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                if (entry.getValue() != null) {
                    userContext.addParam(entry.getKey(), entry.getValue());
                }
            }
        }

        List<?> missing = (List<?>) aiResponse.getOrDefault("missing", List.of());
        // --- BẮT ĐẦU SỬA ĐỔI ---
        if (action != null && action.equals("OTHER")) {
            String nearestKey = dataCache.findNearest(message);
            Object nearestData = null;
            if (nearestKey != null) {
                if (nearestKey.startsWith("field_")) {
                    List<FieldRequestAI.FieldInfo> fields = (List<FieldRequestAI.FieldInfo>) allData.get("fields");
                    String id = nearestKey.substring("field_".length());
                    nearestData = fields.stream().filter(f -> String.valueOf(f.getFieldId()).equals(id)).findFirst()
                            .orElse(null);
                } else if (nearestKey.startsWith("event_")) {
                    List<FieldRequestAI.EventInfo> events = (List<FieldRequestAI.EventInfo>) allData.get("events");
                    String id = nearestKey.substring("event_".length());
                    nearestData = events.stream().filter(e -> String.valueOf(e.getEventId()).equals(id)).findFirst()
                            .orElse(null);
                } else if (nearestKey.startsWith("product_")) {
                    List<FieldRequestAI.ProductsInfo> products = (List<FieldRequestAI.ProductsInfo>) allData
                            .get("products");
                    String id = nearestKey.substring("product_".length());
                    nearestData = products.stream().filter(p -> String.valueOf(p.getProductId()).equals(id)).findFirst()
                            .orElse(null);
                } else if (nearestKey.startsWith("favorite_")) {
                    List<FieldRequestAI.FavoriteInfo> favorites = (List<FieldRequestAI.FavoriteInfo>) allData
                            .get("favorites");
                    String[] parts = nearestKey.substring("favorite_".length()).split("_");
                    if (parts.length == 2) {
                        String username = parts[0];
                        String fieldId = parts[1];
                        nearestData = favorites.stream()
                                .filter(fa -> fa.getUsername().equals(username)
                                        && String.valueOf(fa.getFieldInfo().getFieldId()).equals(fieldId))
                                .findFirst().orElse(null);
                    }
                }
            }
            String systemPromptOther = """
                    Bạn là trợ lý AI của hệ thống Sportify.
                    Chỉ trả lời dựa trên dữ liệu được cung cấp bên dưới.
                    Chỉ trả về **JSON hợp lệ**, không giải thích thêm gì.
                    JSON có cấu trúc:
                    {
                      "message": "Nội dung trả lời người dùng"
                    }

                    🎯 Nhiệm vụ của bạn:
                    Phân tích tin nhắn người dùng và trả lời một cách tự nhiên, lịch sự dựa trên dữ liệu đã cung cấp.
                    """;
            String fullPromptOther = systemPromptOther;
            // Chỉ truyền dữ liệu liên quan nhất nếu có, tránh truyền allData
            if (nearestData != null) {
                try {
                    fullPromptOther += "\n\nĐoạn dữ liệu liên quan nhất:\n"
                            + new ObjectMapper().writeValueAsString(nearestData);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            } else {
                fullPromptOther += "\n\nKhông có dữ liệu liên quan đến câu hỏi này trong hệ thống.";
            }
            if (!userContext.getConversationHistory().isEmpty()) {
                fullPromptOther += "\n\nLịch sử trò chuyện:\n" + formatConversationHistory(userContext);
            }
            fullPromptOther += "\nNgười dùng: " + message;
            String replyOther = aiService.chat(fullPromptOther);

            // Sử dụng clearReply cho dữ liệu OTHER
            ResponseEntity<Map<String, Object>> parsedOther = clearReply(replyOther);
            Map<String, Object> aiOtherResponse = parsedOther.getBody();
            userContext.addSystemMessage(replyOther);
            return ResponseEntity.ok(Map.of("reply", aiOtherResponse));

        } else {
            // Xử lý các action còn lại
            Object result = aiActionHandler.handle(aiResponse);
            userContext.addSystemMessage(aiResponse.toString());
            userContext.clearParams();
            userContext.setCurrentAction(null);
            return ResponseEntity.ok(Map.of("reply", result));
        }
        // --- KẾT THÚC SỬA ĐỔI ---
    }

    @Autowired
    ProductService productService;
    @Autowired
    SportTypeService sportTypeService;
    @Autowired
    FieldService favoriteService;
    @Autowired
    UserService userService;

    @GetMapping("/getAllData")
    public ResponseEntity<FieldRequestAI.requestDataAI> getAllData(HttpServletRequest request) {

        String users = (String) request.getSession().getAttribute("username");
        users = users == null ? "nhanvien" : users;
        // 🏟️ Field → FieldInfo
        List<FieldRequestAI.FieldInfo> fieldInfos = fieldService.findAll().stream()
                .map(f -> new FieldRequestAI.FieldInfo(
                        f.getFieldid(),
                        f.getNamefield(),
                        f.getDescriptionfield(),
                        f.getPrice(),
                        f.getAddress(),
                        f.getSporttype().getCategoryname()))
                .collect(Collectors.toList());

        // 🎉 Event → EventInfo
        List<FieldRequestAI.EventInfo> eventInfos = eventService.findAll().stream()
                .map(e -> new FieldRequestAI.EventInfo(
                        e.getEventid(),
                        e.getNameevent(),
                        e.getDatestart(),
                        e.getDateend(),
                        e.getDescriptions(),
                        e.getEventtype()))
                .collect(Collectors.toList());

        // 🛒 Product → ProductsInfo
        List<FieldRequestAI.ProductsInfo> productInfos = productService.findAll().stream()
                .map(p -> new FieldRequestAI.ProductsInfo(
                        p.getProductid(),
                        p.getCategoryid(),
                        p.getProductname(),
                        p.getDiscountprice(),
                        p.getPrice(),
                        p.getProductstatus(),
                        p.getDescriptions(),
                        p.getQuantity(),
                        p.getCategories().getCategoryname()))
                .collect(Collectors.toList());
        // 🛒 Product → ProductsInfo
        Users user = userService.findByUsername(users);
        FieldRequestAI.UserInfo userInfor = new FieldRequestAI.UserInfo(
                user.getUsername(),
                user.getFirstname(),
                user.getLastname(),
                user.getPhone(),
                user.getEmail(),
                user.getAddress(),
                user.getGender());

        List<FieldRequestAI.FavoriteInfo> favorites = favoriteService.findFavoriteByUsername(users).stream()
                .map(fa -> new FieldRequestAI.FavoriteInfo(
                        fa.getUsername(),
                        new FieldRequestAI.FieldInfo(
                                fa.getField().getFieldid(),
                                fa.getField().getNamefield(),
                                fa.getField().getDescriptionfield(),
                                fa.getField().getPrice(),
                                fa.getField().getAddress(),
                                fa.getField().getSporttype().getCategoryname())))
                .collect(Collectors.toList());

        // ✅ Trả về tất cả trong một JSON
        FieldRequestAI.requestDataAI response = new FieldRequestAI.requestDataAI(
                fieldInfos,
                eventInfos,
                productInfos,
                favorites,
                userInfor);

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> clearReply(String reply) {
        // 🧹 Làm sạch markdown code block
        String raw = reply.trim();
        if (raw.startsWith("```")) {
            int start = raw.indexOf("\n") + 1;
            int end = raw.lastIndexOf("```");
            if (end > start) {
                raw = raw.substring(start, end).trim();
            }
        }

        // 🧩 Parse JSON từ AI trả về
        Map<String, Object> aiResponse = new HashMap<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            aiResponse = mapper.readValue(raw, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            // Trường hợp lỗi JSON — trả nguyên nội dung để debug
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "AI trả về JSON không hợp lệ",
                    "exception", e.getMessage(),
                    "raw_reply", reply));
        }

        System.out.println("Parsed AI Response: " + aiResponse);
        // ✅ Trả về response đã parse
        return ResponseEntity.ok(aiResponse);
    }
 

  /**
   * Endpoint riêng cho Product Chat (trả lời thân thiện + gợi ý sản phẩm)
   * POST /sportify/rest/ai/product-chat
   * Hỗ trợ file upload (ảnh, file, audio) và JSON request
   */
  @PostMapping("/product-chat")
  public ResponseEntity<Map<String, Object>> productChat(
      @RequestParam(value = "message", required = false) String messageParam,
      @RequestParam(value = "files", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> files,
      @RequestBody(required = false) Map<String, String> jsonBody) {
    
    // Lấy message từ RequestParam hoặc JSON Body
    String message = messageParam;
    if ((message == null || message.trim().isEmpty()) && jsonBody != null) {
      message = jsonBody.get("message");
    }
    
    // Kiểm tra message không rỗng
    if (message == null || message.trim().isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Message không được trống",
          "reply", ""));
    }
    
    try {
      // Build message with file info
      String enrichedMessage = message;
      
      if (files != null && !files.isEmpty()) {
        enrichedMessage += "\n\n[Tin nhắn đi kèm các tệp/ảnh đính kèm]\n";
        for (org.springframework.web.multipart.MultipartFile file : files) {
          String fileType = file.getContentType() != null ? file.getContentType() : "unknown";
          enrichedMessage += String.format(
              "- %s (%s, %d bytes)\n",
              file.getOriginalFilename(),
              fileType,
              file.getSize()
          );
        }
        enrichedMessage += "\nVui lòng phân tích và trả lời dựa trên tệp đính kèm.";
      }
      
      System.out.println("📩 Product Chat Request: " + enrichedMessage.substring(0, Math.min(100, enrichedMessage.length())));
      
      // Gọi AI Service (GeminiServiceImpl sẽ lấy products + tạo context)
      String provider = "gemini";
      var aiService = aiServiceFactory.getService(provider);
      String htmlReply = aiService.chat(enrichedMessage);
      
      System.out.println("✅ Product Chat Response nhận được");
      
      return ResponseEntity.ok(Map.of(
          "reply", htmlReply,
          "status", "success"
      ));
    } catch (Exception ex) {
      System.out.println("❌ Product Chat Error: " + ex.getMessage());
      ex.printStackTrace();
      
      return ResponseEntity.ok(Map.of(
          "reply", "❌ Lỗi: " + ex.getMessage(),
          "status", "error"
      ));
    }
  }
}