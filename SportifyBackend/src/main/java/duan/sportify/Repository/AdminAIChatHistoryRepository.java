package duan.sportify.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import duan.sportify.entities.AdminAIChatHistory;

@Repository
public interface AdminAIChatHistoryRepository extends JpaRepository<AdminAIChatHistory, Long> {
    List<AdminAIChatHistory> findByAdminIdOrderByCreatedAtAsc(String adminId);

    List<AdminAIChatHistory> findByAdminId(String adminId);
}
