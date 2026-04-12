package duan.sportify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import duan.sportify.service.ProductReviewService;
import duan.sportify.service.FieldReviewService;
import duan.sportify.service.UploadService;
import duan.sportify.entities.ProductReview;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.ArrayList;
import com.fasterxml.jackson.databind.ObjectMapper;


@RestController
@RequestMapping("api/user/reviews")
public class ReviewController {

    @Autowired
    private ProductReviewService productReviewService;
    
    @Autowired
    private FieldReviewService fieldReviewService;

    @Autowired
    private UploadService uploadService;


    // Lấy tất cả đánh giá của một sản phẩm hoặc sân
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> getReviews(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer fieldId,
            @RequestParam(defaultValue = "product") String type, HttpServletRequest request) {
        try {
            Integer entityId = "field".equalsIgnoreCase(type) ? fieldId : productId;
            if (entityId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Thiếu ID " + ("field".equalsIgnoreCase(type) ? "sân" : "sản phẩm")));
            }

            List<ProductReview> reviews;
            Map<String, Object> stats;
            
            if ("field".equalsIgnoreCase(type)) {
                reviews = fieldReviewService.getReviewsByFieldId(entityId);
                stats = fieldReviewService.getReviewStats(entityId);
                System.out.println("🔍 API /reviews?fieldId=" + entityId + " - Found " + reviews.size() + " reviews");
            } else {
                reviews = productReviewService.getReviewsByProductId(entityId);
                stats = productReviewService.getReviewStats(entityId);
                System.out.println("🔍 API /reviews?productId=" + entityId + " - Found " + reviews.size() + " reviews");
            }

           

            Map<String, Object> response = Map.of(
                    "success", true,
                    "reviews", reviews,
                    "stats", stats);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi lấy đánh giá: " + e.getMessage()));
        }
    }

    // Lấy đánh giá có lọc
    @GetMapping("/filtered")
    public ResponseEntity<Map<String, Object>> getFilteredReviews(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer fieldId,
            @RequestParam(defaultValue = "product") String type,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(required = false) Integer rating,
            HttpServletRequest request) {
        try {
            Integer entityId = "field".equalsIgnoreCase(type) ? fieldId : productId;
            if (entityId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Thiếu ID " + ("field".equalsIgnoreCase(type) ? "sân" : "sản phẩm")));
            }

            System.out.println("🔍 Lấy đánh giá có lọc - " + type + " ID: " + entityId + 
                    ", Filter: " + filter + ", Rating: " + rating);

            List<ProductReview> reviews;
            Map<String, Object> stats;
            
            if ("field".equalsIgnoreCase(type)) {
                reviews = fieldReviewService.getFilteredReviews(entityId, filter, rating);
                stats = fieldReviewService.getReviewStats(entityId);
            } else {
                reviews = productReviewService.getFilteredReviews(entityId, filter, rating);
                stats = productReviewService.getReviewStats(entityId);
            }

          

            Map<String, Object> response = Map.of(
                    "success", true,
                    "reviews", reviews,
                    "stats", stats,
                    "filter", filter,
                    "rating", rating != null ? rating : "");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Lỗi khi lấy đánh giá có lọc: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi lấy đánh giá có lọc: " + e.getMessage()));
        }
    }

    // Tạo đánh giá mới (JSON - không có ảnh)
    @PostMapping(value = "/create", consumes = { "multipart/form-data" })
    public ResponseEntity<Map<String, Object>> createReview(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer fieldId,
            @RequestParam(defaultValue = "product") String type,
            @RequestParam("customerName") String customerName,
            @RequestParam("rating") Integer rating,
            @RequestParam("comment") String comment,
            @RequestParam(value = "images", required = false) MultipartFile[] imageFiles,
            HttpServletRequest request) {
        try {
            Integer entityId = "field".equalsIgnoreCase(type) ? fieldId : productId;
            if (entityId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Thiếu ID " + ("field".equalsIgnoreCase(type) ? "sân" : "sản phẩm")));
            }

            String username = "AdminSportify";

            List<String> imageUrls = new ArrayList<>();

            // Nếu có ảnh thì upload lên Cloudinary
            if (imageFiles != null && imageFiles.length > 0) {
                for (MultipartFile file : imageFiles) {
                    if (!file.isEmpty()) {
                        String imageUrl = uploadService.uploadImage(file, "reviews");
                        imageUrls.add(imageUrl);
                    }
                }
            }

            // Convert list URL -> JSON string (có thể null nếu không có ảnh)
            String imagesJson = null;
            if (!imageUrls.isEmpty()) {
                ObjectMapper mapper = new ObjectMapper();
                imagesJson = mapper.writeValueAsString(imageUrls);
            }

            // Lưu review
            ProductReview review;
            if ("field".equalsIgnoreCase(type)) {
                review = fieldReviewService.createReview(entityId, username, customerName, rating, comment, imagesJson);
            } else {
                review = productReviewService.createReview(entityId, username, customerName, rating, comment, imagesJson);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", imageUrls.isEmpty()
                            ? "Đánh giá đã được lưu thành công!"
                            : "Đánh giá với ảnh đã được lưu thành công!",
                    "reviewId", review.getReviewId(),
                    "review", review,
                    "uploadedImages", imageUrls));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi tạo đánh giá: " + e.getMessage()));
        }
    }

    // Cập nhật đánh giá
    @PutMapping(value = "/{reviewId}", consumes = { "multipart/form-data" })
    public ResponseEntity<Map<String, Object>> updateReview(
            @PathVariable Integer reviewId,
            @RequestParam(defaultValue = "product") String type,
            @RequestParam("comment") String comment,
            @RequestParam("rating") Integer rating,
            @RequestParam(value = "customerName", required = false) String customerName,
            @RequestParam(value = "images", required = false) MultipartFile[] imageFiles,
            HttpServletRequest request) {

        try {
            List<String> imageUrls = new ArrayList<>();

            // ✅ Upload ảnh nếu có
            if (imageFiles != null && imageFiles.length > 0) {
                for (MultipartFile file : imageFiles) {
                    if (!file.isEmpty()) {
                        String imageUrl = uploadService.uploadImage(file, "reviews");
                        imageUrls.add(imageUrl);
                    }
                }
            }

            // ✅ Tạo dữ liệu review để update
            Map<String, Object> reviewData = new HashMap<>();
            reviewData.put("comment", comment);
            reviewData.put("rating", rating);
            if (customerName != null) reviewData.put("customerName", customerName);
            if (!imageUrls.isEmpty()) reviewData.put("images", imageUrls);

            // ✅ Cập nhật review
            ProductReview review;
            if ("field".equalsIgnoreCase(type)) {
                review = fieldReviewService.updateReview(reviewId, reviewData);
            } else {
                review = productReviewService.updateReview(reviewId, reviewData);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đánh giá đã được cập nhật!",
                    "review", review
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi cập nhật đánh giá: " + e.getMessage()
            ));
        }
    }


    // Xóa đánh giá (soft delete)
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Integer reviewId,
            @RequestParam(defaultValue = "product") String type,
            HttpServletRequest request) {
        try {
            if ("field".equalsIgnoreCase(type)) {
                fieldReviewService.deleteReview(reviewId);
            } else {
                productReviewService.deleteReview(reviewId);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đánh giá đã được xóa!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi xóa đánh giá: " + e.getMessage()));
        }
    }

    // Lấy đánh giá của một user
    @GetMapping("/user/{username}")
    public ResponseEntity<Map<String, Object>> getUserReviews(
            @PathVariable String username,
            @RequestParam String type,
            HttpServletRequest request) {
        try {
            List<ProductReview> reviews;
            
            if ("field".equalsIgnoreCase(type)) {
                reviews = fieldReviewService.getFieldReviewsByUsername(username);
            } else {
                reviews = productReviewService.getProductReviewsByUsername(username);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "reviews", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi lấy đánh giá user: " + e.getMessage()));
        }
    }

    // Lấy đánh giá cụ thể của user cho sản phẩm hoặc sân
    @GetMapping("/user/{username}/entity")
    public ResponseEntity<Map<String, Object>> getUserReviewForEntity(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer fieldId,
            @RequestParam(defaultValue = "product") String type,
            @PathVariable String username,
            HttpServletRequest request) {
        try {
            Integer entityId = "field".equalsIgnoreCase(type) ? fieldId : productId;
            if (entityId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Thiếu ID " + ("field".equalsIgnoreCase(type) ? "sân" : "sản phẩm")));
            }

            ProductReview userReview;
            
            if ("field".equalsIgnoreCase(type)) {
                userReview = fieldReviewService.getUserReviewForField(entityId, username);
            } else {
                userReview = productReviewService.getUserReviewForProduct(entityId, username);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hasReview", userReview != null);
            response.put("review", userReview);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy đánh giá user: " + e.getMessage());
            response.put("hasReview", false);
            response.put("review", null);
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Xóa đánh giá của user cho sản phẩm hoặc sân cụ thể
    @DeleteMapping("/user/{username}/entity")
    public ResponseEntity<Map<String, Object>> deleteUserReviewForEntity(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer fieldId,
            @RequestParam(defaultValue = "product") String type,
            @PathVariable String username,
            HttpServletRequest request) {
        try {
            Integer entityId = "field".equalsIgnoreCase(type) ? fieldId : productId;
            if (entityId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Thiếu ID " + ("field".equalsIgnoreCase(type) ? "sân" : "sản phẩm")));
            }

            System.out.println("🗑️ Xóa đánh giá của user " + username + " cho " + type + " " + entityId);

            boolean deleted;
            
            if ("field".equalsIgnoreCase(type)) {
                deleted = fieldReviewService.deleteUserReviewForField(entityId, username);
            } else {
                deleted = productReviewService.deleteUserReviewForProduct(entityId, username);
            }

            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Đánh giá đã được xóa thành công!"));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Không tìm thấy đánh giá để xóa"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi xóa đánh giá: " + e.getMessage()));
        }
    }

 
    @GetMapping("rating/{rating}")
    public ResponseEntity<List<ProductReview>> getReviewsByRating(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer fieldId,
            @RequestParam(defaultValue = "product") String type,
            @PathVariable Integer rating,
            HttpServletRequest request) {
        
        Integer entityId = "field".equalsIgnoreCase(type) ? fieldId : productId;
        if (entityId == null) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        
        if ("field".equalsIgnoreCase(type)) {
            return ResponseEntity.ok(fieldReviewService.findByFieldAndRating(entityId, rating));
        } else {
            return ResponseEntity.ok(productReviewService.findByProductAndRating(entityId, rating));
        }
    }


    // admin

       // Phản hồi của Người Bán cho đánh giá
       @PostMapping("{reviewId}/reply")
    public ResponseEntity<Map<String, Object>> createSellerReply(
            @PathVariable Integer reviewId,
            @RequestBody Map<String, Object> replyData,
            HttpServletRequest request) {
        try {
            String adminName = (String) replyData.get("adminName");
            String content = (String) replyData.get("content");
            String status = (String) replyData.get("status");

            // Kiểm tra quyền admin (có thể thêm logic kiểm tra role ở đây)
            if (adminName == null || content == null || content.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Thiếu thông tin phản hồi");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Gọi service để tạo seller reply
            ProductReview reply = fieldReviewService.createSellerReply(reviewId, status, adminName, content);

            System.out.println("✅ Phản hồi của người bán đã được tạo thành công");

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Phản hồi đã được gửi thành công!");
            successResponse.put("reply", reply);
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            System.out.println("❌ Lỗi khi tạo phản hồi của người bán: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi gửi phản hồi: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    @GetMapping("/all")
    public List<ProductReview> findAllReviews(HttpServletRequest request) {
        return productReviewService.findAllReviews();
    }
    @DeleteMapping("/delete/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReply(@PathVariable Integer reviewId) {
        productReviewService.deleteReply(reviewId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã xóa phản hồi của người bán");
        return ResponseEntity.ok(response);
    }

    // Get reviews for owner's fields
    @GetMapping("/owner/{ownerUsername}")
    public ResponseEntity<Map<String, Object>> getOwnerReviews(
            @PathVariable String ownerUsername,
            HttpServletRequest request) {
        try {
            System.out.println("🔍 API /reviews/owner/" + ownerUsername + " - Fetching reviews for owner's fields");
            List<ProductReview> reviews = fieldReviewService.getReviewsByOwner(ownerUsername);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviews);
            response.put("count", reviews.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error fetching owner reviews: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching owner reviews: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
