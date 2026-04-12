package duan.sportify.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId;

    @Column(name = "product_id", nullable = true)
    private Integer productId;

    @Column(name = "field_id", nullable = true)
    private Integer fieldId;

    @Column(name = "username", nullable = false, length = 16)
    private String username;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    // Seller Reply fields
    @Column(name = "seller_reply_content", columnDefinition = "TEXT")
    private String sellerReplyContent;

    @Column(name = "seller_reply_date")
    private LocalDateTime sellerReplyDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReviewStatus status = ReviewStatus.active;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ReviewStatus {
        active, hidden, deleted
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}