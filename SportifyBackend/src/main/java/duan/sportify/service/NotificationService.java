package duan.sportify.service;

import duan.sportify.Repository.NotificationRepository;
import duan.sportify.entities.Notification;
import duan.sportify.entities.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Date;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserService userService;

    public Notification addNotification(String username, String message, String type) {
        Users user = userService.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setTimestamp(new Date());
        notification.setRead(false);
        notification.setUsername(username);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(String username) {
        return notificationRepository.findByUsernameOrderByTimestampDesc(username);
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String username) {
        List<Notification> notifications = notificationRepository.findByUsernameOrderByTimestampDesc(username);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    public long getUnreadCount(String username) {
        return notificationRepository.countByUsernameAndReadFalse(username);
    }

    @Transactional
    public void clearNotifications(String username) {
        notificationRepository.deleteByUsername(username);
    }
}