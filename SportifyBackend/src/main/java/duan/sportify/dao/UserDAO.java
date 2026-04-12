package duan.sportify.dao;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import duan.sportify.entities.Users;

public interface UserDAO extends JpaRepository<Users, String>{
	@Query(value="SELECT COUNT(*) FROM users;", nativeQuery = true)
	List<Object> CountUser();
	
	@Query(value = "SELECT * FROM sportify.users WHERE username like :usernameSignup", nativeQuery = true)
	Users findAcc(String usernameSignup);
	// search admin
	    @Query(value = "SELECT DISTINCT  users.*\r\n"
		    + "FROM users\r\n"
		    + "JOIN authorized ON users.username = authorized.username\r\n"
		    + "JOIN roles ON authorized.roleid = roles.roleid\r\n"
		    + "WHERE users.username like CONCAT('%', :user, '%')\r\n"
		    + "AND (CONCAT(users.firstname, ' ', users.lastname) LIKE CONCAT('%', :keyword, '%'))\r\n"
		    + "AND (:status IS NULL OR users.status = :status)\r\n"
		    + "AND roles.rolename like CONCAT('%', :role, '%');", nativeQuery = true)
	    List<Users> searchUserAdmin(@Param("user") String user,
					    @Param("keyword") String keyword,
					    @Param("status") Optional<Integer> status,
					    @Param("role") String role);
	
	@Query("SELECT u FROM Users u WHERE u.username = :username")
	Users findByUsername(@Param("username") String username);

	 @Modifying
    @Transactional
    @Query(value = "DELETE FROM users WHERE username = :username", nativeQuery = true)
    void deleteByUsername(@Param("username") String username);
	
}
