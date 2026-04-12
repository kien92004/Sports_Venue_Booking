package duan.sportify.Repository;

import duan.sportify.entities.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Integer> {
    
    // Lấy đánh giá theo product ID (chỉ active)
    @Query("SELECT pr FROM ProductReview pr WHERE pr.productId = :productId AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByProductIdAndStatusActive(@Param("productId") Integer productId);
    
    // Lấy đánh giá theo username
    @Query("SELECT pr FROM ProductReview pr WHERE pr.username = :username AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByUsernameAndStatusActive(@Param("username") String username);
    
    

    // Lấy đánh giá của user cho sản phẩm cụ thể
    @Query("SELECT pr FROM ProductReview pr WHERE pr.productId = :productId AND pr.username = :username AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByProductIdAndUsernameAndStatusActive(@Param("productId") Integer productId, @Param("username") String username);
    
    // Kiểm tra user đã đánh giá sản phẩm chưa
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.productId = :productId AND pr.username = :username AND pr.status = 'active'")
    Long countByProductIdAndUsername(@Param("productId") Integer productId, @Param("username") String username);
    
    // Tính điểm trung bình
    @Query("SELECT AVG(pr.rating) FROM ProductReview pr WHERE pr.productId = :productId AND pr.status = 'active'")
    Double getAverageRatingByProductId(@Param("productId") Integer productId);
    
    // Đếm tổng số đánh giá
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.productId = :productId AND pr.status = 'active'")
    Long getTotalReviewsByProductId(@Param("productId") Integer productId);
    
    // Thống kê theo rating
    @Query("SELECT pr.rating, COUNT(pr) FROM ProductReview pr WHERE pr.productId = :productId AND pr.status = 'active' GROUP BY pr.rating ORDER BY pr.rating DESC")
    List<Object[]> getRatingStatsByProductId(@Param("productId") Integer productId);
    
    // Lọc đánh giá theo rating cụ thể
    @Query("SELECT pr FROM ProductReview pr WHERE pr.productId = :productId AND pr.rating = :rating AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByProductIdAndRatingAndStatusActive(@Param("productId") Integer productId, @Param("rating") Integer rating);
    
    // Lọc đánh giá có comment (bình luận)
    @Query("SELECT pr FROM ProductReview pr WHERE pr.productId = :productId AND pr.comment IS NOT NULL AND pr.comment != '' AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByProductIdWithCommentsAndStatusActive(@Param("productId") Integer productId);
    
    // Lọc đánh giá có ảnh/video
    @Query("SELECT pr FROM ProductReview pr WHERE pr.productId = :productId AND pr.images IS NOT NULL AND pr.images != '' AND pr.status = 'active' ORDER BY pr.createdAt DESC")
    List<ProductReview> findByProductIdWithImagesAndStatusActive(@Param("productId") Integer productId);
    
    // Đếm số đánh giá có comment
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.productId = :productId AND pr.comment IS NOT NULL AND pr.comment != '' AND pr.status = 'active'")
    Long countByProductIdWithComments(@Param("productId") Integer productId);
    
    // Đếm số đánh giá có ảnh/video
    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.productId = :productId AND pr.images IS NOT NULL AND pr.images != '' AND pr.status = 'active'")
    Long countByProductIdWithImages(@Param("productId") Integer productId);

    // Lấy đánh giá theo item ID (có thể là productId hoặc fieldId)
    @Query("SELECT r FROM ProductReview r WHERE r.username = :username AND r.productId > 0 AND r.status = :status")
    List<ProductReview> findProductReviewsByUsername(@Param("username") String username,
                                                   @Param("status") ProductReview.ReviewStatus status);
}