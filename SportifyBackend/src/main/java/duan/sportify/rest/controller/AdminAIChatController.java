package duan.sportify.rest.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.service.CategoryService;
import duan.sportify.service.EventService;
import duan.sportify.service.FieldService;
import duan.sportify.service.ProductService;
import duan.sportify.service.UserService;
import duan.sportify.service.impl.BookingServiceImpl;
import duan.sportify.utils.AI.AIServiceFactory;

@CrossOrigin("*")
@RestController
@RequestMapping("/sportify/rest/ai")
public class AdminAIChatController {

  @Autowired
  EventService eventService;

  @Autowired
  FieldService fieldService;

  @Autowired
  ProductService productService;

  @Autowired
  UserService userService;

  @Autowired
  CategoryService categoryService;

  @Autowired
  BookingServiceImpl bookingServiceImpl;

  @Autowired
  AIServiceFactory aiServiceFactory;

  /**
   * Endpoint riêng cho Admin Chat
   * POST /sportify/rest/ai/admin-chat
   * Trợ lý AI cho admin quản lý hệ thống
   * Hỗ trợ file upload (ảnh, file, audio) và JSON request
   */
  @PostMapping("/admin-chat")
  public ResponseEntity<Map<String, Object>> adminChat(
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
              file.getSize());
        }
        enrichedMessage += "\nVui lòng phân tích và trả lời dựa trên tệp đính kèm.";
      }

      System.out
          .println("📩 Admin Chat Request: " + enrichedMessage.substring(0, Math.min(100, enrichedMessage.length())));

      // Gọi Admin AI Service
      String provider = "gemini";
      var aiService = aiServiceFactory.getAdminService(provider);
      String htmlReply = aiService.chat(enrichedMessage);

      System.out.println("✅ Admin Chat Response nhận được");

      return ResponseEntity.ok(Map.of(
          "reply", htmlReply,
          "status", "success"));
    } catch (Exception ex) {
      System.out.println("❌ Admin Chat Error: " + ex.getMessage());
      ex.printStackTrace();

      return ResponseEntity.ok(Map.of(
          "reply", "❌ Lỗi: " + ex.getMessage(),
          "status", "error"));
    }
  }
}
