package duan.sportify.controller.WebSocket;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
public class UserController {
    private final WebSocketEventListener listener;

    public UserController(WebSocketEventListener listener) {
        this.listener = listener;
    }

    // Lấy user online theo room
    @GetMapping("/api/user/online-users")
    public Set<String> getOnlineUsersByRoom(@RequestParam String roomId) {
        return listener.getUsersByRoom(roomId);
    }
}
