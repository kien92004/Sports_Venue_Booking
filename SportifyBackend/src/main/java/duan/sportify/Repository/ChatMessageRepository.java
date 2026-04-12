package duan.sportify.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import duan.sportify.entities.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);
}

