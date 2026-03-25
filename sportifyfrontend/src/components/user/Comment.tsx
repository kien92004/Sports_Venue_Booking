import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import '../../styles/Comment.css';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Review {
  reviewId: number;
  productId: number;
  username: string;
  customerName: string;
  rating: number;
  comment: string;
  images: string;
  sellerReplyContent: string | null;
  sellerReplyAdminUsername: string | null;
  sellerReplyAdminName: string | null;
  sellerReplyDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RatingStats {
  totalReviews: number;
  ratingDistribution: {
    [key: string]: number;
  };
  reviewsWithComments: number;
  averageRating: number;
  reviewsWithImages: number;
}

interface CommentProps {
  productId: number;
  currentUser?: {
    username: string;
  };
}

const Comment = ({ productId, currentUser }: CommentProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeRating, setActiveRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [hasUserReview, setHasUserReview] = useState<boolean>(false);

  // Review form states
  const [newReviewRating, setNewReviewRating] = useState<number>(0);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [newReviewImages, setNewReviewImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch reviews for the product
  useEffect(() => {
    fetchReviews();
    if (currentUser) {
      fetchUserReview();
    }
  }, [productId, currentUser]);

  // Fetch reviews with filters when filter changes
  useEffect(() => {
    if (activeFilter || activeRating) {
      fetchFilteredReviews();
    }
  }, [activeFilter, activeRating]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${URL_BACKEND}/api/reviews/product/${productId}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchUserReview = async () => {
    if (!currentUser?.username) return;

    try {
      const response = await axios.get(
        `${URL_BACKEND}/api/reviews/product/${productId}/user/${currentUser.username}`
      );

      if (response.data.success) {
        setHasUserReview(response.data.hasReview);
        if (response.data.hasReview) {
          setUserReview(response.data.review);
        }
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  const fetchFilteredReviews = async () => {
    try {
      let url = `${URL_BACKEND}/api/reviews/product/${productId}/filtered?filter=${activeFilter}`;
      if (activeRating) {
        url += `&rating=${activeRating}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching filtered reviews:", error);
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleRatingFilterClick = (rating: number | null) => {
    setActiveRating(rating);
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser || !newReviewRating) return;

    try {
      // For new reviews
      if (!hasUserReview) {
        const formData = new FormData();
        formData.append('rating', newReviewRating.toString());
        formData.append('comment', newReviewComment);

        // Add images if any
        newReviewImages.forEach(image => {
          formData.append('images', image);
        });

        const response = await axios.post(
          `${URL_BACKEND}/api/reviews/product/${productId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          setUserReview(response.data.review);
          setHasUserReview(true);
          resetForm();
          fetchReviews(); // Refresh reviews
        }
      }
      // For updating existing reviews
      else if (userReview) {
        const formData = new FormData();
        formData.append('rating', newReviewRating.toString());
        formData.append('comment', newReviewComment);

        // Add images if any
        newReviewImages.forEach(image => {
          formData.append('images', image);
        });

        const response = await axios.put(
          `${URL_BACKEND}/api/reviews/${userReview.reviewId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          setUserReview(response.data.review);
          resetForm();
          fetchReviews(); // Refresh reviews
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      const response = await axios.delete(
        `${URL_BACKEND}/api/reviews/${userReview.reviewId}`
      );

      if (response.data.success) {
        setUserReview(null);
        setHasUserReview(false);
        fetchReviews(); // Refresh reviews
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setNewReviewImages(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    setNewReviewImages(prev => prev.filter((_, i) => i !== index));

    // Also remove the preview URL and revoke it to free memory
    const urlToRemove = imagePreviewUrls[index];
    URL.revokeObjectURL(urlToRemove);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewReviewRating(0);
    setNewReviewComment('');
    setNewReviewImages([]);
    setImagePreviewUrls(prev => {
      // Revoke all URLs to free memory
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
  };

  // Helper to parse image URLs from the string format in the API
  const parseImageUrls = (imagesString: string): string[] => {
    try {
      return JSON.parse(imagesString) || [];
    } catch (error) {
      return [];
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="comment-container">
      {/* SECTION 1: RATING SUMMARY */}
      <div className="rating-summary">
        <div className="rating-average">
          <div className="average-score">{stats?.averageRating.toFixed(1) || '0.0'}</div>
          <div className="average-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`star ${stats && star <= Math.round(stats.averageRating) ? 'active' : ''}`}>
                ★
              </span>
            ))}
          </div>
          <div className="total-reviews">{stats?.totalReviews || 0} đánh giá</div>
        </div>

        <div className="rating-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' && activeRating === null ? 'active' : ''}`}
            onClick={() => {
              handleFilterClick('all');
              handleRatingFilterClick(null);
            }}
          >
            Tất cả
          </button>

          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={`filter-btn ${activeRating === rating ? 'active' : ''}`}
              onClick={() => {
                handleRatingFilterClick(rating);
                handleFilterClick('all');
              }}
            >
              {rating} Sao ({stats?.ratingDistribution[rating] || 0})
            </button>
          ))}

          <button
            className={`filter-btn ${activeFilter === 'withComments' ? 'active' : ''}`}
            onClick={() => {
              handleFilterClick('withComments');
              handleRatingFilterClick(null);
            }}
          >
            Có Bình luận ({stats?.reviewsWithComments || 0})
          </button>

          <button
            className={`filter-btn ${activeFilter === 'withImages' ? 'active' : ''}`}
            onClick={() => {
              handleFilterClick('withImages');
              handleRatingFilterClick(null);
            }}
          >
            Có Hình ảnh ({stats?.reviewsWithImages || 0})
          </button>
        </div>
      </div>

      {/* SECTION 3: REVIEW FORM (if user is logged in and hasn't reviewed yet) */}
      {currentUser && (
        <div className="review-form-container">
          <h3>{hasUserReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá'}</h3>
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="rating-selector">
              <p>Đánh giá của bạn:</p>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= newReviewRating ? 'active' : ''}`}
                    onClick={() => setNewReviewRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="review-textarea">
              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                rows={4}
              ></textarea>
            </div>

            <div className="image-upload">
              <div className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                <i className="upload-icon">📷</i>
                <span>Thêm ảnh</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {imagePreviewUrls.length > 0 && (
                <div className="image-previews">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={url} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-review-btn">
                {hasUserReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </button>

              {hasUserReview && (
                <button
                  type="button"
                  className="delete-review-btn"
                  onClick={handleDeleteReview}
                >
                  Xóa đánh giá
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: REVIEWS LIST */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">Chưa có đánh giá nào cho sản phẩm này</div>
        ) : (
          reviews.map((review) => (
            <div key={review.reviewId} className="review-card">
              <div className="review-header">
                <div className="reviewer-avatar">
                  <div className="avatar-placeholder">👤</div>
                </div>

                <div className="reviewer-info">
                  <div className="reviewer-name">{review.customerName}</div>
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= review.rating ? 'active' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="review-date">{formatDate(review.createdAt || review.updatedAt)}</div>
                </div>
              </div>

              <div className="review-content">
                <div className="review-comment">{review.comment}</div>

                {review.images && (
                  <div className="review-images">
                    {parseImageUrls(review.images).map((imageUrl, index) => (
                      <div key={index} className="review-image">
                        <img src={imageUrl} alt={`Review image ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {review.sellerReplyContent && (
                <div className="seller-reply">
                  <div className="seller-reply-header">
                    <strong>Phản hồi của Shop:</strong>
                    {review.sellerReplyAdminName && <span> {review.sellerReplyAdminName}</span>}
                    {review.sellerReplyDate && <span className="reply-date"> - {formatDate(review.sellerReplyDate)}</span>}
                  </div>
                  <div className="seller-reply-content">{review.sellerReplyContent}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comment;
