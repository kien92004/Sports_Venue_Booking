package duan.sportify.service;

import duan.sportify.Repository.AdminAIChatHistoryRepository;
import duan.sportify.entities.AdminAIChatHistory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminAIChatHistoryService {

    @Autowired
    private AdminAIChatHistoryRepository repository;

    /**
     * Lưu tin nhắn vào cơ sở dữ liệu
     */
    public AdminAIChatHistory saveMessage(String adminId, String message, String response, String role,
            String messageData) {
        AdminAIChatHistory history = new AdminAIChatHistory(adminId, message, response, role, messageData);
        return repository.save(history);
    }

    /**
     * Lấy lịch sử chat của một admin
     */
    public List<AdminAIChatHistory> getChatHistory(String adminId) {
        return repository.findByAdminIdOrderByCreatedAtAsc(adminId);
    }

    /**
     * Lấy tất cả lịch sử chat
     */
    public List<AdminAIChatHistory> getAllChatHistory() {
        return repository.findAll();
    }

    /**
     * Xóa toàn bộ lịch sử chat của một admin
     */
    public void clearChatHistory(String adminId) {
        List<AdminAIChatHistory> histories = repository.findByAdminId(adminId);
        repository.deleteAll(histories);
    }

    /**
     * Cập nhật tin nhắn
     */
    public AdminAIChatHistory updateMessage(Long messageId, String message, String response) {
        AdminAIChatHistory history = repository.findById(messageId).orElse(null);
        if (history != null) {
            history.setMessage(message);
            history.setResponse(response);
            return repository.save(history);
        }
        return null;
    }
}
