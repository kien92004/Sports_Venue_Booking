package duan.sportify.rest.controller;

import duan.sportify.entities.AIChatHistory;
import duan.sportify.service.AIChatHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/sportify/rest/ai/history")
public class AIChatHistoryController {
    
    @Autowired
    private AIChatHistoryService chatHistoryService;
    
    /**
     * Lưu chat message
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveMessage(
            @RequestBody Map<String, String> req,
            HttpServletRequest request) {
        
        try {
            // Priority: userId from request body > session username > session id
            String userId = req.get("userId");
            if (userId == null || userId.isEmpty()) {
                userId = (String) request.getSession().getAttribute("username");
            }
            if (userId == null || userId.isEmpty()) {
                userId = request.getSession().getId();
            }
            
            String message = req.get("message");
            String response = req.get("response");
            String role = req.get("role"); // "user" hoặc "bot"
            String messageData = req.get("messageData"); // JSON
            
            System.out.println("DEBUG: saveMessage - userId: " + userId + ", role: " + role + ", message: " + message);
            
            AIChatHistory history = chatHistoryService.saveMessage(userId, message, response, role, messageData);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "id", history.getId(),
                "message", "Chat message saved successfully"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Lấy lịch sử chat
     */
    @GetMapping("/get-history")
    public ResponseEntity<?> getChatHistory(
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        try {
            String queryUserId = userId;
            if (queryUserId == null || queryUserId.isEmpty()) {
                queryUserId = (String) request.getSession().getAttribute("username");
            }
            if (queryUserId == null || queryUserId.isEmpty()) {
                queryUserId = request.getSession().getId();
            }
            
            System.out.println("DEBUG: getChatHistory - userId: " + queryUserId);
            
            List<AIChatHistory> history = chatHistoryService.getChatHistory(queryUserId);
            System.out.println("DEBUG: getChatHistory - found " + history.size() + " messages");
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "data", history
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Xóa toàn bộ lịch sử chat
     */
    @DeleteMapping("/delete-all")
    public ResponseEntity<?> deleteAllChatHistory(HttpServletRequest request) {
        try {
            String userId = (String) request.getSession().getAttribute("username");
            if (userId == null) {
                userId = request.getSession().getId();
            }
            
            chatHistoryService.deleteUserChatHistory(userId);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Chat history deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Xóa một message cụ thể
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        try {
            chatHistoryService.deleteMessage(id);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Message deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
}
