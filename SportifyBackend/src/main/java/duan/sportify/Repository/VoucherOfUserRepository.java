package duan.sportify.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import duan.sportify.entities.VoucherOfUser;

public interface VoucherOfUserRepository extends JpaRepository<VoucherOfUser, Long> {
    List<VoucherOfUser> findByUsername(String username);

    List<VoucherOfUser> findByUsernameAndEndDateGreaterThanEqual(String username, LocalDate currentDate);
}
