package duan.sportify.dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import duan.sportify.entities.FieldOwnerRegistration;

public interface FieldOwnerRegistrationDAO extends JpaRepository<FieldOwnerRegistration, Long> {
	boolean existsByUsername(String username);
	
	FieldOwnerRegistration findByUsername(String username);

	List<FieldOwnerRegistration> findByStatusOrderByCreatedAtDesc(String status);
}