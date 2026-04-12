import axios from "axios";
import React, { useEffect, useState } from "react";
import BootstrapModal from "../../components/admin/BootstrapModal";
import { AuthContext } from "../../helper/AuthContext";
import "../../styles/AdminModal.css";
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;

interface Review {
  reviewId: number;
  productId: number;
  fieldId: number;
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

interface ReplyForm {
  adminName: string;
  content: string;
  status: string;
}

const VITE_CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";

const OwnerReviewManager: React.FC = () => {
  const { user } = React.useContext(AuthContext);
  const ownerUsername = user?.username || "";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyForm, setReplyForm] = useState<ReplyForm>({
    adminName: "",
    content: "",
    status: "active",
  });
  const [search, setSearch] = useState({
    username: "",
    status: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch owner's field reviews
  useEffect(() => {
    if (ownerUsername) {
      fetchReviews();
      // Get owner name from localStorage
      const ownerName = localStorage.getItem("ownerName") || ownerUsername;
      setReplyForm(prev => ({ ...prev, adminName: ownerName }));
    }
  }, [ownerUsername]);

  const fetchReviews = async () => {
    if (!ownerUsername) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${URL_BACKEND}/api/user/reviews/owner/${ownerUsername}`,
        { withCredentials: true }
      );

      // API returns array directly (like /all endpoint)
      if (Array.isArray(response.data)) {
        setReviews(response.data);
        console.log(`✅ Loaded ${response.data.length} reviews for owner ${ownerUsername}`);
      } else if (response.data.success && response.data.reviews) {
        // Fallback for wrapped response
        setReviews(response.data.reviews);
        console.log(`✅ Loaded ${response.data.reviews.length} reviews for owner ${ownerUsername}`);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!selectedReview) return;

    try {
      const response = await axios.post(
        `${URL_BACKEND}/api/user/reviews/${selectedReview.reviewId}/reply`,
        replyForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        // Update the review in the list
        setReviews(reviews.map(review =>
          review.reviewId === selectedReview.reviewId ? response.data.reply : review
        ));
        setShowReplyModal(false);
        setReplyForm(prev => ({ ...prev, content: "", status: "active" }));
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      setError("Không thể gửi phản hồi. Vui lòng thử lại.");
    }
  };

  // Add new function to handle reply deletion
  const handleDeleteReply = async () => {
    if (!selectedReview || !selectedReview.reviewId) return;

    try {
      const response = await axios.delete(
        `${URL_BACKEND}/api/user/reviews/delete/${selectedReview.reviewId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess(response.data.message);

        // Update the review in the list by removing reply data
        const updatedReview = {
          ...selectedReview,
          sellerReplyContent: null,
          sellerReplyAdminUsername: null,
          sellerReplyAdminName: null,
          sellerReplyDate: null
        };

        setReviews(reviews.map(review =>
          review.reviewId === selectedReview.reviewId ? updatedReview : review
        ));

        // Update selected review to reflect changes
        setSelectedReview(updatedReview);

        // Clear the form content but keep the admin name
        setReplyForm(prev => ({ ...prev, content: "", status: "active" }));
      }
    } catch (error) {
      console.error("Error deleting reply:", error);
      setError("Không thể xóa phản hồi. Vui lòng thử lại.");
    }
  };

  // Open reply modal
  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setReplyForm(prev => ({
      ...prev,
      content: review.sellerReplyContent || "",
      status: review.status || "active",
    }));
    setShowReplyModal(true);
    setError(null);
    setSuccess(null);
  };

  // Handle search
  const handleSearch = () => {
    const filtered = reviews.filter(review => {
      const usernameMatch = search.username
        ? review.username.toLowerCase().includes(search.username.toLowerCase()) ||
        review.customerName.toLowerCase().includes(search.username.toLowerCase())
        : true;

      const statusMatch = search.status
        ? review.status === search.status
        : true;

      return usernameMatch && statusMatch;
    });

    setReviews(filtered);
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearch({ username: "", status: "" });
    fetchReviews();
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Parse images
  const parseImages = (imagesString: string): string[] => {
    try {
      return JSON.parse(imagesString) || [];
    } catch (e) {
      return [];
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa ${i <= rating ? 'fa-star text-warning' : 'fa-star-o text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <div className="page-wrapper py-4">
      <div className="container bg-white rounded shadow-sm p-4">
        {/* Page Header */}
        <div className="row align-items-center mb-4">
          <div className="col">
            <h3 className="mb-0">Quản lý đánh giá sân</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent p-0">
                <li className="breadcrumb-item"><a href="/owner/dashboard">Dashboard</a></li>
                <li className="breadcrumb-item active" aria-current="page">Quản lý đánh giá</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Alert messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {/* Search Filter */}
        <form className="row g-2 mb-3">
          <div className="col-sm-6 col-md-4">
            <input type="text" className="form-control"
              placeholder="Tìm theo tên hoặc username"
              value={search.username}
              onChange={e => setSearch(s => ({ ...s, username: e.target.value }))}
            />
          </div>
          <div className="col-sm-6 col-md-3">
            <select className="form-select"
              value={search.status}
              onChange={e => setSearch(s => ({ ...s, status: e.target.value }))}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hiển thị</option>
              <option value="hidden">Đã ẩn</option>
              <option value="deleted">Đã xóa</option>
            </select>
          </div>
          <div className="col-sm-6 col-md-2">
            <button type="button" className="btn btn-success w-100" onClick={handleSearch}>
              <i className="fa fa-search me-1"></i> Tìm kiếm
            </button>
          </div>
          <div className="col-sm-6 col-md-2">
            <button type="button" className="btn btn-secondary w-100" onClick={handleRefresh}>
              <i className="fa fa-refresh me-1"></i> Làm mới
            </button>
          </div>
        </form>

        <div className="row">
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Khách hàng</th>
                    <th>Đánh giá</th>
                    <th>Bình luận</th>
                    <th>Hình ảnh</th>
                    <th>Phản hồi</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  ) : reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <tr key={review.reviewId}>
                        <td>{idx + 1}</td>
                        <td>
                          <div>{review.customerName}</div>
                          <small className="text-muted">@{review.username}</small>
                        </td>
                        <td className="text-nowrap">{renderStars(review.rating)}</td>
                        <td>
                          <div style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {review.comment}
                          </div>
                        </td>
                        <td>
                          {parseImages(review.images).length > 0 && (
                            <div className="d-flex gap-1">
                              {parseImages(review.images).map((img, i) => (
                                <img
                                  key={i}
                                  src={`${VITE_CLOUDINARY_BASE_URL}/${img}`}
                                  alt=""
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                    borderRadius: "4px"
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          {review.sellerReplyContent ? (
                            <div>
                              <div className="text-success">Đã phản hồi</div>
                              <small>{formatDate(review.sellerReplyDate || "")}</small>
                            </div>
                          ) : (
                            <div className="text-muted">Chưa phản hồi</div>
                          )}
                        </td>
                        <td className="text-nowrap">
                          {formatDate(review.createdAt)}
                        </td>
                        <td>
                          <span className={`badge ${review.status === 'active' ? 'bg-success' :
                              review.status === 'hidden' ? 'bg-warning' :
                                'bg-danger'
                            }`}>
                            {review.status === 'active' ? 'Đang hiển thị' :
                              review.status === 'hidden' ? 'Đã ẩn' : 'Đã xóa'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-outline-primary btn-sm"
                            onClick={() => openReplyModal(review)}>
                            <i className="fa fa-reply me-1"></i> Phản hồi
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-muted">
                        Không có đánh giá nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reply Modal */}
        <BootstrapModal
          show={showReplyModal}
          onHide={() => setShowReplyModal(false)}
          title="Phản hồi đánh giá"
          size="lg"
          className="custom-modal"
          bodyClassName="modal-body"
          footer={
            <>
              {selectedReview && selectedReview.sellerReplyContent ? (
                <>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteReply}
                  >
                    <i className="fa fa-trash me-1"></i> Xóa phản hồi
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary ms-2"
                    onClick={handleSubmitReply}
                    disabled
                  >
                    Phản hồi đã gửi
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitReply}
                >
                  <i className="fa fa-paper-plane me-1"></i> Gửi phản hồi
                </button>
              )}
            </>
          }
        >
          {selectedReview && (
            <div className="review-reply-container">
              {/* Original review details */}
              <div className="original-review mb-4 p-3 bg-light rounded">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-1">{selectedReview.customerName} <small>@{selectedReview.username}</small></h6>
                    <div className="mb-2">{renderStars(selectedReview.rating)}</div>
                  </div>
                  <div className="text-muted small">
                    {formatDate(selectedReview.createdAt)}
                  </div>
                </div>
                <p className="mb-2">{selectedReview.comment}</p>

                {parseImages(selectedReview.images).length > 0 && (
                  <div className="d-flex gap-2 mb-2">
                    {parseImages(selectedReview.images).map((img, i) => (
                      <img
                        key={i}
                        src={`${VITE_CLOUDINARY_BASE_URL}/${img}`}
                        alt=""
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "6px"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Reply form */}
              <form>
                <div className="mb-3">
                  <label htmlFor="replyContent" className="form-label">Nội dung phản hồi</label>
                  <textarea
                    id="replyContent"
                    className="form-control"
                    rows={4}
                    value={replyForm.content}
                    onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                    placeholder="Nhập nội dung phản hồi..."
                    disabled={selectedReview.sellerReplyContent !== null}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="reviewStatus" className="form-label">Trạng thái đánh giá</label>
                  <select
                    id="reviewStatus"
                    className="form-select"
                    value={replyForm.status}
                    onChange={(e) => setReplyForm({ ...replyForm, status: e.target.value })}
                  >
                    <option value="active">Hiển thị</option>
                    <option value="hidden">Ẩn</option>
                    <option value="deleted">Xóa</option>
                  </select>
                </div>

                <div className="form-text text-muted mb-3">
                  Phản hồi với tư cách: <strong>{replyForm.adminName || "Chủ sân"}</strong>
                </div>

                {selectedReview.sellerReplyContent && (
                  <div className="alert alert-info">
                    <strong>Phản hồi hiện tại:</strong> {selectedReview.sellerReplyContent}
                    <div className="mt-1">
                      <small>Đã phản hồi bởi: {selectedReview.sellerReplyAdminName || replyForm.adminName} vào lúc {formatDate(selectedReview.sellerReplyDate || "")}</small>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </BootstrapModal>
      </div>
    </div>
  );
};

export default OwnerReviewManager;
