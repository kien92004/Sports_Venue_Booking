package duan.sportify.utils.AI;


import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
@Component
public class ChatContextManager {
    
    // Map lưu context cho từng userId
    private final Map<String, UserChatContext> userContexts = new ConcurrentHashMap<>();
    
    // Thời gian một context hết hạn (30 phút)
    private static final long CONTEXT_EXPIRY_MINUTES = 30;
    /**
     * Lấy context hiện tại của người dùng, tạo mới nếu chưa có hoặc đã hết hạn
     */
    public UserChatContext getOrCreateContext(String userId) {
        // Lấy context hiện tại nếu có
        UserChatContext context = userContexts.get(userId);
        
        // Nếu không có hoặc đã hết hạn, tạo mới
        if (context == null || context.isExpired()) {
            context = new UserChatContext();
            userContexts.put(userId, context);
        }
        
        // Cập nhật thời gian tương tác cuối
        context.updateLastInteractionTime();
        return context;
    }
    
    /**
     * Xóa context của người dùng
     */
    public void clearContext(String userId) {
        userContexts.remove(userId);
    }
    
    /**
     * Xóa tất cả context quá hạn
     * (có thể chạy định kỳ bằng @Scheduled)
     */
    public void cleanupExpiredContexts() {
        userContexts.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
    
    /**
     * Class lưu trữ context của một người dùng
     */
    public static class UserChatContext {
        // Thông tin về lịch sử trò chuyện
        private final List<Map<String, String>> conversationHistory = new ArrayList<>();
        
        // Các tham số đang được thu thập
        private final Map<String, Object> currentParams = new HashMap<>();
        
        // Hành động hiện tại người dùng đang thực hiện
        private String currentAction;
        
        // Thời điểm tương tác cuối cùng
        private LocalDateTime lastInteractionTime;
        
        // Các entity đã nhắc tới trong cuộc hội thoại
        private final Map<String, Object> mentionedEntities = new HashMap<>();
        
        public UserChatContext() {
            this.lastInteractionTime = LocalDateTime.now();
        }
        
        public void addUserMessage(String message) {
            conversationHistory.add(Map.of("role", "user", "content", message));
            updateLastInteractionTime();
        }
        
        public void addSystemMessage(String message) {
            conversationHistory.add(Map.of("role", "system", "content", message));
            updateLastInteractionTime();
        }
        
        public void setCurrentAction(String action) {
            this.currentAction = action;
            updateLastInteractionTime();
        }
        
        public String getCurrentAction() {
            return currentAction;
        }
        
        public void addParam(String key, Object value) {
            if (value != null) {
                currentParams.put(key, value);
            }
            updateLastInteractionTime();
        }
        
        public Map<String, Object> getCurrentParams() {
            return new HashMap<>(currentParams);
        }
        
        public void clearParams() {
            currentParams.clear();
        }
        
        public void addEntity(String type, Object entity) {
            mentionedEntities.put(type, entity);
        }
        
        public Object getEntity(String type) {
            return mentionedEntities.get(type);
        }
        
        public List<Map<String, String>> getConversationHistory() {
            return new ArrayList<>(conversationHistory);
        }
        
        public void updateLastInteractionTime() {
            this.lastInteractionTime = LocalDateTime.now();
        }
        
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(
                lastInteractionTime.plusMinutes(CONTEXT_EXPIRY_MINUTES)
            );
        }
    }
}
