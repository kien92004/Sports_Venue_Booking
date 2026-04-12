package duan.sportify.dao;

import java.util.List;
import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import duan.sportify.entities.Categories;

public interface CategoryDAO extends JpaRepository<Categories, Integer>{
	// Viết theo kiểu tối giản để gọi truy vấn tìm theo id
	Categories findByCategoryid(Integer categoryid);
	// search category in admin
	@Query(value = "SELECT * FROM categories\r\n"
			+ "WHERE (:categoryname IS NULL OR categoryname LIKE CONCAT('%', :categoryname, '%'))", nativeQuery = true)
	List<Categories> searchCategoryAdmin(@Param("categoryname") Optional<String> categoryname);
}
