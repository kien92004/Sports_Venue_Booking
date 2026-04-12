package duan.sportify.rest.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.AdminAIChatHistory;
import duan.sportify.service.AdminAIChatHistoryService;

@CrossOrigin("*")
@RestController
@RequestMapping("/sportify/rest/ai/admin/history")
public class AdminAIChatHistoryController {

    @Autowired
    private AdminAIChatHistoryService chatHistoryService;

    /**
     * POST /sportify/rest/ai/admin/history/save
     * Lưu tin nhắn AI Chat của Admin vào database
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveMessage(
            @RequestBody Map<String, String> request) {
        try {
            String adminId = request.get("adminId");
            String message = request.get("message");
            String response = request.get("response");
            String role = request.get("role");
            String messageData = request.get("messageData");

            if (adminId == null || adminId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "adminId không được để trống"));
            }

            AdminAIChatHistory history = chatHistoryService.saveMessage(
                    adminId, message, response, role, messageData);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "data", history));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", ex.getMessage()));
        }
    }

    /**
     * GET /sportify/rest/ai/admin/history/get-history
     * Lấy lịch sử chat của Admin
     */
    @GetMapping("/get-history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @RequestParam String adminId) {
        try {
            if (adminId == null || adminId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "adminId không được để trống"));
            }

            String queryAdminId = adminId;
            List<AdminAIChatHistory> history = chatHistoryService.getChatHistory(queryAdminId);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "data", history));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", ex.getMessage()));
        }
    }

    /**
     * GET /sportify/rest/ai/admin/history/all
     * Lấy tất cả lịch sử chat
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllHistory() {
        try {
            List<AdminAIChatHistory> history = chatHistoryService.getAllChatHistory();
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "data", history));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", ex.getMessage()));
        }
    }

    /**
     * DELETE /sportify/rest/ai/admin/history/clear/{adminId}
     * Xóa toàn bộ lịch sử chat của một admin
     */
    @DeleteMapping("/clear/{adminId}")
    public ResponseEntity<Map<String, Object>> clearHistory(
            @PathVariable String adminId) {
        try {
            chatHistoryService.clearChatHistory(adminId);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Xóa lịch sử chat thành công"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", ex.getMessage()));
        }
    }
}
