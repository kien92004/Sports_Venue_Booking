import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import {
    clearFieldError,
    hasValidationErrors,
    updateFieldError,
    validateOnceBookingForm,
    validatePermanentBookingForm,
    validateSingleField,
    type OnceBookingData,
    type PermanentBookingData
} from "../../helper/bookingValidation";
// import "./CreateBookingModal.css";

interface Field {
    fieldid: number;
    namefield: string;
    price: number;
    sporttype?: {
        categoryname?: string;
    };
}

interface Shift {
    shiftid: number;
    nameshift: string;
    starttime: string;
    endtime: string;
}

interface WeekdayOption {
    value: number;
    label: string;
}

interface Props {
    show: boolean;
    onClose: () => void;
    ownerUsername: string;
    URL_BACKEND: string;

    // Tách API cho từng loại
    onSubmitOnce: (data: any) => void;
    onSubmitPermanent: (data: any) => void;
}

const BookingModal: React.FC<Props> = ({
    show,
    onClose,
    ownerUsername,
    URL_BACKEND,
    onSubmitOnce,
    onSubmitPermanent,
}) => {
    const [tab, setTab] = useState<"ONCE" | "PERMANENT">("ONCE");
    const [loading, setLoading] = useState(false);

    // Form validation states
    const [errors, setErrors] = useState<{
        once: Record<string, string>;
        permanent: Record<string, string>;
    }>({
        once: {},
        permanent: {}
    });

    const [fields, setFields] = useState<Field[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);

    // Weekdays configuration
    const weekdays: WeekdayOption[] = [
        { value: 2, label: "Thứ 2" },
        { value: 3, label: "Thứ 3" },
        { value: 4, label: "Thứ 4" },
        { value: 5, label: "Thứ 5" },
        { value: 6, label: "Thứ 6" },
        { value: 7, label: "Thứ 7" },
        { value: 8, label: "Chủ nhật" }
    ];

    const [onceData, setOnceData] = useState({
        fieldId: "",
        shiftId: "",
        playDate: "",
        nameCustomer: "",
        phoneCustomer: "",
        note: "",
        isDeposit: false,
    });

    const [permanentData, setPermanentData] = useState({
        fieldId: "",
        startDate: "",
        endDate: "",
        nameCustomer: "",
        phoneCustomer: "",
        note: "",
        selectedWeekdays: [] as number[],
        shiftsPerDay: {} as Record<number, number>, // dayOfWeek -> shiftId
        isDeposit: false,
    });

    // Booking price calculation function
    const calculateBookingPrice = (fieldPrice: number, totalBookings: number, isDeposit: boolean = false): number => {
        const totalPrice = fieldPrice * totalBookings;
        return isDeposit ? totalPrice * 0.3 : totalPrice;
    };

    // Calculate total bookings for permanent booking
    const calculateTotalBookings = (startDate: string, endDate: string, weekdays: number[]): number => {
        if (!startDate || !endDate || weekdays.length === 0) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);
        let totalBookings = 0;

        const current = new Date(start);
        while (current <= end) {
            const dayOfWeek = current.getDay() === 0 ? 8 : current.getDay() + 1; // Convert Sunday=0 to 8, Monday=1 to 2, etc.
            if (weekdays.includes(dayOfWeek)) {
                totalBookings++;
            }
            current.setDate(current.getDate() + 1);
        }

        return totalBookings;
    };

    // Validation functions using imported utility
    const validateOnceForm = (): boolean => {
        const onceBookingData: OnceBookingData = {
            fieldId: onceData.fieldId,
            shiftId: onceData.shiftId,
            playDate: onceData.playDate,
            nameCustomer: onceData.nameCustomer,
            phoneCustomer: onceData.phoneCustomer,
            note: onceData.note,
            isDeposit: onceData.isDeposit
        };

        const validationErrors = validateOnceBookingForm(onceBookingData);
        setErrors(prev => ({ ...prev, once: validationErrors }));
        return !hasValidationErrors(validationErrors);
    };

    const validatePermanentForm = (): boolean => {
        const permanentBookingData: PermanentBookingData = {
            fieldId: permanentData.fieldId,
            startDate: permanentData.startDate,
            endDate: permanentData.endDate,
            nameCustomer: permanentData.nameCustomer,
            phoneCustomer: permanentData.phoneCustomer,
            note: permanentData.note,
            selectedWeekdays: permanentData.selectedWeekdays,
            shiftsPerDay: permanentData.shiftsPerDay,
            isDeposit: permanentData.isDeposit
        };

        const validationErrors = validatePermanentBookingForm(permanentBookingData);
        setErrors(prev => ({ ...prev, permanent: validationErrors }));
        return !hasValidationErrors(validationErrors);
    };

    // Clear specific field error when user starts typing
    const clearError = (formType: 'once' | 'permanent', fieldName: string) => {
        setErrors(prev => ({
            ...prev,
            [formType]: clearFieldError(prev[formType], fieldName)
        }));
    };

    // Real-time validation for individual fields
    const validateFieldRealTime = (formType: 'once' | 'permanent', fieldName: string, value: any, additionalData?: any) => {
        const errorMessage = validateSingleField(fieldName, value, formType, additionalData);

        setErrors(prev => ({
            ...prev,
            [formType]: updateFieldError(prev[formType], fieldName, errorMessage)
        }));
    };

    // Handlers for once booking form
    const handleOnceFieldChange = (fieldName: string, value: any) => {
        setOnceData(prev => ({ ...prev, [fieldName]: value }));
        validateFieldRealTime('once', fieldName, value, onceData);
    };

    // Handlers for permanent booking form
    const handlePermanentFieldChange = (fieldName: string, value: any) => {
        setPermanentData(prev => ({ ...prev, [fieldName]: value }));
        validateFieldRealTime('permanent', fieldName, value, permanentData);
    };

    // load fields + shifts
    useEffect(() => {
        if (show) {
            fetch(`${URL_BACKEND}/rest/fields/getAll?ownerUsername=${encodeURIComponent(ownerUsername)}`)
                .then((res) => res.json())
                .then((data) => setFields(data))
                .catch(console.error);

            fetch(`${URL_BACKEND}/rest/shifts/getAll`)
                .then((res) => res.json())
                .then((data) => setShifts(data))
                .catch(console.error);
        }
    }, [show, URL_BACKEND, ownerUsername]);

    // Handle weekday selection
    const handleWeekdayChange = (dayOfWeek: number) => {
        const newSelectedWeekdays = permanentData.selectedWeekdays.includes(dayOfWeek)
            ? permanentData.selectedWeekdays.filter(d => d !== dayOfWeek)
            : [...permanentData.selectedWeekdays, dayOfWeek];

        // Remove shift selection for unselected days
        const newShiftsPerDay = { ...permanentData.shiftsPerDay };
        if (!newSelectedWeekdays.includes(dayOfWeek)) {
            delete newShiftsPerDay[dayOfWeek];
        }

        setPermanentData({
            ...permanentData,
            selectedWeekdays: newSelectedWeekdays,
            shiftsPerDay: newShiftsPerDay
        });

        // Validate weekdays in real-time
        validateFieldRealTime('permanent', 'selectedWeekdays', newSelectedWeekdays, permanentData);
        // Validate shifts assignment
        validateFieldRealTime('permanent', 'shiftsPerDay', newShiftsPerDay, { selectedWeekdays: newSelectedWeekdays });
    };

    // Handle shift selection for specific day
    const handleShiftChange = (dayOfWeek: number, shiftId: string) => {
        const newShiftsPerDay = {
            ...permanentData.shiftsPerDay,
            [dayOfWeek]: parseInt(shiftId)
        };

        setPermanentData({
            ...permanentData,
            shiftsPerDay: newShiftsPerDay
        });

        // Validate shifts assignment in real-time
        validateFieldRealTime('permanent', 'shiftsPerDay', newShiftsPerDay, { selectedWeekdays: permanentData.selectedWeekdays });
    };

    // Get selected field
    const getSelectedField = (): Field | undefined => {
        const fieldId = tab === "ONCE" ? onceData.fieldId : permanentData.fieldId;
        return fields.find(f => f.fieldid.toString() === fieldId);
    };

    const submitOnce = async () => {
        if (!validateOnceForm()) {
            return;
        }

        setLoading(true);
        try {
            const selectedField = getSelectedField();
            if (!selectedField) return; const bookingPrice = calculateBookingPrice(selectedField.price, 1, onceData.isDeposit);

            const data = {
                username: ownerUsername,
                amount: bookingPrice,
                phone: onceData.phoneCustomer.trim(),
                note: onceData.note ? `${onceData.nameCustomer} đặt sân với nội dung : ${onceData.note}` : `${onceData.nameCustomer} đặt sân`,
                shiftId: parseInt(onceData.shiftId),
                fieldId: parseInt(onceData.fieldId),
                playdate: onceData.playDate,
                pricefield: selectedField.price
            };

            await onSubmitOnce(data);
            resetForms();
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitPermanent = async () => {
        if (!validatePermanentForm()) {
            return;
        }

        setLoading(true);
        try {
            const selectedField = getSelectedField();
            if (!selectedField || permanentData.selectedWeekdays.length === 0) return;

            const totalBookings = calculateTotalBookings(
                permanentData.startDate,
                permanentData.endDate,
                permanentData.selectedWeekdays
            );

            const bookingPrice = calculateBookingPrice(selectedField.price, totalBookings, permanentData.isDeposit);

            // Create shifts array based on selected weekdays and their assigned shifts
            const shiftsArray = permanentData.selectedWeekdays.map(dayOfWeek => ({
                dayOfWeek,
                shiftId: permanentData.shiftsPerDay[dayOfWeek]
            })).filter(shift => shift.shiftId);

            const data = {
                username: ownerUsername,
                nameCustomer: permanentData.nameCustomer.trim(),
                amount: bookingPrice,
                phone: permanentData.phoneCustomer.trim(),
                note: permanentData.note.trim() ? `${permanentData.nameCustomer} đặt sân với nội dung : ${permanentData.note}` : `${permanentData.nameCustomer} đặt sân`,
                shifts: shiftsArray,
                fieldId: parseInt(permanentData.fieldId),
                pricefield: selectedField.price,
                startDate: permanentData.startDate,
                endDate: permanentData.endDate
            };

            await onSubmitPermanent(data);
            resetForms();
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForms = () => {
        setOnceData({
            fieldId: "",
            shiftId: "",
            playDate: "",
            nameCustomer: "",
            phoneCustomer: "",
            note: "",
            isDeposit: false,
        });

        setPermanentData({
            fieldId: "",
            startDate: "",
            endDate: "",
            nameCustomer: "",
            phoneCustomer: "",
            note: "",
            selectedWeekdays: [],
            shiftsPerDay: {},
            isDeposit: false,
        });

    };
    const handleCancel = () => {
        onClose();
        resetForms();
    };

    return (
        <Modal show={show} onHide={handleCancel} size="xl" centered>
            <Modal.Header closeButton className="bg-success text-white" >
                <Modal.Title>
                    Đặt sân thể thao
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
                {/* TAB NAVIGATION */}
                <ul className="nav nav-tabs mb-4" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${tab === "ONCE" ? "active" : ""}`}
                            onClick={() => setTab("ONCE")}
                            type="button"
                            role="tab"
                        >
                            Đặt sân lẻ
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={`nav-link ${tab === "PERMANENT" ? "active" : ""}`}
                            onClick={() => setTab("PERMANENT")}
                            type="button"
                            role="tab"
                        >
                            Đặt sân cố định
                        </button>
                    </li>
                </ul>

                {/* FORM CHO ĐẶT LẺ */}
                {tab === "ONCE" && (
                    <div className="tab-content">
                        <div className="tab-pane fade show active">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Chọn sân
                                        </label>
                                        <select
                                            className={`form-select ${errors.once.fieldId ? 'is-invalid' : onceData.fieldId ? 'is-valid' : ''}`}
                                            value={onceData.fieldId}
                                            onChange={(e) => {
                                                handleOnceFieldChange('fieldId', e.target.value);
                                                clearError('once', 'fieldId');
                                            }}
                                        >
                                            <option value="">-- Chọn sân --</option>
                                            {fields.map((f) => (
                                                <option key={f.fieldid} value={f.fieldid}>
                                                    {f.namefield} - {f.price?.toLocaleString('vi-VN')}đ
                                                </option>
                                            ))}
                                        </select>
                                        {errors.once.fieldId && (
                                            <div className="invalid-feedback d-block">
                                                {errors.once.fieldId}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Chọn ca
                                        </label>
                                        <select
                                            className={`form-select ${errors.once.shiftId ? 'is-invalid' : onceData.shiftId ? 'is-valid' : ''}`}
                                            value={onceData.shiftId}
                                            onChange={(e) => {
                                                handleOnceFieldChange('shiftId', e.target.value);
                                                clearError('once', 'shiftId');
                                            }}
                                        >
                                            <option value="">-- Chọn ca --</option>
                                            {shifts.map((s) => (
                                                <option key={s.shiftid} value={s.shiftid}>
                                                    {s.nameshift}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.once.shiftId && (
                                            <div className="invalid-feedback d-block">
                                                {errors.once.shiftId}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-calendar-date text-primary me-1"></i>
                                    Ngày chơi
                                </label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.once.playDate ? 'is-invalid' : onceData.playDate ? 'is-valid' : ''}`}
                                    value={onceData.playDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        handleOnceFieldChange('playDate', e.target.value);
                                        clearError('once', 'playDate');
                                    }}
                                />
                                {errors.once.playDate && (
                                    <div className="invalid-feedback d-block">
                                        {errors.once.playDate}
                                    </div>
                                )}
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="bi bi-person"></i>
                                            Tên khách hàng
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.once.nameCustomer ? 'is-invalid' : onceData.nameCustomer ? 'is-valid' : ''}`}
                                            value={onceData.nameCustomer}
                                            placeholder="Nhập tên khách hàng"
                                            onChange={(e) => {
                                                handleOnceFieldChange('nameCustomer', e.target.value);
                                                clearError('once', 'nameCustomer');
                                            }}
                                        />
                                        {errors.once.nameCustomer && (
                                            <div className="invalid-feedback d-block">
                                                {errors.once.nameCustomer}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="bi bi-telephone"></i>
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            className={`form-control ${errors.once.phoneCustomer ? 'is-invalid' : onceData.phoneCustomer ? 'is-valid' : ''}`}
                                            value={onceData.phoneCustomer}
                                            placeholder="VD: 0901234567"
                                            onChange={(e) => {
                                                handleOnceFieldChange('phoneCustomer', e.target.value);
                                                clearError('once', 'phoneCustomer');
                                            }}
                                        />
                                        {errors.once.phoneCustomer && (
                                            <div className="invalid-feedback d-block">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {errors.once.phoneCustomer}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú */}
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="bi bi-chat-text"></i>
                                    Ghi chú (tùy chọn)
                                </label>
                                <textarea
                                    className={`form-control ${errors.once.note ? 'is-invalid' : ''}`}
                                    value={onceData.note}
                                    placeholder="Nhập ghi chú thêm..."
                                    rows={3}
                                    maxLength={200}
                                    onChange={(e) => {
                                        handleOnceFieldChange('note', e.target.value);
                                        clearError('once', 'note');
                                    }}
                                />
                                <small className="text-muted">{onceData.note.length}/200 ký tự</small>
                                {errors.once.note && (
                                    <div className="invalid-feedback d-block">
                                        {errors.once.note}
                                    </div>
                                )}
                            </div>

                            {/* CHECKBOX ĐẶT CỌC */}
                            <div className="mb-3">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="onceDeposit"
                                        checked={onceData.isDeposit}
                                        onChange={(e) => setOnceData({ ...onceData, isDeposit: e.target.checked })}
                                    />
                                    <label className="form-check-label fw-semibold" htmlFor="onceDeposit">
                                        Đặt cọc trước 30%
                                    </label>
                                </div>
                            </div>

                            {/* HIỂN THỊ GIÁ TỔNG CHO ĐẶT LẺ */}
                            {onceData.fieldId && (() => {
                                const field = getSelectedField();
                                const fullPrice = field ? field.price : 0;
                                const finalPrice = field ? calculateBookingPrice(field.price, 1, onceData.isDeposit) : 0;
                                return (
                                    <div className="card border-success">
                                        <div className="card-header bg-success text-white">
                                            <h6 className="card-title mb-0">
                                                Chi tiết thanh toán
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-medium">Giá gốc:</span>
                                                <span className="text-primary fw-bold">{fullPrice.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            {onceData.isDeposit && (
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="fw-medium">Đặt cọc 30%:</span>
                                                    <span className="text-warning fw-bold">{finalPrice.toLocaleString('vi-VN')}đ</span>
                                                </div>
                                            )}
                                            <hr className="my-2" />
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-bold">Số tiền {onceData.isDeposit ? 'cọc' : 'thanh toán'}:</span>
                                                <span className="text-success fw-bold fs-5">{finalPrice.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* NÚt ĐẶT SÂN Ở TAB ĐẶT LẺ */}
                            <div className="d-flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary flex-fill"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success flex-fill"
                                    onClick={submitOnce}
                                    disabled={loading || !onceData.fieldId || !onceData.shiftId || !onceData.playDate || !onceData.nameCustomer || !onceData.phoneCustomer}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Đặt sân
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FORM CHO ĐẶT CỐ ĐỊNH */}
                {tab === "PERMANENT" && (
                    <div className="tab-content">
                        <div className="tab-pane fade show active">
                            {/* Chọn sân */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Chọn sân
                                </label>
                                <select
                                    className={`form-select ${errors.permanent.fieldId ? 'is-invalid' : permanentData.fieldId ? 'is-valid' : ''}`}
                                    value={permanentData.fieldId}
                                    onChange={(e) => {
                                        handlePermanentFieldChange('fieldId', e.target.value);
                                        clearError('permanent', 'fieldId');
                                    }}
                                >
                                    <option value="">-- Chọn sân --</option>
                                    {fields.map((f) => (
                                        <option key={f.fieldid} value={f.fieldid}>
                                            {f.namefield} - {f.price?.toLocaleString('vi-VN')}đ
                                        </option>
                                    ))}
                                </select>
                                {errors.permanent.fieldId && (
                                    <div className="invalid-feedback d-block">
                                        {errors.permanent.fieldId}
                                    </div>
                                )}
                            </div>

                            {/* Ngày bắt đầu và kết thúc */}
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Ngày bắt đầu
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${errors.permanent.startDate ? 'is-invalid' : permanentData.startDate ? 'is-valid' : ''}`}
                                            value={permanentData.startDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => {
                                                handlePermanentFieldChange('startDate', e.target.value);
                                                clearError('permanent', 'startDate');
                                            }}
                                        />
                                        {errors.permanent.startDate && (
                                            <div className="invalid-feedback d-block">
                                                {errors.permanent.startDate}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Ngày kết thúc
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${errors.permanent.endDate ? 'is-invalid' : permanentData.endDate ? 'is-valid' : ''}`}
                                            value={permanentData.endDate}
                                            min={permanentData.startDate || new Date().toISOString().split('T')[0]}
                                            onChange={(e) => {
                                                handlePermanentFieldChange('endDate', e.target.value);
                                                clearError('permanent', 'endDate');
                                            }}
                                        />
                                        {errors.permanent.endDate && (
                                            <div className="invalid-feedback d-block">
                                                {errors.permanent.endDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Chọn các ngày trong tuần */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Chọn các ngày trong tuần
                                </label>
                                <div className="row g-2">
                                    {weekdays.map(w => (
                                        <div key={w.value} className="col-auto">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`weekday-${w.value}`}
                                                    checked={permanentData.selectedWeekdays.includes(w.value)}
                                                    onChange={() => handleWeekdayChange(w.value)}
                                                />
                                                <label className="form-check-label" htmlFor={`weekday-${w.value}`}>
                                                    {w.label}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.permanent.weekdays && (
                                    <div className="invalid-feedback d-block">
                                        {errors.permanent.weekdays}
                                    </div>
                                )}
                            </div>                        {/* Chọn ca cho từng ngày */}
                            {permanentData.selectedWeekdays.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="bi bi-clock-history"></i>
                                        Chọn ca cho từng ngày
                                    </label>
                                    <div className="shift-selection">
                                        {permanentData.selectedWeekdays.map(w => (
                                            <div key={w} className="shift-day-row">
                                                <span className="shift-day-label">
                                                    {weekdays.find(x => x.value === w)?.label}:
                                                </span>
                                                <select
                                                    className={`form-select shift-day-select ${errors.permanent.shifts && !permanentData.shiftsPerDay[w] ? 'is-invalid' : permanentData.shiftsPerDay[w] ? 'is-valid' : ''}`}
                                                    value={permanentData.shiftsPerDay[w] || ""}
                                                    onChange={e => {
                                                        handleShiftChange(w, e.target.value);
                                                        clearError('permanent', 'shifts');
                                                    }}
                                                >
                                                    <option value="">Chọn ca</option>
                                                    {shifts.map(s => (
                                                        <option key={s.shiftid} value={s.shiftid}>
                                                            {s.nameshift}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.permanent.shifts && (
                                        <div className="error-message">
                                            <i className="bi bi-exclamation-circle"></i>
                                            {errors.permanent.shifts}
                                        </div>
                                    )}
                                </div>
                            )}                        {/* Thông tin khách hàng */}
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="bi bi-person"></i>
                                            Tên khách hàng
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.permanent.nameCustomer ? 'is-invalid' : permanentData.nameCustomer ? 'is-valid' : ''}`}
                                            value={permanentData.nameCustomer}
                                            placeholder="Nhập tên khách hàng"
                                            onChange={(e) => {
                                                handlePermanentFieldChange('nameCustomer', e.target.value);
                                                clearError('permanent', 'nameCustomer');
                                            }}
                                        />
                                        {errors.permanent.nameCustomer && (
                                            <div className="error-message">
                                                <i className="bi bi-exclamation-circle"></i>
                                                {errors.permanent.nameCustomer}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <i className="bi bi-telephone"></i>
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            className={`form-control ${errors.permanent.phoneCustomer ? 'is-invalid' : permanentData.phoneCustomer ? 'is-valid' : ''}`}
                                            value={permanentData.phoneCustomer}
                                            placeholder="VD: 0901234567"
                                            onChange={(e) => {
                                                handlePermanentFieldChange('phoneCustomer', e.target.value);
                                                clearError('permanent', 'phoneCustomer');
                                            }}
                                        />
                                        {errors.permanent.phoneCustomer && (
                                            <div className="error-message">
                                                <i className="bi bi-exclamation-circle"></i>
                                                {errors.permanent.phoneCustomer}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ghi chú */}
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="bi bi-chat-text"></i>
                                    Ghi chú (tùy chọn)
                                </label>
                                <textarea
                                    className={`form-control ${errors.permanent.note ? 'is-invalid' : ''}`}
                                    value={permanentData.note}
                                    placeholder="Nhập ghi chú thêm..."
                                    rows={3}
                                    maxLength={200}
                                    onChange={(e) => {
                                        handlePermanentFieldChange('note', e.target.value);
                                        clearError('permanent', 'note');
                                    }}
                                />
                                <small className="text-muted">{permanentData.note.length}/200 ký tự</small>
                                {errors.permanent.note && (
                                    <div className="error-message">
                                        <i className="bi bi-exclamation-circle"></i>
                                        {errors.permanent.note}
                                    </div>
                                )}
                            </div>

                            {/* ĐẶT CỌC CHECKBOX */}
                            <div className={`booking-checkbox ${permanentData.isDeposit ? 'is-checked' : ''}`}>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="permanentDeposit"
                                        checked={permanentData.isDeposit}
                                        onChange={(e) => setPermanentData({ ...permanentData, isDeposit: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="permanentDeposit">
                                        Đặt cọc trước 30%
                                    </label>
                                </div>
                            </div>

                            {/* HIỂN THỊ GIÁ TỔNG CHO ĐẶT CỐ ĐỊNH */}
                            {permanentData.fieldId && permanentData.startDate && permanentData.endDate && permanentData.selectedWeekdays.length > 0 && (() => {
                                const field = getSelectedField();
                                const totalBookings = calculateTotalBookings(permanentData.startDate, permanentData.endDate, permanentData.selectedWeekdays);
                                const fullPrice = field ? field.price * totalBookings : 0;
                                const finalPrice = field ? calculateBookingPrice(field.price, totalBookings, permanentData.isDeposit) : 0;
                                return (
                                    <div className="price-display">
                                        <div className="price-display__header">
                                            <i className="bi bi-calculator"></i>
                                            Chi tiết thanh toán
                                        </div>
                                        <div className="price-row">
                                            <span className="price-label">Số lượt đặt:</span>
                                            <span className="price-value">{totalBookings}</span>
                                        </div>
                                        <div className="price-row">
                                            <span className="price-label">Giá mỗi lượt:</span>
                                            <span className="price-value">{field?.price?.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="price-row">
                                            <span className="price-label">Tổng giá gốc:</span>
                                            <span className="price-value">{fullPrice.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        {permanentData.isDeposit && (
                                            <div className="price-row">
                                                <span className="price-label">Đặt cọc 30%:</span>
                                                <span className="price-value deposit-highlight">{finalPrice.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        )}
                                        <div className="price-row">
                                            <span className="price-label">Số tiền {permanentData.isDeposit ? 'cọc' : 'thanh toán'}:</span>
                                            <span className="price-value highlight">{finalPrice.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* NÚT ĐẶT SÂN CỐ ĐỊNH */}
                            <div className="booking-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary flex-fill"

                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    <i className="bi bi-x-circle"></i>
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success flex-fill"

                                    onClick={submitPermanent}
                                    disabled={loading || !permanentData.fieldId || !permanentData.startDate || !permanentData.endDate || !permanentData.nameCustomer || !permanentData.phoneCustomer || permanentData.selectedWeekdays.length === 0 || permanentData.selectedWeekdays.some(day => !permanentData.shiftsPerDay[day])}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-calendar-check"></i>
                                            Đặt sân cố định
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default BookingModal;
