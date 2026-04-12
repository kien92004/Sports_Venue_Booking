package duan.sportify.controller.WebSocket;

import java.time.Instant;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import duan.sportify.Repository.ChatMessageRepository;
import duan.sportify.entities.ChatMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Controller
public class ChatController {
    private final ChatMessageRepository repo;
    @Autowired
    SimpMessagingTemplate messagingTemplate;
    public ChatController(ChatMessageRepository repo) {
        this.repo = repo;
    }

    @MessageMapping("/chat.send/{roomId}")
    @SendTo("/topic/{roomId}")
    public ChatMessage sendMessage(@DestinationVariable String roomId, @Payload ChatMessage msg) {
        msg.setRoomId(roomId);
        msg.setTimestamp(Instant.now());
        return repo.save(msg);
    }
 // Controller để phát sự kiện typing
    @MessageMapping("/chat.typing/{roomId}")
    public void typing(@DestinationVariable String roomId, @Payload Map<String, String> payload) {
        String username = payload.get("username");
        messagingTemplate.convertAndSend("/topic/" + roomId + "/typing", Map.of("username", username));
    }

}


