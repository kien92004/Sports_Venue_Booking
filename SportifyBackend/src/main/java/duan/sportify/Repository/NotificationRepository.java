package duan.sportify.Repository;

import duan.sportify.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUsernameOrderByTimestampDesc(String username);
    long countByUsernameAndReadFalse(String username);
    
    @Modifying
    @Transactional
    void deleteByUsername(String username);
}