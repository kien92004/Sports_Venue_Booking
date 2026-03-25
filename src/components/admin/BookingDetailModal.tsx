import React from "react";
import Modal from "react-modal";
import getImageUrl from "../../helper/getImageUrl";
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;



// Interface cho chi tiết booking từ API
interface BookingDetail {
    bookingId: number;
    username: string;
    phone: string;
    note: string;
    bookingStatus: string;
    bookingType: string;
    fieldName: string;
    fieldImage: string;
    shiftName: string;
    shiftStart: string;
    shiftEnd: string;
    price: number;
    playDate: string;
    startDate?: string;
    endDate?: string;
    dayOfWeek?: string;
}

// Interface cho modal booking detail
interface BookingDetailModalProps {
    bookingId: number | null;
    isOpen: boolean;
    onClose: () => void;
}


// Component modal hiển thị chi tiết booking
const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ bookingId, isOpen, onClose }) => {
    const [bookingDetail, setBookingDetail] = React.useState<BookingDetail | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // Custom styles cho react-modal
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '800px',   // <--- Tăng lên
            padding: '0',
            border: 'none',
            borderRadius: '0.5rem',
            maxHeight: '90vh',
            overflow: 'hidden'
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1050
        }
    };


    React.useEffect(() => {
        if (!isOpen || !bookingId) return;

        const fetchBookingDetail = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${URL_BACKEND}/api/rest/calander/${bookingId}`);
                if (!response.ok) throw new Error('Không thể tải chi tiết đặt sân');
                const data = await response.json();
                setBookingDetail(data[0]);
            } catch (err) {
                setError('Không thể tải thông tin chi tiết đặt sân');
                console.error('Error fetching booking detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetail();
    }, [isOpen, bookingId]);

    const getStatusBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'đã xác nhận':
            case 'đã cọc':
                return 'badge bg-success';
            case 'pending':
            case 'chờ xác nhận':
                return 'badge bg-warning text-dark';
            case 'cancelled':
            case 'đã hủy':
                return 'badge bg-danger';
            case 'completed':
            case 'hoàn thành':
                return 'badge bg-success';
            default:
                return 'badge bg-secondary';
        }
    };
    const displayPrice =
        bookingDetail?.bookingStatus === "Hoàn Thành" ? (bookingDetail.price / 30) * 100 : bookingDetail?.price;

    const getBookingTypeClass = (type: string) => {
        return type === 'PERMANENT' ? 'badge bg-info' : 'badge bg-success';
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel="Chi tiết đặt sân"
            closeTimeoutMS={200}
        >
            <div className="border-0">
                {loading ? (
                    <div className="modal-body text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-3 text-muted">Đang tải thông tin...</p>
                    </div>
                ) : bookingDetail ? (
                    <>
                        <div className="modal-header bg-success text-white border-0 mb-0 p-3">
                            <h5 className="modal-title">
                                <i className="bi bi-info-circle me-2"></i>
                                Chi tiết đặt sân {bookingDetail.bookingType === 'PERMANENT' &&
                                    <span className="badge bg-info ms-2">Đặt cố định</span>}
                            </h5>

                            <button
                                type="button"
                                className="btn btn-close-white"
                                onClick={onClose}
                                aria-label="Đóng"
                            >X</button>
                        </div>

                        <div className="modal-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {/* Field Image */}
                            <div className="position-relative">
                                <img
                                    src={getImageUrl(bookingDetail.fieldImage)}
                                    alt={bookingDetail.fieldName}
                                    className="w-100"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    onError={(event) => {
                                        (event.target as HTMLImageElement).src = 'user/images/team-default.png';
                                    }}
                                />
                                <div className="position-absolute top-0 end-0 m-2">
                                    <span className={getStatusBadgeClass(bookingDetail.bookingStatus)}>
                                        {bookingDetail.bookingStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="p-4">
                                <h4 className="text-success mb-3">
                                    <i className="bi bi-dribbble me-2"></i>
                                    {bookingDetail.fieldName}
                                </h4>

                                <div className="row g-3">
                                    {/* Customer Info */}
                                    <div className="col-12">
                                        <div className="card bg-light border-0">
                                            <div className="card-body py-2" >
                                                <h6 className="card-title text-secondary mb-2">
                                                    <i className="bi bi-person me-2"></i>Thông tin khách hàng
                                                </h6>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <small className="text-muted">Tên khách hàng:</small>
                                                        <div className="fw-bold">{bookingDetail.username}</div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <small className="text-muted">Số điện thoại:</small>
                                                        <div className="fw-bold">
                                                            <i className="bi bi-telephone me-1"></i>
                                                            {bookingDetail.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Info */}
                                    <div className="col-12">
                                        <div className="card bg-light border-0">
                                            <div className="card-body py-2">
                                                <h6 className="card-title text-secondary mb-2">
                                                    <i className="bi bi-calendar-check me-2"></i>Thông tin đặt sân
                                                </h6>

                                                <div className="row">
                                                    <div className="col-sm-6 mb-2">
                                                        <small className="text-muted">Loại đặt sân:</small>
                                                        <div>
                                                            <span className={getBookingTypeClass(bookingDetail.bookingType)}>
                                                                {bookingDetail.bookingType === 'PERMANENT' ? 'Đặt cố định' : 'Đặt lẻ'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-2">
                                                        <small className="text-muted">Tên sân:</small>
                                                        <div>{bookingDetail.fieldName}</div>
                                                    </div>
                                                    <div className="col-sm-6 mb-2">
                                                        <small className="text-muted">Trạng thái:</small>
                                                        <div>
                                                            <span className={getStatusBadgeClass(bookingDetail.bookingStatus)}>
                                                                {bookingDetail.bookingStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mb-2">
                                                        <small className="text-muted">Ca chơi:</small>
                                                        <div className="fw-bold">
                                                            <i className="bi bi-clock me-1"></i>
                                                            {bookingDetail.shiftName}
                                                        </div>
                                                        <small className="text-success">
                                                            {bookingDetail.shiftStart} - {bookingDetail.shiftEnd}
                                                        </small>
                                                    </div>
                                                    <div className="col-sm-6 mb-2">
                                                        <small className="text-muted">Đã thanh toán:</small>
                                                        <div className="fw-bold text-danger">
                                                            <i className="bi bi-cash-coin me-1"></i>
                                                            {new Intl.NumberFormat('vi-VN').format(displayPrice ?? 0)}₫
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date Info */}
                                    <div className="col-12">
                                        <div className="card bg-light border-0">
                                            <div className="card-body py-2">
                                                <h6 className="card-title text-secondary mb-2">
                                                    <i className="bi bi-calendar3 me-2"></i>Thời gian
                                                </h6>
                                                {bookingDetail.bookingType === 'PERMANENT' ? (
                                                    <div className="row">
                                                        <div className="col-sm-4 mb-2">
                                                            <small className="text-muted">Từ ngày:</small>
                                                            <div className="fw-bold text-success">{bookingDetail.startDate}</div>
                                                        </div>
                                                        <div className="col-sm-4 mb-2">
                                                            <small className="text-muted">Đến ngày:</small>
                                                            <div className="fw-bold text-success">{bookingDetail.endDate}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <small className="text-muted">Ngày chơi:</small>
                                                        <div className="fw-bold text-success">
                                                            <i className="bi bi-calendar-day me-1"></i>
                                                            {bookingDetail.playDate}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {bookingDetail.note && (
                                        <div className="col-12">
                                            <div className="card bg-light border-0">
                                                <div className="card-body py-2">
                                                    <h6 className="card-title text-secondary mb-2">
                                                        <i className="bi bi-journal-text me-2"></i>Ghi chú
                                                    </h6>
                                                    <p className="mb-0 fst-italic">{bookingDetail.note}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0 bg-light">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                <i className="bi bi-x-lg me-1"></i>Đóng
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => window.print()}
                            >
                                <i className="bi bi-printer me-1"></i>In thông tin
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="modal-body text-center py-5">
                        <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3"></i>
                        <h5 className="text-muted">
                            {error || 'Không có dữ liệu!'}
                        </h5>
                        <p className="text-muted">
                            {error ? 'Vui lòng thử lại sau.' : 'Không thể tải thông tin đặt sân. Vui lòng thử lại.'}
                        </p>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                        >
                            <i className="bi bi-arrow-left me-1"></i>Quay lại
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
export default BookingDetailModal;