import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import getImageUrl from '../../helper/getImageUrl';
import '../../styles/Comment.css';
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
interface Review {
  reviewId: number;
  productId?: number;
  fieldId?: number;
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
  productId?: number;
  fieldId?: number;
  type: string; // "product" or "field"
}

const Comment = ({ productId, fieldId, type }: CommentProps) => {
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

  // New states for modal and confirmation dialog
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);
  const [editReviewRating, setEditReviewRating] = useState<number>(0);
  const [editReviewComment, setEditReviewComment] = useState<string>('');
  const [editReviewImages, setEditReviewImages] = useState<File[]>([]);
  const [editImagePreviewUrls, setEditImagePreviewUrls] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const username = localStorage.getItem('username') || undefined;
  const entityId = type === 'product' ? productId : fieldId;

  // Fetch reviews for the product or field
  useEffect(() => {
    if (entityId) {
      fetchReviews();
      if (username) {
        fetchUserReview();
      }
    }
  }, [entityId, type, username]);

  // Fetch reviews with filters when filter changes
  useEffect(() => {
    if (entityId && (activeFilter || activeRating !== null)) {
      fetchFilteredReviews();
    }
  }, [activeFilter, activeRating, entityId, type]);

  const fetchReviews = async () => {
    if (!entityId) return;

    try {
      // Use the proper parameter name based on type
      const idParam = type === 'product' ? `productId=${entityId}` : `fieldId=${entityId}`;
      const response = await axios.get(`${URL_BACKEND}/api/user/reviews?${idParam}&type=${type}`, { withCredentials: true });
      console.log("Fetch reviews response:", URL_BACKEND);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchUserReview = async () => {
    if (!username || !entityId) return;

    try {
      // Use the proper parameter name based on type
      const idParam = type === 'product' ? `productId=${entityId}` : `fieldId=${entityId}`;
      const response = await axios.get(
        `${URL_BACKEND}/api/user/reviews/user/${username}/entity?${idParam}&type=${type}`, { withCredentials: true }
      );

      if (response.data.success) {
        setHasUserReview(response.data.hasReview);
        if (response.data.hasReview && response.data.review) {
          setUserReview(response.data.review);

          // Pre-fill form with existing review data
          setNewReviewRating(response.data.review.rating);
          setNewReviewComment(response.data.review.comment || '');

          // Load existing images
          if (response.data.review.images) {
            try {
              const imageUrls = JSON.parse(response.data.review.images);
              if (Array.isArray(imageUrls)) {
                // Just store the URLs for display, don't convert to File objects
                setImagePreviewUrls(imageUrls.map(url => getImageUrl(url)));
              }
            } catch (e) {
              console.error("Error parsing image URLs:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  const fetchFilteredReviews = async () => {
    if (!entityId) return;

    try {
      let url;
      const idParam = type === 'product' ? `productId=${entityId}` : `fieldId=${entityId}`;

      if (activeRating !== null) {
        // Use the rating endpoint
        url = `${URL_BACKEND}/api/user/reviews/rating/${activeRating}?${idParam}&type=${type}`, { withCredentials: true };
      } else if (activeFilter !== 'all') {
        // Map internal filter names to API filter names
        const apiFilter = activeFilter === 'withComments' ? 'with_comments' :
          activeFilter === 'withImages' ? 'with_images' : 'all';

        // Use the filtered endpoint for other filters
        url = `${URL_BACKEND}/api/user/reviews/filtered?${idParam}&type=${type}&filter=${apiFilter}`, { withCredentials: true };
      } else {
        // Default: get all reviews
        url = `${URL_BACKEND}/api/user/reviews?${idParam}&type=${type}`;
      }

      const response = await axios.get(url, { withCredentials: true });

      if (response.data.success) {
        setReviews(response.data.reviews);
        // Update stats if available in the response
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else if (Array.isArray(response.data)) {
        // Handle direct array response from rating endpoint
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching filtered reviews:", error);
      setReviews([]);
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleRatingFilterClick = (rating: number | null) => {
    setActiveRating(rating);
    // Reset the other filter when selecting a rating
    setActiveFilter('all');
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username || !entityId || !newReviewRating) {
      console.log('Missing username, entityId, or rating', { username, entityId, newReviewRating });

      alert('Vui lòng đánh giá số sao cho sản phẩm');
      return;
    }

    try {
      const formData = new FormData();
      // Add the appropriate ID field based on the type
      if (type === 'product' && productId) {
        formData.append('productId', productId.toString());
      } else if (type === 'field' && fieldId) {
        formData.append('fieldId', fieldId.toString());
      } else {
        alert('Thiếu thông tin ID sản phẩm hoặc sân');
        return;
      }

      formData.append('type', type);
      formData.append('customerName', username);
      formData.append('rating', newReviewRating.toString());
      formData.append('comment', newReviewComment);

      // Add images if any
      newReviewImages.forEach(image => {
        formData.append('images', image);
      });

      let response;

      // For new reviews
      if (!hasUserReview) {
        response = await axios.post(
          `${URL_BACKEND}/api/user/reviews/create`,
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          setUserReview(response.data.review);
          setHasUserReview(true);
          fetchReviews(); // Refresh reviews
          alert('Đánh giá của bạn đã được gửi thành công!');
          resetForm(); // Move after the alert for better user experience
        }
      }
      // For updating existing reviews
      else if (userReview) {
        response = await axios.put(
          `${URL_BACKEND}/api/user/reviews/${userReview.reviewId}?type=${type}`,
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          setUserReview(response.data.review);
          fetchReviews(); // Refresh reviews
          alert('Đánh giá của bạn đã được cập nhật thành công!');
          resetForm(); // Move after the alert for better user experience
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.');
    }
  };

  // Open the edit modal with the current user review
  const openEditModal = () => {
    if (userReview) {
      setEditReviewId(userReview.reviewId);
      setEditReviewRating(userReview.rating);
      setEditReviewComment(userReview.comment || '');

      // Load existing images
      if (userReview.images) {
        try {
          const imageUrls = JSON.parse(userReview.images);
          if (Array.isArray(imageUrls)) {
            setEditImagePreviewUrls(imageUrls.map(url => getImageUrl(url)));
          }
        } catch (e) {
          console.error("Error parsing image URLs:", e);
        }
      }

      setIsEditModalOpen(true);
    }
  };

  // Close the edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditReviewId(null);
    setEditReviewRating(0);
    setEditReviewComment('');
    setEditReviewImages([]);
    setEditImagePreviewUrls([]);
  };

  // Handle image upload in the edit modal
  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setEditReviewImages(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
    setEditImagePreviewUrls(prev => [...prev, ...newImageUrls]);
  };

  // Remove image in the edit modal
  const removeEditImage = (index: number) => {
    setEditReviewImages(prev => prev.filter((_, i) => i !== index));

    // Also remove the preview URL and revoke it to free memory
    const urlToRemove = editImagePreviewUrls[index];
    if (urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
    }
    setEditImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Submit the edited review
  const handleSubmitEditReview = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username || !entityId || !editReviewRating || !editReviewId) {
      alert('Thiếu thông tin cần thiết để cập nhật đánh giá');
      return;
    }

    try {
      const formData = new FormData();

      if (type === 'product' && productId) {
        formData.append('productId', productId.toString());
      } else if (type === 'field' && fieldId) {
        formData.append('fieldId', fieldId.toString());
      } else {
        alert('Thiếu thông tin ID sản phẩm hoặc sân');
        return;
      }

      formData.append('type', type);
      formData.append('customerName', username);
      formData.append('rating', editReviewRating.toString());
      formData.append('comment', editReviewComment);

      // Add images if any
      editReviewImages.forEach(image => {
        formData.append('images', image);
      });

      const response = await axios.put(
        `${URL_BACKEND}/api/user/reviews/${editReviewId}?type=${type}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setUserReview(response.data.review);
        fetchReviews(); // Refresh reviews
        alert('Đánh giá của bạn đã được cập nhật thành công!');
        closeEditModal();
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert('Có lỗi xảy ra khi cập nhật đánh giá. Vui lòng thử lại sau.');
    }
  };

  // Open delete confirmation dialog
  const openDeleteConfirm = () => {
    setIsDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  // Confirm deletion of review
  const confirmDeleteReview = async () => {
    await handleDeleteReview();
    closeDeleteConfirm();
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      // Updated to match API documentation - delete using reviewId and type
      const response = await axios.delete(
        `${URL_BACKEND}/api/user/reviews/${userReview.reviewId}?type=${type}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUserReview(null);
        setHasUserReview(false);
        fetchReviews(); // Refresh reviews
        alert('Đánh giá của bạn đã được xóa thành công!');
        resetForm(); // Ensure form is reset after deletion
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert('Có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại sau.');
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
    // Reset rating and comment
    setNewReviewRating(0);
    setNewReviewComment('');

    // Reset images state
    setNewReviewImages([]);

    // Clear image preview URLs and revoke object URLs to prevent memory leaks
    imagePreviewUrls.forEach(url => {
      // Only revoke URLs that are object URLs (not API URLs)
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setImagePreviewUrls([]);

    // Reset the file input if it exists
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      {username && !hasUserReview && (
        <div className="review-form-container">
          <h3>Viết đánh giá</h3>
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
                Gửi đánh giá
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: REVIEWS LIST */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            {activeFilter !== 'all' || activeRating !== null ?
              `Không tìm thấy đánh giá nào ${activeRating ? `với ${activeRating} sao` : ''} ${activeFilter !== 'all' ? (activeFilter === 'withComments' ? 'có bình luận' : 'có hình ảnh') : ''}`
              : 'Chưa có đánh giá nào cho sản phẩm này'}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.reviewId} className="review-card">
              <div className="review-layout">
                <div className="review-content-wrapper">
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
                    {/* Action buttons shown only for the user's own review */}
                    {username && review.customerName.toLowerCase() === username.toLowerCase() && (
                      <div className="review-actions">
                        <button className="edit-review-btn small-btn" onClick={openEditModal}>
                          <i className="fa fa-pencil"></i> Sửa
                        </button>
                        <button className="delete-review-btn small-btn" onClick={openDeleteConfirm}>
                          <i className="fa fa-trash"></i> Xóa
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="review-content">
                    <div className="review-comment">{review.comment}</div>

                    {review.images && (
                      <div className="review-images">
                        {parseImageUrls(review.images).map((imageUrl, index) => (
                          <div key={index} className="review-image">
                            <img src={getImageUrl(imageUrl)} alt={`Review image ${index + 1}`} />
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
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Review Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Chỉnh sửa đánh giá</h3>
              <button className="close-modal" onClick={closeEditModal}>✕</button>
            </div>

            <form onSubmit={handleSubmitEditReview} className="edit-review-form">
              <div className="rating-selector">
                <p>Đánh giá của bạn:</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= editReviewRating ? 'active' : ''}`}
                      onClick={() => setEditReviewRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="review-textarea">
                <textarea
                  value={editReviewComment}
                  onChange={(e) => setEditReviewComment(e.target.value)}
                  placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
                  rows={4}
                ></textarea>
              </div>

              <div className="image-upload">
                <div className="upload-btn" onClick={() => editFileInputRef.current?.click()}>
                  <i className="upload-icon">📷</i>
                  <span>Thêm ảnh</span>
                </div>
                <input
                  type="file"
                  ref={editFileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  style={{ display: 'none' }}
                />

                {editImagePreviewUrls.length > 0 && (
                  <div className="image-previews">
                    {editImagePreviewUrls.map((url, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={url} alt={`Preview ${index}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeEditImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-edit-btn">
                  Cập nhật đánh giá
                </button>
                <button type="button" className="cancel-btn" onClick={closeEditModal}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa đánh giá này?</p>
            <div className="dialog-actions">
              <button className="confirm-btn" onClick={confirmDeleteReview}>
                Xóa
              </button>
              <button className="cancel-btn" onClick={closeDeleteConfirm}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;
