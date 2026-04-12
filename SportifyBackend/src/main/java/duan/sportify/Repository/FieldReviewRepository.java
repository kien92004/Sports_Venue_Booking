package duan.sportify.Repository;

import duan.sportify.entities.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FieldReviewRepository extends JpaRepository<ProductReview, Integer> {

    // ===== FIELD REVIEW METHODS =====

    // Lấy đánh giá theo field ID (chỉ active)
    @Query("SELECT pr FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByFieldIdAndStatusActive(@Param("fieldId") Integer fieldId);

    // Lấy đánh giá của user cho field cụ thể
    @Query("SELECT pr FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.username = :username AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByFieldIdAndUsernameAndStatusActive(@Param("fieldId") Integer fieldId,
            @Param("username") String username);

    // Kiểm tra user đã đánh giá field chưa
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.username = :username AND pr.status = 'active'")
    Long countByFieldIdAndUsername(@Param("fieldId") Integer fieldId, @Param("username") String username);

    // Tính điểm trung bình cho field
    @Query("SELECT AVG(pr.rating) FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.status = 'active'")
    Double getAverageRatingByFieldId(@Param("fieldId") Integer fieldId);

    // Đếm tổng số đánh giá cho field
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.status = 'active'")
    Long getTotalReviewsByFieldId(@Param("fieldId") Integer fieldId);

    // Thống kê theo rating cho field
    @Query("SELECT pr.rating, COUNT(pr) FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.status = 'active' GROUP BY pr.rating ORDER BY pr.rating DESC")
    List<Object[]> getRatingStatsByFieldId(@Param("fieldId") Integer fieldId);

    // Lọc đánh giá theo rating cụ thể cho field
    @Query("SELECT pr FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.rating = :rating AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByFieldIdAndRatingAndStatusActive(@Param("fieldId") Integer fieldId,
            @Param("rating") Integer rating);

    // Lọc đánh giá có comment (bình luận) cho field
    @Query("SELECT pr FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.comment IS NOT NULL AND pr.comment != '' AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByFieldIdWithCommentsAndStatusActive(@Param("fieldId") Integer fieldId);

    // Lọc đánh giá có ảnh/video cho field
    @Query("SELECT pr FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.images IS NOT NULL AND pr.images != '' AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByFieldIdWithImagesAndStatusActive(@Param("fieldId") Integer fieldId);

    // Đếm số đánh giá có comment cho field
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.comment IS NOT NULL AND pr.comment != '' AND pr.status = 'active'")
    Long countByFieldIdWithComments(@Param("fieldId") Integer fieldId);

    // Đếm số đánh giá có ảnh/video cho field
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.fieldId = :fieldId AND pr.images IS NOT NULL AND pr.images != '' AND pr.status = 'active'")
    Long countByFieldIdWithImages(@Param("fieldId") Integer fieldId);

    // Phương thức tổng hợp - lấy đánh giá cho cả product hoặc field
    @Query("SELECT pr FROM ProductReview pr WHERE ((pr.productId = :itemId AND pr.fieldId IS NULL) OR (pr.fieldId = :itemId AND pr.productId IS NULL)) AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByItemIdAndStatusActive(@Param("itemId") Integer itemId);

      @Query("SELECT r FROM ProductReview r WHERE r.username = :username AND r.fieldId > 0 AND r.status = :status")
    List<ProductReview> findFieldReviewsByUsername(@Param("username") String username,
                                                   @Param("status") ProductReview.ReviewStatus status);
}