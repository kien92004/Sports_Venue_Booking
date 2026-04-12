package duan.sportify.dao;

import java.util.List;
import javax.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import duan.sportify.entities.FavoriteField;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteFieldDAO extends JpaRepository<FavoriteField, Integer> {

    @Query("SELECT f FROM FavoriteField f WHERE f.username.username = :username")
    List<FavoriteField> findFavoriteByUsername(@Param("username") String username);

    @Modifying
    @Transactional
    @Query("DELETE FROM FavoriteField f WHERE f.username.username = :username AND f.field.id = :fieldId")
    void removeFavoriteField(@Param("username") String username, @Param("fieldId") Integer fieldId);

   
    @Query("""
                SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END
                FROM FavoriteField f
                WHERE f.username.username = :username AND f.field.fieldid = :fieldId
            """)
    boolean checkFavoriteField(@Param("username") String username, @Param("fieldId") Integer fieldId);

    // Lấy danh sách sân yêu thích của user (chỉ sân còn hoạt động)
    @Query(value = "SELECT DISTINCT f.* FROM field f " +
            "INNER JOIN favorite ff ON f.fieldid = ff.fieldid " +
            "WHERE ff.username = :username AND f.status = 1 " +
            "LIMIT 4", nativeQuery = true)
    List<Object[]> findUserFavoriteFields(@Param("username") String username);

}
