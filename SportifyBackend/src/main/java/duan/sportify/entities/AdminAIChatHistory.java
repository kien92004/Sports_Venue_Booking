package duan.sportify.entities;

import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "admin_ai_chat_history")
public class AdminAIChatHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    @Column(name = "admin_id", length = 100)
    private String adminId;
    
    @Column(name = "message", columnDefinition = "LONGTEXT")
    private String message;
    
    @Column(name = "response", columnDefinition = "LONGTEXT")
    private String response;
    
    @Column(name = "role", length = 20)
    private String role; // "user" or "bot"
    
    @Column(name = "message_data", columnDefinition = "LONGTEXT")
    private String messageData;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public AdminAIChatHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public AdminAIChatHistory(String adminId, String message, String response, String role, String messageData) {
        this.adminId = adminId;
        this.message = message;
        this.response = response;
        this.role = role;
        this.messageData = messageData;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessageData() {
        return messageData;
    }

    public void setMessageData(String messageData) {
        this.messageData = messageData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
