package duan.sportify.controller.WebSocket;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class WebSocketEventListener {

    // Map roomId -> Set username
    private final ConcurrentMap<String, Set<String>> roomUsers = new ConcurrentHashMap<>();

    /**
     * Lấy danh sách user theo room
     */
    public Set<String> getUsersByRoom(String roomId) {
        return roomUsers.getOrDefault(roomId, Collections.emptySet());
    }

    /**
     * Khi user connect WebSocket
     * Lưu roomId vào session trước khi connect
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Lấy từ native headers ngay khi CONNECT
        String username = headerAccessor.getFirstNativeHeader("username");
        String roomId = headerAccessor.getFirstNativeHeader("roomId");

        System.out.println("username = " + username + ", roomId = " + roomId);

        if (username != null && roomId != null) {
            // Lưu vào session attributes để dùng cho các event sau này
            headerAccessor.getSessionAttributes().put("username", username);
            headerAccessor.getSessionAttributes().put("roomId", roomId);

            // Thêm vào map quản lý người dùng online
            roomUsers.computeIfAbsent(roomId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()))
                     .add(username);

            System.out.println("✅ " + username + " connected to room " + roomId);
        }
    }




    /**
     * Khi user disconnect WebSocket
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Lấy từ session attributes
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        if (username != null && roomId != null) {
            Set<String> users = roomUsers.get(roomId);
            if (users != null) {
                users.remove(username);
                System.out.println("❌ " + username + " disconnected from room " + roomId);
            }
        }
    }

}
