package duan.sportify.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import duan.sportify.entities.AIChatHistory;

@Repository
public interface AIChatHistoryRepository extends JpaRepository<AIChatHistory, Long> {
    List<AIChatHistory> findByUserIdOrderByCreatedAtAsc(String userId);

    List<AIChatHistory> findByUserId(String userId);

    void deleteByUserId(String userId);
}
