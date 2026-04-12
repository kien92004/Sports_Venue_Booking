package duan.sportify.controller.WebSocket;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import duan.sportify.Repository.ChatMessageRepository;
import duan.sportify.entities.ChatMessage;

@RestController
@RequestMapping("api/user/chat")
public class ChatHistoryController {
    private final ChatMessageRepository repo;

    public ChatHistoryController(ChatMessageRepository repo) {
        this.repo = repo;
    }

    @GetMapping("history/{roomId}")
    public List<ChatMessage> getHistory(@PathVariable String roomId) {
        return repo.findByRoomIdOrderByTimestampAsc(roomId);
    }
}

