package duan.sportify.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import duan.sportify.entities.Notification;
import duan.sportify.service.NotificationService;

@RestController
@RequestMapping("/api/user/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam String username) {
        return ResponseEntity.ok(notificationService.getNotifications(username));
    }

    @PostMapping
    public ResponseEntity<Notification> addNotification(
            @RequestParam String username,
            @RequestParam String message,
            @RequestParam String type) {
        return ResponseEntity.ok(notificationService.addNotification(username, message, type));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String username) {
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam String username) {
        return ResponseEntity.ok(notificationService.getUnreadCount(username));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearNotifications(@RequestParam String username) {
        notificationService.clearNotifications(username);
        return ResponseEntity.ok().build();
    }
}