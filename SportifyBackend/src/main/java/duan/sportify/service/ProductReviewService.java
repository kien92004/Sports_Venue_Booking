package duan.sportify.service;

import duan.sportify.entities.ProductReview;
import duan.sportify.Repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class ProductReviewService {
    
    @Autowired
    private ProductReviewRepository reviewRepository;
    
    // Lấy đánh giá theo product ID
    public List<ProductReview> getReviewsByProductId(Integer productId) {
        return reviewRepository.findByProductIdAndStatusActive(productId);
    }
    
    // Lấy đánh giá theo username
    public List<ProductReview> getReviewsByUsername(String username) {
        return reviewRepository.findByUsernameAndStatusActive(username);
    }
    
    // Tạo đánh giá mới
    public ProductReview createReview(Integer productId, String username, String customerName, 
                                    Integer rating, String comment, String images) {
        // Kiểm tra user đã có đánh giá chưa
        List<ProductReview> existingReviews = reviewRepository.findByProductIdAndUsernameAndStatusActive(productId, username);
        
        if (!existingReviews.isEmpty()) {
            // Cập nhật đánh giá cũ thay vì tạo mới
            ProductReview existingReview = existingReviews.get(0);
            existingReview.setCustomerName(customerName);
            existingReview.setRating(rating);
            existingReview.setComment(comment);
            existingReview.setImages(images);
            existingReview.setUpdatedAt(java.time.LocalDateTime.now());
            
            System.out.println("🔄 Cập nhật đánh giá cũ cho user: " + username + ", product: " + productId);
            return reviewRepository.save(existingReview);
        }
        
        // Tạo đánh giá mới
        ProductReview review = new ProductReview();
        review.setProductId(productId);
        review.setUsername(username);
        review.setCustomerName(customerName);
        review.setRating(rating);
        review.setComment(comment);
        review.setImages(images);
        
        return reviewRepository.save(review);
    }
    
    // Cập nhật đánh giá
   public ProductReview updateReview(Integer reviewId, Map<String, Object> reviewData) {
    Optional<ProductReview> optionalReview = reviewRepository.findById(reviewId);
    if (!optionalReview.isPresent()) {
        throw new RuntimeException("Không tìm thấy đánh giá!");
    }

    ProductReview review = optionalReview.get();
    ObjectMapper mapper = new ObjectMapper();

    // ✅ Rating
    if (reviewData.containsKey("rating")) {
        Object ratingObj = reviewData.get("rating");
        if (ratingObj instanceof Integer) {
            review.setRating((Integer) ratingObj);
        } else if (ratingObj instanceof String) {
            review.setRating(Integer.parseInt((String) ratingObj));
        }
    }

    // ✅ Comment
    if (reviewData.containsKey("comment")) {
        review.setComment((String) reviewData.get("comment"));
    }

    // ✅ Images
    if (reviewData.containsKey("images")) {
        Object imagesObj = reviewData.get("images");

        if (imagesObj instanceof List) {
            // Convert List<String> → JSON string
            try {
                String imagesJson = mapper.writeValueAsString(imagesObj);
                review.setImages(imagesJson);
            } catch (Exception e) {
                throw new RuntimeException("Lỗi khi chuyển danh sách ảnh thành JSON: " + e.getMessage());
            }
        } else if (imagesObj instanceof String) {
            // Nếu đã là JSON string
            review.setImages((String) imagesObj);
        }
    }

    return reviewRepository.save(review);
}
    
    // Xóa đánh giá (soft delete)
    public void deleteReview(Integer reviewId) {
        Optional<ProductReview> optionalReview = reviewRepository.findById(reviewId);
        if (!optionalReview.isPresent()) {
            throw new RuntimeException("Không tìm thấy đánh giá!");
        }
        
        ProductReview review = optionalReview.get();
        review.setStatus(ProductReview.ReviewStatus.deleted);
        reviewRepository.save(review);
    }
    
    // Lấy thống kê đánh giá
    public Map<String, Object> getReviewStats(Integer productId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Điểm trung bình
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        
        // Tổng số đánh giá
        Long totalReviews = reviewRepository.getTotalReviewsByProductId(productId);
        stats.put("totalReviews", totalReviews != null ? totalReviews : 0L);
        
        // Thống kê theo rating
        List<Object[]> ratingStats = reviewRepository.getRatingStatsByProductId(productId);
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        
        // Khởi tạo với 0 cho tất cả rating
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
        }
        
        // Cập nhật số liệu thực tế
        for (Object[] stat : ratingStats) {
            Integer rating = (Integer) stat[0];
            Long count = (Long) stat[1];
            ratingDistribution.put(rating, count);
        }
        
        stats.put("ratingDistribution", ratingDistribution);
        
        // Thêm thống kê cho bộ lọc
        Long reviewsWithComments = reviewRepository.countByProductIdWithComments(productId);
        Long reviewsWithImages = reviewRepository.countByProductIdWithImages(productId);
        
        stats.put("reviewsWithComments", reviewsWithComments != null ? reviewsWithComments : 0L);
        stats.put("reviewsWithImages", reviewsWithImages != null ? reviewsWithImages : 0L);
        
        return stats;
    }
    
    // Lấy đánh giá có lọc
    public List<ProductReview> getFilteredReviews(Integer productId, String filterType, Integer rating) {
        switch (filterType) {
            case "rating":
                if (rating != null) {
                    return reviewRepository.findByProductIdAndRatingAndStatusActive(productId, rating);
                }
                break;
            case "comments":
                return reviewRepository.findByProductIdWithCommentsAndStatusActive(productId);
            case "images":
                return reviewRepository.findByProductIdWithImagesAndStatusActive(productId);
            case "all":
            default:
                return reviewRepository.findByProductIdAndStatusActive(productId);
        }
        return reviewRepository.findByProductIdAndStatusActive(productId);
    }
    
    // Kiểm tra user đã đánh giá chưa
    public boolean hasUserReviewed(Integer productId, String username) {
        Long count = reviewRepository.countByProductIdAndUsername(productId, username);
        return count > 0;
    }
    
    // Lấy đánh giá cụ thể của user cho sản phẩm
    public ProductReview getUserReviewForProduct(Integer productId, String username) {
        List<ProductReview> reviews = reviewRepository.findByProductIdAndUsernameAndStatusActive(productId, username);
        return reviews.isEmpty() ? null : reviews.get(0);
    }
    
    // Xóa đánh giá của user cho sản phẩm cụ thể
    public boolean deleteUserReviewForProduct(Integer productId, String username) {
        List<ProductReview> reviews = reviewRepository.findByProductIdAndUsernameAndStatusActive(productId, username);
        
        if (!reviews.isEmpty()) {
            ProductReview review = reviews.get(0);
            review.setStatus(ProductReview.ReviewStatus.deleted);
            reviewRepository.save(review);
            
            System.out.println("✅ Đã xóa đánh giá ID: " + review.getReviewId() + 
                            " của user: " + username + " cho sản phẩm: " + productId);
            return true;
        }
        
        System.out.println("⚠️ Không tìm thấy đánh giá để xóa cho user: " + username + ", sản phẩm: " + productId);
        return false;
    }
    
    // Tạo phản hồi của người bán
    public ProductReview createSellerReply(Integer reviewId, String status, String adminName, String content) {
        Optional<ProductReview> optionalReview = reviewRepository.findById(reviewId);
        if (!optionalReview.isPresent()) {
            throw new RuntimeException("Không tìm thấy đánh giá với ID: " + reviewId);
        }
        
        ProductReview review = optionalReview.get();
        
        // Kiểm tra xem đã có reply chưa
        String existingContent = review.getSellerReplyContent();
        if (existingContent != null && !existingContent.isEmpty() && 
            !"null".equals(existingContent) && !existingContent.trim().isEmpty() &&
            !"null".equals(existingContent.trim())) {
            throw new RuntimeException("Đánh giá này đã có phản hồi từ người bán");
        }
        
        // Thêm seller reply
        review.setSellerReplyContent(content);
        review.setStatus(status != null ? ProductReview.ReviewStatus.valueOf(status) : review.getStatus());
        review.setSellerReplyDate(java.time.LocalDateTime.now());
        
        ProductReview savedReview = reviewRepository.save(review);
        return savedReview;
    }


    public List<ProductReview> findByProductAndRating(Integer productId, Integer rating) {
        return reviewRepository.findByProductIdAndRatingAndStatusActive(productId, rating);
    }

    public List<ProductReview> getProductReviewsByUsername(String username) {
    return reviewRepository.findProductReviewsByUsername(username, ProductReview.ReviewStatus.active);
    }

    public List<ProductReview> findAllReviews() {
        return reviewRepository.findAll();
    }

   public void deleteReply(Integer reviewId) {
    Optional<ProductReview> optionalReview = reviewRepository.findById(reviewId);
    if (!optionalReview.isPresent()) {
        throw new RuntimeException("Không tìm thấy đánh giá!");
    }
    
    ProductReview review = optionalReview.get();
    review.setSellerReplyContent(null);
    review.setSellerReplyDate(null);
    reviewRepository.save(review);

   }

}